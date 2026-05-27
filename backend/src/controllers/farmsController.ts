import { Request, Response } from "express";
import {
  getAllFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
} from "../services/farmsService";
import { handleRequest } from "../helpers/controllerHelpers";

export const listFarms = async (request: Request, response: Response): Promise<void> => {
  const farmIds = request.user!.farmIds;
  await handleRequest(response, () => getAllFarms(farmIds));
};

export const showFarm = async (request: Request, response: Response): Promise<void> => {
  const farmIds = request.user!.farmIds;
  await handleRequest(response, () => getFarmById(Number(request.params.id), farmIds), 200, 404);
};

export const storeFarm = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => createFarm(request.body), 201);
};

export const updateFarmController = async (request: Request, response: Response): Promise<void> => {
  const farmIds = request.user!.farmIds;
  await handleRequest(response, () => updateFarm(Number(request.params.id), request.body, farmIds));
};

export const destroyFarm = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => deleteFarm(Number(request.params.id)), 204);
};
