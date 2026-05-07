import { Request, Response } from "express";
import {
    getAllPermissionGroups,
    getPermissionGroupById,
    createPermissionGroup,
    updatePermissionGroup,
    deletePermissionGroup,
    addPermissionToGroup,
    removePermissionFromGroup,
    grantGroupPermissionsToRoles,
    revokeGroupPermissionsFromRoles
} from "../services/permissionGroupsService";
import { handleRequest } from "../helpers/controllerHelpers";

export const listPermissionGroups = async (_request: Request, response: Response): Promise<void> => {
    const permissionGroups = await getAllPermissionGroups();
    response.json(permissionGroups);
};

export const showPermissionGroup = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => getPermissionGroupById(Number(request.params.id)), 200, 404);
};

export const storePermissionGroup = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => createPermissionGroup(request.body), 201);
};

export const updatePermissionGroupController = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => updatePermissionGroup(Number(request.params.id), request.body));
};

export const destroyPermissionGroup = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => deletePermissionGroup(Number(request.params.id)), 204);
};

// Permissões do grupo

export const addPermission = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(
        response,
        () => addPermissionToGroup(Number(request.params.id), Number(request.body.permissionId)),
        201
    );
};

export const removePermission = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(
        response,
        () => removePermissionFromGroup(Number(request.params.id), Number(request.params.permissionId)),
        204
    );
};

// Grant / Revoke para Roles

export const grantPermissions = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => grantGroupPermissionsToRoles(Number(request.params.id), request.body));
};

export const revokePermissions = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => revokeGroupPermissionsFromRoles(Number(request.params.id), request.body));
};