import { Request, Response } from "express";
import path from "path";
import {
  getAllCows,
  getCowById,
  createCow,
  updateCow,
  deleteCow,
  addCowPhoto,
  removeCowPhoto,
  getCowHeartRate,
  getCowTemperature,
  getCowAccelerometer,
  getCowHeartRateDaily,
  getCowTemperatureDaily,
  getCowAccelerometerDaily,
  retireCow,
  getCowSensorHistory,
} from "../services/cowsService";
import { handleRequest } from "../helpers/controllerHelpers";
import type { SensorQueryOptions } from "../types/sensors";

// CRUD

export const listCows = async (request: Request, response: Response): Promise<void> => {
  const farmIds = request.user!.farmIds;
  const farmId = request.query.farmId ? Number(request.query.farmId) : undefined;

  // Se o usuário tem restrição de fazenda e passou um farmId via query,
  // valida que esse farmId está na lista permitida
  if (farmIds !== null && farmId && !farmIds.includes(farmId)) {
    response.status(403).json({ error: "Sem acesso a esta fazenda." });
    return;
  }

  // Para usuários restritos sem farmId na query, usa o primeiro da lista
  // Para admins, retorna tudo (farmId undefined = sem filtro)
  const effectiveFarmId = farmId ?? (farmIds !== null ? undefined : undefined);

  await handleRequest(response, () => getAllCows(effectiveFarmId, farmIds));
};

export const showCow = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getCowById(Number(request.params.id)), 200, 404);
};

export const storeCow = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => createCow(request.body), 201);
};

export const updateCowController = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => updateCow(Number(request.params.id), request.body));
};

export const destroyCow = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => deleteCow(Number(request.params.id)), 204, 404);
};

// Aposentadoria

export const retireCowController = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => retireCow(Number(request.params.id), request.body.reason));
};

// Fotos

export const uploadPhoto = async (request: Request, response: Response): Promise<void> => {
  if (!request.file) {
    response.status(400).json({ error: "Nenhum arquivo enviado." });
    return;
  }
  await handleRequest(
    response,
    () => addCowPhoto(Number(request.params.id), request.file!.filename),
    201,
  );
};

export const destroyPhoto = async (request: Request, response: Response): Promise<void> => {
  const filename = String(request.params.filename);
  await handleRequest(
    response,
    () => removeCowPhoto(Number(request.params.id), filename),
    200,
    404,
  );
};

export const servePhoto = (request: Request, response: Response): void => {
  const filename = path.basename(String(request.params.filename));
  const filePath = path.resolve(process.cwd(), "uploads", filename);
  response.sendFile(filePath, (error) => {
    if (error) response.status(404).json({ error: "Foto não encontrada." });
  });
};

// Sensores — listagem paginada

export const listHeartRate = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () =>
      getCowHeartRate(Number(request.params.id), request.query as unknown as SensorQueryOptions),
    200,
    404,
  );
};

export const listTemperature = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () =>
      getCowTemperature(Number(request.params.id), request.query as unknown as SensorQueryOptions),
    200,
    404,
  );
};

export const listAccelerometer = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () =>
      getCowAccelerometer(
        Number(request.params.id),
        request.query as unknown as SensorQueryOptions,
      ),
    200,
    404,
  );
};

// Sensores — média diária para gráficos

export const listHeartRateDaily = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getCowHeartRateDaily(Number(request.params.id)), 200, 404);
};

export const listTemperatureDaily = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getCowTemperatureDaily(Number(request.params.id)), 200, 404);
};

export const listAccelerometerDaily = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getCowAccelerometerDaily(Number(request.params.id)), 200, 404);
};

// Histórico completo dos sensores

export const listSensorHistory = async (request: Request, response: Response): Promise<void> => {
  const { from, to } = request.query as { from?: string; to?: string };
  await handleRequest(
    response,
    () => getCowSensorHistory(Number(request.params.id), from, to),
    200,
    404,
  );
};
