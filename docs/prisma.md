# Prisma — Guia de Referência

Guia de consulta rápida para o uso do Prisma no backend do projeto.

---

## Estrutura relevante

```
backend/
├── prisma/
│   ├── schema.prisma        # definição de todos os modelos e relações
│   ├── seed.ts              # dados iniciais de desenvolvimento
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

### Popular o banco com dados de desenvolvimento

```bash
npx prisma db seed
```

Executa o arquivo `prisma/seed.ts` e popula o banco com dados iniciais: usuário admin, roles, permissões, fazendas, colares, vacas e dados de sensores.

---

### Resetar o banco completamente

Apaga o banco, recria, aplica todas as migrations em ordem e roda o seed automaticamente. Equivalente a um DROP + recriação completa.

```bash
npx prisma migrate reset
```

Útil durante o desenvolvimento quando há mudanças estruturais incompatíveis com os dados existentes — por exemplo, adicionar colunas obrigatórias sem valor padrão em tabelas já populadas.

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
| Puxar mudanças com novas migrations | `prisma migrate dev` |
| Client desatualizado sem nova migration | `prisma generate` |
| Quer popular o banco com dados iniciais | `prisma db seed` |
| Quer apagar tudo e recomeçar do zero | `prisma migrate reset` |
| Quer inspecionar os dados | `prisma studio` |

---

## Observações

- O `schema.prisma` é o **source of truth** do banco. Nunca alterar o banco diretamente pelo Workbench ou por SQL manual — toda mudança passa pelo schema e pelo `migrate dev`.
- O Workbench é utilizado apenas para **visualização e conferência** dos dados, não para alterações estruturais.
- O `migrate reset` apaga todos os dados. Usar apenas em ambiente de desenvolvimento.
- O arquivo `.env` não deve ser commitado. Cada membro do time mantém o seu local com as credenciais próprias, baseando-se no `.env.example`.

---

## Seed massivo via SQL

Para popular o banco com um volume realista de dados (200 colares, 160 vacas, 5 fazendas, 8 perfis de usuário), existe um seed alternativo baseado em SQL puro com stored procedures.

### Arquivos

```
backend/
└── prisma/
    ├── seed_data.sql   # INSERT statements + stored procedures para geração em massa
    └── run_seed.sh     # script de execução com confirmação interativa
```

### Estrutura gerada

| Entidade            | Qtd    | Detalhe                                                              |
|---------------------|--------|----------------------------------------------------------------------|
| Permissions         | 37     | CRUD completo por recurso                                            |
| Roles               | 8      | SuperAdmin, Administrador, Veterinário, Zootecnista, Gerente de Fazenda, Operador de Campo, Financeiro, Observador |
| Users               | 8      | Um por role, emails `@cowhealth.com`                                 |
| Farms               | 5      | PR, MG, GO, SP, MT                                                   |
| Collars             | 200    | 1-160 ACTIVE (atribuídos), 161-180 estoque, 181-190 MAINTENANCE, 191-195 INACTIVE, 196-200 BATTERY |
| Cows                | 160    | 32/fazenda — ~69% HEALTHY, 12% HEAT_STRESS, 12% ALERT, 6% CALVING   |
| Sensor data         | ~81k   | 7 dias × 160 vacas × 3 tabelas (heart_rate, temperature, accelerometer) |
| Notifications       | 100    | Alertas variados, 60% lidas                                          |

### Como executar

```bash
cd backend/prisma
./run_seed.sh
```

O script verifica a conexão, pede confirmação antes de apagar os dados e exibe um resumo ao final.

Para rodar o SQL diretamente:

```bash
mysql -u root -p -P 33071 cowhealth-db < backend/prisma/seed_data.sql
```

### Usuários criados

| Email                       | Role              | Profile |
|-----------------------------|-------------------|---------|
| admin@cowhealth.com         | SuperAdmin        | ADMIN   |
| gerente@cowhealth.com       | Administrador     | ADMIN   |
| vet@cowhealth.com           | Veterinário       | MANAGER |
| zoot@cowhealth.com          | Zootecnista       | MANAGER |
| fazenda@cowhealth.com       | Gerente de Fazenda| MANAGER |
| operador@cowhealth.com      | Operador de Campo | VIEWER  |
| financeiro@cowhealth.com    | Financeiro        | VIEWER  |
| obs@cowhealth.com           | Observador        | VIEWER  |

### Ativando o login (senhas)

O SQL insere hashes placeholder. Para gerar um hash real de `password123` e atualizar todos os usuários:

```bash
node -e "require('bcrypt').hash('password123', 12).then(h => console.log('UPDATE users SET password_hash = \"' + h + '\";'))"
```

Cole o `UPDATE` gerado no MySQL, ou rode o `seed.ts` normalmente (`npx prisma db seed`) — ele recria os usuários com hashes válidos.