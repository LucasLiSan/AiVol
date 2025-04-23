import mongoose from 'mongoose';
import CollectionPoint from '../models/collectionPoint.js';
import FixedPoint from "../models/truckFixedPoints.js";

class GraphService {
    constructor() {
        this.graph = {}
    }

    async loadCollectionPoints() {
        this.graph = {};

        const collectionPoints  = await CollectionPoint.find();
        const fixedPoints = await FixedPoint.find();

        // 1. Adiciona todos os pontos de coleta como vértices
        collectionPoints.forEach((point) => {
            const [lng, lat] = point.location.coordinates;
            this.addVertex(point._id.toString(), lat, lng);
        });

        // 2. Adiciona todos os pontos fixos (garagem, descarte)
        fixedPoints.forEach((point) => {
            const [lng, lat] = point.location.coordinates;
            this.addVertex(point._id.toString(), lat, lng);
        });

        const allPoints = [...collectionPoints, ...fixedPoints];

        // 3. Conecta todos os pontos entre si (grafo não-direcionado)
        for (let i = 0; i < allPoints.length; i++) {
            for (let j = i + 1; j < allPoints.length; j++) {
                const id1 = allPoints[i]._id.toString();
                const id2 = allPoints[j]._id.toString();
                this.addEdge(id1, id2); // cria aresta bidirecional
            }
        }

        // 4. Log de verificação
        console.log("📊 Total de nós no grafo após carregamento:", Object.keys(this.graph).length);
        for (const nodeId in this.graph) {
            const node = this.graph[nodeId];
            const edgeCount = Object.keys(node.edges).length;
            console.log(`🔹 Nó ${nodeId} tem ${edgeCount} conexões.`);
        }
    }

    async loadFixedPoints() {
        const fixedPoints = await FixedPoint.find();
    
        // Adiciona os pontos fixos (garagem, descarte) ao grafo
        fixedPoints.forEach((point) => {
            const [lat, lon] = point.location.coordinates;
            this.addVertex(point._id.toString(), lat, lon);
        });
    
        // Conecta todos os pontos fixos entre si
        for (let i = 0; i < fixedPoints.length; i++) {
            for (let j = i + 1; j < fixedPoints.length; j++) {
                const id1 = fixedPoints[i]._id.toString();
                const id2 = fixedPoints[j]._id.toString();
                this.addEdge(id1, id2);
            }
        }
    }

    getAllNodes() {
        return this.graph;
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

        console.log(`🔗 Conectado ${id1} <-> ${id2} (${distance.toFixed(3)} km)`);
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
        let remainingPoints = Object.keys(this.graph.vertices);
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
        if (!this.graph[start] || !this.graph[end]) return null;

        let distances = {};
        let previous = {};
        let unvisited = new Set(Object.keys(this.graph));

        for (let node of unvisited) {
            distances[node] = Infinity;
        }
        distances[start] = 0;

        while (unvisited.size > 0) {
            let closestNode = [...unvisited].reduce((a, b) => distances[a] < distances[b] ? a : b);
            if (closestNode === end) {
                let path = [];
                let current = end;
                while (current) {
                    path.unshift(current);
                    current = previous[current];
                }
                return { path, distance: distances[end] };
            }

            unvisited.delete(closestNode);

            for (let neighbor in this.graph[closestNode].edges) {
                let alt = distances[closestNode] + this.graph[closestNode].edges[neighbor];
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = closestNode;
                }
            }
        }

        return null;
    }
}

export default GraphService;