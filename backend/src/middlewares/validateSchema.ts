import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Middleware factory que valida o request.body contra um schema Zod.
 * Retorna 422 com os erros de validação se o body for inválido.
 *
 * @example
 * router.post("/", requireAuth, requirePermission("Create Farm"), validateSchema(createFarmSchema), storeFarm);
 */
export const validateSchema = (schema: z.ZodTypeAny) => (
    request: Request, response: Response, next: NextFunction
): void => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
        field:   issue.path.join("."),
        message: issue.message,
    }));

    response.status(422).json({ error: "Dados inválidos.", details: errors });
    return;
    }

    request.body = result.data;
    next();
};