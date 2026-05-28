import { Request, Response } from "express";
import {
  getAllCollars,
  getCollarById,
  createCollar,
  updateCollar,
  deleteCollar,
} from "../services/collarsService";
import { handleRequest } from "../helpers/controllerHelpers";

export const listCollars = async (request: Request, response: Response): Promise<void> => {
  const farmIds = request.user!.farmIds;
  const collars = await getAllCollars(farmIds);
  response.json(collars);
};

export const showCollar = async (request: Request, response: Response): Promise<void> => {
  const farmIds = request.user!.farmIds;
  await handleRequest(response, () => getCollarById(Number(request.params.id), farmIds), 200, 404);
};

export const storeCollar = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => createCollar(request.body), 201);
};

export const updateCollarController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(response, () => updateCollar(Number(request.params.id), request.body));
};

export const destroyCollar = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => deleteCollar(Number(request.params.id)), 204);
};
