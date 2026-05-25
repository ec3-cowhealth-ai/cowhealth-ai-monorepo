import { SensorQueryOptions } from "../types/sensors";

/**
 * Busca um registro pelo ID e lança erro se não encontrado.
 * Elimina o padrão repetido de findUnique + if (!record) throw.
 *
 * @param model      - Nome do modelo Prisma (ex: "farm", "cow", "collar")
 * @param id         - ID do registro a buscar
 * @param errorMessage - Mensagem de erro caso não encontrado
 *
 * @example
 * const farm = await findOrThrow("farm", farmId, "Fazenda não encontrada.");
 */
export const findOrThrow = async <T>(
  model: { findUnique: (args: { where: { id: number } }) => Promise<T | null> },
  id: number,
  errorMessage: string,
): Promise<T> => {
  const record = await model.findUnique({ where: { id } });
  if (!record) throw new Error(errorMessage);
  return record;
};

/**
 * Verifica se um valor já existe em um campo único antes de criar ou atualizar.
 * Lança erro se já estiver em uso.
 *
 * @param model        - Nome do modelo Prisma
 * @param field        - Campo a verificar (ex: { cnpj: "00.000.000/0001-00" })
 * @param errorMessage - Mensagem de erro caso já exista
 * @param excludeId    - ID a ignorar na verificação (usado no update)
 *
 * @example
 * await assertUnique(prisma.farm, { cnpj: data.cnpj }, "Já existe uma fazenda com este CNPJ.");
 * await assertUnique(prisma.collar, { name: data.name }, "Já existe um colar com este nome.", collarId);
 */
export const assertUnique = async (
  model: { findFirst: (args: { where: object }) => Promise<unknown> },
  field: Record<string, unknown>,
  errorMessage: string,
  excludeId?: number,
): Promise<void> => {
  const existing = await model.findFirst({
    where: {
      ...field,
      ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
    },
  });

  if (existing) throw new Error(errorMessage);
};

/**
 * Busca registros de sensor para uma vaca, com filtros opcionais por período.
 * Centraliza o padrão repetido nos três tipos de sensor (FC, temperatura, acelerômetro).
 *
 * @param model      - Modelo Prisma do sensor (ex: prisma.heartRateData)
 * @param cowId      - ID da vaca
 * @param selectFields - Campos a retornar além de id, measuredAt e receivedAt
 * @param options    - Filtros opcionais: startDate, endDate, limit
 */
export const querySensorData = async <T>(
  model: { findMany: (args: object) => Promise<T[]> },
  cowId: number,
  selectFields: Record<string, boolean>,
  options: SensorQueryOptions,
): Promise<T[]> => {
  return model.findMany({
    where: {
      cowId,
      measuredAt: {
        gte: options.startDate ? new Date(options.startDate) : undefined,
        lte: options.endDate ? new Date(options.endDate) : undefined,
      },
    },
    select: {
      id: true,
      measuredAt: true,
      receivedAt: true,
      ...selectFields,
    },
    orderBy: { measuredAt: "desc" },
    take: options.limit ?? 100,
  });
};

/**
 * Agrupa registros de sensor por dia e calcula a média do campo informado.
 * Retorna array com label (dd/MM) e média — formato esperado pelo Recharts.
 *
 * @param records - Registros com measuredAt e o campo a agregar
 * @param field   - Nome do campo numérico a calcular a média
 */
export const aggregateDailyAverage = (
  records: Array<{ measuredAt: Date } & Record<string, unknown>>,
  field: string,
): Array<{ date: string; average: number }> => {
  const dailyGroups = new Map<string, number[]>();

  for (const record of records) {
    const dateLabel = record.measuredAt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });

    if (!dailyGroups.has(dateLabel)) {
      dailyGroups.set(dateLabel, []);
    }

    dailyGroups.get(dateLabel)!.push(record[field] as number);
  }

  return Array.from(dailyGroups.entries()).map(([date, values]) => ({
    date,
    average: parseFloat(
      (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(
        2,
      ),
    ),
  }));
};
