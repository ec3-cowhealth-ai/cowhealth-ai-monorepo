import { Request, Response } from "express";
import {
  getDashboardOverview,
  getCowsPerStatus,
  getCowsPerFarm,
} from "../services/dashboardService";

export const overview = async (request: Request, response: Response): Promise<void> => {
  const farmId = request.query.farmId ? Number(request.query.farmId) : undefined;
  const data = await getDashboardOverview(farmId);
  response.json(data);
};

export const cowsPerStatus = async (request: Request, response: Response): Promise<void> => {
  const farmId = request.query.farmId ? Number(request.query.farmId) : undefined;
  const data = await getCowsPerStatus(farmId);
  response.json(data);
};

export const cowsPerFarm = async (_request: Request, response: Response): Promise<void> => {
  const data = await getCowsPerFarm();
  response.json(data);
};
