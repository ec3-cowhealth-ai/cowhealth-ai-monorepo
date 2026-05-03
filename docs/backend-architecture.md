# Backend — Estrutura e Arquitetura

Guia de referência sobre a organização do código no backend do projeto.

---

## Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma        # definição de todos os modelos e relações
│   ├── seed.ts              # dados iniciais de desenvolvimento
│   └── migrations/          # histórico de migrations geradas automaticamente
├── src/
│   ├── controllers/         # recebe req/res e chama os services
│   ├── middlewares/         # autenticação, autorização e validações
│   ├── routes/              # definição dos endpoints
│   ├── services/            # regras de negócio e acesso ao banco via Prisma
│   ├── types/               # interfaces e tipos TypeScript
│   ├── lib/
│   │   └── prisma.ts        # singleton do PrismaClient
│   ├── server.ts            # inicialização do Express
│   └── worker.ts            # processo MQTT (roda em paralelo ao servidor)
├── prisma.config.ts         # configuração de conexão com o banco
├── .env                     # variáveis de ambiente
├── .env.example             # template de variáveis para o time
├── package.json
└── tsconfig.json
```

---

## Responsabilidade de cada camada

### `routes/`
Define os endpoints e associa cada um ao controller correspondente. Aplica middlewares por rota quando necessário. Não contém lógica.

```ts
// src/routes/farms.ts
import { Router } from "express";
import { listFarms, createFarm } from "../controllers/farmsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get("/",  requireAuth, requirePermission("ViewAny Farm"), listFarms);
router.post("/", requireAuth, requirePermission("Create Farm"),  createFarm);

export default router;
```

---

### `controllers/`
Recebe a requisição, extrai os dados necessários (params, body, query) e delega ao service. Devolve a resposta HTTP.

```ts
// src/controllers/farmsController.ts
import { Request, Response } from "express";
import { getAllFarms, createFarm } from "../services/farmsService";

export const listFarms = async (_req: Request, res: Response) => {
  const farms = await getAllFarms();
  res.json(farms);
};

export const createFarm = async (req: Request, res: Response) => {
  const farm = await createFarm(req.body);
  res.status(201).json(farm);
};
```

---

### `services/`
Contém as regras de negócio e é a única camada que acessa o banco de dados via Prisma. Não conhece `req` nem `res`.

```ts
// src/services/farmsService.ts
import { prisma } from "../lib/prisma";

export const getAllFarms = async () => {
  return prisma.farm.findMany();
};

export const createFarm = async (data: { name: string; cnpj: string }) => {
  return prisma.farm.create({ data });
};
```

---

### `middlewares/`
Funções executadas antes dos controllers. Responsáveis por autenticação (JWT), autorização (RBAC) e validações.

```ts
// src/middlewares/requireAuth.ts
// Valida o JWT e injeta o usuário autenticado na requisição
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Não autenticado." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido." });
  }
};
```

```ts
// src/middlewares/requirePermission.ts
// Verifica se o usuário autenticado possui a permissão necessária via roles
export const requirePermission = (permissionName: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });

    const hasPermission = user?.roles.some((userRole) =>
      userRole.role.permissions.some((rp) => rp.permission.name === permissionName)
    );

    if (!hasPermission) return res.status(403).json({ error: "Sem permissão." });
    next();
  };
```

---

### `types/`
Interfaces e tipos TypeScript compartilhados entre as camadas.

```ts
// src/types/farm.ts
export interface CreateFarmInput {
  name: string;
  cnpj: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}
```

---

### `lib/prisma.ts`
Instância única do PrismaClient compartilhada por toda a aplicação. Substitui o `connection.ts` de projetos com SQL manual.

```ts
import { prisma } from "../lib/prisma";
```

---

### `worker.ts`
Processo separado que faz subscribe no broker MQTT e persiste os dados dos sensores. Roda em paralelo ao `server.ts` e usa a mesma instância do Prisma.

```ts
// src/worker.ts
import mqtt from "mqtt";
import { prisma } from "./lib/prisma";

const client = mqtt.connect(process.env.MQTT_BROKER_URL!);

client.on("connect", () => {
  client.subscribe("project_ch_ai/send");
});

client.on("message", async (_topic, payload) => {
  const data = JSON.parse(payload.toString());
  const collar = await prisma.collar.findUnique({ where: { name: data.device_id }, include: { cow: true } });
  if (!collar?.cow) return;
  // persistir sensores e executar análise de saúde...
});
```

---

## Fluxo de uma requisição

```
Client HTTP
    │
    ▼
routes/          → define o caminho e o método (GET, POST, etc.)
    │
    ▼
middlewares/     → valida JWT (requireAuth) e permissão (requirePermission)
    │
    ▼
controllers/     → extrai dados da requisição, chama o service
    │
    ▼
services/        → aplica regras de negócio, acessa o banco via Prisma
    │
    ▼
Banco de dados (MySQL)
```

## Fluxo do worker MQTT

```
Broker MQTT (broker.emqx.io)
    │
    ▼
worker.ts        → subscribe no tópico project_ch_ai/send
    │
    ▼
                 → resolve Collar por device_id → encontra Cow vinculada
    │
    ▼
                 → persiste HeartRateData, TemperatureData, AccelerometerData
    │
    ▼
                 → executa análise de saúde (parto iminente / estresse térmico)
    │
    ▼
                 → atualiza Cow.status e cria Notification se alerta disparar
```
