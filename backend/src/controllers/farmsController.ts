import { Request, Response } from "express";
import {
    getAllFarms,
    getFarmById,
    createFarm,
    updateFarm,
    deleteFarm,
} from "../services/farmsService";

export const listFarms = async (_request: Request, response: Response): Promise<void> => {
    const farms = await getAllFarms();
    response.json(farms);
};

export const showFarm = async (request: Request, response: Response): Promise<void> => {
    try {
        const farm = await getFarmById(Number(request.params.id));
        response.json(farm);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const storeFarm = async (request: Request, response: Response): Promise<void> => {
    try {
        const farm = await createFarm(request.body);
        response.status(201).json(farm);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const updateFarmController = async (request: Request, response: Response): Promise<void> => {
    try {
        const farm = await updateFarm(Number(request.params.id), request.body);
        response.json(farm);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const destroyFarm = async (request: Request, response: Response): Promise<void> => {
    try {
        await deleteFarm(Number(request.params.id));
        response.status(204).send();
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};