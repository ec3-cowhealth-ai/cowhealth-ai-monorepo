# CHANGELOG

# Alterações e Progresso de JCFS

---

## 2026-05-23 - Ícones bovinos coloridos por status + redirect logout para Landing Page (JCFS)

Escopo: ícone `CowHead` (lucide-lab) colorido dinamicamente conforme status de saúde da vaca; migração completa do componente `Icon` customizado e `CowMark` para `lucide-react` em todas as telas pós-login; redirect de logout e sessão expirada apontando para a Landing Page.

### Adicionado

- `frontend/src/components/ui/CowHeadIcon.tsx` — componente React compartilhado que envolve o node `cowHead` do `@lucide/lab` via `createLucideIcon`; elimina a repetição de `createLucideIcon` em cada arquivo

**Frontend — Dependências**

- `frontend/package.json` — instalado `@lucide/lab` para uso do `CowHead`

### Modificado

**Frontend — Ícones de vaca por status**

O ícone `CowHead` agora recebe `color` dinamicamente com base no status da vaca, tornando o estado de saúde visualmente imediato na lista e no detalhe.

- `frontend/src/features/cows/pages/CowsPage.tsx` — cada `CowHead` na lista recebe `color={statusColor(cow.status)}`
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — `CowHead` no hero card recebe `color={statusColor(cow.status)}`

Mapeamento de cores:

| Status | Cor |
|---|---|
| Saudável | `var(--success)` — verde |
| Alerta | `var(--danger)` — vermelho |
| Estresse Térmico | `var(--warning)` — laranja |
| Parto | `var(--info)` — azul |

**Frontend — Migração Icon customizado → lucide-react**

Todos os usos do componente `Icon` customizado (`@components/ui/Icon`) e `CowMark` foram substituídos por equivalentes Lucide em todas as telas pós-login.

- `frontend/src/components/layout/AppBar.tsx` — `Icon n="chevronLeft"` → `<ChevronLeft />`
- `frontend/src/components/layout/Sidebar.tsx` — `Beef` → `CowHead` (via `CowHeadIcon.tsx`)
- `frontend/src/features/cows/pages/CowsPage.tsx` — `Icon n="search/chevronRight"` → `Search`, `ChevronRight`; `CowMark` → `CowHead`
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — `Icon n="alert/farm/collar/thermo/heart"` → `AlertTriangle`, `Warehouse`, `Tag`, `Thermometer`, `Heart`; `CowMark` → `CowHead`
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — `Icon n="check/alert/bell/activity"` → `Check`, `AlertTriangle`, `Bell`, `Activity`; mapa de ícones por tipo refatorado para `ReactNode`
- `frontend/src/pages/home/HomePage.tsx` — `Icon n="bell/alert/chevronRight/check/list/map/farm"` → Lucide equivalentes; `CowMark` → `CowHead`
- `frontend/src/pages/profile/ProfilePage.tsx` — `Icon n="list/farm/collar/user/chevronRight/logout"` → Lucide equivalentes; `CowMark` → `CowHead`; `menuItems` refatorado para `ReactNode` em vez de strings
- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — `Beef` → `CowHead` (via `CowHeadIcon.tsx`)

**Frontend — Logout**

- `frontend/src/hooks/useAuth.ts` — `useLogout` redireciona para `/` (Landing Page) em vez de `/login`
- `frontend/src/components/layout/Sidebar.tsx` — `handleLogout` redireciona para `/`
- `frontend/src/lib/api.ts` — interceptor 401 redireciona para `/` em vez de `/login`

### Build Status

- TypeScript frontend: zero erros (`tsc --noEmit`)

---

## 2026-05-23 - Design System Hi-Fi: 5 telas pós-login + filtro por fazenda em cascata (JCFS)

