import TruckCollector from "../models/truckCollectors.js";

class TruckCollectorService {
  // Criar um novo caminhão
  async create(data) {
    try {
      const newTruck = new TruckCollector(data);
      await newTruck.save();
      return newTruck;
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao cadastrar o caminhão");
    }
  }

  // Buscar todos os caminhões
  async getAll() {
    try {
      return await TruckCollector.find();
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao buscar os caminhões");
    }
  }

  // Buscar um caminhão específico
  async getOne(id) {
    try {
      return await TruckCollector.findById(id);
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao buscar o caminhão");
    }
  }

  // Atualizar os dados de um caminhão
  async update(id, data) {
    try {
      return await TruckCollector.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao atualizar o caminhão");
    }
  }

  // Deletar um caminhão
  async delete(id) {
    try {
      await TruckCollector.findByIdAndDelete(id);
    } catch (error) {
      console.log(error);
      throw new Error("Erro ao deletar o caminhão");
    }
  }
}

export default new TruckCollectorService();
