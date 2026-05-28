import { Request, Response } from "express";
import {
  getClinicalRecords,
  getClinicalRecord,
  createClinicalRecord,
  updateClinicalRecord,
  deleteClinicalRecord,
} from "../services/clinicalRecordService";
import { handleRequest } from "../helpers/controllerHelpers";

export const listClinicalRecords = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getClinicalRecords(Number(request.params.id)), 200, 404);
};

export const showClinicalRecord = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () => getClinicalRecord(Number(request.params.id), Number(request.params.recordId)),
    200,
    404,
  );
};

export const storeClinicalRecord = async (request: Request, response: Response): Promise<void> => {
  const veterinarianId = request.user!.sub;
  await handleRequest(
    response,
    () => createClinicalRecord(Number(request.params.id), veterinarianId, request.body),
    201,
  );
};

export const updateClinicalRecordController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(response, () =>
    updateClinicalRecord(Number(request.params.id), Number(request.params.recordId), request.body),
  );
};

export const destroyClinicalRecord = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () => deleteClinicalRecord(Number(request.params.id), Number(request.params.recordId)),
    204,
    404,
  );
};