Escopo: substituição completa das telas pós-login pelo Design System Hi-Fi (CowHealth AI — 5 telas · iPhone 14 Pro · Dark · PT-BR); adição de contexto global de fazenda selecionada com propagação em cascata até o Prisma; reescrita do mapa como planta interna de fazenda com piquetes/estábulos e pins de vaca em tempo real; criação de 5 layouts SVG únicos (um por fazenda).

### Adicionado

**Frontend — Componentes UI (`src/components/ui/`)**

- `Icon.tsx` — renderizador SVG com 30+ ícones do Design System; props `{ n, s, c, sw, style }`; ícones: bell, search, home, list, alert, map, user, wifi, arrowUp, calendar, chevronLeft/Right, filter, plus, check, thermo, heart, activity, battery, logout, farm, collar
- `StatusDot.tsx` — indicador colorido com animação `cowPulse`; tons `success | warn | danger | muted | info`
- `Battery.tsx` — componente visual de percentual de bateria com cores por faixa (danger < 20 %, warning < 40 %, accent ≥ 40 %)
- `CowMark.tsx` — logotipo SVG de vaca; props `{ s, primary, accent }`
- `LineChart.tsx` — gráfico SVG nativo consumindo `SensorDailyPoint[]`; suporte a thresholds horizontais, gradiente de área, eixos X/Y automáticos, até 5 rótulos de data

**Frontend — Contexto**

- `src/context/FarmContext.tsx` — `FarmProvider` expondo `selectedFarm`, `setSelectedFarm`, `farms`, `isLoading`; persiste `selectedFarmId` no `localStorage`; auto-seleciona a primeira fazenda na inicialização

**Frontend — Páginas novas**

- `src/pages/map/farmLayouts.ts` — 5 layouts SVG de plantas de fazenda: Aurora (campos + estábulo central), São Bento (corredor + piquetes laterais), Vale Verde (formato L + lagoa), Santa Clara (grade 3×2 de piquetes), Rio Bonito (linear + mata ciliar + rio); cada layout define zonas coloridas com labels, vias e posições de pins
- `src/pages/map/MapPage.tsx` — mapa full-bleed da fazenda selecionada: fundo topográfico SVG, polígonos de zonas com labels, pins de vaca animados por status (dados reais filtrados por fazenda), legenda de contagem, card de detalhe ao tocar pin, botão "Próxima" para ciclar entre fazendas
- `src/pages/profile/ProfilePage.tsx` — perfil do usuário com CowMark, email, perfil, menu de acesso rápido e logout

### Modificado

**Frontend — Layout**

- `src/components/layout/BottomNav.tsx` — migrado de 4 abas com emoji para 5 abas com `Icon` SVG (Início / Rebanho / Alertas / Mapa / Perfil); indicador Pearl Aqua `.bottom-nav__indicator` animado no item ativo; badge de não lidos em Alertas
- `src/components/layout/AppBar.tsx` — adicionados props `subtitle`, `showBack`, `left`; back button usa `Icon` chevronLeft; slot `left` para avatar/logo personalizado

**Frontend — Páginas reescritas**

- `src/pages/home/HomePage.tsx` — hero card com score de saúde + barra de progresso, strip de alerta crítico, fila horizontal de vacas em atenção, grid de acesso rápido; bottom sheet para troca de fazenda; todos os dados filtrados pela fazenda selecionada
- `src/features/cows/pages/CowsPage.tsx` — layout `cow-row` com `CowMark` + `StatusDot`; filtro por fazenda via contexto; chips de status; busca colapsável; subtitle mostra nome da fazenda
- `src/features/cows/pages/CowDetailPage.tsx` — hero card com CowMark + status + pills de fazenda/coleira; grid de métricas; `LineChart` com tabs Temperatura / FC; notificações recentes da vaca
- `src/features/notifications/pages/NotificationsPage.tsx` — alert cards com borda esquerda colorida por tipo; chips Todos / Não lidos; `timeAgo` em PT-BR; marcar lido ao tocar; ação "marcar tudo" no AppBar

**Frontend — Rotas**

