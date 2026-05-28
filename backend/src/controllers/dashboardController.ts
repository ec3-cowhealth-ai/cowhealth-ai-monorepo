import { Request, Response } from "express";
import {
  getDashboardOverview,
  getCowsPerStatus,
  getCowsPerFarm,
  getHealthTimeline,
  getFeaturedCow,
  getRecentAlerts,
  getCowVitals,
  getCowActivityTimeline,
} from "../services/dashboardService";
import { handleRequest } from "../helpers/controllerHelpers";

export const overview = async (request: Request, response: Response): Promise<void> => {
  const userId  = request.user!.sub;
  const farmIds = request.user!.farmIds;
  const farmId  = request.query.farmId ? Number(request.query.farmId) : undefined;
  const period  = request.query.period as "day" | "week" | "month" | undefined;
  await handleRequest(response, () => getDashboardOverview(farmId, userId, farmIds, period));
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
  const farmId  = request.query.farmId  ? Number(request.query.farmId) : undefined;
  const farmIds = request.user!.farmIds;
  const period  = (request.query.period  as string | undefined) ?? "daily";
  const from    = request.query.from   as string | undefined;
  const to      = request.query.to     as string | undefined;
  const data = await getHealthTimeline(farmId, farmIds, period, from, to);
  response.json(data);
};

export const featuredCow = async (request: Request, response: Response): Promise<void> => {
  const farmId = request.query.farmId ? Number(request.query.farmId) : undefined;
  const farmIds = request.user!.farmIds;
  await handleRequest(response, () => getFeaturedCow(farmId, farmIds));
};

export const recentAlerts = async (request: Request, response: Response): Promise<void> => {
  const farmId = request.query.farmId ? Number(request.query.farmId) : undefined;
  const limit = request.query.limit ? Number(request.query.limit) : 6;
  await handleRequest(response, () => getRecentAlerts(farmId, limit));
};

export const cowVitals = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getCowVitals(Number(request.params.id)), 200, 404);
};

export const cowActivityTimeline = async (request: Request, response: Response): Promise<void> => {
  const date = request.query.date as string | undefined;
  await handleRequest(response, () => getCowActivityTimeline(Number(request.params.id), date));
};
