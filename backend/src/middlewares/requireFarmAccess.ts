import { Request, Response, NextFunction } from "express";

/**
 * Verifica se o usuário tem acesso à fazenda informada via parâmetro de rota.
 * Lê farmIds do JWT — sem query ao banco.
 *
 * null = SuperAdmin / Administrador — acesso irrestrito, passa direto.
 * number[] = perfil restrito — o farmId do parâmetro deve estar na lista.
 *
 * @param farmIdParam - nome do parâmetro de rota que contém o farmId (default: "farmId")
 *
 * @example
 * // Rota com :farmId explícito
 * router.get("/:farmId/cows", requireAuth, requireFarmAccess("farmId"), listCows);
 */
export const requireFarmAccess = (farmIdParam: string = "farmId") =>
  (request: Request, response: Response, next: NextFunction): void => {
    const farmIds = request.user?.farmIds ?? [];

    // null = irrestrito (ADMIN profile)
    if (request.user?.farmIds === null) {
      next();
      return;
    }

    const requestedFarmId = Number(request.params[farmIdParam]);

    if (!requestedFarmId || !farmIds.includes(requestedFarmId)) {
      response.status(403).json({ error: "Sem acesso a esta fazenda." });
      return;
    }

    next();
  };
