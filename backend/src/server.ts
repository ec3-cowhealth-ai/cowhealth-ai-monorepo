import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import path from "path";
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";
import rolesRoutes from "./routes/rolesRoutes";
import permissionsRoutes from "./routes/permissionsRoutes";
import permissionGroupsRoutes from "./routes/permissionGroupsRoutes";
import farmsRoutes            from "./routes/farmsRoutes";
import collarsRoutes          from "./routes/collarsRoutes";
import cowsRoutes             from "./routes/cowsRoutes";
import dashboardRoutes        from "./routes/dashboardRoutes";
import notificationsRoutes    from "./routes/notificationsRoutes";
import mqttRoutes             from "./routes/mqttRoutes";
import { errorHandler }       from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") }));
app.use(express.json());

// TODO[RENATO] Fotos servidas publicamente sem autenticação — qualquer URL /uploads/<filename> é acessível.
// Substituir por um endpoint autenticado: GET /cows/:id/photos/:filename protegido por requireAuth.
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Rotas
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/roles", rolesRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/permission-groups", permissionGroupsRoutes);
app.use("/farms", farmsRoutes);
app.use("/collars", collarsRoutes);
app.use("/cows", cowsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/mqtt", mqttRoutes);

// Teste de conexão com o Banco de Dados
app.get("/health", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: "ok", db: "connected" });
  } catch {
    response.status(503).json({ status: "error", db: "disconnected" });
  }
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicialização
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Encerramento do PrismaClient
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close();
});
