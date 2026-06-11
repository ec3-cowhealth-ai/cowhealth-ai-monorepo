# Changelog

## [Unreleased]

### Added

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

