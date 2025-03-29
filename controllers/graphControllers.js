import GraphService from '../services/graphService.js';
import CollectionPoint from '../models/collectionPoint.js';

// Adicionar um novo ponto de coleta
const addPoint = (req, res) => {
    const { point } = req.body;
    GraphService.addVertex(point);
    res.status(201).json({ success: `Ponto ${point} adicionado com sucesso.` });
};

// Adicionar uma conexão entre pontos de coleta
const addRoute = (req, res) => {
    const { origin, destination, weight } = req.body;
    GraphService.addEdge(origin, destination, parseFloat(weight));
    res.status(201).json({ success: `Rota entre ${origin} e ${destination} adicionada com sucesso.` });
};

// Calcular o melhor caminho entre dois pontos
const findRoute = (req, res) => {
    const { start, end } = req.query;
    const result = GraphService.findShortestPath(start, end);
    if (result) { res.status(200).json(result); }
    else { res.status(404).json({ error: 'Caminho não encontrado.' }); }
};

// Otimizar rota com base na capacidade do caminhão
const findOptimizedRoute = async (req, res) => {
    try {
        const { startId, truckCapacity } = req.query;
        const capacity = parseFloat(truckCapacity);
        if (!startId || isNaN(capacity)) {
            return res.status(400).json({ error: "Parâmetros inválidos. Envie startId e truckCapacity." });
        }

        const points = await CollectionPoint.find();
        const sortedPoints = points.sort((a, b) => {
            const distA = GraphService.findShortestPath(startId, a._id.toString())?.distance || Infinity;
            const distB = GraphService.findShortestPath(startId, b._id.toString())?.distance || Infinity;
            return distA - distB;
        });

        let remainingCapacity = capacity;
        let route = [];
        let totalDistance = 0;
        let trips = [];
        let lastPoint = startId;

        for (const point of sortedPoints) {
            let volumeToCollect = point.volume - point.collectedVolume;
            if (volumeToCollect <= 0) continue;

            while (volumeToCollect > 0) {
                let collectedNow = Math.min(volumeToCollect, remainingCapacity);

                if (collectedNow === 0) {
                    trips.push({ route: [...route], totalDistance });
                    route = [];
                    totalDistance = 0;
                    remainingCapacity = capacity;
                    lastPoint = startId;
                }

                // Atualiza o volume coletado e salva no histórico
                point.collectedVolume += collectedNow;
                point.collectionHistory.push({
                    collectedVolume: collectedNow,
                    collectedAt: new Date()
                });

                // Se todo o volume foi retirado, definir a data da coleta concluída
                if (point.collectedVolume >= point.volume) {
                    point.collectedDateTime = new Date();
                }

                route.push(
                    `Endereço: ${point.address.toString()}, Volume agendado: ${point.volume}, Volume retirado: ${point.collectedVolume}`
                );

                remainingCapacity -= collectedNow;
                volumeToCollect -= collectedNow;

                if (route.length > 1) {
                    const previousPoint = route[route.length - 2];
                    const pathData = GraphService.findShortestPath(previousPoint, point._id.toString());
                    if (pathData) {
                        totalDistance += pathData.distance;
                    }
                }

                // Atualiza no banco de dados
                await CollectionPoint.updateOne(
                    { _id: point._id },
                    { 
                        $set: {
                            volume: point.volume - point.collectedVolume,
                            collectedVolume: point.collectedVolume - collectedNow,
                            collectedDateTime: point.collectedDateTime
                        },
                        $push: { collectionHistory: { collectedVolume: collectedNow, collectedAt: new Date() } }
                    }
                );
            }
        }

        if (route.length > 0) {
            trips.push({ route, totalDistance });
        }

        res.status(200).json({ trips });
    } catch (error) {
        res.status(500).json({ error: "Erro ao calcular a rota otimizada: " + error.message });
    }
};

export default {
    addPoint,
    addRoute,
    findRoute,
    findOptimizedRoute
};