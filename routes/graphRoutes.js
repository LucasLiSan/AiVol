import express from 'express';
import GraphService from '../services/graphService.js';
import collectionPoint from '../models/collectionPoint.js';

const router = express.Router();
const graphService = new GraphService();

// Carregar os pontos de coleta no grafo
router.get('/load-points', async (req, res) => {
  try {
    await graphService.loadCollectionPoints();
    const points = await collectionPoint.find({}, 'address');
    const addresses = points.map(point => point.address);

    res.status(200).json({
      message: 'Pontos de coleta carregados no grafo com sucesso.',
      addresses: addresses
    });
  } catch (error) {
    res.status(500).send('Erro ao carregar pontos de coleta: ' + error.message);
  }
});

// Encontrar a rota mais curta entre dois pontos
router.get('/shortest-path', async (req, res) => {
    const { startId, endId } = req.query;
    try {
        const result = graphService.findShortestPath(startId, endId);
        if (result) {
        res.status(200).json(result); // Agora retorna a rota e a distância total
        } else {
        res.status(404).send('Caminho não encontrado.');
        }
    } catch (error) {
        res.status(500).send('Erro ao calcular o caminho mais curto: ' + error.message);
    }
});

export default router;