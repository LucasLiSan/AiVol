import mongoose, { Schema } from "mongoose";

const truckCollectorsSchema = new mongoose.Schema ({
    truckPlate: String, //placa do caminhão
    truckBrand: String, //marca do caminhão
    capacity: Number, //capacidade do caminhão
    kmPerLiter: Number, //km por litro do caminhão
    routeStatus: { 
        type: String, 
        enum: ["EM ROTA", "DESCARREGANDO", "CARREGANDO", "PARADO", "FORA DE SERVIÇO"], 
        default: "PARADO" 
    },
    loadStatus: { 
        type: String, 
        enum: ["VAZIO", "PARCIALMENTE OCUPADO", "OCUPADO"], 
        default: "VAZIO" 
    },
    location: { 
        type: { 
            type: String, 
            enum: ["Point"], 
            default: "Point" 
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    } // localização do caminhão
});

truckCollectorsSchema.index({ location: "2dsphere" });

export default mongoose.model('TruckCollector', truckCollectorsSchema);
