# CHANGELOG

# Alterações e Progresso de JCFS

---

## 2026-05-23 - Backend MQTT + Gestão de Acesso + Auth + Dashboard + Ambiente (JCFS)

Escopo: endpoint de ingestão MQTT, análise heurística de saúde, telas de gestão de acesso completas, dashboard com dados reais, correção de tipos TypeScript, configuração de ambiente e seed massivo de dados.

### Adicionado

**Backend — Ingestão MQTT**

- `backend/src/middlewares/requireApiKey.ts` — middleware de autenticação por API Key (`Authorization: Bearer`)
- `backend/src/services/mqttIngestService.ts` — validação de payload, persistência de HeartRateData / TemperatureData / AccelerometerData, análise heurística de CALVING e HEAT_STRESS, disparo de notificações para ADMIN e MANAGER
- `backend/src/controllers/mqttController.ts` — controller fino delegando para `ingestMqttPayload`
- `backend/src/routes/mqttRoutes.ts` — `POST /mqtt/ingest` protegido por `requireApiKey`

**Documentação IoT**

- `docs/iot-simulator-plan.md` — plano completo do simulador Python: faixas fisiológicas bovinas, formato do payload MQTT, arquitetura do fluxo, pseudocódigo de todos os módulos e sequência de execução
- `cowhealth-iot-simulator/CLAUDE.md` — instruções permanentes para IA no repositório IoT separado

**Frontend — Dashboard**

- `frontend/src/services/dashboardService.ts` — serviço com os 3 endpoints de dashboard
- `frontend/src/features/dashboard/hooks/useDashboard.ts` — hooks `useDashboardOverview`, `useCowsPerStatus`, `useCowsPerFarm`
- `frontend/src/features/dashboard/components/DashboardKPICard.tsx`
- `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx` — PieChart com Recharts
- `frontend/src/features/dashboard/components/CowsPerFarmChart.tsx` — BarChart com Recharts
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — LineChart com Recharts

**Frontend — Auth**

- `frontend/src/pages/auth/RegisterPage.tsx`

**Frontend — Hooks de Acesso**

- `frontend/src/features/access/hooks/useRoles.ts` — `useRoles`, `useRole`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`, `useGrantPermission`, `useRevokePermission`
- `frontend/src/features/access/hooks/useUsers.ts` — `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useToggleActive`, `useAssignRole`, `useRemoveRole`
- `frontend/src/features/access/hooks/usePermissions.ts` — `usePermissions`, `useCreatePermission`, `useUpdatePermission`, `useDeletePermission`

### Modificado

**Backend**

- `backend/src/server.ts` — registro de `mqttRoutes` em `app.use("/mqtt", mqttRoutes)`
- `backend/src/types/auth.ts` — adicionada interface `RegisterInput { name, email, password }`
- `backend/src/services/authService.ts` — adicionada função `register()` com hash bcrypt e perfil VIEWER
- `backend/src/controllers/authController.ts` — adicionado `registerController`
- `backend/src/routes/authRoutes.ts` — adicionada rota `POST /register` (pública)
- `backend/.env` / `backend/.env.example` — adicionada variável `MQTT_WORKER_API_KEY`

**Frontend — Auth**

- `frontend/src/features/auth/components/LoginForm.tsx` — implementação com `react-hook-form` + `zod`, `autoComplete="off"` para evitar preenchimento automático do Chrome
- `frontend/src/features/auth/components/RegisterForm.tsx` — implementado do zero com validações e integração com `useRegister()`
- `frontend/src/services/authService.ts` — adicionado `registerService()`
- `frontend/src/hooks/useAuth.ts` — adicionado `useRegister()` com redirect para `/login` no `onSuccess`
- `frontend/src/routes/AppRoutes.tsx` — substituído `RegisterPlaceholder` por `<RegisterPage />` real

**Frontend — Dashboard**

- `frontend/src/features/dashboard/pages/DashboardPage.tsx` — substituído mock data por hooks reais, loading state, KPIs adicionais (`totalActiveCollars`, `unreadNotifications`)

**Frontend — Cows**

- `frontend/src/features/cows/components/SensorChart.tsx` — interface corrigida: `{ timestamp, value }` → `{ date, average }`
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — removidas 2 queries desnecessárias; `farm` e `collar` extraídos diretamente de `cow.farm` e `cow.collar`

**Frontend — Collars**

- `frontend/src/features/collars/components/CollarCard.tsx` — `collar.identifier` → `collar.name`; removidos campos `batteryPercentage` e `lastSync`
- `frontend/src/features/collars/pages/CollarDetailPage.tsx` — removida query extra; `linkedCow = collar?.cow` (já aninhado)

**Frontend — Farms**

- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — removido filtro client-side `c.farmId === id`

**Frontend — Access**

- `frontend/src/features/access/pages/UsersPage.tsx` — reescrita completa: busca, `CreateUserModal`, `EditUserModal`, `ManageRolesModal`, toggle ativo, exclusão com confirmação
- `frontend/src/features/access/pages/RolesPage.tsx` — reescrita completa: busca, `RoleFormModal`, `ManagePermissionsModal` com checkboxes em tempo real; corrigido `role.permissions.length` → `role._count.permissions`
- `frontend/src/features/access/pages/PermissionsPage.tsx` — reescrita completa: busca, `PermissionFormModal`, exclusão com confirmação

**Frontend — Hooks**

- `frontend/src/hooks/useNotifications.ts` — `useMarkNotificationAsRead` e `useMarkAllAsRead` convertidos de objetos fake para `useMutation` real com `invalidateQueries`

**Frontend — Tipos**

- `frontend/src/types/cows.ts` — `id: string` → `number`; `dateOfBirth` → `birthDate`; `farmId` → `farm { id, name }`; `collarId` → `collar { id, name, status }`; `HeartRateDailyPoint` → `SensorDailyPoint { date, average }`
- `frontend/src/types/collars.ts` — `identifier` → `name`; removidos `batteryPercentage` e `lastSync`; `cowId` → `cow { id, tag, name }`
- `frontend/src/types/access.ts` — adicionados `RoleListItem` e `RoleDetail`; `Permission.description` → `string | null`

**Frontend — Services**

- `frontend/src/services/rolesService.ts` — tipagem atualizada; corrigido `grantPermission()` que enviava `permissionId` na URL em vez do body

**Frontend — Dependências**

- `frontend/package.json` — instalados `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`

**Ambiente**

- `backend/.env` — criado a partir do `.env.example`; `DATABASE_URL` configurada com porta `33071`
- `frontend/.env` — criado a partir do `.env.example`; `VITE_API_URL=http://localhost:3001`

