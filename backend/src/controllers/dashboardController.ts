import { Request, Response } from "express";
import { getDashboardOverview, getCowsPerStatus, getCowsPerFarm } from "../services/dashboardService";

export const overview = async (request: Request, response: Response): Promise<void> => {
    const period = request.query.period as "day" | "week" | "month" | undefined;
    const data   = await getDashboardOverview(period);
    response.json(data);
};

export const cowsPerStatus = async (_request: Request, response: Response): Promise<void> => {
    const data = await getCowsPerStatus();
    response.json(data);
};

export const cowsPerFarm = async (_request: Request, response: Response): Promise<void> => {
    const data = await getCowsPerFarm();
    response.json(data);
};