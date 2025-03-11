import express from "express";
import collectionControllers from "../controllers/collectionControllers.js";

const collectionPointRoutes = express.Router();

collectionPointRoutes.post('/collectionpoint', collectionControllers.createNewCollectionPoint);

collectionPointRoutes.get('/collectionpoints', collectionControllers.getAllCollectionPoints);

collectionPointRoutes.get('/collectionpoint/:id', collectionControllers.getOneCollectionPoint);

collectionPointRoutes.patch('/collectionpoint/:id', collectionControllers.updateCollectionPoint);

collectionPointRoutes.delete('/collectionpoint/:id', collectionControllers.deleteCollectionPoint);

export default collectionPointRoutes;