### Removido

- `backend/prisma/run_seed.sh` — removido: bypass do Prisma ORM com credenciais MySQL hardcoded
- `backend/prisma/seed_data.sql` — removido: operações SQL diretas, senhas em texto puro
- `backend/src/routes/authRoutes.ts` — removida rota `POST /register` (pública sem autenticação, rejeitada em code review)
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — removido do dashboard (LineChart com dados categóricos não faz sentido sem endpoint de série temporal)

### Corrigido

- **Frontend chamava `localhost:3000/auth/login` (si mesmo) em vez de `localhost:3001`**
  Causa: `frontend/.env` não existia; `VITE_API_URL` era `undefined`
  Solução: criado `frontend/.env` com `VITE_API_URL=http://localhost:3001`

- **`grantPermission` retornava 404 silencioso**
  Causa: frontend enviava `POST /roles/:id/permissions/:permissionId` (rota inexistente)
  Solução: corrigido para `POST /roles/:id/permissions` com body `{ permissionId }`

- **Crash em `/access/roles`: `Cannot read properties of undefined (reading 'length')`**
  Causa: `role.permissions.length` — mas `getAllRoles` retorna `_count.permissions` (inteiro)
  Solução: substituído por `role._count.permissions`

- **Marcar notificação como lida não atualizava a UI**
  Causa: `useMarkNotificationAsRead` retornava objeto fake sem integração com React Query
  Solução: convertido para `useMutation` com `invalidateQueries(["notifications"])`

- **Dados chegavam no banco mas não apareciam nas telas**
  Causa: tipos TypeScript divergentes do contrato real da API (`timestamp/value` vs `date/average`, `identifier` vs `name`, etc.)
  Solução: todos os tipos alinhados com o shape real dos endpoints

- **Chrome preenchendo campo de email com conta Google do usuário**
  Causa: formulário sem `autoComplete`
  Solução: `autoComplete="off"` no `<form>` + `autoComplete="one-time-code"` no input de email

- **Porta 3001 ocupada por processo externo**
  Causa: outro projeto com processo Node na mesma porta
  Solução: identificado via `lsof -i :3001` + `kill {PID}`

### Build Status

- TypeScript backend: zero erros (`npx tsc --noEmit`)
- TypeScript frontend: zero erros — 837 modules | 284ms

---

## 2026-05-15 - Landing Page: responsividade iOS/Android + correção de scroll (JCFS)

Escopo: otimização mobile da landing page e correção de bug de scroll.

### Modificado

- `frontend/index.html` — adicionadas meta tags iOS/Android: `viewport-fit=cover`, `theme-color`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- `frontend/src/styles/landing.css` — adicionadas regras globais, `.stage` com `min-height: 100dvh`, `.app` com `overflow-y: auto`, `padding` com `env(safe-area-inset-*)`, `overscroll-behavior-y: none`
- `frontend/src/features/landing/pages/LandingPage.tsx` — conteúdo envolvido em `<div className="stage">`

### Corrigido

- **Scroll do mouse não funcionava na landing page**
  Causa: `overflow-y: auto` ausente no CSS do `.app`
  Solução: restaurado `overflow-y: auto; overflow-x: hidden` + `scrollbar-width: none`

### Build Status

- TypeScript: zero erros | Vite: zero erros

---

## 2026-05-14 - Estrutura base do frontend conforme instruções do professor (JCFS)

Escopo: apenas `frontend/` — sem alterações no backend.

### Adicionado

- `frontend/src/routes/AppRoutes.tsx` — roteamento centralizado
- `frontend/src/config/environment.ts` — configuração de ambiente centralizada
- `frontend/src/components/charts/ChartContainer.tsx` e `index.ts`
- `frontend/src/components/common/index.ts`
- `frontend/src/components/layout/index.ts`
- `frontend/src/components/feedback/index.ts`
- `frontend/src/utils/index.ts`

### Modificado

- `frontend/src/App.tsx` — simplificado para composição de providers globais e roteamento via `AppRoutes`
- `frontend/vite.config.ts` — aliases: `@`, `@components`, `@features`, `@pages`, `@hooks`, `@services`, `@routes`, `@config`, `@utils`, `@types`
- `frontend/tsconfig.app.json` — adicionados `baseUrl` e `paths` alinhados ao Vite
- `frontend/src/lib/api.ts` — `baseURL` passa a usar `environment.apiUrl`
- `frontend/.env.example` — adicionadas variáveis `VITE_API_URL`, `VITE_APP_NAME`, `VITE_ENV`

---

# Alterações e Progresso de Angelo

...

# Alterações e Progresso de Ian

...

# Alterações e Progresso de Renato

...
