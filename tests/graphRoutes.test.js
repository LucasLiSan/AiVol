// graphRoutes.test.js
import GraphService from '../services/graphService.js';

describe('Graph Service', () => {
    let graph;

    beforeEach(() => {
        graph = new GraphService();
    });

    test('Deve adicionar um novo nó ao grafo', async () => {
        await graph.addNode('A');
        expect(graph.adjacencyList.has('A')).toBe(true);
    });

    test('Deve adicionar uma aresta entre dois nós', async () => {
        await graph.addEdge('A', 'B', 5);
        expect(graph.adjacencyList.get('A')).toEqual([{ node: 'B', distance: 5 }]);
        expect(graph.adjacencyList.get('B')).toEqual([{ node: 'A', distance: 5 }]);
    });

    test('Deve encontrar o menor caminho entre dois nós', async () => {
        await graph.addEdge('A', 'B', 1);
        await graph.addEdge('B', 'C', 2);
        await graph.addEdge('A', 'C', 4);

        const result = await graph.findShortestPath('A', 'C');
        expect(result.path).toEqual(['A', 'B', 'C']);
        expect(result.distance).toBe(3);
    });

    test('Deve retornar null se não houver caminho entre os nós', async () => {
        await graph.addNode('A');
        await graph.addNode('B');

        const result = await graph.findShortestPath('A', 'B');
        expect(result.path).toEqual([]);
        expect(result.distance).toBe(Infinity);
    });

    test('Deve lidar com grafos mais complexos corretamente', async () => {
        await graph.addEdge('A', 'B', 1);
        await graph.addEdge('B', 'C', 2);
        await graph.addEdge('C', 'D', 1);
        await graph.addEdge('A', 'D', 6);
        await graph.addEdge('B', 'D', 4);

        const result = await graph.findShortestPath('A', 'D');
        expect(result.path).toEqual(['A', 'B', 'C', 'D']);
        expect(result.distance).toBe(4);
    });
});