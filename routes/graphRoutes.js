import express from 'express';
import GraphService from '../services/graphService.js';

const router = express.Router();
const graphService = new GraphService();

// Rota para adicionar aresta
router.post('/add-edge', async (req, res) => {
    const { source, destination, distance } = req.body;
    await graphService.addEdge(source, destination, distance);
    res.status(201).send('Aresta adicionada com sucesso');
});

// Rota para encontrar o menor caminho
router.get('/shortest-path', async (req, res) => {
    const { start, end } = req.query;
    const result = await graphService.findShortestPath(start, end);
    res.status(200).json(result);
});

export default router;