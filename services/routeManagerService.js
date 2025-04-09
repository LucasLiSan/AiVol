import TruckCollector from "../models/truckCollectors.js";
import FixedPoint from "../models/truckFixedPoints.js";
import haversine from 'haversine-distance'; // para calcular distâncias geográficas

class RouteManagerService {
    // Atualiza localização e status do caminhão
    async updateTruckLocation(truckId, newCoords) {
        const truck = await TruckCollector.findById(truckId);
        if (!truck) throw new Error("Caminhão não encontrado.");

        truck.location.coordinates = newCoords;
        truck.routeStatus = "EM ROTA";
        await truck.save();
        return truck;
    }

    // Incrementa carga e verifica se está cheio
    async collectWaste(truckId, collectedAmount) {
        const truck = await TruckCollector.findById(truckId);
        if (!truck) throw new Error("Caminhão não encontrado.");

        // Inicializa ou atualiza carga atual
        if (!truck.currentLoad) truck.currentLoad = 0;
        truck.currentLoad += collectedAmount;

        // Atualiza status de carga
        const loadPercent = truck.currentLoad / truck.capacity;
        if (loadPercent >= 1) {
            truck.loadStatus = "OCUPADO";
            await truck.save();
            return this.sendToNearestDisposal(truck); // Caminhão cheio? Vai descarregar
        } else if (loadPercent >= 0.5) {
            truck.loadStatus = "PARCIALMENTE OCUPADO";
        }

        await truck.save();
        return truck;
    }

    // Envia o caminhão ao ponto de descarte mais próximo
    async sendToNearestDisposal(truck) {
        const disposalPoints = await FixedPoint.find({ type: "DESCARTE" });

        const closest = disposalPoints.reduce((prev, curr) => {
            const distPrev = haversine(truck.location.coordinates, prev.location.coordinates);
            const distCurr = haversine(truck.location.coordinates, curr.location.coordinates);
            return distCurr < distPrev ? curr : prev;
        });

        truck.routeStatus = "DESCARREGANDO";
        truck.destination = closest.location.coordinates; // opcional: guardar o destino
        await truck.save();

        return { message: "Indo descarregar", destination: closest.name };
    }

    // Após descarregar, limpar carga e voltar ao ponto de coleta mais próximo
    async returnToCollection(truckId, availableCollectionPoints) {
        const truck = await TruckCollector.findById(truckId);
        if (!truck) throw new Error("Caminhão não encontrado.");

        // Limpa a carga
        truck.currentLoad = 0;
        truck.loadStatus = "VAZIO";

        // Vai para o ponto de coleta mais próximo
        const closest = availableCollectionPoints.reduce((prev, curr) => {
            const distPrev = haversine(truck.location.coordinates, prev.location.coordinates);
            const distCurr = haversine(truck.location.coordinates, curr.location.coordinates);
            return distCurr < distPrev ? curr : prev;
        });

        truck.routeStatus = "EM ROTA";
        truck.destination = closest.location.coordinates;
        await truck.save();

        return { message: "Voltando para coleta", destination: closest.name };
    }
}

export default new RouteManagerService();