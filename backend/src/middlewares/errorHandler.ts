import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
): void => {
    console.error("[Unhandled Error]", error);
    response.status(500).json({ error: "Internal server error." });
};