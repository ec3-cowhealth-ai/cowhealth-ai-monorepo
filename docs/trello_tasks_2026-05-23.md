# Tarefas Trello — 2026-05-23

---

## DONE (Concluido)

- `[BE]` Criar endpoint `POST /auth/register`
- `[FE]` Criar `RegisterForm` com validacao zod + react-hook-form
- `[FE]` Criar `RegisterPage` e rota `/register`
- `[FE]` Criar hook `useRegister` com redirect para `/login`
- `[FE]` Criar `dashboardService` tipado (overview, cowsPerStatus, cowsPerFarm)
- `[FE]` Criar hooks `useDashboardOverview`, `useCowsPerStatus`, `useCowsPerFarm`
- `[FE]` Implementar `DashboardKPICard` com trend (up/down/neutral)
- `[FE]` Implementar `CowsPerStatusChart` com Recharts PieChart
- `[FE]` Implementar `CowsPerFarmChart` com Recharts BarChart
- `[FE]` Corrigir tipos `Cow` e `CowListItem` para bater com contrato real da API
- `[FE]` Corrigir tipos `Collar` — remover `identifier`, `batteryPercentage`, `lastSync`; adicionar `name`
- `[FE]` Corrigir `SensorChart` — usar `{ date, average }` em vez de `{ timestamp, value }`
- `[FE]` Corrigir `CowDetailPage` — usar `cow.farm` e `cow.collar` aninhados (remover queries extras)
- `[FE]` Corrigir `CollarDetailPage` — usar `collar.cow` aninhado, remover campos inexistentes
- `[FE]` Corrigir `CollarCard` — renomear `identifier` para `name`
- `[FE]` Corrigir `FarmDetailPage` — remover filtro client-side `c.farmId === id`
- `[FE]` Corrigir `useNotifications` — converter para `useMutation` real com cache invalidation

---

## TODO (Pendente de verificacao manual)

- `[QA]` Verificar `/home` — cards mostram contagens reais
- `[QA]` Verificar `/cows` — lista exibe as 160 vacas
- `[QA]` Verificar `/cows/:id` — detalhe mostra fazenda e colar sem erro de runtime
- `[QA]` Verificar `/cows/:id` — graficos de sensor mostram dados dos ultimos 7 dias
- `[QA]` Verificar `/collars` — lista exibe os 160 colares
- `[QA]` Verificar `/collars/:id` — detalhe sem erros de `identifier`/`batteryPercentage`
- `[QA]` Verificar `/dashboard` — KPIs e graficos com dados reais
- `[QA]` Verificar `/notifications` — marcar como lida atualiza badge sem reload
- `[QA]` Verificar fluxo `/register` -> `/login` -> app

---

## BACKLOG (Proximas entregas sugeridas)

- `[BE]` Criar endpoint de time-series para o `DashboardOverviewChart` (dados por dia/semana)
- `[FE]` Implementar `DashboardOverviewChart` (LineChart) quando endpoint existir
- `[FE]` Adicionar paginacao na lista de vacas (`/cows`)
- `[FE]` Adicionar paginacao na lista de colares (`/collars`)
- `[FE]` Tela de perfil do usuario logado (`/profile`)
- `[FE]` Protecao de rotas por permissao (ex: so ADMIN ve `/access`)
- `[BE]` Middleware de autorizacao granular por permissao de papel
