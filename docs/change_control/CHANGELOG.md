# Changelog

## [Unreleased]

### Added

#### Documentação do produto — README e referência técnica (2026-06-17)

Reestruturação completa da documentação raiz do repositório, separando conteúdo de produto de conteúdo técnico.

**Arquivos criados:**
- **`TECHNICAL.md`**: Extraído do README anterior. Contém stack técnica, estrutura de pastas, design system, modelo de dados completo (incluindo `CowClinicalRecord` e `ActivityEvent`), setup local, verificação e mapa de documentação.
- **`DEMO_USERS.md`**: Lista de usuários de demonstração com e-mails, senha padrão (`12345678`), papéis, fazendas vinculadas, tabela de permissões por papel e resumo dos dados do banco (seed).

**Arquivo atualizado:**
- **`README.md`**: Reescrito com foco no produto. Inclui tagline, descrição do sistema, fluxo IoT → análise → dashboard, seção da coleira RF10A com tabela de sensores, motor de diagnóstico heurístico com as 8 condições do Anexo VII, funcionalidades organizadas por público (produtor, veterinário, administrador), menção à landing page e link para `TECHNICAL.md`.

---

### Fixed

#### Coordenadas geográficas das fazendas — seed e simulador IoT (2026-06-17)

As coordenadas anteriores eram fictícias e posicionavam as fazendas dentro de centros urbanos ou em estados incorretos. Substituídas por coordenadas de propriedades rurais reais de pecuária leiteira no Paraná, verificadas via Google Maps.

**Arquivos alterados:**
- `backend/prisma/seed.ts` — `farmData[]`: coordenadas de `latitude` e `longitude`
- `cowhealth-iot-simulator/data/farms.json` — campos `lat` e `lng`

**Coordenadas corrigidas:**

| Fazenda | Lat anterior | Lng anterior | Lat nova | Lng nova | Referência |
|---|---|---|---|---|---|
| Fazenda Santa Clara | -25.0945 | -50.1633 | -24.9638 | -50.0298 | Fazenda Rincão (DUQUEZA), PR |
| Fazenda Aurora | -14.0658 | -50.4153 | -24.6953 | -50.7126 | Confinamento leiteiro Souza, PR |
| Fazenda Sao Bento | -14.9375 | -51.0800 | -24.8373 | -49.9234 | Fazenda Rhoelandt, PR |
| Fazenda Boa Esperanca | -12.9167 | -52.4167 | -26.7771 | -51.6224 | Fazenda Sonho e Realidade, PR |
| Fazenda Vale Verde | -24.9578 | -53.4554 | — | — | Sem alteração (já era rural) |

**Nomes, CNPJs, cidades e e-mails das fazendas não foram alterados.**

**Instruções:**
- Backend: executar `npx prisma migrate reset` para reconstruir o banco com as novas coordenadas (o `upsert` do seed usa `update: {}`, portanto não atualiza registros existentes)
- Simulador IoT: reiniciar o processo — `data/farms.json` é lido em runtime, sem rebuild necessário



#### Soft Delete Implementation (2026-06-11)

Implemented soft delete (logical deletion) for `User`, `Farm`, and `MedicalRecord` models. Records are marked as deleted instead of physically removed from the database, allowing for audit trails and accidental recovery.

**Schema Changes:**
- Added `deletedAt DateTime?` column to `User` model
- Added `deletedAt DateTime?` column to `Farm` model
- Added `deletedAt DateTime?` column to `MedicalRecord` model
- Created migration: `20260611120000_add_soft_delete_to_user_farm_medical_record`
- Added database indices on `deleted_at` columns for query optimization

**Backend Changes:**
- **usersService.ts**: Updated all queries to filter `WHERE deletedAt IS NULL`
  - `getAllUsers()`: Added `deletedAt: null` filter
  - `getUserById()`: Changed to `findFirst()` with soft delete filter
  - `updateUser()`: Changed to `findFirst()` with soft delete filter
  - `toggleUserActive()`: Changed to `findFirst()` with soft delete filter
  - `deleteUser()`: Changed from hard delete to soft delete (sets `deletedAt: new Date()`)
  - `assignRoleToUser()`: Changed to `findFirst()` with soft delete filter

- **farmsService.ts**: Updated all queries to filter `WHERE deletedAt IS NULL`
  - `getAllFarms()`: Added `deletedAt: null` filter
  - `getFarmById()`: Changed to `findFirst()` with soft delete filter
  - `updateFarm()`: Changed to `findFirst()` with soft delete filter
  - `deleteFarm()`: Changed from hard delete to soft delete (sets `deletedAt: new Date()`)

- **medicalRecordsService.ts**: Updated all queries to filter `WHERE deletedAt IS NULL`
  - `getMedicalRecords()`: Added `deletedAt: null` filter
  - `getMedicalRecord()`: Changed to `findFirst()` with soft delete filter
  - `updateMedicalRecord()`: Changed to `findFirst()` with soft delete filter
  - `deleteMedicalRecord()`: Changed from hard delete to soft delete (sets `deletedAt: new Date()`)

**Frontend Changes:**
- **UsersPage.tsx**: Already has delete confirmation modal (ConfirmDialog component)
  - Displays warning: "Esta ação não pode ser desfeita."
  - Marked as `isDangerous` with red button styling

- **CowDetailPage.tsx**: Already has delete confirmation modal for animals
  - Displays warning: "Esta ação não pode ser desfeita."
  - Marked as `isDangerous` with red button styling

- **MedicalRecordCard.tsx**: Added delete confirmation modal
  - New state: `showDeleteConfirm` to track confirmation dialog state
  - Delete button now opens modal before confirming deletion
  - Modal displays record details (title, type, date)
  - Marked as `isDangerous` with appropriate warning message

**Why Soft Delete?**
- **User model**: Auditability and compliance (LGPD, regulatory requirements)
- **Farm model**: Historical tracking and accidental deletion recovery
- **MedicalRecord model**: Medical records should never be truly deleted; archival is preferable

**Why NOT for other models?**
- **Cow**: Contains massive sensor data (>10GB/year); soft delete would degrade performance
- **Collar**: Status field (`ACTIVE`, `INACTIVE`, `MAINTENANCE`, `BATTERY`) already provides logical deletion
- **Notification**: Ephemeral data without audit/compliance requirements
- **Sensor Data**: Time-series data; automatic purging after 2 years is more appropriate

**Migration Instructions:**
1. Run: `npx prisma migrate deploy`
2. Indices on `deleted_at` created automatically
3. No data modification required; existing records have `deletedAt = NULL`