- `src/routes/AppRoutes.tsx` — adicionadas rotas `/map` → `MapPage` e `/profile` → `ProfilePage`

**Frontend — App**

- `src/App.tsx` — envolvido com `<FarmProvider>` dentro do `QueryClientProvider`

**Frontend — CSS**

- `src/styles/App.css` — reescrita completa do Design System autenticado (sem bloco `:root`, que reside em `landing.css`): `bottom-nav` 5 colunas 64px com `.bottom-nav__indicator` Pearl Aqua; `app-bar` 56px com `.app-bar__titles`, `.app-bar__subtitle`, `.app-bar__action-badge`; `@keyframes cowPulse`; novas classes: `.app-content`, `.home-hero`, `.home-hero__bar`, `.home-hero__bar-fill`, `.home-stat`, `.home-section`, `.home-section__header`, `.alert-card`, `.alert-card--danger`, `.alert-card--read`, `.quick-grid`, `.quick-chip`, `.cow-row`, `.cow-row__meta`, `.cow-row__right`, `.cow-row__status`, `.filter-chips`, `.filter-chip`, `.home-empty`

**Frontend — Hooks**

- `src/features/dashboard/hooks/useDashboard.ts` — `useDashboardOverview(farmId?)` e `useCowsPerStatus(farmId?)` incluem `farmId` no `queryKey` e repassam ao service

**Frontend — Services**

- `src/services/dashboardService.ts` — `getDashboardOverview(farmId?)` e `getCowsPerStatus(farmId?)` enviam `?farmId=` quando informado

**Backend — Services**

- `src/services/dashboardService.ts` — `getDashboardOverview(farmId?)`: filtra `prisma.cow.count()` com `where: { farmId }`; quando `farmId` fornecido retorna a própria fazenda como `topFarm`; `getCowsPerStatus(farmId?)`: adiciona `where: { farmId }` ao `groupBy`
- `src/services/cowsService.ts` — `getAllCows(farmId?)`: adiciona `where: farmId ? { farmId } : undefined` ao `findMany`

**Backend — Controllers**

- `src/controllers/dashboardController.ts` — `overview` e `cowsPerStatus` leem `request.query.farmId` e repassam como `number`
- `src/controllers/cowsController.ts` — `listCows` lê `request.query.farmId` e repassa para `getAllCows`

### Corrigido

- **Dashboard exibia 160 vacas (todas as fazendas)** quando o admin acessava fazenda específica
  Causa: backend sem suporte a `farmId`; frontend sem estado de fazenda selecionada
  Solução: `FarmContext` + query param `?farmId=` em cascata até o Prisma

- **Mapa exibia visão global multi-fazenda** em vez de planta interna
  Causa: `MapPage` anterior usava pins fixos de localização geográfica das fazendas
  Solução: reescrito com `farmLayouts.ts` — planta interna com zonas SVG e pins de vacas filtrados

- **`isPending: toggling` declarado e nunca usado** em `UsersPage` (erro TypeScript pré-existente)
  Solução: removido do destructuring

### Build Status

- TypeScript frontend: zero erros — 842 modules transformados (`npm run build`)
- TypeScript backend: sem erros de tipo nas funções modificadas

---

## 2026-05-23 - FarmContext + Mapa Refatorado + Ícones Lucide React (JCFS)

Escopo: contexto global de fazenda selecionada, refatoração completa do mapa, farm layouts estáticos, ajustes no backend de cows/dashboard, e substituição de todos os emojis por ícones vetoriais via `lucide-react`.

### Adicionado

**Frontend — Contexto**

- `frontend/src/context/FarmContext.tsx` — contexto global de fazenda selecionada; expõe `selectedFarm` e `setSelectedFarm` para filtrar dados por fazenda em toda a aplicação

**Frontend — Mapa**

- `frontend/src/pages/map/farmLayouts.ts` — layouts estáticos de fazendas (posições de setores, currais e pontos de interesse); dado local para renderização do mapa sem depender de endpoint externo

