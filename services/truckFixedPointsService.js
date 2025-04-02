import TruckFixedPoint from "../models/truckFixedPoints.js";

class TruckFixedPointsService {
  // Criar um novo ponto fixo
  async create(data) {
    try {
      const newPoint = new TruckFixedPoint(data);
      await newPoint.save();
      return newPoint;
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao cadastrar o ponto fixo");
    }
  }

  // Buscar todos os pontos fixos
  async getAll() {
    try {
      return await TruckFixedPoint.find();
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao buscar os pontos fixos");
    }
  }

  // Buscar um ponto fixo específico
  async getOne(id) {
    try {
      return await TruckFixedPoint.findById(id);
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao buscar o ponto fixo");
    }
  }

  // Atualizar um ponto fixo
  async update(id, data) {
    try {
      return await TruckFixedPoint.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao atualizar o ponto fixo");
    }
  }

  // Deletar um ponto fixo
  async delete(id) {
    try {
      await TruckFixedPoint.findByIdAndDelete(id);
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao deletar o ponto fixo");
    }
  }
}

export default new TruckFixedPointsService();