import mongoose, { Schema } from "mongoose";

const collectionPointSchema = new mongoose.Schema ({
    address: String,
    latitude: Number,
    longitude: Number,
    volume: Number,
    scheduledDate: Date,
    collectedVolume: { type: Number, default: 0 }, // Volume já coletado
    materialType: String
});

export default mongoose.model('CollectionPoint', collectionPointSchema);