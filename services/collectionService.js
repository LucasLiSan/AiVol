import { error } from "console";
import collectionPoint from "../models/collectionPoint.js";

class CollectionService {
    async create(data) {
        try {
            const newPoint = new collectionPoint(data);
            await newPoint.save();
            return newPoint;
        } catch(error) { console.log(error); }
    }

    async getAll() {
        try {
            return await collectionPoint.find();
        } catch(error) { console.log(error); }
    }

    async getOne(id) {
        try {
            return await collectionPoint.findById(id);
        } catch(error) { console.log(error); }
    }

    async update(id, data) {
        try {
            return await collectionPoint.findByIdAndUpdate(id, data);
        } catch(error) { console.log(error); }
    }

    async delete(id) {
        try {
            return await collectionPoint.findByIdAndDelete(id);
        } catch(error) { console.log(error); }
    }
}

export default new CollectionService();