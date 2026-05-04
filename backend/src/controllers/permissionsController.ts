import { Request, Response } from "express";
import {
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
} from "../services/permissionsService";

export const listPermissions = async (_request: Request, response: Response): Promise<void> => {
    const permissions = await getAllPermissions();
    response.json(permissions);
};

export const showPermission = async (request: Request, response: Response): Promise<void> => {
    try {
        const permission = await getPermissionById(Number(request.params.id));
        response.json(permission);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const storePermission = async (request: Request, response: Response): Promise<void> => {
    try {
        const permission = await createPermission(request.body);
        response.status(201).json(permission);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const updatePermissionController = async (request: Request, response: Response): Promise<void> => {
    try {
        const permission = await updatePermission(Number(request.params.id), request.body);
        response.json(permission);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const destroyPermission = async (request: Request, response: Response): Promise<void> => {
    try {
        await deletePermission(Number(request.params.id));
        response.status(204).send();
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};