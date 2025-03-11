import PriorityQueue from 'priorityqueuejs';

class Graph {
    constructor() {
        this.nodes = new Map();
    }

    addNode(node) {
        if (!this.nodes.has(node)) {
            this.nodes.set(node, []);
        }
    }

    addEdge(origin, destination, weight) {
        this.addNode(origin);
        this.addNode(destination);
        this.nodes.get(origin).push({ node: destination, weight });
        this.nodes.get(destination).push({ node: origin, weight });
    }

    findShortestPath(start, end) {
        const distances = new Map();
        const previousNodes = new Map();
        const priorityQueue = new PriorityQueue((a, b) => a.priority - b.priority);

        this.nodes.forEach((_, node) => {
            distances.set(node, Infinity);
            previousNodes.set(node, null);
        });

        distances.set(start, 0);
        priorityQueue.enq({ node: start, priority: 0 });

        while (!priorityQueue.isEmpty()) {
            const { node: currentNode } = priorityQueue.deq();

            if (currentNode === end) break;

            const neighbors = this.nodes.get(currentNode);
            for (const neighbor of neighbors) {
                const alt = distances.get(currentNode) + neighbor.weight;
                if (alt < distances.get(neighbor.node)) {
                    distances.set(neighbor.node, alt);
                    previousNodes.set(neighbor.node, currentNode);
                    priorityQueue.enq({ node: neighbor.node, priority: alt });
                }
            }
        }

        const path = [];
        let currentNode = end;

        while (currentNode) {
            path.unshift(currentNode);
            currentNode = previousNodes.get(currentNode);
        }

        if (path[0] !== start) return null;
        return { path, distance: distances.get(end) };
    }
}

export default Graph;
