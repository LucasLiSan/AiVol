import mongoose from 'mongoose';
import CollectionPoint from '../models/collectionPoint.js';
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

class GraphService {
  constructor() {
    this.graph = {};
  }

  addVertex(id, volume = 0) {
    if (!this.graph[id]) {
      this.graph[id] = { edges: {}, volume };
    }
  }

  addEdge(id1, id2, weight) {
    if (!this.graph[id1] || !this.graph[id2]) return;
    this.graph[id1].edges[id2] = weight;
    this.graph[id2].edges[id1] = weight;
  }

  findShortestPath(start, end) {
    const distances = {};
    const prev = {};
    const pq = new MinPriorityQueue();
    
    Object.keys(this.graph).forEach(v => {
      distances[v] = v === start ? 0 : Infinity;
      pq.enqueue(v, distances[v]);
    });

    while (!pq.isEmpty()) {
      let { element: current } = pq.dequeue();
      if (current === end) break;
      
      for (const neighbor in this.graph[current].edges) {
        const newDist = distances[current] + this.graph[current].edges[neighbor];
        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          prev[neighbor] = current;
          pq.enqueue(neighbor, newDist);
        }
      }
    }
    
    const path = [];
    let step = end;
    while (step) {
      path.unshift(step);
      step = prev[step];
    }
    return path[0] === start ? path : [];
  }

  async findOptimizedRoute(start, maxCapacity) {
    let currentVolume = 0;
    let path = [start];
    let visited = new Set();
    let current = start;
    
    while (true) {
      let nextPoint = null;
      let shortestDist = Infinity;

      for (const neighbor in this.graph[current].edges) {
        if (!visited.has(neighbor) && this.graph[neighbor].volume > 0) {
          const dist = this.graph[current].edges[neighbor];
          if (dist < shortestDist) {
            nextPoint = neighbor;
            shortestDist = dist;
          }
        }
      }

      if (!nextPoint || currentVolume + this.graph[nextPoint].volume > maxCapacity) {
        break;
      }

      visited.add(nextPoint);
      currentVolume += this.graph[nextPoint].volume;
      path.push(nextPoint);
      current = nextPoint;
    }
    return path;
  }
}

export default new GraphService();