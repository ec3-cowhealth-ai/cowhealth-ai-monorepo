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
│   └── worker.ts            # processo MQTT — fora do escopo do MVP
├── prisma.config.ts         # configuração de conexão com o banco
├── .env                     # variáveis de ambiente (não commitado)
├── .env.example             # template de variáveis para o time
├── package.json
└── tsconfig.json
```

---

## Responsabilidade de cada camada

### `routes/`
Define os endpoints e associa cada um ao controller correspondente. Aplica os middlewares de autenticação e autorização por rota. Não contém lógica.

```ts
// src/routes/farmsRoutes.ts
import { Router } from "express";
import { listFarms, createFarm, updateFarm, deleteFarm } from "../controllers/farmsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get("/",        requireAuth, requirePermission("ViewAny Farm"), listFarms);
router.post("/",       requireAuth, requirePermission("Create Farm"),  createFarm);
router.put("/:id",    requireAuth, requirePermission("Update Farm"),  updateFarm);
router.delete("/:id", requireAuth, requirePermission("Delete Farm"),  deleteFarm);

export default router;
```

---

### `controllers/`
Recebe a requisição, extrai os dados necessários (params, body, query) e delega ao service. Devolve a resposta HTTP. Não contém regras de negócio.

```ts
// src/controllers/farmsController.ts
import { Request, Response } from "express";
import { getAllFarms, createFarm } from "../services/farmsService";

export const listFarms = async (_request: Request, response: Response): Promise<void> => {
  const farms = await getAllFarms();
  response.json(farms);
};

export const createFarmController = async (request: Request, response: Response): Promise<void> => {
  const farm = await createFarm(request.body);
  response.status(201).json(farm);
};
```

---

### `services/`
Contém as regras de negócio e é a única camada que acessa o banco via Prisma. Não conhece `req` nem `res`.

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

#### `requireAuth`
Valida o token JWT no header `Authorization` e injeta os dados do usuário autenticado em `req.user`. Deve ser aplicado em todas as rotas protegidas.

```ts
// src/middlewares/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/auth";

export const requireAuth = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    response.status(401).json({ error: "Token nao fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as AuthPayload;
    request.user = payload;
    next();
  } catch {
    response.status(401).json({ error: "Token invalido ou expirado." });
  }
};
```

#### `requirePermission`
Verifica se o usuário autenticado possui a permissão necessária através de seus roles. Deve ser aplicado após `requireAuth`. A query ao banco é encapsulada em `userHasPermission` no `authService`.

```ts
// src/middlewares/requirePermission.ts
import { Request, Response, NextFunction } from "express";
import { userHasPermission } from "../services/authService";

export const requirePermission = (permissionName: string) =>
  async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const userId = request.user?.sub;

    if (!userId) {
      response.status(401).json({ error: "Nao autenticado." });
      return;
    }

    const isAllowed = await userHasPermission(userId, permissionName);

    if (!isAllowed) {
      response.status(403).json({ error: "Sem permissao para esta acao." });
      return;
    }

    next();
  };
```

---

### `types/`
Interfaces e tipos TypeScript compartilhados entre as camadas.

```ts
// src/types/auth.ts
export interface AuthPayload {
  sub: number;
  email: string;
  profile: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
```

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

## Fluxo de uma requisição

```
Client HTTP
    │
    ▼
routes/              → define o caminho, método e middlewares
    │
    ▼
requireAuth          → valida o JWT e injeta req.user
    │
    ▼
requirePermission    → verifica a permissão via roles no banco
    │
    ▼
controllers/         → extrai dados da requisição, chama o service
    │
    ▼
services/            → aplica regras de negócio, acessa o banco via Prisma
    │
    ▼
Banco de dados (MySQL)
```

---

## Worker MQTT — fora do escopo do MVP

O `worker.ts` está documentado no `plan.md` para uso futuro. Nesta entrega os dados de sensores são mockados via seed. A arquitetura de rotas e serviços não depende do worker.

---
