import { Request, Response } from "express";
import multer from "multer";
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
    getCowTemperatureDaily
} from "../services/cowsService";
import { handleRequest } from "../lib/controllerHelpers";

// Configuração do Multer

const storage = multer.diskStorage({
    destination: (_request, _file, callback) => {
        callback(null, path.resolve(process.cwd(), "uploads"));
    },
    filename: (_request, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension    = path.extname(file.originalname);
        callback(null, `cow-${uniqueSuffix}${extension}`);
    },
});

const fileFilter = (_request: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Tipo de arquivo não permitido. Use JPEG, PNG ou WebP."));
    }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// CRUD

export const listCows = async (_request: Request, response: Response): Promise<void> => {
    const cows = await getAllCows();
    response.json(cows);
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

// Fotos

export const uploadPhoto = async (request: Request, response: Response): Promise<void> => {
    if (!request.file) {
        response.status(400).json({ error: "Nenhum arquivo enviado." });
        return;
    }
    await handleRequest(response, () => addCowPhoto(Number(request.params.id), request.file!.filename), 201);
};

export const destroyPhoto = async (request: Request, response: Response): Promise<void> => {
    const filename = String(request.params.filename);
    await handleRequest(response, () => removeCowPhoto(Number(request.params.id), filename), 200, 404);
};

// Sensores — listagem paginada

export const listHeartRate = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => getCowHeartRate(Number(request.params.id), request.query as any), 200, 404);
};

export const listTemperature = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => getCowTemperature(Number(request.params.id), request.query as any), 200, 404);
};

export const listAccelerometer = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => getCowAccelerometer(Number(request.params.id), request.query as any), 200, 404);
};

// Sensores — média diária para gráficos

export const listHeartRateDaily = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => getCowHeartRateDaily(Number(request.params.id)), 200, 404);
};

export const listTemperatureDaily = async (request: Request, response: Response): Promise<void> => {
    await handleRequest(response, () => getCowTemperatureDaily(Number(request.params.id)), 200, 404);
};