import { Request, Response } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserActive,
  deleteUser,
  assignRoleToUser,
  removeRoleFromUser,
} from "../services/usersService";
import { handleRequest } from "../helpers/controllerHelpers";
import { prisma } from "../lib/prisma";

export const listUsers = async (request: Request, response: Response): Promise<void> => {
  const farmIds = request.user!.farmIds;
  const users = await getAllUsers(farmIds);
  response.json(users);
};

export const showUser = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getUserById(Number(request.params.id)), 200, 404);
};

export const storeUser = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => createUser(request.body, request.user?.sub), 201);
};

export const updateUserController = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => updateUser(Number(request.params.id), request.body));
};

export const toggleActive = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => toggleUserActive(Number(request.params.id)), 200, 404);
};

export const destroyUser = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => deleteUser(Number(request.params.id)), 204, 404);
};

export const addRoleToUser = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () => assignRoleToUser(Number(request.params.id), Number(request.body.roleId)),
    201,
  );
};

export const removeUserRole = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () => removeRoleFromUser(Number(request.params.id), Number(request.params.roleId)),
    204,
  );
};
