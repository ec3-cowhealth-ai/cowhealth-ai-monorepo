import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do PrismaClient em modo de desenvolvimento
// (ts-node-dev reinicia o processo mas mantém o módulo em cache no Node)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
