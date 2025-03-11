import express from 'express';
import graphController from '../controllers/graphControllers.js';

const graphRoutes = express.Router();

// Rota para adicionar um ponto de coleta
graphRoutes.post('/add-point', graphController.addPoint);

// Rota para adicionar uma rota entre pontos de coleta
graphRoutes.post('/add-route', graphController.addRoute);

// Rota para encontrar a melhor rota entre dois pontos
graphRoutes.get('/find-route', graphController.findRoute);

export default graphRoutes;