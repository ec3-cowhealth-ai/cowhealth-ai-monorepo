import { Request, Response } from "express";
import {
    getAllCollars,
    getCollarById,
    createCollar,
    updateCollar,
    deleteCollar,
} from "../services/collarsService";

export const listCollars = async (_request: Request, response: Response): Promise<void> => {
    const collars = await getAllCollars();
    response.json(collars);
};

export const showCollar = async (request: Request, response: Response): Promise<void> => {
    try {
        const collar = await getCollarById(Number(request.params.id));
        response.json(collar);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const storeCollar = async (request: Request, response: Response): Promise<void> => {
    try {
        const collar = await createCollar(request.body);
        response.status(201).json(collar);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const updateCollarController = async (request: Request, response: Response): Promise<void> => {
    try {
        const collar = await updateCollar(Number(request.params.id), request.body);
        response.json(collar);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const destroyCollar = async (request: Request, response: Response): Promise<void> => {
    try {
        await deleteCollar(Number(request.params.id));
        response.status(204).send();
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};