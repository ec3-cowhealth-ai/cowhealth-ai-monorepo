import { Request, Response } from "express";
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionToRole,
    removePermissionFromRole,
} from "../services/rolesService";

export const listRoles = async (_request: Request, response: Response): Promise<void> => {
    const roles = await getAllRoles();
    response.json(roles);
};

export const showRole = async (request: Request, response: Response): Promise<void> => {
    try {
        const role = await getRoleById(Number(request.params.id));
        response.json(role);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const storeRole = async (request: Request, response: Response): Promise<void> => {
    try {
        const role = await createRole(request.body);
        response.status(201).json(role);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const updateRoleController = async (request: Request, response: Response): Promise<void> => {
    try {
        const role = await updateRole(Number(request.params.id), request.body);
        response.json(role);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const destroyRole = async (request: Request, response: Response): Promise<void> => {
    try {
        await deleteRole(Number(request.params.id));
        response.status(204).send();
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const addPermissionToRole = async (request: Request, response: Response): Promise<void> => {
    try {
        await assignPermissionToRole(
        Number(request.params.id),
        Number(request.body.permissionId)
        );
        response.status(201).json({ message: "Permissão atribuída com sucesso." });
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const removeRolePermission = async (request: Request, response: Response): Promise<void> => {
    try {
        await removePermissionFromRole(
        Number(request.params.id),
        Number(request.params.permissionId)
        );
        response.status(204).send();
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};