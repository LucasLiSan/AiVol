import collectionService from "../services/collectionService.js";
import { ObjectId } from "mongodb";

const createNewCollectionPoint = async (req, res) => {
    try {
        const newCollectionPoint = await collectionService.create(req.body);
        res.status(201).json({ success: `Ponto de coleta criado com sucesso!`, newCollectionPoint});
    } catch (error) { res.status(500).json({ error: `Erro ao criar o ponto de coleta.` }); }
}

const getAllCollectionPoints = async (req, res) => {
    try {
        const collectionPoints = await collectionService.getAll();
        res.status(200).json(collectionPoints);
    } catch (error) { res.status(500).json({ error:`Erro ao buscar os pontos de coleta.` }); }
}

const getOneCollectionPoint = async (req, res) => {
    try {
        const collectionPoint = await collectionService.getOne(req.params.id);
        if(!collectionPoint) {
            return res.status(404).json({ error: `Ponto de coleta não encontrado` });
        } else { res.status(200).json(collectionPoint); }
    } catch (error) { res.status(500).json({ error: `Erro ao buscar o ponto de coleta` }); }
}

const updateCollectionPoint = async (req, res) => {
    try {
        const collectionPoint = await collectionService.update(req.params.id, req.body);
        res.status(200).json({ success: `Ponto de coleta atualizado com sucesso` });
    } catch (error) { res.status(500).json({ error: `Erro ao atualizar o ponto de coleta` }); }
}

const deleteCollectionPoint = async (req, res) => {
    try {
        await collectionService.delete(req.params.id);
        res.status(204).send();
    } catch (error) { res.status(500).json({ error: `Erro ao deletar o ponto de coleta.` }); }
}

export default {
    createNewCollectionPoint,
    getAllCollectionPoints,
    getOneCollectionPoint,
    updateCollectionPoint,
    deleteCollectionPoint
}