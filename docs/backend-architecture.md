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
├── uploads/                 # fotos das vacas
├── prisma.config.ts         # configuração de conexão com o banco
├── .env                     # variáveis de ambiente
├── .env.example             # template de variáveis para o time
├── package.json
└── tsconfig.json
```

---

## Endpoints implementados

### Auth
| Método | Rota | Permissão |
|---|---|---|
| POST | `/auth/login` | pública |
| GET | `/auth/me` | autenticado |

### Users
| Método | Rota | Permissão |
|---|---|---|
| GET | `/users` | ViewAny User |
| GET | `/users/:id` | View User |
| POST | `/users` | Create User |
| PUT | `/users/:id` | Update User |
| DELETE | `/users/:id` | Delete User |
| PATCH | `/users/:id/toggle-active` | Update User |
| POST | `/users/:id/roles` | Update User |
| DELETE | `/users/:id/roles/:roleId` | Update User |

### Roles
| Método | Rota | Permissão |
|---|---|---|
| GET | `/roles` | ViewAny Role |
| GET | `/roles/:id` | View Role |
| POST | `/roles` | Create Role |
| PUT | `/roles/:id` | Update Role |
| DELETE | `/roles/:id` | Delete Role |
| POST | `/roles/:id/permissions` | Update Role |
| DELETE | `/roles/:id/permissions/:permissionId` | Update Role |

### Permissions
| Método | Rota | Permissão |
|---|---|---|
| GET | `/permissions` | ViewAny Permission |
| GET | `/permissions/:id` | View Permission |
| POST | `/permissions` | Create Permission |
| PUT | `/permissions/:id` | Update Permission |
| DELETE | `/permissions/:id` | Delete Permission |

### Permission Groups
| Método | Rota | Permissão |
|---|---|---|
| GET | `/permission-groups` | ViewAny PermissionGroup |
| GET | `/permission-groups/:id` | View PermissionGroup |
| POST | `/permission-groups` | Create PermissionGroup |
| PUT | `/permission-groups/:id` | Update PermissionGroup |
| DELETE | `/permission-groups/:id` | Delete PermissionGroup |
| POST | `/permission-groups/:id/permissions` | Update PermissionGroup |
| DELETE | `/permission-groups/:id/permissions/:permissionId` | Update PermissionGroup |
| POST | `/permission-groups/:id/grant` | Update PermissionGroup |
| POST | `/permission-groups/:id/revoke` | Update PermissionGroup |

### Farms
| Método | Rota | Permissão |
|---|---|---|
| GET | `/farms` | ViewAny Farm |
| GET | `/farms/:id` | View Farm |
| POST | `/farms` | Create Farm |
| PUT | `/farms/:id` | Update Farm |
| DELETE | `/farms/:id` | Delete Farm |

### Collars
| Método | Rota | Permissão |
|---|---|---|
| GET | `/collars` | ViewAny Collar |
| GET | `/collars/:id` | View Collar |
| POST | `/collars` | Create Collar |
| PUT | `/collars/:id` | Update Collar |
| DELETE | `/collars/:id` | Delete Collar |

### Cows
| Método | Rota | Permissão |
|---|---|---|
| GET | `/cows` | ViewAny Cow |
| GET | `/cows/:id` | View Cow |
| POST | `/cows` | Create Cow |
| PUT | `/cows/:id` | Update Cow |
| DELETE | `/cows/:id` | Delete Cow |
| POST | `/cows/:id/photos` | Update Cow |
| DELETE | `/cows/:id/photos/:filename` | Update Cow |
| GET | `/cows/:id/heart-rate` | View Cow |
| GET | `/cows/:id/temperature` | View Cow |
| GET | `/cows/:id/accelerometer` | View Cow |
| GET | `/cows/:id/heart-rate/daily` | View Cow |
| GET | `/cows/:id/temperature/daily` | View Cow |

### Dashboard
| Método | Rota | Permissão |
|---|---|---|
| GET | `/dashboard/overview` | autenticado |
| GET | `/dashboard/cows-per-status` | autenticado |
| GET | `/dashboard/cows-per-farm` | autenticado |

### Notifications
| Método | Rota | Permissão |
|---|---|---|
| GET | `/notifications` | ViewAny Notification |
| PATCH | `/notifications/:id/read` | View Notification |
| PATCH | `/notifications/read-all` | View Notification |

---

## Responsabilidade de cada camada

### `routes/`
Define os endpoints e associa cada um ao controller correspondente. Aplica os middlewares de autenticação e autorização por rota. Não contém lógica.

```ts
// src/routes/farmsRoutes.ts
import { Router } from "express";
import { listFarms, showFarm, storeFarm, updateFarmController, destroyFarm } from "../controllers/farmsController";
import { requireAuth } from "../middlewares/requireAuth";
import { requirePermission } from "../middlewares/requirePermission";

