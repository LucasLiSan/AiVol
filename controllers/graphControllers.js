import GraphService from '../services/graphService.js';
import CollectionPoint from '../models/collectionPoint.js';

const graphService = new GraphService();

// Adicionar um novo ponto de coleta
const addPoint = (req, res) => {
    const { point } = req.body;
    graphService.addNode(point);
    res.status(201).json({ success: `Ponto ${point} adicionado com sucesso.` });
};

// Adicionar uma conexão entre pontos de coleta
const addRoute = (req, res) => {
    const { origin, destination, weight } = req.body;
    graphService.addEdge(origin, destination, parseFloat(weight));
    res.status(201).json({ success: `Rota entre ${origin} e ${destination} adicionada com sucesso.` });
};

// Calcular o melhor caminho entre dois pontos
const findRoute = (req, res) => {
    const { start, end } = req.query;
    const result = graphService.findShortestPath(start, end);
    if (result) {
        res.status(200).json(result);
    } else { res.status(404).json({ error: 'Caminho não encontrado.' }); }
};

// Otimizar rota com base na capacidade do caminhão
const findOptimizedRoute = async (req, res) => {
    try {
        const { startId, truckCapacity } = req.query;
        const capacity = parseFloat(truckCapacity);

        if (!startId || isNaN(capacity)) {
            return res.status(400).json({ error: "Parâmetros inválidos. Envie startId e truckCapacity." });
        }

        // Carregar pontos de coleta do banco
        const points = await CollectionPoint.find();

        // Ordenar pontos por proximidade ao ponto de partida
        const sortedPoints = points.sort((a, b) => {
            const distA = graphService.findShortestPath(startId, a._id.toString())?.distance || Infinity;
            const distB = graphService.findShortestPath(startId, b._id.toString())?.distance || Infinity;
            return distA - distB;
        });

        let remainingCapacity = capacity;
        let route = [];
        let totalDistance = 0;
        let trips = [];
        let lastPoint = startId;

        for (const point of sortedPoints) {
            let volumeToCollect = point.volume; // Agora pega o volume atualizado do banco

            if (volumeToCollect <= 0) continue;

            while (volumeToCollect > 0) {
                let collectedNow = Math.min(volumeToCollect, remainingCapacity);
            
                if (remainingCapacity === 0) {
                    trips.push({ route: [...route], totalDistance });
                    route = [];
                    totalDistance = 0;
                    remainingCapacity = capacity;
                    lastPoint = startId;
                }
            
                if (collectedNow > 0) {
                    point.collectedVolume += collectedNow;
                    volumeToCollect -= collectedNow;
            
                    // Atualiza o volume do ponto corretamente
                    point.volume -= collectedNow;
                    let remainingVolume = Math.max(0, point.volume); // Garante que não fique negativo
            
                    route.push(
                        `Endereço: ${point.address} Volume agendado: ${remainingVolume}, coletado: ${collectedNow}`
                    );
            
                    remainingCapacity -= collectedNow;
            
                    if (route.length > 1) {
                        const previousPointId = sortedPoints.find(p => p.address === route[route.length - 2].split(" ")[1])?._id.toString();
                        if (previousPointId) {
                            const pathData = graphService.findShortestPath(previousPointId, point._id.toString());
                            if (pathData) {
                                totalDistance += pathData.distance;
                            }
                        }
                    }
            
                    // **Atualiza o banco corretamente**
                    await CollectionPoint.updateOne(
                        { _id: point._id },
                        { 
                            $set: {
                                volume: remainingVolume, // Agora realmente diminui no banco
                                collectedVolume: point.collectedVolume,
                                collectedDateTime: new Date()
                            },
                            $push: { collectionHistory: { collectedVolume: collectedNow, collectedAt: new Date() } }
                        }
                    );
                }
            }
            
        }

        if (route.length > 0) {
            trips.push({ route: [...route], totalDistance });
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