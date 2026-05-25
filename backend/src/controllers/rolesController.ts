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
import { handleRequest } from "../helpers/controllerHelpers";

export const listRoles = async (_request: Request, response: Response): Promise<void> => {
  const roles = await getAllRoles();
  response.json(roles);
};

export const showRole = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getRoleById(Number(request.params.id)), 200, 404);
};

export const storeRole = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => createRole(request.body), 201);
};

export const updateRoleController = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => updateRole(Number(request.params.id), request.body));
};

export const destroyRole = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => deleteRole(Number(request.params.id)), 204);
};

export const addPermissionToRole = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () => assignPermissionToRole(Number(request.params.id), Number(request.body.permissionId)),
    201,
  );
};

export const removeRolePermission = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () => removePermissionFromRole(Number(request.params.id), Number(request.params.permissionId)),
    204,
  );
};
