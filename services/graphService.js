import mongoose from 'mongoose';
import CollectionPoint from '../models/collectionPoint.js';

class GraphService {
  constructor() {
    this.graph = { vertices: {} };
  }

  async loadCollectionPoints() {
    const points = await CollectionPoint.find();
    const MAX_DISTANCE = 0.9; // distância máxima permitida em km

    points.forEach(point => {
      const vertex = point._id.toString();
      this.addVertex(vertex, point.latitude, point.longitude);
    });

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const point1 = points[i];
        const point2 = points[j];
        const distance = this.calculateDistance(
          point1.latitude,
          point1.longitude,
          point2.latitude,
          point2.longitude
        );

        if (distance <= MAX_DISTANCE) { // Conecta apenas pontos próximos
          this.addEdge(point1._id.toString(), point2._id.toString(), distance);
          this.addEdge(point2._id.toString(), point1._id.toString(), distance);
        }
      }
    }
  }

  addVertex(vertex, lat, lon) {
    this.graph.vertices[vertex] = { lat, lon, edges: {} };
  }

  addEdge(vertex1, vertex2, distance) {
    if (this.graph.vertices[vertex1] && this.graph.vertices[vertex2]) {
      this.graph.vertices[vertex1].edges[vertex2] = distance;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  findShortestPath(startVertex, endVertex) {
    const distances = {};
    const previous = {};
    const queue = new Set(Object.keys(this.graph.vertices));

    for (const vertex of queue) {
      distances[vertex] = Infinity;
    }
    distances[startVertex] = 0;

    while (queue.size > 0) {
      const currentVertex = [...queue].reduce((a, b) => (distances[a] < distances[b] ? a : b));
      if (currentVertex === endVertex) break;
      
      if (distances[currentVertex] === Infinity) break; // Nenhuma conexão possível a partir daqui

      queue.delete(currentVertex);
      const neighbors = this.graph.vertices[currentVertex].edges;

      for (const neighbor in neighbors) {
        const alt = distances[currentVertex] + neighbors[neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = currentVertex;
        }
      }
    }

    const path = [];
    let u = endVertex;

    while (u) {
      path.unshift(u);
      u = previous[u];
    }

    if (path.length > 1) {
      return { path, distance: distances[endVertex] };
    } else {
      return null;
    }
  }
}

export default GraphService;
