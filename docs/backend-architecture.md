# Backend — Estrutura e Arquitetura

Guia de referência sobre a organização do código no backend do projeto.

---

## Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma             # definição de todos os modelos e relações
│   ├── seed.ts                   # dados iniciais de desenvolvimento
│   └── migrations/               # histórico de migrations geradas automaticamente
├── src/
│   ├── controllers/              # recebe req/res e chama os services
│   ├── helpers/                  # funções auxiliares reutilizáveis
│   │   ├── controllerHelpers.ts  # handleRequest
│   │   └── serviceHelpers.ts     # assertUnique, querySensorData, aggregateDailyAverage
│   ├── middlewares/              # autenticação e autorização
│   ├── routes/                   # definição dos endpoints
│   ├── services/                 # regras de negócio e acesso ao banco via Prisma
│   ├── types/                    # interfaces e tipos TypeScript
│   ├── lib/
│   │   └── prisma.ts             # singleton do PrismaClient
│   ├── server.ts                 # inicialização do Express
│   └── worker.ts                 # processo MQTT — fora do escopo do MVP
├── uploads/                      # fotos das vacas
├── prisma.config.ts              # configuração de conexão com o banco
├── .env                          # variáveis de ambiente
├── .env.example                  # template de variáveis para o time
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
Define os endpoints, métodos HTTP e middlewares por rota. Não contém lógica.

```ts
// src/routes/farmsRoutes.ts
router.get("/",       requireAuth, requirePermission("ViewAny Farm"), listFarms);
router.get("/:id",    requireAuth, requirePermission("View Farm"),    showFarm);
router.post("/",      requireAuth, requirePermission("Create Farm"),  storeFarm);
router.put("/:id",    requireAuth, requirePermission("Update Farm"),  updateFarmController);
router.delete("/:id", requireAuth, requirePermission("Delete Farm"),  destroyFarm);
```

---

### `controllers/`
Recebe a requisição, extrai os dados e delega ao service via `handleRequest`. Não contém regras de negócio nem blocos try/catch manuais.

```ts
// src/controllers/farmsController.ts
import { handleRequest } from "../helpers/controllerHelpers";

export const listFarms = async (_request: Request, response: Response): Promise<void> => {
  const farms = await getAllFarms();
  response.json(farms);
};

export const showFarm = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => getFarmById(Number(request.params.id)), 200, 404);
};

export const storeFarm = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => createFarm(request.body), 201);
};

export const destroyFarm = async (request: Request, response: Response): Promise<void> => {
  await handleRequest(response, () => deleteFarm(Number(request.params.id)), 204);
};
```

---

### `services/`
Contém as regras de negócio e é a única camada que acessa o banco via Prisma. Usa `assertUnique` para verificações de unicidade.

```ts
// src/services/farmsService.ts
import { assertUnique } from "../helpers/serviceHelpers";

export const createFarm = async (data: CreateFarmInput) => {
  await assertUnique(prisma.farm, { cnpj: data.cnpj }, "Ja existe uma fazenda com este CNPJ.");
  return prisma.farm.create({ data, select: { ... } });
};

export const updateFarm = async (farmId: number, data: UpdateFarmInput) => {
  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) throw new Error("Fazenda nao encontrada.");

  if (data.cnpj && data.cnpj !== farm.cnpj) {
    await assertUnique(prisma.farm, { cnpj: data.cnpj }, "Ja existe uma fazenda com este CNPJ.", farmId);
  }

  return prisma.farm.update({ where: { id: farmId }, data, select: { ... } });
};
```

---

### `helpers/`

#### `controllerHelpers.ts` — `handleRequest`
Elimina o bloco try/catch repetido em todos os controllers.

```ts
// Antes — padrão repetido em cada controller:
try {
  const farm = await getFarmById(id);
  response.json(farm);
} catch (error: any) {
  response.status(404).json({ error: error.message });
}

// Depois — uma linha:
await handleRequest(response, () => getFarmById(id), 200, 404);
```

Referência de status codes por operação:

| Operação | successStatus | errorStatus |
|---|---|---|
| `show` (buscar por id) | `200` | `404` |
| `store` (criar) | `201` | `400` |
| `update` (atualizar) | `200` | `400` |
| `destroy` (deletar) | `204` | `400` ou `404` |

---

#### `serviceHelpers.ts` — `assertUnique`
Elimina o padrão repetido de verificação de campo único antes de criar ou atualizar.

```ts
// Criar — verifica se o valor já existe
await assertUnique(prisma.farm, { cnpj: data.cnpj }, "Ja existe uma fazenda com este CNPJ.");

// Atualizar — exclui o próprio registro da verificação via excludeId
await assertUnique(prisma.farm, { cnpj: data.cnpj }, "Ja existe uma fazenda com este CNPJ.", farmId);
```

#### `serviceHelpers.ts` — `querySensorData`
Centraliza a query de dados de sensor para os três tipos (FC, temperatura, acelerômetro).

```ts
// Busca paginada de frequência cardíaca
return querySensorData(prisma.heartRateData, cowId, { bpm: true }, options);

// Busca paginada de temperatura
return querySensorData(prisma.temperatureData, cowId, { celsius: true }, options);
```

#### `serviceHelpers.ts` — `aggregateDailyAverage`
Agrupa registros de sensor por dia e calcula a média — retorna o formato que o Recharts espera.

```ts
// Retorno: [{ date: "01/05", average: 72.4 }, { date: "02/05", average: 75.1 }]
return aggregateDailyAverage(records, "bpm");
```

---

### `middlewares/`

#### `requireAuth`
Valida o token JWT e injeta `req.user` com `sub`, `email` e `profile`.

#### `requirePermission`
Verifica se o usuário possui a permissão via roles. Encapsula a query no `authService.userHasPermission`.

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

Multer configurado no `cowsController.ts`. Arquivos salvos em `uploads/` na raiz do backend.

- Tipos aceitos: JPEG, PNG, WebP
- Tamanho máximo: 5MB por arquivo
- Limite: 3 fotos por vaca
- Servidas estaticamente em `/uploads/:filename`
- Lista de nomes persistida no campo JSON `photos` da vaca

---

## Sensores — endpoints para gráficos

`/cows/:id/heart-rate/daily` e `/cows/:id/temperature/daily` retornam a média diária dos últimos 7 dias:

```json
[
  { "date": "28/04", "average": 72.4 },
  { "date": "29/04", "average": 74.1 }
]
```

Os endpoints sem `/daily` retornam registros individuais para as tabelas. Aceitam query params: `startDate`, `endDate` e `limit`.

---

## Grant / Revoke de permissões

```
1. POST /permission-groups/:id/permissions     → vincula permissão ao grupo
2. POST /permission-groups/:id/grant           → body: { permissionIds: [roleId1, roleId2] }
                                                 concede todas as permissões do grupo às roles
```

O `grant` opera sobre as permissões já vinculadas ao grupo — grupo vazio retorna erro 400.

---

## Fluxo de uma requisição

```
Client HTTP
    │
    ▼
routes/              → define caminho, método e middlewares
    │
    ▼
requireAuth          → valida JWT e injeta req.user
    │
    ▼
requirePermission    → verifica permissão via roles no banco
    │
    ▼
controllers/         → extrai dados e chama handleRequest
    │
    ▼
services/            → regras de negócio, assertUnique, Prisma
    │
    ▼
Banco de dados (MySQL)
```

---

## Worker MQTT — fora do escopo do MVP

Dados de sensores são mockados via seed.

---
