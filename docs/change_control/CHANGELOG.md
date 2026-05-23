# CHANGELOG

# Alterações e Progresso de JCFS


## 2026-05-14 - Aplicacao das instrucoes do Professor (Frontend)

Escopo aplicado: apenas `frontend/` (sem alteracoes de estrutura no backend).

### Novos arquivos e pastas

- `frontend/src/routes/`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/config/`
- `frontend/src/config/environment.ts`
- `frontend/src/components/charts/`
- `frontend/src/components/charts/ChartContainer.tsx`
- `frontend/src/components/charts/index.ts`
- `frontend/src/components/common/`
- `frontend/src/components/common/index.ts`
- `frontend/src/components/layout/`
- `frontend/src/components/layout/index.ts`
- `frontend/src/components/feedback/`
- `frontend/src/components/feedback/index.ts`
- `frontend/src/utils/`
- `frontend/src/utils/index.ts`

### Arquivos modificados

- `frontend/src/App.tsx`
  - Arquivo simplificado para composicao de providers globais e roteamento centralizado via `AppRoutes`.

- `frontend/vite.config.ts`
  - Inclusao de `path` e configuracao de aliases:
    - `@`, `@components`, `@features`, `@pages`, `@hooks`, `@services`, `@routes`, `@config`, `@utils`, `@types`.

- `frontend/tsconfig.app.json`
  - Inclusao de `baseUrl` e `paths` para refletir os mesmos aliases do Vite.

- `frontend/src/lib/api.ts`
  - `baseURL` passa a usar `environment.apiUrl` de `src/config/environment.ts`.

- `frontend/.env.example`
  - Inclusao de variaveis padrao:
    - `VITE_API_URL`
    - `VITE_APP_NAME`
    - `VITE_ENV`

### Exclusoes

- Nenhum arquivo removido.

### Conformidade aplicada

- Rotas centralizadas em `src/routes/AppRoutes.tsx`.
- Configuracao de ambiente centralizada em `src/config/environment.ts`.
- Estrutura base proposta pelo professor criada para frontend.
- Placeholders com dependencia cruzada marcados com `TODO[IAN]`, `TODO[ANGELO]` e `TODO[JAFTE]`.
- Base para componentes reutilizaveis (`common`, `layout`, `feedback`) e charts via Recharts (`components/charts`) estabelecida.


## 2026-05-15 - Landing Page iOS/Android Responsivity + Bug Fixes

Escopo: Landing page iOS/Android optimization, CSS responsividade e correção de funcionalidade.

### Arquivos modificados

- `frontend/index.html`
  - Adicionadas meta tags iOS/Android:
    - `viewport-fit=cover` — Suporte a notch/safe area
    - `theme-color: #131515` — Cor da barra de status (dark)
    - `mobile-web-app-capable: yes` — PWA (novo padrão recomendado)
    - `apple-mobile-web-app-capable: yes` — PWA (compatibilidade Safari)
    - `apple-mobile-web-app-status-bar-style: black-translucent` — Estilo da barra

- `frontend/src/styles/landing.css`
  - Adicionadas regras globais (`html`, `body`, `img`, `svg`, `button`)
  - `body { overscroll-behavior-y: none; }` — Previne scroll elástico no iOS
  - `.stage` — Novo container de viewport com `min-height: 100dvh`
  - `.app` — Atualizado com:
    - `min-height: 100dvh` — Altura dinâmica do viewport (considera address bar)
    - `overflow-y: auto; overflow-x: hidden; scrollbar-width: none;` — Scroll funcional com scrollbar oculta
    - `padding-top: calc(env(safe-area-inset-top, 0px) + var(--s-4));` — Padding superior com suporte a notch
    - `padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--s-6));` — Padding inferior com suporte a home indicator
    - `padding-left: env(safe-area-inset-left, 0px);` — Padding para safe area esquerda
    - `padding-right: env(safe-area-inset-right, 0px);` — Padding para safe area direita
  - Adicionadas regras CSS para `body[data-view="phone"]` — Modo preview de dispositivo:
    - `.stage` com `display: grid; place-items: center;` — Centraliza device frame
    - `.app` com `height: 100%; overflow-y: auto;` — Conteúdo scrollável dentro do frame

