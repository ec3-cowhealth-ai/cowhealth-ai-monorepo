import { Request, Response } from "express";
import {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from "../services/permissionsService";
import { handleRequest } from "../helpers/controllerHelpers";

export const listPermissions = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  const permissions = await getAllPermissions();
  response.json(permissions);
};

export const showPermission = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(
    response,
    () => getPermissionById(Number(request.params.id)),
    200,
    404,
  );
};

export const storePermission = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(response, () => createPermission(request.body), 201);
};

export const updatePermissionController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(response, () =>
    updatePermission(Number(request.params.id), request.body),
  );
};

export const destroyPermission = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(
    response,
    () => deletePermission(Number(request.params.id)),
    204,
  );
};
