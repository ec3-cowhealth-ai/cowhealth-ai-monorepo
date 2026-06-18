/**
 * Script pontual: corrige raças no banco atual, atribuindo uma raça por fazenda.
 * Uso: npx ts-node --transpile-only prisma/fix-breeds.ts
 *
 * Distribuição:
 *   Fazenda Aurora       → Holandesa
 *   Fazenda Sao Bento    → Gir
 *   Fazenda Boa Esperanca→ Girolando
 *   Fazenda Santa Clara  → Jersey
 *   Fazenda Trevizan     → Holandesa
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FARM_BREEDS: Record<string, string> = {
  "Fazenda Aurora":        "Holandesa",
  "Fazenda Sao Bento":     "Gir",
  "Fazenda Boa Esperanca": "Girolando",
  "Fazenda Santa Clara":   "Jersey",
  "Fazenda Trevizan":      "Holandesa",
};

async function main() {
  const farms = await prisma.farm.findMany({ select: { id: true, name: true } });

  for (const farm of farms) {
    const breed = FARM_BREEDS[farm.name];
    if (!breed) {
      console.log(`Fazenda "${farm.name}" não mapeada — ignorando.`);
      continue;
    }
    const { count } = await prisma.cow.updateMany({
      where: { farmId: farm.id },
      data: { breed },
    });
    console.log(`${farm.name} → ${breed} (${count} vacas atualizadas)`);
  }

  console.log("Concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
