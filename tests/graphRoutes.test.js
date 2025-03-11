import request from 'supertest';
import app from '../index.js';

describe('Graph Routes API', () => {
    test('Deve adicionar um novo ponto de coleta', async () => {
        const response = await request(app)
            .post('/graph/add-point')
            .send({ point: 'A' });  // Certifique-se de enviar o valor corretamente
    
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ success: "Ponto A adicionado com sucesso." });
    });

  test('Deve adicionar uma rota entre pontos de coleta', async () => {
    const response = await request(app)
        .post('/graph/add-route')
        .send({ origin: 'A', destination: 'B', weight: 10 });  // Certifique-se de enviar os valores corretamente

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ success: "Rota entre A e B adicionada com sucesso." });
  });

  test('Deve encontrar a melhor rota entre dois pontos', async () => {
    const response = await request(app)
        .get('/graph/find-route')
        .query({ start: 'A', end: 'B' });  // Passando os parâmetros pela query

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
        message: "Rota encontrada",
        path: ['A', 'B'],
        distance: 10
    });
  });
});