import truckFixedPointsService from "../services/truckFixedPointsService.js";

const createNewFixedPoint = async (req, res) => {
  try {
    const newPoint = await truckFixedPointsService.create(req.body);
    res.status(201).json({ success: "Ponto fixo cadastrado com sucesso!", newPoint });
  } catch (error) {
    res.status(500).json({ error: `Erro ao cadastrar o ponto fixo: ${error.message}` });
  }
};

const getAllFixedPoints = async (req, res) => {
  try {
    const points = await truckFixedPointsService.getAll();
    res.status(200).json(points);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar os pontos fixos." });
  }
};

const getOneFixedPoint = async (req, res) => {
  try {
    const point = await truckFixedPointsService.getOne(req.params.id);
    if (!point) {
      return res.status(404).json({ error: "Ponto fixo não encontrado." });
    }
    res.status(200).json(point);
  } catch (error) {
    res.status(500).json({ error: `Erro ao buscar o ponto fixo: ${error.message}` });
  }
};

const updateFixedPoint = async (req, res) => {
  try {
    const point = await truckFixedPointsService.update(req.params.id, req.body);
    if (!point) {
      return res.status(404).json({ error: "Ponto fixo não encontrado para atualização." });
    }
    res.status(200).json({ success: "Ponto fixo atualizado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: `Erro ao atualizar o ponto fixo: ${error.message}` });
  }
};

const deleteFixedPoint = async (req, res) => {
  try {
    const point = await truckFixedPointsService.getOne(req.params.id);
    if (!point) {
      return res.status(404).json({ error: "Ponto fixo não encontrado para deleção." });
    }
    await truckFixedPointsService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: `Erro ao deletar o ponto fixo: ${error.message}` });
  }
};

export default {
  createNewFixedPoint,
  getAllFixedPoints,
  getOneFixedPoint,
  updateFixedPoint,
  deleteFixedPoint
};
