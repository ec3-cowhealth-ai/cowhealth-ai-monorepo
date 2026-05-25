import { Request, Response } from "express";
import { handleRequest } from "../helpers/controllerHelpers";
import { ingestMqttPayload } from "../services/mqttIngestService";

export const ingest = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(
    response,
    () => ingestMqttPayload(request.body),
    200,
    400,
  );
};
