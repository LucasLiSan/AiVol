import express from "express";
import truckFixedPointsController from "../controllers/truckFixedPointsControllers.js";

const truckFixedPointsRoutes = express.Router();

truckFixedPointsRoutes.post("/truckfixedpoints", truckFixedPointsController.createNewFixedPoint);
truckFixedPointsRoutes.get("/truckfixedpoints", truckFixedPointsController.getAllFixedPoints);
truckFixedPointsRoutes.get("/truckfixedpoints/:id", truckFixedPointsController.getOneFixedPoint);
truckFixedPointsRoutes.patch("/truckfixedpoints/:id", truckFixedPointsController.updateFixedPoint);
truckFixedPointsRoutes.delete("/truckfixedpoints/:id", truckFixedPointsController.deleteFixedPoint);

export default truckFixedPointsRoutes;