- `frontend/src/features/landing/pages/LandingPage.tsx`
  - Envolvido conteúdo em `<div className="stage">` — Necessário para viewport management
  - Estrutura agora: `.stage` > `.app` > content sections

### Exclusões

Nenhum arquivo removido.

### Bugs fixados

- **Scroll do mouse não funcionava na landing page**
  - Causa: `overflow-y: auto` estava ausente no CSS do `.app`
  - Solução: Restaurado `overflow-y: auto; overflow-x: hidden;` + `scrollbar-width: none;` para scrollbar invisível

### Conformidade aplicada

- **iOS/Android Safe Area Handling:** Uso de `env(safe-area-inset-*)` para respeitar notches, dynamic islands e home indicators
- **Dynamic Viewport Height:** Substituição de `100vh` por `100dvh` (Dynamic Viewport Height) para lidar com address bar que aparece/desaparece
- **Progressive Web App (PWA):** Meta tags para instalação em home screen de dispositivos móveis
- **Mobile Scroll Behavior:** `overscroll-behavior-y: none` para melhor UX no iOS
- **Design System:** Todos os estilos respeitam CSS variables (cores, tipografia, espaçamento, radii, sombras)
- **Acessibilidade:** Contraste WCAG AA mantido, sem dependência de hover-only states

### Testes

- Build TypeScript: ✅ OK
- Build Vite: ✅ OK (sem erros)
- CSS Validação: ✅ Contém safe-area-inset (4x), 100dvh (2x), overscroll-behavior (1x)
- Meta tags: ✅ Presentes no dist/index.html


## 2026-05-23 - Backend register + Frontend auth/dashboard + Correcao de integracao

Escopo: implementacao do endpoint de registro, features de auth e dashboard com graficos reais, e correcao completa de tipos TypeScript desalinhados com o contrato real da API.

### Novos arquivos

- `frontend/src/pages/auth/RegisterPage.tsx` — pagina de registro completa
- `frontend/src/services/dashboardService.ts` — servico com os 3 endpoints de dashboard
- `frontend/src/features/dashboard/hooks/useDashboard.ts` — hooks `useDashboardOverview`, `useCowsPerStatus`, `useCowsPerFarm`

### Arquivos modificados

**Backend**

- `backend/src/types/auth.ts`
  - Adicionada interface `RegisterInput { name, email, password }`

- `backend/src/services/authService.ts`
  - Adicionada funcao `register()`: verifica email duplicado, faz hash bcrypt, cria user com perfil VIEWER

- `backend/src/controllers/authController.ts`
  - Adicionado `registerController`: valida campos obrigatorios, chama service, responde 201

- `backend/src/routes/authRoutes.ts`
  - Adicionada rota `POST /register` (publica, sem requireAuth)

**Frontend — Dependencias**

- `frontend/package.json`
  - Instalados: `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`

**Frontend — Auth**

- `frontend/src/features/auth/components/LoginForm.tsx`
  - Substituido esqueleto por implementacao com `react-hook-form` + `zod`
  - Validacao: email valido, password min 6 caracteres
  - Loading state, erros inline por campo, link para `/register`

- `frontend/src/features/auth/components/RegisterForm.tsx`
  - Implementado do zero com `react-hook-form` + `zod`
  - Validacoes: nome min 2 chars, email valido, senha forte (maiuscula + numero + min 8), confirmacao
  - Integrado com `useRegister()`, redireciona para `/login` apos sucesso

- `frontend/src/services/authService.ts`
  - Adicionado `registerService()`

- `frontend/src/hooks/useAuth.ts`
  - Adicionado `useRegister()` com `useMutation` + `navigate("/login")` no `onSuccess`

- `frontend/src/routes/AppRoutes.tsx`
  - Substituido `RegisterPlaceholder` por `<RegisterPage />` real

**Frontend — Dashboard**

- `frontend/src/features/dashboard/components/DashboardKPICard.tsx`
  - Implementado usando classes `.kpi-card` do design system
  - Indicador de tendencia com seta unicode e percentual

