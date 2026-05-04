import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import {
    getAllCows, getCowById, createCow, updateCow, deleteCow,
    addCowPhoto, removeCowPhoto,
    getCowHeartRate, getCowTemperature, getCowAccelerometer,
    getCowHeartRateDaily, getCowTemperatureDaily,
} from "../services/cowsService";

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
    try {
        const cow = await getCowById(Number(request.params.id));
        response.json(cow);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const storeCow = async (request: Request, response: Response): Promise<void> => {
    try {
        const cow = await createCow(request.body);
        response.status(201).json(cow);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const updateCowController = async (request: Request, response: Response): Promise<void> => {
    try {
        const cow = await updateCow(Number(request.params.id), request.body);
        response.json(cow);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const destroyCow = async (request: Request, response: Response): Promise<void> => {
    try {
        await deleteCow(Number(request.params.id));
        response.status(204).send();
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

// Fotos

export const uploadPhoto = async (request: Request, response: Response): Promise<void> => {
    try {
        if (!request.file) {
        response.status(400).json({ error: "Nenhum arquivo enviado." });
        return;
        }
        const cow = await addCowPhoto(Number(request.params.id), request.file.filename);
        response.status(201).json(cow);
    } catch (error: any) {
        response.status(400).json({ error: error.message });
    }
};

export const destroyPhoto = async (request: Request, response: Response): Promise<void> => {
    try {
        const filename = String(request.params.filename);
        const cow = await removeCowPhoto(Number(request.params.id), filename);
        response.json(cow);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

// Sensores — listagem paginada

export const listHeartRate = async (request: Request, response: Response): Promise<void> => {
    try {
        const data = await getCowHeartRate(Number(request.params.id), request.query as any);
        response.json(data);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const listTemperature = async (request: Request, response: Response): Promise<void> => {
    try {
        const data = await getCowTemperature(Number(request.params.id), request.query as any);
        response.json(data);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const listAccelerometer = async (request: Request, response: Response): Promise<void> => {
    try {
        const data = await getCowAccelerometer(Number(request.params.id), request.query as any);
        response.json(data);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

// Sensores — média diária para gráficos

export const listHeartRateDaily = async (request: Request, response: Response): Promise<void> => {
    try {
        const data = await getCowHeartRateDaily(Number(request.params.id));
        response.json(data);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};

export const listTemperatureDaily = async (request: Request, response: Response): Promise<void> => {
    try {
        const data = await getCowTemperatureDaily(Number(request.params.id));
        response.json(data);
    } catch (error: any) {
        response.status(404).json({ error: error.message });
    }
};