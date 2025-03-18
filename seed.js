import mongoose from 'mongoose';
import CollectionPoint from './models/collectionPoint.js';

mongoose.connect('mongodb://localhost:27017/api-aiVol', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

const points = [
  { address: "Rua A, 123", latitude: -23.55052, longitude: -46.6333, volume: 10, scheduledDate: new Date(), materialType: "Papel" },
  { address: "Rua B, 456", latitude: -23.55152, longitude: -46.6338, volume: 15, scheduledDate: new Date(), materialType: "Plástico" },
  { address: "Rua C, 789", latitude: -23.55252, longitude: -46.6343, volume: 20, scheduledDate: new Date(), materialType: "Vidro" },
];

async function seedDatabase() {
  await CollectionPoint.deleteMany({});
  await CollectionPoint.insertMany(points);
  console.log("Pontos de coleta inseridos com sucesso.");
  mongoose.disconnect();
}

seedDatabase();