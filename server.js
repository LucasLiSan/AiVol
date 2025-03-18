import app from "./index.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;
mongoose.connect("mongodb://127.0.0.1:27017/api-aiVol", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Conectado ao MongoDB'))
    .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });