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
│   └── server.ts            # inicialização do Express
├── prisma.config.ts         # configuração de conexão com o banco
├── .env                     # variáveis de ambiente (não commitado)
├── .env.example             # template de variáveis para o time
├── package.json
└── tsconfig.json
```

---

## Responsabilidade de cada camada

### `routes/`
Define os endpoints e associa cada um ao controller correspondente. Aplica os middlewares por rota. Não contém lógica.

```ts
// src/routes/farmsRoutes.ts
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
Funções executadas antes dos controllers. Responsáveis por autenticação (JWT) e autorização (RBAC).

```ts
// src/middlewares/requireAuth.ts
// Valida o JWT e injeta o usuário autenticado em req.user
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/auth";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token nao fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as unknown as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Token invalido ou expirado." });
  }
};
```

```ts
// src/middlewares/requirePermission.ts
// Verifica se o usuário autenticado possui a permissão necessária via roles
import { Request, Response, NextFunction } from "express";
import { userHasPermission } from "../services/authService";

export const requirePermission = (permissionName: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ error: "Nao autenticado." });
      return;
    }

    const allowed = await userHasPermission(userId, permissionName);

    if (!allowed) {
      res.status(403).json({ error: "Sem permissao para esta acao." });
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
Instância única do PrismaClient compartilhada por toda a aplicação.

```ts
import { prisma } from "../lib/prisma";
```

---

## Fluxo de uma requisição

```
Client HTTP
    │
    ▼
routes/          → define o caminho, o método e aplica os middlewares
    │
    ▼
middlewares/     → requireAuth (valida JWT) → requirePermission (verifica RBAC)
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

---

## Variáveis de ambiente necessárias

```dotenv
PORT=3001
DATABASE_URL="mysql://user:password@localhost:3306/cowhealth-db"
JWT_SECRET="string-longa-e-aleatoria"
JWT_EXPIRES_IN="7d"
NODE_ENV=development
```
