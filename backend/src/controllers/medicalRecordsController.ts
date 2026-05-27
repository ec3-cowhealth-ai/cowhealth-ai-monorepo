import { Request, Response } from "express";
import {
  getMedicalRecords,
  getMedicalRecord,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../services/medicalRecordsService";
import { handleRequest } from "../helpers/controllerHelpers";

export const listMedicalRecords = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getMedicalRecords(Number(request.params.id)), 200, 404);
};

export const showMedicalRecord = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () => getMedicalRecord(Number(request.params.id), Number(request.params.recordId)),
    200,
    404,
  );
};

export const storeMedicalRecord = async (request: Request, response: Response): Promise<void> => {
  const userId = request.user!.sub;
  await handleRequest(
    response,
    () => createMedicalRecord(Number(request.params.id), userId, request.body),
    201,
  );
};

export const updateMedicalRecordController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(response, () =>
    updateMedicalRecord(Number(request.params.id), Number(request.params.recordId), request.body),
  );
};

export const destroyMedicalRecord = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(
    response,
    () => deleteMedicalRecord(Number(request.params.id), Number(request.params.recordId)),
    204,
    404,
  );
};