**Frontend — Dependências**

- `frontend/package.json` — instalada `lucide-react` para substituição de emojis por ícones vetoriais consistentes

### Modificado

**Backend — Cows**

- `backend/src/controllers/cowsController.ts` — ajustes na resposta do controller
- `backend/src/services/cowsService.ts` — ajustes na lógica de filtragem

**Backend — Dashboard**

- `backend/src/controllers/dashboardController.ts` — ajustes na resposta dos KPIs
- `backend/src/services/dashboardService.ts` — refatoração da lógica de agregação de dados por fazenda

**Frontend — Dashboard**

- `frontend/src/services/dashboardService.ts` — atualizado para suportar filtro por `farmId`
- `frontend/src/features/dashboard/hooks/useDashboard.ts` — hooks atualizados para consumir `FarmContext` e passar `farmId` nas queries

**Frontend — Home**

- `frontend/src/pages/home/HomePage.tsx` — refatorado para usar `FarmContext`; seletor de fazenda integrado à página inicial

**Frontend — Mapa**

- `frontend/src/pages/map/MapPage.tsx` — refatoração completa: renderização baseada em `farmLayouts.ts`, integração com `FarmContext`, novo layout visual de setores e currais

**Frontend — Cows**

- `frontend/src/features/cows/pages/CowsPage.tsx` — filtro por fazenda via `FarmContext` integrado

**Frontend — App**

- `frontend/src/App.tsx` — `FarmContext.Provider` adicionado ao wrapper de providers globais

**Frontend — Ícones (lucide-react)**

Todos os emojis foram removidos do código-fonte e substituídos por componentes Lucide. **Impacto: `icon` prop de `EmptyState` e `ErrorState` mudou de `string` para `ReactNode`** — quem passar string literal nesses props receberá erro de TypeScript.

- `frontend/src/components/common/EmptyState.tsx` — `icon?: string` → `icon?: ReactNode`; default `<Inbox size={40} />`
- `frontend/src/components/common/ErrorState.tsx` — `icon?: string` → `icon?: ReactNode`; default `<AlertTriangle size={40} />`
- `frontend/src/components/common/FormModal.tsx` — `✕` → `<X size={16} />`
- `frontend/src/components/common/ConfirmDialog.tsx` — `✕` → `<X size={16} />`
- `frontend/src/components/layout/Sidebar.tsx` — emojis de navegação → `Home`, `Warehouse`, `Tag`, `Beef`, `Bell`, `ShieldCheck`, `LogOut`
- `frontend/src/components/layout/BottomNav.tsx` — custom `Icon` SVG component → `Home`, `List`, `Bell`, `Map`, `User` (Lucide)
- `frontend/src/features/notifications/components/NotificationCard.tsx` — mapa de emojis por tipo → `AlertTriangle`, `Bell`, `Info`, `XCircle`, `Megaphone`
- `frontend/src/pages/auth/LoginPage.tsx` — emoji `🐄` removido do título `CowHealth AI`
- `frontend/src/features/access/pages/AccessLayout.tsx` — `🔒` → `<Lock size={40} />`
- `frontend/src/features/access/pages/RolesPage.tsx` — `✕` → `<X />`, `🎭` → `<Users size={40} />`
- `frontend/src/features/access/pages/PermissionsPage.tsx` — `🔑` → `<Key size={40} />`
- `frontend/src/features/access/pages/UsersPage.tsx` — `✕` → `<X />`, `👤` → `<User size={40} />`
- `frontend/src/features/farms/pages/FarmsPage.tsx` — `🏡` → `<Warehouse size={40} />`
- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — `❌` → `<XCircle />`, `🐄` → `<Beef />`
- `frontend/src/features/collars/pages/CollarDetailPage.tsx` — `❌` → `<XCircle size={40} />`

### Build Status

- TypeScript frontend: zero erros (`tsc --noEmit`)

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
