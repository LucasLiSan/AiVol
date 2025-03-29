import mongoose from "mongoose";

const collectionPointSchema = new mongoose.Schema({
    address: String,
    latitude: Number,
    longitude: Number,
    volume: Number,
    scheduledDate: Date,
    collectedVolume: { type: Number, default: 0 }, // Volume já coletado
    collectedDateTime: Date, // Data/hora quando todo o volume foi retirado
    materialType: String,
    collectionHistory: [{ 
        collectedVolume: Number, 
        collectedAt: Date 
    }] // Histórico de retiradas
});

export default mongoose.model("CollectionPoint", collectionPointSchema);