const router = Router();

router.get("/",       requireAuth, requirePermission("ViewAny Farm"), listFarms);
router.get("/:id",    requireAuth, requirePermission("View Farm"),    showFarm);
router.post("/",      requireAuth, requirePermission("Create Farm"),  storeFarm);
router.put("/:id",    requireAuth, requirePermission("Update Farm"),  updateFarmController);
router.delete("/:id", requireAuth, requirePermission("Delete Farm"),  destroyFarm);

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

export const storeFarm = async (request: Request, response: Response): Promise<void> => {
  try {
    const farm = await createFarm(request.body);
    response.status(201).json(farm);
  } catch (error: any) {
    response.status(400).json({ error: error.message });
  }
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

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
```

```ts
// src/types/farming.ts
export interface CreateFarmInput {
  name: string;
  cnpj: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface CreateCollarInput {
  name: string;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "BATTERY";
  dataFrequency?: "HIGHER" | "DEFAULT" | "LOWER";
}
```

```ts
// src/types/cows.ts
export interface CreateCowInput {
  tag: string;
  name?: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  farmId: number;
  collarId?: number;
}
```

---

## Regras de negócio implementadas

| Recurso | Regra |
|---|---|
| Farm | Não deletar com vacas vinculadas |
| Collar | Não deletar vinculado a vaca |
| Cow | Tag única; colar não pode estar vinculado a outra vaca; máximo 3 fotos |
| Role | Não deletar com usuários vinculados |
| Permission | Não deletar vinculada a roles ou grupos |
| Permission Group | Não deletar com permissões vinculadas |
| User | Não deletar usuário com role SuperAdmin |
| User | Não remover role do usuário id: 1 (SuperAdmin) |
| Permission Group Grant | Grupo deve ter permissões antes de conceder às roles |
| Notification | Usuário só vê e marca suas próprias notificações |

---

## Upload de fotos

O Multer é configurado no `cowsController.ts` e salva os arquivos na pasta `uploads/` da raiz do backend. Os nomes são gerados automaticamente com timestamp para evitar colisões.

- Tipos aceitos: JPEG, PNG, WebP
- Tamanho máximo: 5MB por arquivo
- Limite: 3 fotos por vaca
- As fotos são servidas estaticamente em `/uploads/:filename`
- A lista de nomes é persistida no campo JSON `photos` da vaca

---

## Sensores — endpoints diários para gráficos

Os endpoints `/cows/:id/heart-rate/daily` e `/cows/:id/temperature/daily` retornam a média diária dos últimos 7 dias no formato que o Recharts espera:

```json
[
  { "date": "28/04", "average": 72.4 },
  { "date": "29/04", "average": 74.1 },
  { "date": "30/04", "average": 71.8 }
]
```

Os endpoints sem `/daily` retornam registros individuais paginados, usados nas tabelas do detalhe da vaca. Aceitam query params opcionais: `startDate`, `endDate` e `limit`.

---

## Grant / Revoke de permissões

O fluxo correto para conceder permissões de um grupo às roles:

```
1. POST /permission-groups/:id/permissions     → vincula permissão ao grupo
2. POST /permission-groups/:id/grant           → body: { permissionIds: [roleId1, roleId2] }
                                                 concede todas as permissões do grupo às roles
```

O `grant` opera sobre as permissões **já vinculadas ao grupo** — se o grupo estiver vazio retorna erro 400.

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
