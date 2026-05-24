import { Request, Response, NextFunction } from "express";

/**
 * Verifica se o usuário autenticado possui a permissão necessária.
 * As permissões são lidas diretamente do payload JWT — sem query ao banco.
 * O token é gerado com a lista de permissões no login (authService.ts).
 */
export const requirePermission = (permissionName: string) => (
    request: Request, response: Response, next: NextFunction
): void => {
    const permissions = request.user?.permissions ?? [];

    if (!permissions.includes(permissionName)) {
        response.status(403).json({ error: "Sem permissão para esta ação." });
        return;
    }

    next();
};
