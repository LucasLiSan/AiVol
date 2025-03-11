import mongoose, { Schema } from "mongoose";

const collectionPointSchema = new mongoose.Schema ({
    address: String,
    latitude: Number,
    longitude: Number,
    volume: Number,
    scheduledDate: Date,
    materialType: String
});

export default mongoose.model('CollectionPoint', collectionPointSchema);