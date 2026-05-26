import { Request, Response } from "express";
import {
  getDashboardOverview,
  getCowsPerStatus,
  getCowsPerFarm,
  getHealthTimeline,
} from "../services/dashboardService";

export const overview = async (request: Request, response: Response): Promise<void> => {
  const farmId = request.query.farmId ? Number(request.query.farmId) : undefined;
  const userId = request.user!.sub;
  const data = await getDashboardOverview(farmId, userId);
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

export const healthTimeline = async (request: Request, response: Response): Promise<void> => {
  const farmId = request.query.farmId ? Number(request.query.farmId) : undefined;
  const data = await getHealthTimeline(farmId);
  response.json(data);
};
