import express from 'express';
import routeManagerService from '../services/routeManagerService.js';

const router = express.Router();

router.post('/coleta/:id', async (req, res) => {
    const { quantidade } = req.body;
    try {
      const resultado = await routeManagerService.collectWaste(req.params.id, quantidade);
      res.json(resultado);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
});

export default router;