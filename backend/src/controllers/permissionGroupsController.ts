import { Request, Response } from "express";
import {
    getAllPermissionGroups,
    getPermissionGroupById,
    createPermissionGroup,
    updatePermissionGroup,
    deletePermissionGroup,
    grantPermissionsToGroup,
    revokePermissionsFromGroup,
} from "../services/permissionGroupsService";

export const listPermissionGroups = async (_request: Request, response: Response): Promise<void> => {
    const permissionGroups = await getAllPermissionGroups();
    response.json(permissionGroups);
};

export const showPermissionGroup = async (request: Request, response: Response): Promise<void> => {
    try {
        const permissionGroup = await getPermissionGroupById(Number(request.params.id));
        response.json(permissionGroup);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const storePermissionGroup = async (request: Request, response: Response): Promise<void> => {
    try {
        const permissionGroup = await createPermissionGroup(request.body);
        response.status(201).json(permissionGroup);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const updatePermissionGroupController = async (request: Request, response: Response): Promise<void> => {
    try {
        const permissionGroup = await updatePermissionGroup(Number(request.params.id), request.body);
        response.json(permissionGroup);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const destroyPermissionGroup = async (request: Request, response: Response): Promise<void> => {
    try {
        await deletePermissionGroup(Number(request.params.id));
        response.status(204).send();
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const grantPermissions = async (request: Request, response: Response): Promise<void> => {
    try {
        const result = await grantPermissionsToGroup(Number(request.params.id), request.body);
        response.json(result);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const revokePermissions = async (request: Request, response: Response): Promise<void> => {
    try {
        const result = await revokePermissionsFromGroup(Number(request.params.id), request.body);
        response.json(result);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};