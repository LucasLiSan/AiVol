import express from "express";
import truckCollectorControllers from "../controllers/truckCollectorControllers.js";

const truckCollectorRoutes = express.Router();

// Rota para criar um novo caminhão
truckCollectorRoutes.post('/truckcollector', truckCollectorControllers.createNewTruck);

// Rota para obter todos os caminhões
truckCollectorRoutes.get('/truckcollectors', truckCollectorControllers.getAllTrucks);

// Rota para obter um caminhão específico pelo ID
truckCollectorRoutes.get('/truckcollector/:id', truckCollectorControllers.getOneTruck);

// Rota para atualizar as informações de um caminhão pelo ID
truckCollectorRoutes.patch('/truckcollector/:id', truckCollectorControllers.updateTruck);

// Rota para deletar um caminhão pelo ID
truckCollectorRoutes.delete('/truckcollector/:id', truckCollectorControllers.deleteTruck);

export default truckCollectorRoutes;
