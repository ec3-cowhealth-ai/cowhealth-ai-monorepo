import { Request, Response, NextFunction } from "express";
import { userHasPermission } from "../services/authService";

export const requirePermission = (permissionName: string) =>
    async (request: Request, response: Response, next: NextFunction): Promise<void> => {
        const userId = request.user?.sub;

        if (!userId) {
        response.status(401).json({ error: "Não autenticado." });
        return;
        }

        const allowed = await userHasPermission(userId, permissionName);

        if (!allowed) {
        response.status(403).json({ error: "Sem permissão para esta ação." });
        return;
        }

        next();
    };