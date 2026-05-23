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

### Sessao tarde — IoT + MQTT + Gestao de Acesso

- `[DOC]` Comparacao arquitetural: cow-health-web (Laravel/Filament) vs cowhealth-ai-monorepo (Node/React)
- `[DOC]` Criar `docs/iot-simulator-plan.md` com plano completo do simulador IoT para 160 vacas
- `[DOC]` Criar `CLAUDE.md` em `/Users/jafte/PyCharmProject/cowhealth-iot-simulator` para sessao AI do repositorio IoT
- `[DOC]` Definir sensores: MAX30102 (BPM), MLX90614 (temp infravermelha), MPU-6050 (acelerometro/giroscopio)
- `[DOC]` Definir formato de payload MQTT e topico `cowhealth/sensors/{device_id}`
- `[DOC]` Selecionar broker MQTT gratuito: broker.emqx.io:1883 (sem autenticacao)
- `[BE]` Implementar middleware `requireApiKey` (`Authorization: Bearer {MQTT_WORKER_API_KEY}`)
- `[BE]` Implementar `mqttIngestService` com pipeline: validar payload → buscar colar → persistir sensores → analisar saude → notificar usuarios
- `[BE]` Implementar deteccao heuristica de CALVING (mudanca postural + BPM + queda de temp) no ingest
- `[BE]` Implementar deteccao heuristica de HEAT_STRESS (agitacao + temp > 39C + BPM > 100) no ingest
- `[BE]` Implementar `POST /mqtt/ingest` protegido por API Key
- `[BE]` Adicionar `MQTT_WORKER_API_KEY` em `.env` e `.env.example`
- `[BE]` Registrar rota `/mqtt` em `server.ts`
- `[FE]` Criar tipos `RoleListItem` e `RoleDetail` em `types/access.ts` para separar lista vs detalhe
- `[FE]` Criar hooks de acesso: `useRoles`, `useRole`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`, `useGrantPermission`, `useRevokePermission`
- `[FE]` Criar hooks de usuarios: `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useToggleActive`, `useAssignRole`, `useRemoveRole`
- `[FE]` Criar hooks de permissoes: `usePermissions`, `useCreatePermission`, `useUpdatePermission`, `useDeletePermission`
- `[FE]` Reescrever `UsersPage` com CRUD completo: tabela com avatar, badge de perfil, status badge com dot, modais criar/editar/papeis, confirm dialogs para ativar/desativar e excluir
- `[FE]` Reescrever `RolesPage` com CRUD completo: grid de cards com contadores, modal de permissoes com checkboxes em tempo real (grant/revoke)
- `[FE]` Reescrever `PermissionsPage` com CRUD completo: tabela com nome em mono/accent, modais criar/editar
- `[FE]` Bugfix: `grantPermission` enviava `permissionId` na URL em vez do body — corrigido para `POST /roles/:id/permissions` com body `{ permissionId }`
- `[FE]` Atualizar `rolesService.ts` com tipagens corretas (`RoleListItem[]` para lista, `RoleDetail` para detalhe)

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
- `[QA]` Verificar `/access/users` — CRUD completo funcional (criar, editar, ativar/desativar, excluir, atribuir papeis)
- `[QA]` Verificar `/access/roles` — CRUD completo + gerenciamento de permissoes por papel
- `[QA]` Verificar `/access/permissions` — CRUD completo
- `[QA]` Testar `POST /mqtt/ingest` com payload simulado e API Key valida
- `[QA]` Verificar criacao de alerta de saude (HealthAlert) ao ingerir dados criticos

---

## BACKLOG (Proximas entregas sugeridas)

- `[BE]` Criar endpoint de time-series para o `DashboardOverviewChart` (dados por dia/semana)
- `[FE]` Implementar `DashboardOverviewChart` (LineChart) quando endpoint existir
- `[FE]` Adicionar paginacao na lista de vacas (`/cows`)
- `[FE]` Adicionar paginacao na lista de colares (`/collars`)
- `[FE]` Tela de perfil do usuario logado (`/profile`)
- `[FE]` Protecao de rotas por permissao (ex: so ADMIN ve `/access`)
- `[BE]` Middleware de autorizacao granular por permissao de papel
- `[IOT]` Implementar simulador Python: `cow_registry.py`, `sensor_simulator.py`, `mqtt_publisher.py`
- `[IOT]` Implementar `health_worker.py` consumidor MQTT → POST /mqtt/ingest
- `[IOT]` Testar pipeline completo: simulador → MQTT → backend → banco → alerta
