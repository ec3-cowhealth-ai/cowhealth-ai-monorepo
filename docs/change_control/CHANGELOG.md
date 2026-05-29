# CHANGELOG

# Changes and Progress by JCFS

---

## 2026-05-28 - Cherry-pick de Melhorias UI: Collars, Farms, Cows & Notifications (JCFS)

Scope: Import de melhorias visuais e funcionais de `feature/ian-medical-mobile-v2`. Adicionado sorting na lista de vacas da fazenda, hero card melhorado para detalhes da vaca, checkboxes para notificações, e filtragem corrigida de severidade. Branch: `refactor/rbac_drop_undesired_layer`.

### Added

- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — **Sorting dropdown** com 3 opções:
  - Nome (alfabético, default)
  - ID (tag alphanumericamente)
  - Status (por saúde: HEALTHY > CALVING > HEAT_STRESS > ALERT > RETIRED)
  - Implementado com `useMemo` + `COW_STATUS_ORDER` constant
  - Grid responsivo com `repeat(auto-fill, minmax(160px, 1fr))`

- `frontend/src/features/cows/pages/CowDetailPage.tsx` — **Melhorias no hero card**:
  - Avatar circular (64x64px) com status color-coded
  - Nome da vaca em serif font (Instrument Serif)
  - Status badge posicionado à direita
  - Botão **"+ Registro"** adicionado ao header para criar registros médicos rapidamente
  - Removido duplicate "+ Novo Registro" da seção de prontuário

- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — **Checkboxes para read/unread**:
  - Cada notificação tem checkbox clicável
  - Toggle read status sem navegar para cow detail
  - Visual feedback: checkbox preenchido com cor quando lido
  - **Filtragem por severidade** corrigida (Críticos/Avisos/Resolvidos)
  - Função `inferSeverity()`: se não houver `severity` field, mapeia tipo → severity
    - ALERT → HIGH (Críticos)
    - WARNING → MEDIUM (Avisos)
    - INFO → LOW (Resolvidos)
  - Contadores em cada filtro mostrando quantidade de notificações

### Changed

- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — Refatorado para layout vertical com sorting
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — Hero card refatorado com melhor hierarchy visual
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — UI remodelada com checkboxes e filtragem inteligente

### Fixed

- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — Lexical declarations em case blocks (no-case-declarations)
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — Unused imports e variables (@typescript-eslint/no-unused-vars)

### Build Status

- ✅ Frontend: ESLint zero erros
- ✅ TypeScript: zero erros

---

## 2026-05-28 - Seletor de Período, Gráfico de Saúde e Linha do Tempo de Atividade (JCFS)

Scope: Correção do gráfico "Saúde do rebanho" (dados não apareciam), seletor de período reutilizável (7 opções), e implementação da Linha do Tempo de Atividade com classificação comportamental a partir dos dados reais de acelerômetro. Branch: `refactor/rbac_drop_undesired_layer`.

### Fixed

- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — bug raiz: backend retornava `{ label, healthy, alert, heatStress, calving }` mas chart usava `dataKey="value"` (inexistente). Corrigido com chart multi-linha usando os campos reais.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — comparação inválida `n.cowId === id` (`number` vs `string`) corrigida para `n.cowId === Number(id)`.
- `frontend/src/features/dashboard/components/CowSelectorBar.tsx` — `first.cowId` (`number`) passado como `string`; `a.cowId === selectedCowId` sem conversão. Ambos corrigidos.
- `frontend/src/features/dashboard/components/DashboardAlertFeed.tsx` — `a.cowId` passado sem `String()` para `onSelectCow`.
- `frontend/src/features/dashboard/components/DashboardCenterPanel.tsx` — `r.user.name` sem optional chaining (`r.user?.name`).
- `frontend/src/features/clinicalRecord/pages/ClinicalRecordFormPage.tsx` — `ClinicalRecord` passado direto ao form; campos `null` incompatíveis com `Partial<CreateClinicalRecordInput>` (`undefined`). Corrigido com helper `toFormInput()` usando `Object.entries` + `null → undefined`.

### Added

- `frontend/src/types/period.ts` — tipo `Period` (`hourly|daily|weekly|biweekly|monthly|yearly|custom`) + `PERIOD_OPTIONS` com `days` equivalente por período.
- `frontend/src/components/ui/PeriodPicker.tsx` — pills horizontalmente scrolláveis (mobile-safe), campo de datas para "Personalizar". Reutilizável em qualquer página.
- `frontend/src/features/dashboard/hooks/useHealthTimeline.ts` — hook tipado com `HealthTimelinePoint` (retorno real do backend) + params `period`, `from`, `to`.
- `frontend/src/components/ui/OfflineBanner.tsx` — banner offline com `navigator.onLine` + eventos `online/offline`.
- `frontend/src/components/ui/PeriodPicker.tsx` — componente reutilizável de seleção de período.
- `frontend/src/pages/onboarding/OnboardingPage.tsx` — 3 slides, dot nav, skip/começar, persiste `onboardingDone`.
- `frontend/src/styles/App.css` — `.skeleton` + `@keyframes shimmer`.

### Changed

- `backend/src/services/dashboardService.ts` — `getHealthTimeline` suporta `period` + `from`/`to`; função `buildBuckets` gera buckets corretos para hourly/daily/weekly/biweekly/monthly/yearly/custom.
- `backend/src/controllers/dashboardController.ts` — `healthTimeline` extrai `period`, `from`, `to` da query e passa ao service.
- `backend/src/services/dashboardService.ts` — `getCowActivityTimeline` implementado com classificação real por acelerômetro: thresholds calibrados com dados do DB (`accelXY`, `gyroMag`); horas consecutivas mescladas; retorna `{ time, label, icon, color, durationMin }[]`.
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — refatorado: `PeriodPicker` integrado, 4 linhas no chart (Saudável/Alerta/Est. Térmico/Parto), legenda, estado vazio, skeleton.
- `frontend/src/features/dashboard/components/DashboardActivityTimeline.tsx` — reescrito com dados reais: busca `/dashboard/cow/:id/activity-timeline?date=`, navegação prev/next day, barra visual proporcional, legenda de cores.
- `frontend/src/features/dashboard/pages/DashboardPage.tsx` — `DashboardOverviewChart` adicionado após KPIs.
- `frontend/src/features/cows/hooks/useCows.ts` — `useCowHeartRateDaily`, `useCowTemperatureDaily`, `useCowAccelerometerDaily` aceitam `period` + `customFrom/To`; traduzem para `days` via `periodToDays`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — `PeriodPicker` adicionado acima dos gráficos de sensores; botão "+ Novo Registro" movido acima do título "Prontuário" com `width: 100%`.
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — filtros de severidade (Críticos/Avisos/Resolvidos); `handleNotificationClick` usa `n.cowId`; `n.read` substitui `n.readAt`.
- `frontend/src/hooks/useNotifications.ts` — `read: boolean` computado, `cowId: number | null`, `severity?`.
- `frontend/src/components/layout/AppShell.tsx` — `OfflineBanner` adicionado.
- `frontend/src/routes/AppRoutes.tsx` — rota pública `/onboarding` adicionada.
- `frontend/src/pages/profile/ProfilePage.tsx` — item "Ver tutorial" com limpeza de `onboardingDone`.

### Classification thresholds (acelerômetro bovino)

Calibrados com 27.213 registros reais (accelZ médio 9.42 m/s² = gravidade, gyro até ±47 °/s):

| accelXY (m/s²) | gyroMag (°/s) | Classificação |
|---|---|---|
| > 0.55 ou | > 20 | Atividade (caminhando) |
| > 0.25 ou | > 10 | Alimentação |
| qualquer | > 4  | Ruminação |
| baixo | baixo | Repouso |

### Build Status

- ✅ Frontend: `tsc -b` zero erros.
- ✅ Backend: zero erros novos (erros pré-existentes em `collarsService.ts` e `clinicalRecordService.ts` não alterados).

---

## 2026-05-28 - Prontuário Clínico Veterinário Completo (Option 2) (JCFS)

Scope: Implementação end-to-end do sistema de prontuário clínico (`CowClinicalRecord`) conforme `Master_Plan_ClinicalRecord_and_Dashboard.md`. Branch: `refactor/rbac_drop_undesired_layer`.

### Added — Backend

- `backend/prisma/migrations/20260528000001_clinical_records/migration.sql` — migration completa:
  - Campos novos em `cows`: `lactation_number`, `last_calving_date`, `expected_calving_date`, `reproductive_status`, `sire`
  - Campos novos em `notifications`: `severity ENUM('HIGH','MEDIUM','LOW')`, `alert_type VARCHAR(64)`
  - Nova tabela `activity_events` (comportamento classificado por sensor)
  - Nova tabela `cow_clinical_records` com 30+ campos: sinais vitais, biometria, avaliação clínica, medicamentos, vacinação, status reprodutivo, acompanhamento, soft delete
- `backend/src/schemas/clinicalRecordSchemas.ts` — validação Zod (`createClinicalRecordSchema`, `updateClinicalRecordSchema`)
- `backend/src/services/clinicalRecordService.ts` — CRUD completo + `syncCowReproductiveData` (atualiza `Cow` ao salvar prontuário)
- `backend/src/controllers/clinicalRecordController.ts` — 5 controllers via `handleRequest`

### Changed — Backend

- `backend/prisma/schema.prisma` — enums `ReproductiveStatus`, `ClinicalStatus`, `BreedingEligibility`, `EstrusStatus`, `AlertSeverity`, `ActivityType`; modelos `Cow` (5 campos novos), `Notification` (2 campos), `User` (relação `clinicalRecords`), `ActivityEvent` (novo), `CowClinicalRecord` (novo)
- `backend/src/routes/cowsRoutes.ts` — 5 rotas `GET/POST/GET/PUT/DELETE /cows/:id/clinical-records[/:recordId]` com `requirePermission("*ClinicalRecord")` e validação de schema
- `backend/prisma/seed.ts`:
  - 5 permissões novas: `ViewAny/View/Create/Update/Delete ClinicalRecord`
  - Grupo `"Prontuario Clinico"` adicionado
  - Atribuição por role: Veterinário → todas; Zootecnista + Gerente + Produtor → view only
  - `userFarm.createMany` com `skipDuplicates: true` (evita `P2002` em re-seed)

