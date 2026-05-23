import { Request, Response, NextFunction } from "express";

export const requireApiKey = (
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        response.status(401).json({ error: "API Key não fornecida." });
        return;
    }

    const key = authHeader.split(" ")[1];
    const expectedKey = process.env.MQTT_WORKER_API_KEY;

    if (!expectedKey || key !== expectedKey) {
        response.status(401).json({ error: "API Key inválida." });
        return;
    }

    next();
};