- `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx`
  - Implementado com Recharts `PieChart` + `Cell` + `Legend` + `Tooltip`
  - Cores mapeadas por status: HEALTHY verde, HEAT_STRESS amarelo, ALERT vermelho, CALVING azul

- `frontend/src/features/dashboard/components/CowsPerFarmChart.tsx`
  - Implementado com Recharts `BarChart`
  - `CartesianGrid` com `var(--border)`, barras com radius 4px

- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx`
  - Implementado com Recharts `LineChart`

- `frontend/src/features/dashboard/pages/DashboardPage.tsx`
  - Substituido mock data por hooks reais (`useDashboardOverview`, `useCowsPerStatus`, `useCowsPerFarm`)
  - Loading state com `<LoadingSpinner />`
  - Adicionados KPIs: `totalActiveCollars` e `unreadNotifications`
  - Removido `DashboardOverviewChart` (LineChart com dados categoricos nao faz sentido sem endpoint de serie temporal)
  - Mapeamento explicito dos campos do backend (`status/count` → `label/value`, `name/cowCount` → `label/value`)

**Frontend — Cows**

- `frontend/src/features/cows/components/SensorChart.tsx`
  - Interface corrigida: `{ timestamp, value }` → `{ date, average }`
  - `date` ja vem formatado como `"dd/MM"` do backend — usado diretamente no eixo X sem `new Date()`
  - Calculos de min/avg/max corrigidos de `p.value` para `p.average`

- `frontend/src/features/cows/pages/CowDetailPage.tsx`
  - Removidas 2 queries desnecessarias (`farmsService.get` e `collarsService.get`)
  - `farm` e `collar` agora extraidos de `cow.farm` e `cow.collar` (ja vem aninhados na API)
  - `cow.dateOfBirth` → `cow.birthDate`
  - `collar.identifier` → `collar.name`

**Frontend — Collars**

- `frontend/src/features/collars/components/CollarCard.tsx`
  - `collar.identifier` → `collar.name`
  - Removidos campos `batteryPercentage` e `lastSync` (nao existem no banco/API)
  - Exibe vaca vinculada via `collar.cow.tag`

- `frontend/src/features/collars/pages/CollarDetailPage.tsx`
  - Removida query de lista de vacas para encontrar a vaca vinculada
  - `linkedCow = collar?.cow` (ja vem aninhado)
  - `collar.identifier` → `collar.name` (titulo e AppBar)
  - Removidos blocos de bateria e ultima sincronizacao
  - Adicionado campo "Cadastrado em" com `collar.createdAt`

**Frontend — Farms**

- `frontend/src/features/farms/pages/FarmDetailPage.tsx`
  - Removido filtro client-side `c.farmId === id` (campo nao existe mais; API ja filtra por `farmId`)

**Frontend — Access**

- `frontend/src/features/access/pages/RolesPage.tsx`
  - `role._count.permissions` → `role.permissions?.length ?? 0`

**Frontend — Hooks**

- `frontend/src/hooks/useNotifications.ts`
  - `useMarkNotificationAsRead`: convertido de objeto fake `{ mutate }` para `useMutation` real com `invalidateQueries(["notifications"])`
  - `useMarkAllAsRead`: idem — marcar como lida agora atualiza o cache automaticamente sem reload

**Frontend — Tipos**

- `frontend/src/types/cows.ts`
  - `id: string` → `id: number`
  - `dateOfBirth: string` → `birthDate?: string`
  - `farmId: string` → `farm: { id: number; name: string; city?; state? }`
  - `collarId?: string` → `collar?: { id: number; name: string; status; dataFrequency? }`
  - `avatar?: string` → `photos?: string[]`
  - `HeartRateDailyPoint/TemperatureDailyPoint { timestamp, value }` → `SensorDailyPoint { date, average }` (aliases mantidos para retrocompatibilidade)
  - `CreateCowInput.farmId/collarId`: `string` → `number`

- `frontend/src/types/collars.ts`
  - `id: string` → `id: number`
  - `identifier: string` → `name: string`
  - Removidos `batteryPercentage: number` e `lastSync: string`
  - `cowId?: string` → `cow?: { id, tag, name, breed?, status, farm? }`
  - `CreateCollarInput.identifier` → `name`

### Exclusoes

- Nenhum arquivo removido.

### Bugs corrigidos

- **Dados em tempo real chegavam no banco mas nao apareciam nas telas**
  - Causa: tipos TypeScript divergentes do contrato real da API (`timestamp/value` vs `date/average`, `identifier` vs `name`, `farmId` vs `farm`, etc.)
  - Solucao: todos os tipos alinhados com o shape real dos endpoints (documentado em `docs/frontendDev_JCFS/FRONTEND_INTEGRATION.md`)

- **Marcar notificacao como lida nao atualizava a UI**
  - Causa: `useMarkNotificationAsRead` retornava objeto fake sem integrar com React Query
  - Solucao: convertido para `useMutation` com `invalidateQueries`

- **CollarDetailPage buscava todas as vacas para encontrar a vinculada**
  - Causa: filtro client-side `cows.find(c => c.collarId === id)` usando campo inexistente
  - Solucao: `collar.cow` ja vem aninhado no endpoint `GET /collars/:id`

- **CowDetailPage fazia 2 requests extras desnecessarios**
  - Causa: queries separadas para `farmsService.get(cow.farmId)` e `collarsService.get(cow.collarId)`
  - Solucao: `cow.farm` e `cow.collar` ja vem no objeto retornado por `GET /cows/:id`

### Build Status

✅ **837 modules** | ✅ **284ms** | ✅ **Zero TypeScript errors**

```
dist/assets/index-CrAumhe4.css   36.87 kB │ gzip:  7.70 kB
dist/assets/index-B9GOnZVC.js   853.29 kB │ gzip: 251.91 kB
```

### Checklist de verificacao (conforme FRONTEND_INTEGRATION.md §7)

- [ ] `/home` — cards de status mostram contagens reais (nao 0)
- [ ] `/cows` — lista com 160 vacas aparece (BR-0001 a BR-0160)
- [ ] `/cows/:id` — detalhe mostra fazenda e colar sem erro de runtime
- [ ] `/cows/:id` — graficos de frequencia cardiaca e temperatura mostram dados dos ultimos 7 dias
- [ ] `/collars` — lista com 160 colares aparece
- [ ] `/collars/:id` — detalhe sem erro (sem identifier, sem batteryPercentage)
- [ ] `/dashboard` — KPIs com numeros reais, graficos de status e fazendas renderizados
- [ ] `/notifications` — marcar como lida atualiza badge sem recarregar pagina
- [ ] `/register` — fluxo de registro funcional (endpoint backend ativo)


## 2026-05-15 - Implementação Completa do App Autenticado (JCFS - Fases 1-4)

Escopo: Implementação de todas as páginas autenticadas, layout do app, 5 features e design system CSS.

### Novos Arquivos e Pastas

**Styles:**
- `frontend/src/styles/app.css` — 600+ linhas de componentes CSS (AppShell, Sidebar, BottomNav, AppBar, Forms, Modals, Tables, etc.)

**Components:**
- `frontend/src/components/layout/AppShell.tsx` — Grid layout (sidebar desktop, bottom-nav mobile)
- `frontend/src/components/layout/Sidebar.tsx` — Navegação lateral com badge de notificações
- `frontend/src/components/layout/BottomNav.tsx` — Tab bar mobile
- `frontend/src/components/layout/AppBar.tsx` — Header por página com back button
- `frontend/src/components/common/StatusBadge.tsx` — Badges semânticos
- `frontend/src/components/common/LoadingSpinner.tsx` — Spinner animado
- `frontend/src/components/common/EmptyState.tsx` — Estado vazio
- `frontend/src/components/common/ErrorState.tsx` — Estado de erro
- `frontend/src/components/common/ConfirmDialog.tsx` — Modal de confirmação
- `frontend/src/components/common/FormModal.tsx` — Wrapper modal para formulários

**Types:**
- `frontend/src/types/farms.ts` — Farm, FarmListItem, CreateFarmInput, UpdateFarmInput
- `frontend/src/types/cows.ts` — CowStatus (const), Cow, HeartRateDailyPoint, TemperatureDailyPoint, SensorPage<T>
- `frontend/src/types/collars.ts` — CollarStatus, DataFrequency, Collar, CreateCollarInput, UpdateCollarInput
- `frontend/src/types/access.ts` — UserProfile (const), User, Role, Permission, PermissionGroup

**Services:**
- `frontend/src/services/farmsService.ts` — CRUD farms
- `frontend/src/services/cowsService.ts` — CRUD cows + sensores (heart-rate, temperature daily/paginado)
- `frontend/src/services/collarsService.ts` — CRUD collars
- `frontend/src/services/usersService.ts` — CRUD users + toggle-active + role management
- `frontend/src/services/rolesService.ts` — CRUD roles + permission grant/revoke
- `frontend/src/services/permissionsService.ts` — CRUD permissions + groups
- `frontend/src/services/notificationsService.ts` — List, mark-as-read, mark-all-as-read

**Hooks:**
- `frontend/src/hooks/usePermission.ts` — useHasPermission(name: string)
- `frontend/src/hooks/useNotifications.ts` — useNotifications, useUnreadNotifications, useMarkNotificationAsRead, useMarkAllAsRead

**Features:**
- `frontend/src/features/farms/` — FarmsPage, FarmDetailPage, FarmCard, FarmForm + useFarms hooks
- `frontend/src/features/collars/` — CollarsPage, CollarDetailPage, CollarCard + useCollars hooks
- `frontend/src/features/notifications/` — NotificationsPage, NotificationCard
- `frontend/src/features/cows/` — CowsPage, CowDetailPage, CowCard, CowStatusBadge, SensorChart + useCows hooks
- `frontend/src/features/access/` — AccessLayout, UsersPage, RolesPage, PermissionsPage (admin-only)

**Pages:**
- `frontend/src/pages/home/HomePage.tsx` — Greeting + herd status (4 KPIs) + cows in attention + quick access grid

### Arquivos Modificados

- `frontend/tsconfig.app.json`
  - Adicionado alias: `@lib/*` → `src/lib/*`

- `frontend/src/styles/index.css`
  - Importado `./app.css` (após landing.css)

- `frontend/src/routes/AppRoutes.tsx`
  - Substituídos placeholders por componentes reais
  - Adicionadas rotas protegidas: `/farms`, `/farms/:id`, `/collars`, `/collars/:id`, `/cows`, `/cows/:id`, `/notifications`, `/access/*`
  - Adicionadas sub-rotas: `/access/users`, `/access/roles`, `/access/permissions`
  - Total: 11 rotas protegidas + 2 públicas (landing, login)

- `frontend/src/components/ProtectedRoute/index.tsx`
  - Alterado para renderizar `<AppShell>` com `<Outlet />` (antes renderizava só `<Outlet />`)
  - Adicionado `<LoadingSpinner>` durante carregamento do user

- `frontend/src/pages/auth/LoginPage.tsx`
  - Convertida de Tailwind bruto para CSS design system
  - Usa `.form-field`, `.form-field__input`, `.btn`, `.btn-primary`
  - Usa CSS custom properties (var(--bg-app), var(--text-primary), etc.)

### Design System CSS (app.css)

**Componentes Implementados:**
- `.app-shell` — Grid 1/1 (mobile), grid 240px/1fr (desktop)
- `.sidebar` — Navegação lateral com nav-items e footer (avatar + logout)
- `.bottom-nav` — Tab bar mobile com badges
- `.app-bar` — Header com back button, título, ações
- `.app-page` — Container principal da página
- `.form-field`, `.form-field__input`, `.form-field__label`, `.form-field__textarea` — Formulários
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg` — Botões
- `.status-badge`, `.status-badge--success/warning/danger/muted/info` — Badges semânticos
- `.kpi-card` — Card com label/value/unit/change
- `.empty-state` — Estado vazio com ícone/título/descrição
- `.error-state` — Estado de erro com ícone/título
- `.modal-overlay`, `.modal-card`, `.modal-card__header`, `.modal-card__body`, `.modal-card__footer` — Modais
- `.data-table` — Tabelas com thead/tbody
- `.card`, `.card--clickable` — Cards reutilizáveis
- `.tabs`, `.tabs__tab`, `.tabs__tab.is-active` — Abas
- `.grid`, `.grid--2`, `.grid--3`, `.grid--4` — Grids responsivos
- Utilities: `.flex`, `.gap-*`, `.p-*`, `.mt-*`, `.mb-*`, `.text-center`, `.text-muted`, `.opacity-*`

**Responsividade:**
- Mobile-first (100% width)
- Breakpoint 768px: Sidebar visível, bottom-nav oculta
- <768px: Bottom-nav visível, sidebar oculta
- Safe area insets para notches/home indicator (mantido de landing.css)

### Features Implementadas

**1. Farms (CRUD Completo)**
- Lista com busca local
- Modal de criação
- Detail page com info + vacas vinculadas
- Cards com CNPJ/cidade

**2. Collars (com Status Filtering)**
- Filtro por status: ACTIVE (✓ green), MAINTENANCE (⚠ yellow), BATTERY (🔴 red), INACTIVE (muted)
- Detail page com vaca vinculada
- Frequency display: HIGHER=2min, DEFAULT=10min, LOWER=60min

**3. Notifications**
- Tabs: Todos | Não Lidos
- Card com ícone/tipo, tempo relativo, link para vaca
- Mark as read + Mark all as read
- Unread count badge no Sidebar

**4. Cows (Feature Mais Complexa)**
- Lista com multi-filtro: status, farm, search
- Detail page com:
  - Hero: tag, nome, status badge
  - KPI Grid: farm, collar, breed, weight, DOB
  - Sensor Tabs: Heart Rate | Temperature (7 dias)
  - SensorChart: Min/Avg/Max com thresholds visuais
  - Recent notifications: últimas 5 notificações
- Cow status badges: HEALTHY (green), CALVING (blue), HEAT_STRESS (yellow), ALERT (red)
- Hooks com refetchInterval: 30000 (simula live)

**5. Access (Admin Only)**
- AccessLayout com tabs: Usuários | Papéis | Permissões
- UsersPage: Tabela com nome/email/perfil/status
- RolesPage: Grid com cards de papéis
- PermissionsPage: Tabela com permissões
- Guard: Renderiza EmptyState se user não for ADMIN

### Configurações

**tsconfig.app.json:**
- Adicionado `@lib/*` → `src/lib/*`

**Imports corrigidos:**
- Services usam `import api from "../lib/api"`
- Types usam `import type { ... } from "../types/*.ts"`
- Removidas variaveis não utilizadas

### Build Status

✅ **188 modules** | ✅ **664ms** | ✅ **Zero TypeScript errors**

```
dist/assets/index-iiprU0j5.css   36.88 kB │ gzip:   7.69 kB
dist/assets/index-CoG3v4Bx.js   370.10 kB │ gzip: 111.84 kB
```

### Testes

- Build TypeScript: ✅ OK
- Build Vite: ✅ OK (sem erros, 188 modules)
- Routes: ✅ 13 rotas configuradas (11 protegidas)
- Components: ✅ 20+ componentes criados
- Services: ✅ 7 domínios com padrão consistente
- Types: ✅ Type-safe com `import type`
- Responsiveness: ✅ Mobile (BottomNav) + Desktop (Sidebar)

### Próximas Etapas (Opcional)

1. Instalar Recharts: `npm install recharts` — Substituir SensorChart placeholder por gráficos reais
2. Implementar CowPhotoGallery: Upload de fotos + delete
3. Edit Pages: Formulários para atualizar Farms, Cows, Collars
4. Real-time: WebSocket para sensores (atualmente 30s refetch)
5. Backend confirmation: Validar endpoints com API

### Conformidade

- ✅ Roteamento centralizado (AppRoutes.tsx)
- ✅ Layout responsivo (AppShell com Sidebar/BottomNav)
- ✅ Design system CSS (sem Tailwind no app autenticado)
- ✅ Type-safe types e services
- ✅ Error boundaries e empty states
- ✅ Permission checks (useHasPermission)
- ✅ Loading states e skeletons
- ✅ Mobile-first responsiveness


# Alterações e Progresso de Angelo

...


# Alterações e Progresso de Ian


...


# Alterações e Progresso de Renato


...
