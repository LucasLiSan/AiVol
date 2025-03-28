import mongoose from 'mongoose';
import CollectionPoint from '../models/collectionPoint.js';

class GraphService {
    constructor() {
        this.graph = {}
    }

    async loadCollectionPoints() {
        try {
            const collectionPoints = await CollectionPoint.find();

            // Resetar o grafo antes de carregar novos pontos
            this.graph = {}; 

            // Adiciona os pontos ao grafo
            collectionPoints.forEach(point => {
                this.graph[point._id.toString()] = {
                    lat: point.latitude,
                    lon: point.longitude,
                    edges: {}
                };
            });

            // Conectar cada ponto apenas aos seus 3 vizinhos mais próximos
            collectionPoints.forEach((pointA) => {
                let distances = collectionPoints.map((pointB) => {
                    if (pointA._id.toString() !== pointB._id.toString()) {
                        return {
                            id: pointB._id.toString(),
                            distance: this.calculateDistance(pointA.latitude, pointA.longitude, pointB.latitude, pointB.longitude)
                        };
                    }
                    return null;
                }).filter(Boolean);

                // Ordena pelos mais próximos e pega os 3 menores
                distances.sort((a, b) => a.distance - b.distance);
                distances.slice(0, 3).forEach(({ id, distance }) => {
                    this.graph[pointA._id.toString()].edges[id] = distance;
                    this.graph[id].edges[pointA._id.toString()] = distance; // Grafo não-direcionado
                });
            });

            console.log('Pontos de coleta carregados no grafo.');
        } catch (error) {
            console.error('Erro ao carregar os pontos de coleta:', error);
        }
    }

    addVertex(id, lat, lon) {
        if (!this.graph[id]) { this.graph[id] = { lat, lon, edges: {} }; }
    }

    // Método para adicionar uma aresta (conexão entre dois pontos)
    addEdge(id1, id2) {
        if (!this.graph[id1] || !this.graph[id2]) return;
        const { lat: lat1, lon: lon1 } = this.graph[id1];
        const { lat: lat2, lon: lon2 } = this.graph[id2];
        const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
        this.graph[id1].edges[id2] = distance;
        this.graph[id2].edges[id1] = distance; // Grafo não-direcionado
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    findOptimizedRoute(startVertex, dumpSite) {
        let remainingPoints = Object.keys(this.graph);
        let currentTruckLoad = 0;
        let totalDistance = 0;
        let route = [startVertex];

        while (remainingPoints.length > 0) {
            let nextStop = null;
            let shortestDistance = Infinity;

            for (let point of remainingPoints) {
                if (this.graph.vertices[point].volume > 0) {
                    const result = this.findShortestPath(startVertex, point);
                    if (result && result.distance < shortestDistance) {
                        shortestDistance = result.distance;
                        nextStop = point;
                    }
                }
            }
            if (!nextStop) break;
            let availableVolume = this.graph.vertices[nextStop].volume;
            let canCarry = Math.min(availableVolume, this.truckCapacity - currentTruckLoad);
            this.graph.vertices[nextStop].volume -= canCarry;
            currentTruckLoad += canCarry;
            totalDistance += shortestDistance;
            route.push(nextStop);
            remainingPoints = remainingPoints.filter(p => p !== nextStop);
            if (currentTruckLoad === this.truckCapacity) {
                const returnTrip = this.findShortestPath(nextStop, dumpSite);
                totalDistance += returnTrip.distance;
                route.push(dumpSite);
                currentTruckLoad = 0;
            }
        }
        if (currentTruckLoad > 0) {
            const returnTrip = this.findShortestPath(route[route.length - 1], dumpSite);
            totalDistance += returnTrip.distance;
            route.push(dumpSite);
        }
        return { route, totalDistance };
    }

    findShortestPath(start, end) {
        if (!this.graph[start] || !this.graph[end]) {
            return null; // Se os pontos não existem
        }

        const distances = {};
        const previous = {};
        const priorityQueue = Object.keys(this.graph);

        // Inicialização das distâncias
        priorityQueue.forEach(vertex => {
            distances[vertex] = vertex === start ? 0 : Infinity;
        });

        while (priorityQueue.length) {
            // Ordena e pega o nó com a menor distância
            priorityQueue.sort((a, b) => distances[a] - distances[b]);
            const current = priorityQueue.shift();

            if (current === end) break;

            // Processa os vizinhos do nó atual
            for (const [neighbor, weight] of Object.entries(this.graph[current].edges)) {
                const newDistance = distances[current] + weight;

                if (newDistance < distances[neighbor]) {
                    distances[neighbor] = newDistance;
                    previous[neighbor] = current;
                }
            }
        }

        // Reconstrução do caminho mais curto
        let path = [];
        let step = end;
        while (step) {
            path.unshift(step);
            step = previous[step];
        }

        return path.length ? { path, totalDistance: distances[end] } : null;
    }
        
}

export default GraphService;