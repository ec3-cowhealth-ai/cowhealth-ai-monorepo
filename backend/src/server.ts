import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);

// Teste básico
app.get("/", (_request, response) => {
    response.json({ message: "A API da CowHealth AI está rodando." });
});

// Teste de conexão com o Banco de Dados
app.get("/health", async (_request, response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        response.json({ status: "ok", db: "connected" });
    } catch {
        response.status(503).json({ status: "error", db: "disconnected" });
    }
});

// Inicialização
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Encerramento do PrismaClient
process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    server.close();
});