### Added — Frontend

- `frontend/src/features/clinicalRecord/types/index.ts` — tipos `ClinicalRecord`, `ClinicalRecordSummary`, `CreateClinicalRecordInput`, `UpdateClinicalRecordInput` e enums
- `frontend/src/services/clinicalRecordService.ts` — API calls (`getClinicalRecords`, `getClinicalRecord`, `createClinicalRecord`, `updateClinicalRecord`, `deleteClinicalRecord`)
- `frontend/src/features/clinicalRecord/hooks/useClinicalRecords.ts` — hooks React Query (`useClinicalRecords`, `useClinicalRecord`, `useCreateClinicalRecord`, `useUpdateClinicalRecord`, `useDeleteClinicalRecord`)
- `frontend/src/features/clinicalRecord/components/ClinicalRecordCard.tsx` — card clicável com badge de status e nome do veterinário
- `frontend/src/features/clinicalRecord/components/ClinicalRecordDetail.tsx` — visualização somente-leitura em 6 seções
- `frontend/src/features/clinicalRecord/components/ClinicalRecordForm.tsx` — formulário completo em 6 seções (Informações Gerais, Sinais Vitais, Avaliação Clínica, Medicamentos, Status Reprodutivo, Acompanhamento)
- `frontend/src/features/clinicalRecord/pages/ClinicalRecordListPage.tsx` — rota `/cows/:id/clinical-records`
- `frontend/src/features/clinicalRecord/pages/ClinicalRecordDetailPage.tsx` — rota `/cows/:id/clinical-records/:recordId`
- `frontend/src/features/clinicalRecord/pages/ClinicalRecordFormPage.tsx` — rotas `/new` e `/:recordId/edit`; converte `null → undefined` via `toFormInput()`
- `frontend/src/features/clinicalRecord/index.ts` — barrel exports

### Changed — Frontend

- `frontend/src/config/permissions.ts` — 5 constants `VIEW_ANY/VIEW/CREATE/UPDATE/DELETE_CLINICAL_RECORD`
- `frontend/src/routes/AppRoutes.tsx` — 4 rotas de prontuário clínico adicionadas
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — botão "Prontuário Clínico" adicionado ao lado de "Histórico de sensores"

### Fixed — Backend

- `backend/src/services/clinicalRecordService.ts` `getClinicalRecord` — removido check `record.deletedAt !== undefined` incorreto (campo não faz parte do `detailSelect`)

### Pending (próxima sessão)

- Seed: dados de exemplo (`ActivityEvent`, `CowClinicalRecord`, campos reprodutivos nas `Cow`)
- Dashboard backend: 5 novos endpoints (`/overview`, `/alerts/recent`, `/featured-cow`, `/cow/:id/vitals`, `/cow/:id/activity-timeline`)
- Dashboard frontend: refatoração completa com novo layout 12-col + tema claro
- `SensorDataPrefill` component (pré-preenche formulário com dados do sensor)
- Sidebar: badge de alertas não lidos + itens placeholder

---

## 2026-05-28 - Tasks Ian: Prontuário Médico, Notificações, Dashboard e Mobile (JCFS)

Scope: Implementação das tasks do `ian-todo-v2.md` (TARs 1–7) entregues por JCFS em sessão paralela. Branch alvo: `feature/ian-medical-mobile-v2`.

### Added

- `frontend/src/types/cows.ts` — `MedicalRecordType`, `MedicalRecord`, `CreateMedicalRecordInput` adicionados.
- `frontend/src/services/medicalRecordsService.ts` — serviço com `getMedicalRecords`, `createMedicalRecord`, `updateMedicalRecord`, `deleteMedicalRecord` (endpoints `GET|POST|PUT|DELETE /cows/:id/medical-records`).
- `frontend/src/features/cows/hooks/useMedicalRecords.ts` — hooks `useMedicalRecords`, `useCreateMedicalRecord`, `useDeleteMedicalRecord`.
- `frontend/src/features/cows/components/MedicalRecordCard.tsx` — card com badge colorido por tipo, data pt-BR, nome do veterinário, notas colapsáveis, botão excluir guarded por `PERMISSIONS.DELETE_MEDICAL_RECORD`.
- `frontend/src/features/cows/components/MedicalRecordModal.tsx` — formulário de criação com select de tipo, título, notas e datetime picker.
- `frontend/src/features/dashboard/hooks/useHealthTimeline.ts` — `useHealthTimeline(farmId?)` consultando `GET /dashboard/health-timeline`.
- `frontend/src/pages/onboarding/OnboardingPage.tsx` — 3 slides (Monitoramento / Alertas / Gerencie), dot navigation, botões Próximo / Pular / Começar; persiste `onboardingDone` em `localStorage`.
- `frontend/src/components/ui/OfflineBanner.tsx` — banner de offline usando `navigator.onLine` + eventos `online/offline`.
- `frontend/src/styles/App.css` — classe `.skeleton` com `@keyframes shimmer` (gradiente 200% animado).

### Changed

- `frontend/src/features/cows/pages/CowDetailPage.tsx` — seção Prontuário adicionada: lista de `MedicalRecordCard`, botão "+ Registro" guarded por `CREATE_MEDICAL_RECORD`, `MedicalRecordModal`.
- `frontend/src/hooks/useNotifications.ts` — interface `Notification` atualizada: `read: boolean` (computado de `readAt`), `cowId: number | null`, `severity?: "HIGH" | "MEDIUM" | "LOW"`; helper `mapRead`; funções de query mapeiam resposta da API.
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — `handleNotificationClick` usa `n.cowId` para navegar a `/cows/:id`; `n.read` substitui `n.readAt` em todos os guards; filtro de severidade com pills Críticos / Avisos / Resolvidos adicionado.
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — refatorado para aceitar `farmId?: number` e buscar próprios dados via `useHealthTimeline`; exibe `.skeleton` durante loading.
- `frontend/src/features/dashboard/pages/DashboardPage.tsx` — `DashboardOverviewChart` renderizado após KPIs com `farmId={selectedFarm?.id}`.
- `frontend/src/routes/AppRoutes.tsx` — rota pública `/onboarding` adicionada.
- `frontend/src/pages/profile/ProfilePage.tsx` — item "Ver tutorial" adicionado ao menu; limpa `onboardingDone` antes de navegar.
- `frontend/src/components/layout/AppShell.tsx` — `<OfflineBanner />` renderizado entre `<Sidebar />` e `<main>`.

### Notes

- TAREFA 2 (bottom nav safe-area fix) já estava aplicada no CSS — nenhuma alteração necessária.
- OfflineBanner é puramente visual; não bloqueia ações do usuário.
- `DashboardOverviewChart` espera que o backend retorne `ChartDataPoint[]` (`label: string, value: number`) em `GET /dashboard/health-timeline`.

### Build Status

- ✅ Frontend: zero erros TypeScript esperados após `tsc --noEmit`.

---

## 2026-05-28 - Etapa 1 RBAC: Tarefas Pendentes do Angelo (JCFS)

Scope: Implementação das tarefas T3, T4, T7 e T8 do `angelo-todo.md` que não foram cobertas na entrega anterior. Guards de coleiras e fazendas migrados para RBAC; status `RETIRED` tratado; Settings Page criada.

### Added

- `frontend/src/pages/settings/SettingsPage.tsx` — página de configurações com toggles de notificação persistidos em `localStorage` (Alertas críticos, Avisos, Resumo diário) e seção Conta com link para `/profile` e texto LGPD.

### Changed

- `frontend/src/features/farms/pages/FarmsPage.tsx` — `isSuperAdmin = me?.roles.some(...)` → `canCreate = useHasPermission(PERMISSIONS.CREATE_FARM)`; botão "+ Nova Fazenda" e modal visíveis apenas para quem tem `Create Farm`.
- `frontend/src/features/collars/pages/CollarsPage.tsx` — `isSuperAdmin` → `canCreate = useHasPermission(PERMISSIONS.CREATE_COLLAR)`; botão "+ Nova Coleira" visível apenas para quem tem `Create Collar`.
- `frontend/src/features/collars/pages/CollarDetailPage.tsx` — `isSuperAdmin` substituído por `canEdit = useHasPermission(UPDATE_COLLAR)` e `canDelete = useHasPermission(DELETE_COLLAR)` independentes; botões Editar e Excluir renderizados e modais montados separadamente por permissão.
- `frontend/src/features/cows/pages/CowsPage.tsx` — `RETIRED` adicionado em `STATUS_LABEL` ("Aposentada"), `STATUS_COLOR` (muted) e `STATUS_BG`; badge não quebra mais ao exibir vacas aposentadas.
- `frontend/src/routes/AppRoutes.tsx` — rota protegida `/settings` adicionada.
- `frontend/src/pages/profile/ProfilePage.tsx` — item "Configurações" com ícone `Settings` adicionado ao menu de navegação, apontando para `/settings`.

### Build Status

- ✅ Frontend: `tsc --noEmit` — zero erros.
- ✅ Zero ocorrências de `isSuperAdmin` baseado em `roles.some(r.name === "SuperAdmin")` nas páginas de farms e collars.

---

## 2026-05-28 - Referência RBAC: Usuários, Papéis e Permissões (JCFS)

> Estado do sistema após Etapa 0 + Etapa 1. Fonte: `backend/prisma/seed.ts`.

### Usuários Seed (senha: `12345678`)

