import Graph from '../services/graphService.js';

const graph = new Graph();

// Adicionar um novo ponto de coleta
const addPoint = (req, res) => {
    const { point } = req.body;
    graph.addNode(point);
    res.status(201).json({ success: `Ponto ${point} adicionado com sucesso.` });
};

// Adicionar uma conexão entre pontos de coleta
const addRoute = (req, res) => {
    const { origin, destination, weight } = req.body;
    graph.addEdge(origin, destination, parseFloat(weight));
    res.status(201).json({ success: `Rota entre ${origin} e ${destination} adicionada com sucesso.` });
};

// Calcular o melhor caminho entre dois pontos
const findRoute = (req, res) => {
    const { start, end } = req.query;
    const result = graph.findShortestPath(start, end);
    if (result) {
        res.status(200).json(result);
    } else { res.status(404).json({ error: 'Caminho não encontrado.' }); }
};

export default {
    addPoint,
    addRoute,
    findRoute
};