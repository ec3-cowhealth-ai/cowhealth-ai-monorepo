# CowHealth AI — Referência Técnica

[![Stack](https://img.shields.io/badge/stack-React%2019%20%7C%20TypeScript%20%7C%20Express%20%7C%20Prisma-339989?style=for-the-badge)](./)
[![Frontend](https://img.shields.io/badge/frontend-Vite%20%2B%20React%20Query%20%2B%20Axios-7DE2D1?style=for-the-badge)](./frontend)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma%20%2B%20JWT-131515?style=for-the-badge)](./backend)
[![Database](https://img.shields.io/badge/database-MySQL-E8C66B?style=for-the-badge)](./backend/prisma/schema.prisma)
[![Architecture](https://img.shields.io/badge/architecture-feature--oriented%20monorepo-6BB4E8?style=for-the-badge)](./docs/architecture/frontend-architecture.md)

Documento de referência técnica do monorepo. Para entender o produto, leia primeiro o [README.md](./README.md).

## O que ler primeiro

1. [START_HERE.md](/START_HERE.md)
2. [MANAGER.md](/MANAGER.md)
3. [docs/README.md](/docs/README.md)
4. [docs/agents/agents.md](/docs/agents/agents.md)
5. [docs/agents/design.md](/docs/agents/design.md)
6. [docs/architecture/frontend-architecture.md](/docs/architecture/frontend-architecture.md)
7. [docs/architecture/backend-architecture.md](/docs/architecture/backend-architecture.md)
8. [backend/prisma/schema.prisma](/backend/prisma/schema.prisma)

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router v7
- TanStack React Query
- Axios
- Lucide React + `@lucide/lab` (CowHead icon)
- CSS design system próprio (sem Tailwind nas rotas autenticadas)
- Leaflet (mapa GPS interativo)

### Backend

- Express 5
- TypeScript
- Prisma ORM
- MySQL
- JSON Web Tokens (permissões embutidas no payload)
- bcrypt
- multer (upload de fotos das vacas)
- Zod (validação de requisições)
- MQTT (ingestão de dados das coleiras)

## Estrutura do repositório

```text
.
├── README.md
├── TECHNICAL.md
├── START_HERE.md
├── MANAGER.md
├── backend/
├── docs/
└── frontend/
```

### Frontend

```text
frontend/
├── public/
└── src/
    ├── components/
    │   ├── charts/           # ChartContainer
    │   ├── common/           # ConfirmDialog, EmptyState, FormModal, StatusBadge…
    │   ├── layout/           # AppShell, Sidebar, BottomNav, AppBar
    │   └── ui/               # Icon, Battery, LineChart, PeriodPicker…
    ├── context/              # FarmContext
    ├── features/             # Módulos de domínio
    │   ├── access/           # Usuários, papéis, permissões (admin)
    │   ├── auth/             # LoginForm, RegisterForm
    │   ├── clinicalRecord/   # Prontuário clínico veterinário (CRUD completo)
    │   ├── collars/          # Gestão de coleiras
    │   ├── cows/             # Ficha da vaca, histórico, sensores
    │   ├── dashboard/        # KPIs, gráficos, alerta, perfil da vaca
    │   ├── farms/            # Cadastro de fazendas
    │   ├── landing/          # Site público (landing page)
    │   └── notifications/    # Feed de alertas
    ├── hooks/
    ├── lib/                  # Axios client, QueryClient
    ├── pages/
    │   ├── auth/             # LoginPage, RegisterPage
    │   ├── map/              # MapPage — rastreamento GPS
    │   ├── onboarding/
    │   ├── profile/
    │   └── settings/
    ├── routes/               # AppRoutes, ProtectedRoute
    ├── services/
    ├── styles/               # App.css — design system tokens e componentes
    └── types/
```

### Backend

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── src/
    ├── controllers/
    ├── helpers/
    ├── lib/                  # Singleton do Prisma client
    ├── middlewares/          # requireAuth, requirePermission, validateSchema, errorHandler
    ├── routes/
    ├── schemas/              # Schemas Zod por domínio
    ├── services/
    │   ├── cowHealthAnalyzer.ts   # Classificador de saúde (heurísticas puras)
    │   ├── mqttIngestService.ts   # Pipeline de ingestão da coleira
    │   └── …
    └── types/
```

## Design System

O app autenticado usa um design system CSS puro em `frontend/src/styles/App.css`. Não há Tailwind dentro das rotas protegidas — apenas na landing page.

Tokens e componentes principais:

- `--bg-app: #131515` — base escura
- `.app-shell`, `.sidebar`, `.bottom-nav`, `.app-bar`, `.app-page`
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`
- `.status-badge--success/warning/danger/muted/info`
- `.kpi-card`, `.card`, `.card--clickable`
- `.data-table`, `.tabs`, `.modal-*`, `.drawer-*`
- Breakpoint: 768px (sidebar no desktop, bottom-nav no mobile)

## Modelo de dados

O schema Prisma modela:

| Grupo | Modelos |
|---|---|
| Auth / RBAC | `User`, `Role`, `Permission`, `PermissionGroup`, tabelas de junção |
| Domínio principal | `Farm`, `Cow`, `Collar` |
| Dados de sensores | `HeartRateData`, `TemperatureData`, `AccelerometerData` |
| Registros clínicos | `CowClinicalRecord` (prontuário veterinário completo) |
| Registros médicos | `MedicalRecord` (checkup, procedimento, medicação) |
| Comportamento | `ActivityEvent` (ruminação, alimentação, descanso, etc.) |
| Notificações | `Notification` (com severidade HIGH / MEDIUM / LOW) |

### Enums principais

```
CowStatus:           HEALTHY | CALVING | HEAT_STRESS | ALERT | RETIRED
CollarStatus:        ACTIVE | INACTIVE | MAINTENANCE | BATTERY
DataFrequency:       HIGHER (2 min) | DEFAULT (10 min) | LOWER (60 min)
ReproductiveStatus:  OPEN | INSEMINATED | PREGNANT | DRY | POSTPARTUM
ClinicalStatus:      STABLE | MONITORING | CRITICAL | RECOVERED | REFERRED
ActivityType:        RUMINATION | FEEDING | RESTING | LOW_ACTIVITY | HIGH_ACTIVITY | WALKING
AlertSeverity:       HIGH | MEDIUM | LOW
```

## Setup local

### 1. Instalar dependências

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Variáveis de ambiente

Frontend — criar `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:3001
```

Backend — criar `backend/.env`:

```dotenv
PORT=3001
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/cowhealth-db"
JWT_SECRET="a-long-random-string"
JWT_EXPIRES_IN="7d"
```

### 3. Rodar localmente

```bash
# Terminal 1
cd frontend && npm run dev     # http://localhost:5173

# Terminal 2
cd backend && npm run dev      # http://localhost:3001
```

### 4. Verificar

```bash
cd frontend && npm run lint && npm run build
cd backend  && npm run lint && npm run build
```

## Mapa de documentação

| Documento | Finalidade |
|---|---|
| `START_HERE.md` | Ponto de entrada prático |
| `MANAGER.md` | Gestão do projeto e decisões |
| `docs/README.md` | Índice da documentação |
| `docs/agents/agents.md` | Papéis e responsabilidades dos agentes |
| `docs/agents/design.md` | Referência do design system |
| `docs/architecture/frontend-architecture.md` | Estrutura e convenções do frontend |
| `docs/architecture/backend-architecture.md` | Matriz de rotas e convenções do backend |
| `docs/heuristic_models/` | Modelos matemáticos do diagnóstico heurístico (Anexo VII) |
| `docs/CHANGELOG.md` | Histórico de mudanças |
| `docs/change_control/CHANGE_BUGFIX.md` | Log de correções |

## Notas

- Este é um repositório web, não um app mobile.
- Trate planos e auditorias antigas como histórico, a menos que listados em `docs/README.md` como documentos de trabalho atuais.
- O código-fonte e o schema Prisma são a fonte de verdade final para o comportamento em runtime.
