// graphService.js
class GraphService {
    constructor() {
        this.adjacencyList = new Map();
    }

    async addNode(node) {
        if (!this.adjacencyList.has(node)) {
            this.adjacencyList.set(node, []);
        }
    }

    async addEdge(source, destination, distance) {
        if (!this.adjacencyList.has(source)) {
            this.adjacencyList.set(source, []);
        }
        if (!this.adjacencyList.has(destination)) {
            this.adjacencyList.set(destination, []);
        }
        this.adjacencyList.get(source).push({ node: destination, distance });
        this.adjacencyList.get(destination).push({ node: source, distance }); // Se for um grafo não-direcionado
    }

    async findShortestPath(start, end) {
        const distances = new Map();
        const previousNodes = new Map();
        const visited = new Set();
        const priorityQueue = new Map();
    
        // Initialize distances and priority queue
        for (const node of this.adjacencyList.keys()) {
            distances.set(node, Infinity);
            previousNodes.set(node, null);
            priorityQueue.set(node, Infinity);
        }
    
        distances.set(start, 0);
        priorityQueue.set(start, 0);
    
        while (priorityQueue.size > 0) {
            const currentNode = [...priorityQueue.entries()].reduce((a, b) => a[1] < b[1] ? a : b)[0];
            priorityQueue.delete(currentNode);
    
            if (currentNode === end) {
                const path = [];
                let current = end;
    
                while (current) {
                    path.unshift(current);
                    current = previousNodes.get(current);
                }

                if (path[0] === start) {
                    return { path, distance: distances.get(end) };
                } else {
                    // No path was found
                    return { path: [], distance: Infinity };
                }
            }
    
            visited.add(currentNode);
    
            const neighbors = this.adjacencyList.get(currentNode) || [];
            for (const neighbor of neighbors) {
                if (visited.has(neighbor.node)) continue;
    
                const newDistance = distances.get(currentNode) + neighbor.distance;
    
                if (newDistance < distances.get(neighbor.node)) {
                    distances.set(neighbor.node, newDistance);
                    previousNodes.set(neighbor.node, currentNode);
                    priorityQueue.set(neighbor.node, newDistance);
                }
            }
        }

        return { path: [], distance: Infinity };
    }
}

export default GraphService;