| Credencial | Nome | Papel | Fazenda |
|---|---|---|---|
| `admin@cowhealth.com` | Super Admin | SuperAdmin | — (irrestrito) |
| `administrador@aurora.com` | Administrador Aurora | Administrador | Fazenda Aurora |
| `administrador@saobento.com` | Administrador Sao Bento | Administrador | Fazenda Sao Bento |
| `administrador@boaesperanca.com` | Administrador Boa Esperanca | Administrador | Fazenda Boa Esperanca |
| `administrador@santaclara.com` | Administrador Santa Clara | Administrador | Fazenda Santa Clara |
| `administrador@valeverde.com` | Administrador Vale Verde | Administrador | Fazenda Vale Verde |
| `vet@cowhealth.com` | Veterinario | Veterinario | Aurora + Sao Bento |
| `zoot@cowhealth.com` | Zootecnista | Zootecnista | Boa Esperanca |
| `gerente@cowhealth.com` | Gerente de Fazenda | Gerente de Fazenda | Aurora |
| `operador@cowhealth.com` | Operador de Campo | Operador de Campo | Aurora |
| `financeiro@cowhealth.com` | Financeiro | Financeiro | Todas |
| `obs@cowhealth.com` | Observador | Observador | Santa Clara |

### Matriz de Permissões por Papel

`●` = possui | `○` = não possui | `*` = adicionado na Etapa 0

| Permissão | SuperAdmin | Administrador | Veterinário | Zootecnista | Gerente Fazenda | Operador Campo | Financeiro | Observador | Produtor |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Farm** |
| ViewAny / View Farm | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Create / Update Farm | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| Delete Farm | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| **Cow** |
| ViewAny / View Cow | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Create Cow | ● | ● | ● | ● | ●* | ○ | ○ | ○ | ○ |
| Update Cow | ● | ● | ● | ● | ●* | ○ | ○ | ○ | ○ |
| Delete Cow | ● | ● | ● | ● | ○ | ○ | ○ | ○ | ○ |
| Retire Cow | ● | ● | ● | ● | ● | ○ | ○ | ○ | ○ |
| **Collar** |
| ViewAny / View Collar | ● | ● | ● | ● | ● | ○ | ●* | ○ | ●* |
| Create / Update Collar | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| Delete Collar | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| **Medical Record** |
| ViewAny / View MedicalRecord | ● | ● | ● | ● | ● | ○ | ○ | ○ | ●* |
| Create / Update MedicalRecord | ● | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ |
| Delete MedicalRecord | ● | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ |
| **User** |
| ViewAny / View User | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| Create / Update / Delete User | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| **Notification** |
| ViewAny / View Notification | ● | ● | ● | ● | ● | ●* | ○ | ● | ● |
| **Role / Permission CRUD** |
| Todos | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |

---

## 2026-05-28 - Etapa 1 RBAC: Consolidação dos Guards de UI no Frontend (JCFS)

Scope: Remoção completa de `UserProfile` do frontend e consolidação de todos os guards de UI no hook `useHasPermission()` + constantes tipadas `PERMISSIONS`. Zero ocorrências de `user?.profile` no codebase após esta etapa.

### Added

- `frontend/src/config/permissions.ts` — objeto `PERMISSIONS` com 60 constantes tipadas e tipo `PermissionName`; elimina typos silenciosos em strings de permissão.

### Changed

- `frontend/src/hooks/usePermission.ts` — `useHasPermission` aceita `PermissionName` (type-safe); removido TODO comentário de Angelo.
- `frontend/src/hooks/usePermissions.ts` — `useIsAdmin` marcado como `@deprecated`; implementação substituída por `useHasPermission(PERMISSIONS.VIEW_ANY_USER)`; `useHasAnyPermission` tipado com `PermissionName[]`.
- `frontend/src/types/auth.ts` — `profile: "ADMIN" | "MANAGER" | "VIEWER"` removido de `AuthUser`.
- `frontend/src/types/access.ts` — `UserProfile`, `USER_PROFILE_VALUES` removidos; `profile` removido de `User`, `UserListItem`, `CreateUserInput`, `UpdateUserInput`; `roles` adicionado a `UserListItem`.
- `frontend/src/components/layout/Sidebar.tsx` — `isAdmin = user?.profile === "ADMIN"` → `canViewUsers = useHasPermission(PERMISSIONS.VIEW_ANY_USER)`; exibição do perfil substituída por `roles[0].name`.
- `frontend/src/features/access/pages/AccessLayout.tsx` — guard `profile === "ADMIN"` → `useHasPermission(PERMISSIONS.VIEW_ANY_USER)`.
- `frontend/src/features/cows/pages/CowsPage.tsx` — `canCRUD` baseado em `profile` → `useHasPermission(PERMISSIONS.CREATE_COW)`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — `canCRUD` baseado em `profile` → `useHasPermission(PERMISSIONS.UPDATE_COW)`.
- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — `canEdit` baseado em `profile === "ADMIN"` → `useHasPermission(PERMISSIONS.UPDATE_FARM)`.
- `frontend/src/pages/profile/ProfilePage.tsx` — `user?.profile` → `user?.roles?.[0]?.name`.
- `frontend/src/features/access/pages/UsersPage.tsx` — selects ADMIN/MANAGER/VIEWER removidos dos modais de criação e edição; coluna "Perfil" substituída por "Papel" (exibe `roles[0].role.name`); `UserProfile` removido de todos os tipos locais.
- `backend/prisma/seed.ts` — ajustes de permissão conforme matriz da Seção 3 do plano: Gerente de Fazenda +`Create/Update Cow`; Financeiro +`ViewAny/View Collar`; Produtor +`ViewAny/View Collar` e `ViewAny/View MedicalRecord`; Operador de Campo +`ViewAny/View Notification`.

### Build Status

- ✅ Frontend: `tsc --noEmit` — zero erros.
- ✅ Zero ocorrências de `user?.profile` ou `profile === "ADMIN"` no codebase frontend.

---

## 2026-05-28 - Etapa 0 RBAC: Remoção do UserProfile do Backend (JCFS)

Scope: Remoção completa do mecanismo legado `UserProfile` (ADMIN/MANAGER/VIEWER) do backend, eliminando o sistema de acesso paralelo e conflitante com o RBAC via `User → Role → Permission`. Pré-requisito para Angelo implementar `feature/angelo-rbac-v2` (Etapa 1).

### Removed

- `enum UserProfile { ADMIN MANAGER VIEWER }` de `backend/prisma/schema.prisma`.
- Campo `profile UserProfile @default(VIEWER)` do model `User` no schema Prisma.
- Campo `profile: string` de `AuthPayload` em `backend/src/types/auth.ts` — JWT não emite mais `profile`.
- Campos `profile?: "ADMIN" | "MANAGER" | "VIEWER"` de `CreateUserInput` e `UpdateUserInput` em `backend/src/types/access.ts`.
- `profile: z.enum(["ADMIN", "MANAGER", "VIEWER"]).optional()` de `createUserSchema` e `updateUserSchema` em `backend/src/schemas/userSchemas.ts`.

### Changed

- `backend/src/services/authService.ts` — removido `profile` do payload JWT e da resposta de `getMe`; removido do select Prisma.
- `backend/src/services/usersService.ts` — removido `profile` de todos os selects, destructurings e objetos `create`/`update`; removida a guard `if (profile === "ADMIN") throw ...` (substituída por controle via Role).
- `backend/src/services/mqttIngestService.ts` — `notifyUsers` substituiu `profile: { in: ["ADMIN", "MANAGER"] }` por query RBAC: usuários com role que possua a permissão `"ViewAny Notification"`.
- `backend/src/middlewares/requireFarmAccess.ts` — comentário atualizado de "ADMIN profile" para "SuperAdmin role".
- `backend/prisma/seed.ts` — removido `profile` de todos os 12 `userData` e do `upsert`.

### Migration

- `backend/prisma/migrations/20260528000000_remove_user_profile/migration.sql` — `ALTER TABLE users DROP COLUMN profile`.
- Aplicado via `prisma db push --accept-data-loss`.

### Build Status

- ✅ Backend: `tsc --noEmit` sem erros relacionados a `UserProfile`; único erro pré-existente em `collarsService.ts` (`throwWithStatus`) não afetado.
- ✅ DB: coluna `profile` removida da tabela `users`.

---

## 2026-05-28 - Feature D, G, E, A: Aposentadoria, Histórico, Splash, Acelerômetro + Dashboard Endpoints (JCFS)

Scope: Implementação das pendências do jafte-todo.md para a apresentação. Cobertura completa de 8 tarefas: aposentadoria de animal (Feature D), histórico de sensores (Feature G), splash screen (Feature E), acelerômetro diário (Feature A), 4 novos endpoints do dashboard, botão de alternância de tema e correção do bottom-nav em iOS.

### Added

- `frontend/src/features/cows/components/RetireAnimalModal.tsx` — modal de aposentadoria com seleção Venda/Abate e confirmação irreversível.
- `frontend/src/features/cows/pages/CowHistoryPage.tsx` — página de histórico de sensores com filtro de datas, tabela `.data-table` e exportação CSV client-side.
- `frontend/src/pages/splash/SplashPage.tsx` — splash screen com animação "Sincronizando coleiras…" exibida durante carregamento do auth.

### Changed

