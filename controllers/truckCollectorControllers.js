import truckCollectorService from "../services/truckCollectorService.js";
import { ObjectId } from "mongodb";

// Criar um novo caminhão
const createNewTruck = async (req, res) => {
    try {
        const newTruck = await truckCollectorService.create(req.body);
        res.status(201).json({ success: `Caminhão cadastrado com sucesso!`, newTruck });
    } catch (error) {
        res.status(500).json({ error: `Erro ao cadastrar o caminhão: ${error.message}` });
    }
}

// Buscar todos os caminhões
const getAllTrucks = async (req, res) => {
    try {
        const trucks = await truckCollectorService.getAll();
        res.status(200).json(trucks);
    } catch (error) {
        res.status(500).json({ error: `Erro ao buscar os caminhões.` });
    }
}

// Buscar um caminhão específico pelo ID
const getOneTruck = async (req, res) => {
    try {
        const truck = await truckCollectorService.getOne(req.params.id);
        if (!truck) {
            return res.status(404).json({ error: `Caminhão não encontrado.` });
        }
        res.status(200).json(truck);
    } catch (error) {
        res.status(500).json({ error: `Erro ao buscar o caminhão: ${error.message}` });
    }
}

// Atualizar informações do caminhão
const updateTruck = async (req, res) => {
    try {
        const truck = await truckCollectorService.update(req.params.id, req.body);
        if (!truck) {
            return res.status(404).json({ error: `Caminhão não encontrado para atualização.` });
        }
        res.status(200).json({ success: `Caminhão atualizado com sucesso.` });
    } catch (error) {
        res.status(500).json({ error: `Erro ao atualizar o caminhão: ${error.message}` });
    }
}

// Deletar o caminhão
const deleteTruck = async (req, res) => {
    try {
        const truck = await truckCollectorService.getOne(req.params.id);
        if (!truck) {
            return res.status(404).json({ error: `Caminhão não encontrado para deleção.` });
        }
        await truckCollectorService.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: `Erro ao deletar o caminhão: ${error.message}` });
    }
}

export default {
    createNewTruck,
    getAllTrucks,
    getOneTruck,
    updateTruck,
    deleteTruck
}
