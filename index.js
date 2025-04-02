import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import collectionPointRoutes from "./routes/collectionRoutes.js";
import graphRoutes from "./routes/graphRoutes.js";
import truckCollectorRoutes from "./routes/truckCollectorsRoutes.js";
import truckFixedPointsRoutes from "./routes/truckFixedPointsRoutes.js";

//mongoose.connect("mongodb://127.0.0.1:27017/api-aiVol");

const app = express();

// Middleware para processar o corpo das requisições como JSON
app.use(bodyParser.json());  // Para JSON
app.use(bodyParser.urlencoded({ extended: true }));  // Para dados de formulário, se necessário

/* ----------  DEFINIÇÕES BÁSICAS ---------- */
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', collectionPointRoutes);
app.use('/', truckCollectorRoutes);
app.use('/', truckFixedPointsRoutes);
app.use('/graph', graphRoutes);

/* ----------\/ INICIANDO SERVIDOR \/---------- 
const port = 8080;
//const myServer = ip.address();
const renderPort = '0.0.0.0';
//console.log(myServer);

app.listen(port, (error) => {
    if(error) {console.log(error); }
    console.log(`API rodando em http://localhost:${port}.`);
});*/

export default app;