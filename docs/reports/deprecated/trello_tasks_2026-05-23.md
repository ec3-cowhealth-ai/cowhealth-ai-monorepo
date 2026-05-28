# Trello Tasks — 2026-05-23

---

## DONE (Completed)

- `[BE]` Create `POST /auth/register` endpoint
- `[FE]` Create `RegisterForm` with zod + react-hook-form validation
- `[FE]` Create `RegisterPage` and `/register` route
- `[FE]` Create `useRegister` hook with redirect to `/login`
- `[FE]` Create typed `dashboardService` (overview, cowsPerStatus, cowsPerFarm)
- `[FE]` Create `useDashboardOverview`, `useCowsPerStatus`, `useCowsPerFarm` hooks
- `[FE]` Implement `DashboardKPICard` with trend (up/down/neutral)
- `[FE]` Implement `CowsPerStatusChart` with Recharts PieChart
- `[FE]` Implement `CowsPerFarmChart` with Recharts BarChart
- `[FE]` Correct `Cow` and `CowListItem` types to match actual API contract
- `[FE]` Correct `Collar` types — remove `identifier`, `batteryPercentage`, `lastSync`; add `name`
- `[FE]` Correct `SensorChart` — use `{ date, average }` instead of `{ timestamp, value }`
- `[FE]` Correct `CowDetailPage` — use nested `cow.farm` and `cow.collar` (remove extra queries)
- `[FE]` Correct `CollarDetailPage` — use nested `collar.cow`, remove non-existent fields
- `[FE]` Correct `CollarCard` — rename `identifier` to `name`
- `[FE]` Correct `FarmDetailPage` — remove client-side filter `c.farmId === id`
- `[FE]` Correct `useNotifications` — convert to real `useMutation` with cache invalidation

### Afternoon session — IoT + MQTT + Access Management

- `[DOC]` Architectural comparison: cow-health-web (Laravel/Filament) vs cowhealth-ai-monorepo (Node/React)
- `[DOC]` Create `docs/iot-simulator-plan.md` with complete IoT simulator plan for 160 cows
- `[DOC]` Create `CLAUDE.md` in `/Users/jafte/PyCharmProject/cowhealth-iot-simulator` for the IoT repository AI session
- `[DOC]` Define sensors: MAX30102 (BPM), MLX90614 (infrared temp), MPU-6050 (accelerometer/gyroscope)
- `[DOC]` Define MQTT payload format and `cowhealth/sensors/{device_id}` topic
- `[DOC]` Select free MQTT broker: broker.emqx.io:1883 (no authentication)
- `[BE]` Implement `requireApiKey` middleware (`Authorization: Bearer {MQTT_WORKER_API_KEY}`)
- `[BE]` Implement `mqttIngestService` with pipeline: validate payload → find collar → persist sensors → analyze health → notify users
- `[BE]` Implement heuristic CALVING detection (postural change + BPM + temp drop) in ingest
- `[BE]` Implement heuristic HEAT_STRESS detection (agitation + temp > 39C + BPM > 100) in ingest
- `[BE]` Implement `POST /mqtt/ingest` protected by API Key
- `[BE]` Add `MQTT_WORKER_API_KEY` to `.env` and `.env.example`
- `[BE]` Register `/mqtt` route in `server.ts`
- `[FE]` Create `RoleListItem` and `RoleDetail` types in `types/access.ts` to separate list vs detail
- `[FE]` Create access hooks: `useRoles`, `useRole`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`, `useGrantPermission`, `useRevokePermission`
- `[FE]` Create user hooks: `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useToggleActive`, `useAssignRole`, `useRemoveRole`
- `[FE]` Create permission hooks: `usePermissions`, `useCreatePermission`, `useUpdatePermission`, `useDeletePermission`
- `[FE]` Rewrite `UsersPage` with full CRUD: table with avatar, profile badge, status badge with dot, create/edit/roles modals, confirm dialogs for activate/deactivate and delete
- `[FE]` Rewrite `RolesPage` with full CRUD: card grid with counters, permission modal with real-time checkboxes (grant/revoke)
- `[FE]` Rewrite `PermissionsPage` with full CRUD: table with mono/accent name, create/edit modals
- `[FE]` Bugfix: `grantPermission` sent `permissionId` in URL instead of body — fixed to `POST /roles/:id/permissions` with `{ permissionId }` body
- `[FE]` Update `rolesService.ts` with correct typings (`RoleListItem[]` for list, `RoleDetail` for detail)

---

## TODO (Pending manual verification)

- `[QA]` Verify `/home` — cards show real counts
- `[QA]` Verify `/cows` — list displays the 160 cows
- `[QA]` Verify `/cows/:id` — detail shows farm and collar without runtime error
- `[QA]` Verify `/cows/:id` — sensor charts show data from the last 7 days
- `[QA]` Verify `/collars` — list displays the 160 collars
- `[QA]` Verify `/collars/:id` — detail without `identifier`/`batteryPercentage` errors
- `[QA]` Verify `/dashboard` — KPIs and charts with real data
- `[QA]` Verify `/notifications` — marking as read updates badge without reload
- `[QA]` Verify flow `/register` -> `/login` -> app
- `[QA]` Verify `/access/users` — full functional CRUD (create, edit, activate/deactivate, delete, assign roles)
- `[QA]` Verify `/access/roles` — full CRUD + role-based permission management
- `[QA]` Verify `/access/permissions` — full CRUD
- `[QA]` Test `POST /mqtt/ingest` with simulated payload and valid API Key
- `[QA]` Verify creation of health alert (HealthAlert) when ingesting critical data

---

## BACKLOG (Suggested next deliveries)

- `[BE]` Create time-series endpoint for `DashboardOverviewChart` (daily/weekly data)
- `[FE]` Implement `DashboardOverviewChart` (LineChart) when endpoint exists
- `[FE]` Add pagination to cow list (`/cows`)
- `[FE]` Add pagination to collar list (`/collars`)
- `[FE]` Logged-in user profile screen (`/profile`)
- `[FE]` Route protection by permission (e.g., only ADMIN sees `/access`)
- `[BE]` Granular authorization middleware by role permission
- `[IOT]` Implement Python simulator: `cow_registry.py`, `sensor_simulator.py`, `mqtt_publisher.py`
- `[IOT]` Implement `health_worker.py` MQTT consumer → POST /mqtt/ingest
- `[IOT]` Test complete pipeline: simulator → MQTT → backend → database → alert
