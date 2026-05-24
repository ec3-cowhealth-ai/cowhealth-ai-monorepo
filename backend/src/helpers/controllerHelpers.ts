import { Response } from "express";

/**
 * Executa uma função de service e trata o erro automaticamente.
 * Elimina o bloco try/catch repetido em todos os controllers.
 *
 * @param response      - Objeto response do Express
 * @param serviceCall   - Função async do service a executar
 * @param successStatus - Status HTTP de sucesso (default: 200)
 * @param errorStatus   - Status HTTP de erro (default: 400)
 *
 * @example
 * // Antes:
 * try {
 *   const farm = await getFarmById(id);
 *   response.json(farm);
 * } catch (error: any) {
 *   response.status(404).json({ error: error.message });
 * }
 *
 * // Depois:
 * await handleRequest(response, () => getFarmById(id), 200, 404);
 */
export const handleRequest = async (
  response: Response,
  serviceCall: () => Promise<any>,
  successStatus: number = 200,
  errorStatus: number = 400,
): Promise<void> => {
  try {
    const result = await serviceCall();

    if (successStatus === 204) {
      response.status(204).send();
    } else {
      response.status(successStatus).json(result);
    }
  } catch (error: any) {
    response.status(errorStatus).json({ error: error.message });
  }
};