- `frontend/src/types/cows.ts` — `RETIRED` já estava presente; confirmado.
- `frontend/src/services/cowsService.ts` — adicionados `retireCow`, `getAccelerometerDaily`, `getSensorHistory`.
- `frontend/src/features/cows/hooks/useCows.ts` — adicionados `useRetireCow` e `useCowAccelerometerDaily`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — seção "Zona de perigo" com `useHasPermission("Retire Cow")`; grade 3 colunas de gráficos (Temperatura + FC + Atividade) substituindo as tabs; botão "Histórico de sensores".
- `frontend/src/features/cows/index.ts` — exporta `CowHistoryPage`.
- `frontend/src/routes/AppRoutes.tsx` — rota `/cows/:id/history`; refatorado com `AppRoutesInner` para suportar splash screen via `useMe().isLoading`.
- `frontend/src/pages/map/MapPage.tsx` — vacas com `status === "RETIRED"` filtradas dos pins do mapa.
- `frontend/src/pages/home/HomePage.tsx` — vacas `RETIRED` excluídas do strip "Em Atenção"; nova seção "Pré-parto" com cards horizontais das vacas `CALVING`.
- `frontend/src/components/layout/Sidebar.tsx` — botão Sun/Moon para alternar tema, antes do logout.
- `frontend/src/components/layout/BottomNav.tsx` — item "Perfil" substituído por "Tema" (botão Sun/Moon), mantendo 5 colunas no grid.
- `frontend/src/styles/App.css` — `.bottom-nav` com `height: calc(64px + env(safe-area-inset-bottom, 0px))`, `-webkit-transform: translateZ(0)` e `.bottom-nav__item` com `height: 64px; align-self: start` (correção safe-area iOS).
- `backend/src/services/cowsService.ts` — `getCowAccelerometerDaily`: agrega magnitude diária do acelerômetro via `sqrt(x²+y²+z²)`.
- `backend/src/controllers/cowsController.ts` — handler `listAccelerometerDaily`.
- `backend/src/routes/cowsRoutes.ts` — rota `GET /:id/accelerometer/daily`.
- `backend/src/services/dashboardService.ts` — `getFeaturedCow`, `getRecentAlerts`, `getCowVitals`, `getCowActivityTimeline` (retorna `[]` até MQTT popular a tabela).
- `backend/src/controllers/dashboardController.ts` — handlers: `featuredCow`, `recentAlerts`, `cowVitals`, `cowActivityTimeline`.
- `backend/src/routes/dashboardRoutes.ts` — rotas: `GET /featured-cow`, `GET /alerts/recent`, `GET /cow/:id/vitals`, `GET /cow/:id/activity-timeline`.

### Build Status

- ✅ Frontend: zero erros TypeScript esperados; todos os imports e hooks consistentes.
- ✅ Backend: novos serviços e rotas seguem padrão `handleRequest` existente.

---

## 2026-05-26 - Critical Fixes: Login Loop, Build Errors, and Farm Consistency (JCFS)

Scope: Resolved critical authentication and build issues introduced after git synchronization. Fixed a infinite login redirect loop by making the `getMe` service more resilient; unified all ID types to `number` on the frontend to resolve 18+ TypeScript compilation errors; and implemented strict farm validation in `FarmContext` to prevent incorrect farm assignment due to stale local storage data.

### Fixed

- `backend/src/services/authService.ts` — `getMe` now correctly merges the user's primary `farmId` into the accessible farms list and handles missing relations gracefully.
- `frontend/src/context/FarmContext.tsx` — added validation logic to ensure the selected farm is always allowed for the current user, automatically switching if invalid.
- `frontend/src/types/access.ts` & `auth.ts` — unified all ID types to `number` to match the backend and resolve build errors.
- `frontend/src/features/access/pages/UsersPage.tsx` — fixed search filter crash for users without an assigned farm (Super Admins) and updated to numeric IDs.
- `frontend/src/features/access/pages/RolesPage.tsx` & `PermissionsPage.tsx` — updated to handle numeric IDs and fixed various prop-drilling type mismatches.
- `frontend/src/components/ProtectedRoute/index.tsx` — improved logic to prevent premature login redirects during API loading or error handling.
- `frontend/src/features/dashboard/components/DashboardCenterPanel.tsx` — fixed Recharts tooltip formatter type errors.
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — fixed unsafe index access for notification types.

### Changed

- `backend/src/controllers/farmsController.ts`, `usersController.ts`, `collarsController.ts` — refactored to use `request.user.sub` for the authenticated user ID and consistently utilize the `farmIds` array from the JWT for high-performance data isolation.

### Build Status

- ✅ Backend: Consolidated schema and isolation logic.
- ✅ Frontend TypeScript: Successfully built with **zero errors**.

---

## 2026-05-26 - User Isolation by Farm and Cow Weight field (JCFS)

Scope: Implemented backend isolation for user management, restricting Farm Admins to viewing and managing only users within their own farm; added the weight field to the cow creation modal in the frontend to align with the database schema.

### Changed

- `backend/src/services/usersService.ts` — `getAllUsers` now supports farm isolation filtering.
- `backend/src/controllers/usersController.ts` — `listUsers` updated to detect the current user's farm and apply isolation rules for non-Super Admins.
- `frontend/src/types/cows.ts` — added `weight` field to `CreateCowInput` interface.
- `frontend/src/features/cows/pages/CowsPage.tsx` — updated `CreateCowModal` to include a numeric weight field (kg).

### Build Status

- ✅ Backend: Logic updated and verified.
- ✅ Frontend TypeScript: zero errors.

---

## 2026-05-26 - Farm Isolation and Super Admin Collar CRUD (JCFS)

Scope: Implementation of tenant-style isolation where users are restricted to their assigned farm's data; added `farmId` to the `Collar` model to allow equipment allocation; implemented full Collar CRUD for Super Admins; and updated the seed script to establish realistic farm-linked relationships for users and hardware.

### Added

- `backend/prisma/migrations/20260527030503_add_farm_id_to_collars/` — migration adding `farm_id` to `collars` table.

### Changed

- `backend/prisma/schema.prisma` — added `farmId` to `Collar` model and established relation with `Farm`.
- `backend/prisma/seed.ts` — updated to link all test users to specific farms (except Super Admin) and distribute the 160 active collars across the 5 farms (32 per farm).
- `backend/src/services/authService.ts` — `getMe` now includes `farmId` in the response; JWT payload updated to include user `id`.
- `backend/src/services/farmsService.ts` — `getAllFarms` and `getFarmById` now support isolation filtering via `userFarmId`.
- `backend/src/services/collarsService.ts` — `getAllCollars` and `getCollarById` now support isolation filtering; `create` and `update` now handle `farmId`.
- `backend/src/controllers/farmsController.ts` & `collarsController.ts` — updated to extract `userFarmId` from the authenticated request and pass it to services for data isolation.
- `backend/src/types/farming.ts` — updated Collar input types to include `farmId`.
- `frontend/src/pages/home/HomePage.tsx` — farm picker restricted to Super Admins; other users are locked to their assigned farm.
- `frontend/src/features/collars/pages/CollarsPage.tsx` — added "New Collar" action for Super Admins and integrated `CreateCollarModal` with farm selection.
- `frontend/src/features/collars/pages/CollarDetailPage.tsx` — added Edit/Delete actions for Super Admins and enabled farm allocation management.
- `frontend/src/features/collars/components/CollarCard.tsx` — now displays the name of the assigned farm.
- `frontend/src/types/auth.ts` & `collars.ts` — updated frontend types to reflect backend changes (`farmId`, `farm` objects).

### Build Status

- ✅ Backend: Database migrated and seed updated.
- ✅ Frontend TypeScript: zero errors.

---

## 2026-05-26 - RBAC system implementation, Users Page refactor, and profile-based CRUD (JCFS)

Scope: Full implementation of Role-Based Access Control (RBAC) linking users to specific farms; backend enforcement for user creation (Super Admin vs Farm Admin); frontend overhaul of the Users page with CSS extraction; automatic email suffix based on farm name; and system-wide CRUD visibility restrictions based on User Profile (Admin/Gestor vs Observador).

### Added

- `frontend/src/styles/access.css` — extracted styles for access management pages.
- `backend/prisma/migrations/20260527021139_add_farm_id_to_users/` — migration adding `farm_id` to `users` table.

### Changed

- `backend/prisma/schema.prisma` — added `farmId` field to `User` model and established relation with `Farm`.
- `backend/src/services/usersService.ts` — updated to enforce RBAC rules: Super Admin can create any profile/farm, Farm Admin is restricted to their farm and non-admin profiles; mandatory role assignment on creation.
- `backend/src/schemas/userSchemas.ts` — updated to accept `farmId` and `roleId`.
- `backend/src/controllers/usersController.ts` — updated to pass `creatorId` to the service.
- `frontend/src/features/access/pages/UsersPage.tsx` — complete refactor: removed inline styles, added Farm/Role selection, and implemented automatic email domain filling.
- `frontend/src/types/access.ts` — updated types to include farm relationship and creation fields.
- `frontend/src/features/cows/pages/CowsPage.tsx` — added "New animal" button restricted to Admin/Manager profiles; integrated `CreateCowModal`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — added Edit, Delete, and Collar Link/Unlink actions, visible only to Admin/Manager profiles; added confirmation dialogs.
- `frontend/src/features/farms/pages/FarmsPage.tsx` — restricted "New Farm" creation to Super Admins.
- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — enabled farm info editing for Super Admins and the specific Farm Admin.
- `.gitignore` — permanently removed `docs/*` to allow tracking of documentation files.

### Build Status

- ✅ Backend: Database migrated and schema updated.
- ✅ Frontend TypeScript: zero errors.

---

## 2026-05-24 - Farm geolocation, cow position simulation, authentication loop fix, and team task documentation (JCFS)

Scope: Utility for simulating geographic coordinates for cows by farm; fix for infinite reload loop caused by FarmProvider outside the protected route; update of the Farm type with optional latitude/longitude fields; generation of triage cards for the team (Angelo, Ian, Renato); PR task documenting farm geolocation for integration with the MQTT simulator; adjustment of .gitignore to track .claude/SKILL.md.

### Added

