import { Response } from "express";

/**
 * Executa uma função de service e trata o erro automaticamente.
 * Elimina o bloco try/catch repetido em todos os controllers.
 *
 * Respeita o campo `statusCode` do erro quando presente — permite que
 * os services lancem erros com status HTTP específicos (ex: 403, 404)
 * sem depender do errorStatus padrão do controller.
 *
 * @param response      - Objeto response do Express
 * @param serviceCall   - Função async do service a executar
 * @param successStatus - Status HTTP de sucesso (default: 200)
 * @param errorStatus   - Status HTTP de erro fallback quando error.statusCode ausente (default: 400)
 *
 * @example
 * await handleRequest(response, () => getFarmById(id), 200, 404);
 */
export const handleRequest = async (
  response: Response,
  serviceCall: () => Promise<unknown>,
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
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    const status = err.statusCode ?? errorStatus;
    response.status(status).json({ error: err.message ?? String(error) });
  }
};
