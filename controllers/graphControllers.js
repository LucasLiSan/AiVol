import GraphService from '../services/graphService.js';
import CollectionPoint from '../models/collectionPoint.js';
import TruckCollector from "../models/truckCollectors.js";
import truckFixedPoints from '../models/truckFixedPoints.js';

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
        await graphService.loadCollectionPoints();

        const { truckId } = req.query;

        if (!truckId) {
            return res.status(400).json({ error: "Parâmetro truckId é obrigatório." });
        }

        const truck = await TruckCollector.findById(truckId);
        if (!truck) {
            return res.status(404).json({ error: "Caminhão não encontrado." });
        }

        const capacity = truck.capacity;
        if (!capacity || capacity <= 0) {
            return res.status(400).json({ error: "Capacidade do caminhão inválida ou não definida." });
        }

        console.log("📦 Caminhão encontrado:");
        console.log(`ID: ${truck._id}`);
        console.log(`Localização: ${truck.location?.coordinates}`);

        const [truckLon, truckLat] = truck.location.coordinates;

        let closestNodeId = null;
        let minDistance = Infinity;

        console.log("\n🌐 Iniciando busca pelo ponto mais próximo no grafo...");
        for (const nodeId in graphService.graph) {
            const node = graphService.graph[nodeId];
            console.log(`🔹 Verificando nó ${nodeId}: (${node.lat}, ${node.lon})`);

            const dist = graphService.calculateDistance(truckLat, truckLon, node.lat, node.lon);
            console.log(`➡️ Distância para caminhão: ${dist.toFixed(4)} km`);

            if (dist < minDistance) {
                minDistance = dist;
                closestNodeId = nodeId;
            }
        }

        if (!closestNodeId) {
            console.log("❌ Nenhum ponto encontrado próximo.");
            return res.status(400).json({ error: "Nenhum ponto inicial encontrado próximo ao caminhão." });
        }

        console.log(`✅ Ponto mais próximo encontrado: ${closestNodeId} (distância: ${minDistance.toFixed(4)} km)`);

        const startId = closestNodeId;
        if (!startId) { return res.status(400).json({ error: "Nenhum ponto inicial encontrado próximo ao caminhão." }); }

        // Carregar pontos de coleta do banco
        const points = await CollectionPoint.find();
        const fixedPoints = await truckFixedPoints.find();

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
                    const remainingVolume = Math.max(0, point.volume); // Garante que não fique negativo
            
                    route.push(
                        `Endereço: ${point.address} Volume agendado: ${remainingVolume}, coletado: ${collectedNow}`
                    );

                    const pathData = graphService.findShortestPath(lastPoint, point._id.toString());
                    if (pathData) {
                        totalDistance += pathData.distance;
                        console.log('Distância somada:', pathData.distance)
                    } else {
                        console.log(`⚠️ Caminho não encontrado entre ${lastPoint} e ${point._id.toString()}`);
                    }

                    lastPoint = point._id.toString();
                    remainingCapacity -= collectedNow;
            
                    await CollectionPoint.updateOne(
                        { _id: point._id },
                        {
                            $set: {
                                volume: remainingVolume,
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
            trips.push({ route: [...route], totalDistance: Number(totalDistance.toFixed(3)) });
        }

        res.status(200).json({ trips });
    } catch (error) {
        res.status(500).json({ error: "Erro ao calcular a rota otimizada: " + error.message });
    }
};

const listGraphNodes = (req, res) => {
    res.status(200).json(graphService.getAllNodes());
};

export default {
    addPoint,
    addRoute,
    findRoute,
    findOptimizedRoute,
    listGraphNodes
};