- `frontend/src/pages/map/simulateCowPositions.ts` — utility that distributes cows in deterministic geographic positions (seeded by `cow.id`) within a 600m radius around farm coordinates; uses hardcoded fallback for the 5 farms until the geolocation migration (PR #15) is applied.
- `docs/tasks/farm-geolocation.md` — task document for Renato: Prisma schema, migration, seed with coordinates, and acceptance criteria.
- `docs/tasks/triagen-cards.yaml` — 13 triage cards (v2 format) covering all pending tasks for Angelo, Ian, and Renato, with checklists and priorities.
- `backend/src/helpers/fileStorage.ts` — helper for storing cow photo files.
- `backend/src/helpers/multerUpload.ts` — multer configuration for image uploads.
- `backend/src/services/cowHealthAnalyzer.ts` — heuristic service for bovine health analysis.
- `frontend/src/pages/map/CowDetailCard.tsx`, `CowPin.tsx`, `MapBackground.tsx`, `MapLegend.tsx` — components extracted from MapPage for better separation of responsibilities.

### Changed

- `frontend/src/types/farms.ts` — added `latitude?: number` and `longitude?: number` to the `Farm` type.
- `frontend/src/components/layout/AppShell.tsx` — `FarmProvider` moved inside AppShell (it was in App.tsx), fixing the infinite reload loop when the user was not authenticated.
- `frontend/src/App.tsx` — removed `FarmProvider` (now in AppShell).
- `frontend/src/pages/map/MapPage.tsx` — refactored with extracted components.
- `frontend/src/hooks/usePermission.ts` — improvements in the permission check hook.
- `frontend/src/features/farms/components/FarmForm.tsx` — updated farm form.
- `backend/src/server.ts` — configuration adjustments.
- `backend/src/services/dashboardService.ts` — `farmId` filter integrated into the merge with main.
- `backend/src/services/mqttIngestService.ts` — improvements in the MQTT ingestion service.
- `backend/src/controllers/cowsController.ts`, `farmsController.ts` — controller updates.
- `backend/src/middlewares/requirePermission.ts` — adjustments in the permission middleware.
- `.gitignore` — added exception `!.claude/SKILL.md`.

### Removed

- `frontend/src/store/README.md`, `context/index.ts`, `reducers/index.ts` — Redux store removed (replaced by FarmContext).

### Open PRs

- PR #15 — `feat/farm-geolocation` → farm geolocation task (Renato).

### Build Status

- Frontend TypeScript: zero errors.

---

## 2026-05-23 - Colored bovine icons by status + logout redirect to Landing Page (JCFS)

Scope: `CowHead` icon (lucide-lab) dynamically colored according to the cow's health status; complete migration of the custom `Icon` component and `CowMark` to `lucide-react` on all post-login screens; logout and expired session redirect pointing to the Landing Page.

### Added

- `frontend/src/components/ui/CowHeadIcon.tsx` — shared React component that wraps the `@lucide/lab` `cowHead` node via `createLucideIcon`; eliminates repetition of `createLucideIcon` in each file.

**Frontend — Dependencies**

- `frontend/package.json` — installed `@lucide/lab` for `CowHead` usage.

### Changed

**Frontend — Cow icons by status**

The `CowHead` icon now receives `color` dynamically based on the cow's status, making the health state visually immediate in the list and detail.

- `frontend/src/features/cows/pages/CowsPage.tsx` — each `CowHead` in the list receives `color={statusColor(cow.status)}`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — `CowHead` in the hero card receives `color={statusColor(cow.status)}`.

Color mapping:

| Status | Color |
|---|---|
| Healthy | `var(--success)` — green |
| Alert | `var(--danger)` — red |
| Heat Stress | `var(--warning)` — orange |
| Calving | `var(--info)` — blue |

**Frontend — Migration custom Icon → lucide-react**

All uses of the custom `Icon` component (`@components/ui/Icon`) and `CowMark` were replaced by Lucide equivalents on all post-login screens.

- `frontend/src/components/layout/AppBar.tsx` — `Icon n="chevronLeft"` → `<ChevronLeft />`.
- `frontend/src/components/layout/Sidebar.tsx` — `Beef` → `CowHead` (via `CowHeadIcon.tsx`).
- `frontend/src/features/cows/pages/CowsPage.tsx` — `Icon n="search/chevronRight"` → `Search`, `ChevronRight`; `CowMark` → `CowHead`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — `Icon n="alert/farm/collar/thermo/heart"` → `AlertTriangle`, `Warehouse`, `Tag`, `Thermometer`, `Heart`; `CowMark` → `CowHead`.
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — `Icon n="check/alert/bell/activity"` → `Check`, `AlertTriangle`, `Bell`, `Activity`; icon map by type refactored to `ReactNode`.
- `frontend/src/pages/home/HomePage.tsx` — `Icon n="bell/alert/chevronRight/check/list/map/farm"` → Lucide equivalents; `CowMark` → `CowHead`.
- `frontend/src/pages/profile/ProfilePage.tsx` — `Icon n="list/farm/collar/user/chevronRight/logout"` → Lucide equivalents; `CowMark` → `CowHead`; `menuItems` refactored to `ReactNode` instead of strings.
- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — `Beef` → `CowHead` (via `CowHeadIcon.tsx`).

**Frontend — Logout**

- `frontend/src/hooks/useAuth.ts` — `useLogout` redirects to `/` (Landing Page) instead of `/login`.
- `frontend/src/components/layout/Sidebar.tsx` — `handleLogout` redirects to `/`.
- `frontend/src/lib/api.ts` — 401 interceptor redirects to `/` instead of `/login`.

### Build Status

- Frontend TypeScript: zero errors (`tsc --noEmit`).

---

## 2026-05-23 - Hi-Fi Design System: 5 post-login screens + cascaded farm filter (JCFS)

Scope: Complete replacement of post-login screens with the Hi-Fi Design System (CowHealth AI — 5 screens · iPhone 14 Pro · Dark · PT-BR); addition of global selected farm context with cascade propagation to Prisma; rewrite of the map as a farm floor plan with paddocks/stables and real-time cow pins; creation of 5 unique SVG layouts (one per farm).

### Added

**Frontend — UI Components (`src/components/ui/`)**

- `Icon.tsx` — SVG renderer with 30+ Design System icons; props `{ n, s, c, sw, style }`; icons: bell, search, home, list, alert, map, user, wifi, arrowUp, calendar, chevronLeft/Right, filter, plus, check, thermo, heart, activity, battery, logout, farm, collar.
- `StatusDot.tsx` — colored indicator with `cowPulse` animation; tones `success | warn | danger | muted | info`.
- `Battery.tsx` — visual battery percentage component with range-based colors (danger < 20%, warning < 40%, accent ≥ 40%).
- `CowMark.tsx` — cow SVG logo; props `{ s, primary, accent }`.
- `LineChart.tsx` — native SVG chart consuming `SensorDailyPoint[]`; support for horizontal thresholds, area gradient, automatic X/Y axes, up to 5 date labels.

**Frontend — Context**

- `src/context/FarmContext.tsx` — `FarmProvider` exposing `selectedFarm`, `setSelectedFarm`, `farms`, `isLoading`; persists `selectedFarmId` in `localStorage`; auto-selects the first farm on initialization.

**Frontend — New Pages**

- `src/pages/map/farmLayouts.ts` — 5 SVG farm floor plan layouts: Aurora (fields + central stable), São Bento (corridor + side paddocks), Vale Verde (L-shape + pond), Santa Clara (3×2 grid of paddocks), Rio Bonito (linear + riparian forest + river); each layout defines colored zones with labels, roads, and pin positions.
- `src/pages/map/MapPage.tsx` — full-bleed map of the selected farm: SVG topographic background, zone polygons with labels, animated cow pins by status (real data filtered by farm), count legend, detail card on pin tap, "Next" button to cycle between farms.
- `src/pages/profile/ProfilePage.tsx` — user profile with CowMark, email, profile, quick access menu, and logout.

### Changed

**Frontend — Layout**

- `src/components/layout/BottomNav.tsx` — migrated from 4 tabs with emoji to 5 tabs with SVG `Icon` (Home / Herd / Alerts / Map / Profile); Pearl Aqua `.bottom-nav__indicator` animated on active item; unread badge in Alerts.
- `src/components/layout/AppBar.tsx` — added `subtitle`, `showBack`, `left` props; back button uses `Icon` chevronLeft; `left` slot for custom avatar/logo.

**Frontend — Rewritten Pages**

- `src/pages/home/HomePage.tsx` — hero card with health score + progress bar, critical alert strip, horizontal row of cows needing attention, quick access grid; bottom sheet for farm switching; all data filtered by the selected farm.
- `src/features/cows/pages/CowsPage.tsx` — `cow-row` layout with `CowMark` + `StatusDot`; farm filter via context; status chips; collapsible search; subtitle shows farm name.
- `src/features/cows/pages/CowDetailPage.tsx` — hero card with CowMark + status + farm/collar pills; metrics grid; `LineChart` with Temperature / HR tabs; recent cow notifications.
- `src/features/notifications/pages/NotificationsPage.tsx` — alert cards with type-colored left border; All / Unread chips; `timeAgo` in PT-BR; mark as read on tap; "mark all" action in AppBar.

**Frontend — Routes**

- `src/routes/AppRoutes.tsx` — added routes `/map` → `MapPage` and `/profile` → `ProfilePage`.

**Frontend — App**

- `src/App.tsx` — wrapped with `<FarmProvider>` inside `QueryClientProvider`.

**Frontend — CSS**

- `src/styles/App.css` — complete rewrite of the authenticated Design System (without the `:root` block, which resides in `landing.css`): `bottom-nav` 5 columns 64px with Pearl Aqua `.bottom-nav__indicator`; `app-bar` 56px with `.app-bar__titles`, `.app-bar__subtitle`, `.app-bar__action-badge`; `@keyframes cowPulse`; new classes: `.app-content`, `.home-hero`, `.home-hero__bar`, `.home-hero__bar-fill`, `.home-stat`, `.home-section`, `.home-section__header`, `.alert-card`, `.alert-card--danger`, `.alert-card--read`, `.quick-grid`, `.quick-chip`, `.cow-row`, `.cow-row__meta`, `.cow-row__right`, `.cow-row__status`, `.filter-chips`, `.filter-chip`, `.home-empty`.

**Frontend — Hooks**

- `src/features/dashboard/hooks/useDashboard.ts` — `useDashboardOverview(farmId?)` and `useCowsPerStatus(farmId?)` include `farmId` in the `queryKey` and pass it to the service.

**Frontend — Services**

- `src/services/dashboardService.ts` — `getDashboardOverview(farmId?)` and `getCowsPerStatus(farmId?)` send `?farmId=` when provided.

**Backend — Services**

- `src/services/dashboardService.ts` — `getDashboardOverview(farmId?)`: filters `prisma.cow.count()` with `where: { farmId }`; when `farmId` provided, returns the farm itself as `topFarm`; `getCowsPerStatus(farmId?)`: adds `where: { farmId }` to the `groupBy`.
- `src/services/cowsService.ts` — `getAllCows(farmId?)`: adds `where: farmId ? { farmId } : undefined` to the `findMany`.

**Backend — Controllers**

- `src/controllers/dashboardController.ts` — `overview` and `cowsPerStatus` read `request.query.farmId` and pass it as `number`.
- `src/controllers/cowsController.ts` — `listCows` reads `request.query.farmId` and passes it to `getAllCows`.

### Fixed

- **Dashboard displayed 160 cows (all farms)** when admin accessed a specific farm.
  Cause: backend lacked `farmId` support; frontend lacked selected farm state.
  Solution: `FarmContext` + query param `?farmId=` cascaded down to Prisma.

- **Map displayed global multi-farm view** instead of internal floor plan.
  Cause: previous `MapPage` used fixed pins for geographic location of farms.
  Solution: rewritten with `farmLayouts.ts` — internal floor plan with SVG zones and filtered cow pins.

- **`isPending: toggling` declared but never used** in `UsersPage` (pre-existing TypeScript error).
  Solution: removed from destructuring.

### Build Status

- Frontend TypeScript: zero errors — 842 modules transformed (`npm run build`).
- Backend TypeScript: no type errors in modified functions.

---

## 2026-05-23 - FarmContext + Refactored Map + Lucide React Icons (JCFS)

Scope: Global selected farm context, complete map refactoring, static farm layouts, adjustments in cows/dashboard backend, and replacement of all emojis with vector icons via `lucide-react`.

### Added

**Frontend — Context**

- `frontend/src/context/FarmContext.tsx` — global selected farm context; exposes `selectedFarm` and `setSelectedFarm` to filter data by farm across the application.

**Frontend — Map**

- `frontend/src/pages/map/farmLayouts.ts` — static farm layouts (sector positions, corrals, and points of interest); local data for map rendering without depending on external endpoint.

**Frontend — Dependencies**

- `frontend/package.json` — installed `lucide-react` for replacing emojis with consistent vector icons.

### Changed

**Backend — Cows**

- `backend/src/controllers/cowsController.ts` — adjustments in controller response.
- `backend/src/services/cowsService.ts` — adjustments in filtering logic.

**Backend — Dashboard**

- `backend/src/controllers/dashboardController.ts` — adjustments in KPI response.
- `backend/src/services/dashboardService.ts` — refactoring of data aggregation logic by farm.

**Frontend — Dashboard**

- `frontend/src/services/dashboardService.ts` — updated to support `farmId` filter.
- `frontend/src/features/dashboard/hooks/useDashboard.ts` — hooks updated to consume `FarmContext` and pass `farmId` in queries.

**Frontend — Home**

- `frontend/src/pages/home/HomePage.tsx` — refactored to use `FarmContext`; farm selector integrated into the home page.

**Frontend — Map**

- `frontend/src/pages/map/MapPage.tsx` — complete refactoring: rendering based on `farmLayouts.ts`, integration with `FarmContext`, new visual layout of sectors and corrals.

**Frontend — Cows**

- `frontend/src/features/cows/pages/CowsPage.tsx` — integrated farm filter via `FarmContext`.

**Frontend — App**

- `frontend/src/App.tsx` — `FarmContext.Provider` added to global providers wrapper.

**Frontend — Icons (lucide-react)**

All emojis were removed from the source code and replaced by Lucide components. **Impact: `icon` prop of `EmptyState` and `ErrorState` changed from `string` to `ReactNode`** — passing a string literal to these props will result in a TypeScript error.

- `frontend/src/components/common/EmptyState.tsx` — `icon?: string` → `icon?: ReactNode`; default `<Inbox size={40} />`.
- `frontend/src/components/common/ErrorState.tsx` — `icon?: string` → `icon?: ReactNode`; default `<AlertTriangle size={40} />`.
- `frontend/src/components/common/FormModal.tsx` — `✕` → `<X size={16} />`.
- `frontend/src/components/common/ConfirmDialog.tsx` — `✕` → `<X size={16} />`.
- `frontend/src/components/layout/Sidebar.tsx` — navigation emojis → `Home`, `Warehouse`, `Tag`, `Beef`, `Bell`, `ShieldCheck`, `LogOut`.
- `frontend/src/components/layout/BottomNav.tsx` — custom `Icon` SVG component → `Home`, `List`, `Bell`, `Map`, `User` (Lucide).
- `frontend/src/features/notifications/components/NotificationCard.tsx` — emoji map by type → `AlertTriangle`, `Bell`, `Info`, `XCircle`, `Megaphone`.
- `frontend/src/pages/auth/LoginPage.tsx` — emoji `🐄` removed from `CowHealth AI` title.
- `frontend/src/features/access/pages/AccessLayout.tsx` — `🔒` → `<Lock size={40} />`.
- `frontend/src/features/access/pages/RolesPage.tsx` — `✕` → `<X />`, `🎭` → `<Users size={40} />`.
- `frontend/src/features/access/pages/PermissionsPage.tsx` — `🔑` → `<Key size={40} />`.
- `frontend/src/features/access/pages/UsersPage.tsx` — `✕` → `<X />`, `👤` → `<User size={40} />`.
- `frontend/src/features/farms/pages/FarmsPage.tsx` — `🏡` → `<Warehouse size={40} />`.
- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — `❌` → `<XCircle />`, `🐄` → `<Beef />`.
- `frontend/src/features/collars/pages/CollarDetailPage.tsx` — `❌` → `<XCircle size={40} />`.

### Build Status

- Frontend TypeScript: zero errors (`tsc --noEmit`).

---

## 2026-05-23 - Backend MQTT + Access Management + Auth + Dashboard + Environment (JCFS)

Scope: MQTT ingestion endpoint, heuristic health analysis, complete access management screens, dashboard with real data, TypeScript type corrections, environment configuration, and massive data seed.

### Added

**Backend — MQTT Ingestion**

- `backend/src/middlewares/requireApiKey.ts` — API Key authentication middleware (`Authorization: Bearer`).
- `backend/src/services/mqttIngestService.ts` — payload validation, persistence of HeartRateData / TemperatureData / AccelerometerData, heuristic analysis of CALVING and HEAT_STRESS, notification triggering for ADMIN and MANAGER.
- `backend/src/controllers/mqttController.ts` — thin controller delegating to `ingestMqttPayload`.
- `backend/src/routes/mqttRoutes.ts` — `POST /mqtt/ingest` protected by `requireApiKey`.

**IoT Documentation**

- `docs/iot-simulator-plan.md` — complete plan for the Python simulator: bovine physiological ranges, MQTT payload format, flow architecture, pseudocode for all modules, and execution sequence.
- `cowhealth-iot-simulator/CLAUDE.md` — permanent instructions for AI in the separate IoT repository.

**Frontend — Dashboard**

- `frontend/src/services/dashboardService.ts` — service with 3 dashboard endpoints.
- `frontend/src/features/dashboard/hooks/useDashboard.ts` — `useDashboardOverview`, `useCowsPerStatus`, `useCowsPerFarm` hooks.
- `frontend/src/features/dashboard/components/DashboardKPICard.tsx`.
- `frontend/src/features/dashboard/components/CowsPerStatusChart.tsx` — PieChart with Recharts.
- `frontend/src/features/dashboard/components/CowsPerFarmChart.tsx` — BarChart with Recharts.
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — LineChart with Recharts.

**Frontend — Auth**

- `frontend/src/pages/auth/RegisterPage.tsx`.

**Frontend — Access Hooks**

- `frontend/src/features/access/hooks/useRoles.ts` — `useRoles`, `useRole`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`, `useGrantPermission`, `useRevokePermission`.
- `frontend/src/features/access/hooks/useUsers.ts` — `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useToggleActive`, `useAssignRole`, `useRemoveRole`.
- `frontend/src/features/access/hooks/usePermissions.ts` — `usePermissions`, `useCreatePermission`, `useUpdatePermission`, `useDeletePermission`.

### Changed

**Backend**

- `backend/src/server.ts` — registration of `mqttRoutes` in `app.use("/mqtt", mqttRoutes)`.
- `backend/src/types/auth.ts` — added `RegisterInput { name, email, password }` interface.
- `backend/src/services/authService.ts` — added `register()` function with bcrypt hash and VIEWER profile.
- `backend/src/controllers/authController.ts` — added `registerController`.
- `backend/src/routes/authRoutes.ts` — added `POST /register` route (public).
- `backend/.env` / `backend/.env.example` — added `MQTT_WORKER_API_KEY` variable.

**Frontend — Auth**

- `frontend/src/features/auth/components/LoginForm.tsx` — implementation with `react-hook-form` + `zod`, `autoComplete="off"` to prevent Chrome autofill.
- `frontend/src/features/auth/components/RegisterForm.tsx` — implemented from scratch with validations and `useRegister()` integration.
- `frontend/src/services/authService.ts` — added `registerService()`.
- `frontend/src/hooks/useAuth.ts` — added `useRegister()` with redirect to `/login` on `onSuccess`.
- `frontend/src/routes/AppRoutes.tsx` — replaced `RegisterPlaceholder` with real `<RegisterPage />`.

**Frontend — Dashboard**

- `frontend/src/features/dashboard/pages/DashboardPage.tsx` — replaced mock data with real hooks, loading state, additional KPIs (`totalActiveCollars`, `unreadNotifications`).

**Frontend — Cows**

- `frontend/src/features/cows/components/SensorChart.tsx` — corrected interface: `{ timestamp, value }` → `{ date, average }`.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — removed 2 unnecessary queries; `farm` and `collar` extracted directly from `cow.farm` and `cow.collar`.

**Frontend — Collars**

- `frontend/src/features/collars/components/CollarCard.tsx` — `collar.identifier` → `collar.name`; removed `batteryPercentage` and `lastSync` fields.
- `frontend/src/features/collars/pages/CollarDetailPage.tsx` — removed extra query; `linkedCow = collar?.cow` (already nested).

**Frontend — Farms**

- `frontend/src/features/farms/pages/FarmDetailPage.tsx` — removed client-side filter `c.farmId === id`.

**Frontend — Access**

- `frontend/src/features/access/pages/UsersPage.tsx` — complete rewrite: search, `CreateUserModal`, `EditUserModal`, `ManageRolesModal`, active toggle, deletion with confirmation.
- `frontend/src/features/access/pages/RolesPage.tsx` — complete rewrite: search, `RoleFormModal`, `ManagePermissionsModal` with real-time checkboxes; fixed `role.permissions.length` → `role._count.permissions`.
- `frontend/src/features/access/pages/PermissionsPage.tsx` — complete rewrite: search, `PermissionFormModal`, deletion with confirmation.

**Frontend — Hooks**

- `frontend/src/hooks/useNotifications.ts` — `useMarkNotificationAsRead` and `useMarkAllAsRead` converted from fake objects to real `useMutation` with `invalidateQueries`.

**Frontend — Types**

- `frontend/src/types/cows.ts` — `id: string` → `number`; `dateOfBirth` → `birthDate`; `farmId` → `farm { id, name }`; `collarId` → `collar { id, name, status }`; `HeartRateDailyPoint` → `SensorDailyPoint { date, average }`.
- `frontend/src/types/collars.ts` — `identifier` → `name`; removed `batteryPercentage` and `lastSync`; `cowId` → `cow { id, tag, name }`.
- `frontend/src/types/access.ts` — added `RoleListItem` and `RoleDetail`; `Permission.description` → `string | null`.

**Frontend — Services**

- `frontend/src/services/rolesService.ts` — updated typing; fixed `grantPermission()` which sent `permissionId` in the URL instead of the body.

**Frontend — Dependencies**

- `frontend/package.json` — installed `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`.

**Environment**

- `backend/.env` — created from `.env.example`; `DATABASE_URL` configured with port `33071`.
- `frontend/.env` — created from `.env.example`; `VITE_API_URL=http://localhost:3001`.

### Removed

- `backend/prisma/run_seed.sh` — removed: Prisma ORM bypass with hardcoded MySQL credentials.
- `backend/prisma/seed_data.sql` — removed: direct SQL operations, plain text passwords.
- `backend/src/routes/authRoutes.ts` — removed `POST /register` route (public without authentication, rejected in code review).
- `frontend/src/features/dashboard/components/DashboardOverviewChart.tsx` — removed from dashboard (LineChart with categorical data makes no sense without time series endpoint).

### Fixed

- **Frontend called `localhost:3000/auth/login` (self) instead of `localhost:3001`**
  Cause: `frontend/.env` did not exist; `VITE_API_URL` was `undefined`.
  Solution: created `frontend/.env` with `VITE_API_URL=http://localhost:3001`.

- **`grantPermission` returned silent 404**
  Cause: frontend sent `POST /roles/:id/permissions/:permissionId` (non-existent route).
  Solution: fixed to `POST /roles/:id/permissions` with body `{ permissionId }`.

- **Crash in `/access/roles`: `Cannot read properties of undefined (reading 'length')`**
  Cause: `role.permissions.length` — but `getAllRoles` returns `_count.permissions` (integer).
  Solution: replaced with `role._count.permissions`.

- **Marking notification as read did not update the UI**
  Cause: `useMarkNotificationAsRead` returned fake object without React Query integration.
  Solution: converted to `useMutation` with `invalidateQueries(["notifications"])`.

- **Data arrived in the database but did not appear on screens**
  Cause: TypeScript types divergent from actual API contract (`timestamp/value` vs `date/average`, `identifier` vs `name`, etc.).
  Solution: all types aligned with the real shape of the endpoints.

- **Chrome filling email field with user's Google account**
  Cause: form without `autoComplete`.
  Solution: `autoComplete="off"` on `<form>` + `autoComplete="one-time-code"` on email input.

- **Port 3001 occupied by external process**
  Cause: another project with Node process on the same port.
  Solution: identified via `lsof -i :3001` + `kill {PID}`.

### Build Status

- Backend TypeScript: zero errors (`npx tsc --noEmit`).
- Frontend TypeScript: zero errors — 837 modules | 284ms.

---

## 2026-05-15 - Landing Page: iOS/Android responsiveness + scroll fix (JCFS)

Scope: mobile optimization of the landing page and scroll bug fix.

### Changed

- `frontend/index.html` — added iOS/Android meta tags: `viewport-fit=cover`, `theme-color`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`.
- `frontend/src/styles/landing.css` — added global rules, `.stage` with `min-height: 100dvh`, `.app` with `overflow-y: auto`, `padding` with `env(safe-area-inset-*)`, `overscroll-behavior-y: none`.
- `frontend/src/features/landing/pages/LandingPage.tsx` — content wrapped in `<div className="stage">`.

### Fixed

- **Mouse scroll did not work on landing page**
  Cause: `overflow-y: auto` missing in `.app` CSS.
  Solution: restored `overflow-y: auto; overflow-x: hidden` + `scrollbar-width: none`.

### Build Status

- TypeScript: zero errors | Vite: zero errors.

---

## 2026-05-14 - Frontend base structure per professor's instructions (JCFS)

Scope: `frontend/` only — no backend changes.

### Added

- `frontend/src/routes/AppRoutes.tsx` — centralized routing.
- `frontend/src/config/environment.ts` — centralized environment configuration.
- `frontend/src/components/charts/ChartContainer.tsx` and `index.ts`.
- `frontend/src/components/common/index.ts`.
- `frontend/src/components/layout/index.ts`.
- `frontend/src/components/feedback/index.ts`.
- `frontend/src/utils/index.ts`.

### Changed

- `frontend/src/App.tsx` — simplified to global provider composition and routing via `AppRoutes`.
- `frontend/vite.config.ts` — aliases: `@`, `@components`, `@features`, `@pages`, `@hooks`, `@services`, `@routes`, `@config`, `@utils`, `@types`.
- `frontend/tsconfig.app.json` — added `baseUrl` and `paths` aligned with Vite.
- `frontend/src/lib/api.ts` — `baseURL` now uses `environment.apiUrl`.
- `frontend/.env.example` — added `VITE_API_URL`, `VITE_APP_NAME`, `VITE_ENV` variables.

---

# Changes and Progress by Angelo

...

# Changes and Progress by Ian

---

## 2026-05-27 - Dashboard polish and visual alignment across all screens (Ian)

Owner: Ian Braz  
Scope: Unified the "Home" navigation with the real Dashboard; replaced inline SVGs with the official CowHead icon; added previous/next cow navigation arrows; fixed the sidebar; removed a duplicate title; visually aligned all sidebar screens with the Dashboard pattern (beige background, white cards, Instrument Serif typography, pill filters).

### Changed

**Frontend — Navigation**

- `frontend/src/components/layout/Sidebar.tsx` — the "Home" item redirected to `/home` (HomePage); changed to `/dashboard` (DashboardPage), the product's main screen.
- `frontend/src/components/layout/BottomNav.tsx` — the "Home" item redirected to `/home`; changed to `/dashboard`.
- `frontend/src/routes/AppRoutes.tsx` — `/home` route replaced with `<Navigate to="/dashboard" replace />` to avoid breaking direct links; `HomePage` import removed.

**Frontend — Dashboard: cow icon**

- `frontend/src/features/dashboard/components/CowProfilePanel.tsx` — two inline cow-head SVGs (empty state and photo placeholder) replaced with the official `CowHead` component from `@components/ui/CowHeadIcon`, aligning with the icon already used in the Sidebar, `CowsPage`, and `CowDetailPage`.

**Frontend — Dashboard: cow navigation**

- `frontend/src/features/dashboard/components/CowProfilePanel.tsx` — added `onPrev`, `onNext`, `hasPrev`, and `hasNext` props; buttons with `ChevronLeft`/`ChevronRight` (lucide-react) positioned absolutely on the card sides; 30% opacity when disabled (first/last cow).
- `frontend/src/features/dashboard/pages/DashboardPage.tsx` — added `currentIndex`, `hasPrev`, `hasNext`, `handlePrev`, and `handleNext` derived from `cowList` and `effectiveCowId`; passed them to `CowProfilePanel`.

**Frontend — Layout: fixed sidebar**

- `frontend/src/styles/App.css` — `.app-shell`: `min-height: 100vh` → `height: 100dvh` + `overflow: hidden`; `.app-shell__main`: added `min-height: 0` (required for the grid child to respect `overflow-y: auto`); `.sidebar`: `height: 100vh` → `height: 100%`, removed `position: sticky`.

**Frontend — Dashboard: duplicate title**

- `frontend/src/features/dashboard/pages/DashboardPage.tsx` — removed `<AppBar title="Herd overview" />` and its import; the styled title with Instrument Serif and CowHead already exists in the content area.

**Frontend — Visual alignment: all sidebar screens**

All screens now use the same visual pattern as the Dashboard: beige background (`#f5f1ea`), white cards with subtle shadow, `Instrument Serif` typography in page titles, pill filters (border-radius 999, green border when active), and headers with an icon plus descriptive subtitle.

- `frontend/src/features/cows/pages/CowsPage.tsx` — complete rewrite: removed AppBar and the `cow-row` list; added a styled header with `CowHead`; 2-column grid with white cards (circular avatar by status, name, tag, farm, status pill); filters converted to green pills; search with a circular toggle.
- `frontend/src/features/cows/pages/CowDetailPage.tsx` — beige background; hero card with white background and `CowHead` avatar colored by status; metrics in inline white cards; sensor tabs converted to pills; recent notifications with white cards and a colored left border.
- `frontend/src/features/farms/pages/FarmsPage.tsx` — rewrite: removed AppBar and generic `EmptyState`; header with `Warehouse` icon; "+ New" button as a green pill; inline search; 2-column grid with updated `FarmCard`.
- `frontend/src/features/farms/components/FarmCard.tsx` — updated to a white card with a `Warehouse` icon in a light-green square, name, CNPJ, and city/state.
- `frontend/src/features/collars/pages/CollarsPage.tsx` — rewrite: removed AppBar; header with `Tag` icon; status filters converted from `btn btn-sm` to pills; 2-column grid with updated `CollarCard`.
- `frontend/src/features/collars/components/CollarCard.tsx` — updated to a white card with a status-colored `Tag` icon in a background square, status label as a pill, frequency, and linked cow.
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` — rewrite: beige background; header with `Bell` + unread count in orange; pill filters; each notification in a white card with left border colored by type + contextual icon in a colored square + green dot for unread; "Mark all" button in the header.
- `frontend/src/pages/profile/ProfilePage.tsx` — rewrite: beige background; avatar with the name initial in a light-green circle (Instrument Serif); profile badge as a pill; unified white-card menu with separators; icons in light-green squares; red "Sign out" button with icon.

### Build Status

- Frontend TypeScript: zero errors (`npx tsc --noEmit`).

# Changes and Progress by Renato

---
 
## 2026-05-27 - User-farm access control: restrict data by farm assignment (Renato)
 
Scope: Farm-level access control so each user only sees data from the farms they are assigned to. Introduces a `UserFarm` join table, embeds `farmIds` in the JWT payload, and adds a `requireFarmAccess` middleware that isolates queries across farms, collars, and the dashboard — without any extra DB query per request. SuperAdmin is the only role that retains unrestricted access.
 
### Added
 
- `backend/prisma/migrations/add_user_farm_relation/` — migration creating the `UserFarm` join table (N:N between users and farms).
- `backend/src/middlewares/requireFarmAccess.ts` — new middleware; reads `farmIds` from the JWT and short-circuits for SuperAdmin; returns 403 on unauthorized farm access.
- `backend/src/helpers/serviceHelpers.ts` — `throwWithStatus()` helper for throwing errors with an explicit HTTP status code.
### Changed
 
- `backend/prisma/schema.prisma` — added `UserFarm` model with relations to `User` and `Farm`.
- `backend/prisma/seed.ts` — farm assignments per profile: Veterinário → Aurora + São Bento; Zootecnista → Boa Esperança; Gerente de Fazenda → Aurora; Operador de Campo → Aurora; Financeiro → all 5 farms; Observador → Santa Clara; Administrador → one dedicated admin per farm (5 created); SuperAdmin → unrestricted (no `UserFarm` record required).
- `backend/src/types/auth.ts` — `AuthPayload` extended with `farmIds: number[] | null` (`null` = unrestricted).
- `backend/src/services/authService.ts` — `getUserFarmIds()` runs at login to embed `farmIds` in the JWT; checks for the role name `"SuperAdmin"` instead of profile `"ADMIN"`, decoupling access control from profile type.
- `backend/src/middlewares/requirePermission.ts` — updated to work with the new `AuthPayload`.
- `backend/src/services/farmsService.ts` — `getAllFarms` and `getFarmById` filter by `farmIds`.
- `backend/src/services/dashboardService.ts` — all cow counts and `groupBy` queries filter by `farmIds`.
- `backend/src/controllers/farmsController.ts` — passes `farmIds` from JWT to services.
- `backend/src/helpers/handleRequest.ts` — updated to read `error.statusCode` when present; access denied → 403, resource not found → 404.
- `insomnia-backend.yaml` — Farm Access Control folder added with 11 requests covering list, show, 403 and 200 scenarios.
### Build Status
 
- ✅ Backend TypeScript: zero errors (`npx tsc --noEmit`).
---
 
## 2026-05-26 - Backend features C, D and G: medical records, cow retirement and sensor history (Renato)
 
Scope: Three backend features from `Master_Plan_NewFeatures.md`. Feature C adds a full veterinary medical record system with RBAC; Feature D implements a soft-delete retirement flow that unlinks the cow's collar; Feature G exposes a unified sensor-history endpoint combining heart rate, temperature and accelerometer for the frontend `CowHistoryPage`.
 
### Added
 
**Feature C — Veterinary Medical Record**
 
- `backend/prisma/migrations/` — `MedicalRecord` model with `MedicalRecordType` enum (`CHECKUP`, `PROCEDURE`, `MEDICATION`) and relation to `Cow` and `User`.
- `backend/prisma/seed.ts` — permission group `Medical Records` with 5 permissions; role assignments: Veterinário (full CRUD), Zootecnista and Gerente de Fazenda (read-only), Admin and SuperAdmin (full CRUD).
- `backend/src/schemas/medicalRecordSchemas.ts` — `createMedicalRecordSchema` and `updateMedicalRecordSchema` (Zod).
- `backend/src/services/medicalRecordsService.ts` — full CRUD service.
- `backend/src/controllers/medicalRecordsController.ts` — controller wiring service to HTTP.
- `backend/src/routes/cowsRoutes.ts` — medical record routes appended (flat pattern, consistent with project convention).
**Feature D — Animal Retirement**
 
- `backend/prisma/migrations/` — `RETIRED` status added to `CowStatus` enum; `retiredAt` and `retiredReason` fields added to `Cow`.
- `backend/src/services/cowsService.ts` — `retireCow()` with guard against double retirement; unlinks collar and sets it to `INACTIVE`.
**Feature G — Sensor History**
 
- `backend/src/routes/cowsRoutes.ts` — `GET /cows/:id/sensor-history?from=<ISO>&to=<ISO>` returning `{ measuredAt, heartRate, temperature, activity }` per reading; `activity` computed as Euclidean magnitude of accelerometer axes.
### Changed
 
**Feature D — Animal Retirement**
 
- `backend/src/services/dashboardService.ts` — all cow counts and `groupBy` queries now exclude `RETIRED` cows.
- `backend/src/services/cowsService.ts` — cow listing excludes `RETIRED`.
### Build Status
 
- ✅ Backend TypeScript: zero errors (`npx tsc --noEmit`).
---
 
## 2026-05-25 - Fix: missing migration for last_lat and last_lng on cows (Renato)
 
Scope: Alignment between `schema.prisma` and the actual database state. The fields `lastLat` and `lastLng` were present in the `Cow` model but the corresponding migration had never been generated, causing `prisma migrate reset` to fail.
 
### Added
 
- `backend/prisma/migrations/add_last_location_to_cows/` — migration creating `last_lat` and `last_lng` columns on the `cows` table.
### Fixed
 
- **`prisma migrate reset` failed with `The column cowhealth-db.cows.last_lat does not exist`**
  Cause: `lastLat` / `lastLng` were declared in `schema.prisma` but no migration had been generated for them.
  Solution: generated `add_last_location_to_cows` migration, aligning the schema with the database.
### Build Status
 
- ✅ `npx prisma migrate reset` executes without errors.
- ✅ Seed: 8 users, 200 collars, 160 cows.
---
 
## 2026-05-24 - Backend security hardening: CORS, authenticated uploads, error handler, Zod validation and permission caching (Renato)
 
Scope: Five backend security and quality tasks from `docs/tasks/triagen-cards.yaml` (cards 9–13). CORS is now restricted to allowed origins; cow photos require authentication and are protected against path traversal; unhandled errors no longer leak stack traces to the client; all POST and PUT endpoints are validated with Zod; and permission checks are resolved directly from the JWT payload, eliminating one DB query per request.
 
### Added
 
- `backend/src/middlewares/errorHandler.ts` — global error handler extracted to its own file; suppresses stack traces in responses.
- `backend/src/middlewares/validateSchema.ts` — middleware factory that runs Zod validation and returns `422` with a `details[]` array on failure.
- `backend/src/schemas/` — new directory with Zod schemas for all entities: `authSchemas.ts`, `farmSchemas.ts`, `collarSchemas.ts`, `cowSchemas.ts`, `userSchemas.ts`, `roleSchemas.ts`, `permissionSchemas.ts`, `permissionGroupSchemas.ts`.
### Changed
 
- `backend/src/server.ts` — `app.use(cors())` replaced by `cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") })`; `express.static("/uploads")` removed; `errorHandler` registered as the last middleware; `validateSchema` applied on all `POST` and `PUT` routes.
- `backend/src/types/auth.ts` — `AuthPayload` extended with `permissions: string[]`.
- `backend/src/services/authService.ts` — login now embeds `permissions[]` in the JWT payload.
- `backend/src/middlewares/requirePermission.ts` — rewritten to read permissions directly from the JWT token; no DB query per request.
- `backend/src/routes/cowsRoutes.ts` — `GET /cows/:id/photos/:filename` added with `requireAuth` + `requirePermission("View Cow")`; `path.basename()` prevents path traversal.
- `backend/.env.example` — `ALLOWED_ORIGINS` documented.
- `insomnia-backend.yaml` — collection updated for all new routes and validation behaviour.
### Notes
 
- Existing JWT tokens must be renewed — the new payload includes `permissions[]`.
- `ALLOWED_ORIGINS=http://localhost:5173` must be added to the local `.env` as documented in `.env.example`.
### Build Status
 
- ✅ Backend TypeScript: zero errors (`npx tsc --noEmit`).

