import mongoose from "mongoose";

const collectionPointSchema = new mongoose.Schema({
    address: String,
    volume: Number,
    scheduledDate: Date,
    collectedVolume: { type: Number, default: 0 }, // Volume já coletado
    collectedDateTime: Date, // Data/hora quando todo o volume foi retirado
    materialType: String,
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    collectionHistory: [{ 
        collectedVolume: Number, 
        collectedAt: Date 
    }] // Histórico de retiradas
});

collectionPointSchema.index({ location: "2dsphere" });
export default mongoose.model("CollectionPoint", collectionPointSchema);