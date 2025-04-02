import mongoose from "mongoose";

const fixedPointSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Nome do local (ex: "Garagem Central", "Aterro Sanitário")
    type: { 
        type: String, 
        enum: ["GARAGEM", "DESCARTE"], // Tipos de pontos fixos
        required: true
    },
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
    }
});

fixedPointSchema.index({ location: "2dsphere" });
export default mongoose.model("FixedPoint", fixedPointSchema);