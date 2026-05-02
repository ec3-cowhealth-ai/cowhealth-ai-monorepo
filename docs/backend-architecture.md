# Backend — Estrutura e Arquitetura

Guia de referência sobre a organização do código no backend do projeto.

---

## Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma        # definição de todos os modelos e relações
│   └── migrations/          # histórico de migrations geradas automaticamente
├── src/
│   ├── controllers/         # recebe request/response e chama os services
│   ├── middlewares/         # validações, autenticação, autorização
│   ├── routes/              # definição dos endpoints
│   ├── services/            # regras de negócio e acesso ao banco via Prisma
│   ├── types/               # interfaces e tipos TypeScript
│   ├── lib/
│   │   └── prisma.ts        # singleton do PrismaClient
│   └── server.ts            # inicialização do Express
├── prisma.config.ts         # configuração de conexão com o banco
├── .env                     # variáveis de ambiente
├── .env.example             # template de variáveis para o time
├── package.json
└── tsconfig.json
```

---

## Responsabilidade de cada camada

### `routes/`
Define os endpoints e associa cada um ao controller correspondente. Não contém lógica.

```ts
// src/routes/farms.ts
import { Router } from "express";
import { listFarms, createFarm } from "../controllers/farmsController";

const router = Router();

router.get("/", listFarms);
router.post("/", createFarm);

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
Funções executadas antes dos controllers. Usadas para autenticação, autorização e validação de dados.

```ts
// src/middlewares/validateId.ts
import { Request, Response, NextFunction } from "express";

export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "ID inválido." });
  }
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
routes/          → define o caminho e o método (GET, POST, etc.)
    │
    ▼
middlewares/     → valida token, permissões, formato dos dados
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

## Comparação com projeto sem Prisma

| | Projeto anterior (SQL manual) | Projeto atual (Prisma) |
|---|---|---|
| Conexão com o banco | `connection.ts` com `mysql2` | `lib/prisma.ts` com `PrismaClient` |
| Queries | SQL escrito manualmente | Métodos do Prisma (`findMany`, `create`, etc.) |
| Tipagem dos resultados | Manual ou ausente | Gerada automaticamente pelo Prisma |
| Migrations | Scripts SQL manuais | `prisma migrate dev` |
| Controllers, routes, services, middlewares | Igual | Igual |