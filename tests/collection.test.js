import request from "supertest";
import mongoose from "mongoose";
import app from "../index.js";

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) { // Verifica se já está conectado
        await mongoose.connect("mongodb://127.0.0.1:27017/api-aiVol", { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
    }
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) { // Verifica se a conexão está ativa
        await mongoose.connection.db.dropDatabase(); // Limpa o banco de dados após os testes
        await mongoose.connection.close();
        await mongoose.disconnect();
    }
});

describe("Testes da API de Pontos de Coleta", () => {
    let newPointId;

    test("Cria um novo ponto de coleta", async () => {
        const response = await request(app)
            .post("/collectionpoint")
            .send({
                address: "Rua Teste",
                latitude: -23.5505,
                longitude: -46.6333,
                volume: 120,
                scheduledDate: "2025-03-10",
                materialType: "Madeira"
            });

        expect(response.status).toBe(201);
        expect(response.body.newCollectionPoint).toHaveProperty("_id");
        newPointId = response.body.newCollectionPoint._id;
    });

    test("Busca todos os pontos de coleta", async () => {
        const response = await request(app).get("/collectionpoints");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test("Busca um ponto de coleta pelo ID", async () => {
        const response = await request(app).get(`/collectionpoint/${newPointId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("_id", newPointId);
    });

    test("Atualiza um ponto de coleta", async () => {
        const response = await request(app)
            .patch(`/collectionpoint/${newPointId}`)
            .send({ volume: 150 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe("Ponto de coleta atualizado com sucesso");
    });

    test("Deleta um ponto de coleta", async () => {
        const response = await request(app).delete(`/collectionpoint/${newPointId}`);
        expect(response.status).toBe(204);
    });
});
