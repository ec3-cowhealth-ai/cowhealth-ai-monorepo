# Prisma — Guia de Referência

Guia de consulta rápida para o uso do Prisma no backend do projeto.

---

## Estrutura relevante

```
backend/
├── prisma/
│   ├── schema.prisma        # definição de todos os modelos e relações
│   └── migrations/          # histórico de migrations geradas automaticamente
├── src/
│   └── lib/
│       └── prisma.ts        # singleton do PrismaClient
└── prisma.config.ts         # configuração de conexão com o banco
```

---

## Comandos

### Setup inicial (já executado)

```bash
npx prisma init
```
Cria a pasta `prisma/` com o `schema.prisma` inicial. Executado apenas uma vez.

---

### Criar e aplicar uma migration

Deve ser executado sempre que o `schema.prisma` for alterado — novo campo, nova tabela, mudança de tipo ou relação.

```bash
npx prisma migrate dev --name descricao_da_mudanca
```

O nome deve descrever o que foi alterado, em snake_case:

```bash
npx prisma migrate dev --name add_weight_to_cows
npx prisma migrate dev --name create_audit_log_table
npx prisma migrate dev --name remove_breed_from_cows
```

Este comando também executa o `prisma generate` automaticamente.

---

### Aplicar migrations pendentes

Ao puxar alterações do repositório que incluam novas migrations, executar:

```bash
npx prisma migrate dev
```

Aplica todas as migrations que ainda não foram executadas no banco local.

---

### Gerar o client manualmente

Necessário quando o `@prisma/client` estiver desatualizado em relação ao schema sem ter passado pelo `migrate dev`:

```bash
npx prisma generate
```

---

### Visualizar os dados no browser

```bash
npx prisma studio
```

Abre uma interface visual em `http://localhost:5555` para inspecionar e editar registros diretamente no banco.

---

## Uso no código

O `PrismaClient` é instanciado uma única vez em `src/lib/prisma.ts`. Importar sempre a partir desse arquivo:

```ts
import { prisma } from "../lib/prisma";
```

### Exemplos de queries

```ts
// Listar todos os registros
const farms = await prisma.farm.findMany();

// Buscar com filtro
const activeCows = await prisma.cow.findMany({
  where: { status: "HEALTHY" },
});

// Buscar um registro por campo único
const user = await prisma.user.findUnique({
  where: { email: "admin@cowhealth.com" },
});

// Buscar com relações
const cow = await prisma.cow.findUnique({
  where: { id: 1 },
  include: { farm: true, collar: true },
});

// Criar
const farm = await prisma.farm.create({
  data: { name: "Fazenda Aurora", cnpj: "00.000.000/0001-00" },
});

// Atualizar
const updated = await prisma.cow.update({
  where: { id: 1 },
  data: { status: "ALERT" },
});

// Deletar
await prisma.cow.delete({ where: { id: 1 } });
```

---

## Referência rápida

| Situação | Comando |
|---|---|
| Alterou o `schema.prisma` | `prisma migrate dev --name descricao` |
| Puxou mudanças com novas migrations | `prisma migrate dev` |
| Client desatualizado sem nova migration | `prisma generate` |
| Quer inspecionar os dados | `prisma studio` |

---

## Observações

- O `schema.prisma` é o **source of truth** do banco. Nunca alterar o banco diretamente pelo Workbench ou por SQL manual — toda mudança passa pelo schema e pelo `migrate dev`.
- O Workbench é utilizado apenas para **visualização e conferência** dos dados, não para alterações estruturais.
- O arquivo `.env` não deve ser commitado. Cada membro do time mantém o seu local com as credenciais próprias, baseando-se no `.env.example`.