import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import authRoutes             from "./routes/authRoutes";
import usersRoutes            from "./routes/usersRoutes";
import rolesRoutes            from "./routes/rolesRoutes";
import permissionsRoutes      from "./routes/permissionsRoutes";
import permissionGroupsRoutes from "./routes/permissionGroupsRoutes";
import farmsRoutes            from "./routes/farmsRoutes";
import collarsRoutes          from "./routes/collarsRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.use("/auth",              authRoutes);
app.use("/users",             usersRoutes);
app.use("/roles",             rolesRoutes);
app.use("/permissions",       permissionsRoutes);
app.use("/permission-groups", permissionGroupsRoutes);
app.use("/farms",             farmsRoutes);
app.use("/collars",           collarsRoutes);

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