# Prisma — Reference Guide

Quick reference guide for using Prisma in the project's backend.

---

## Relevant Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # definition of all models and relationships
│   ├── seed.ts              # initial development data
│   └── migrations/          # history of automatically generated migrations
├── src/
│   └── lib/
│       └── prisma.ts        # PrismaClient singleton
└── prisma.config.ts         # database connection configuration
```

---

## Commands

### Initial Setup (already executed)

```bash
npx prisma init
```
Creates the `prisma/` folder with the initial `schema.prisma`. Executed only once.

---

### Create and Apply a Migration

Must be executed whenever `schema.prisma` is changed — new field, new table, change of type or relationship.

```bash
npx prisma migrate dev --name change_description
```

The name should describe what was changed, in snake_case:

```bash
npx prisma migrate dev --name add_weight_to_cows
npx prisma migrate dev --name create_audit_log_table
npx prisma migrate dev --name remove_breed_from_cows
```

This command also runs `prisma generate` automatically.

---

### Apply Pending Migrations

When pulling changes from the repository that include new migrations, run:

```bash
npx prisma migrate dev
```

Applies all migrations that have not yet been executed in the local database.

---

### Generate the Client Manually

Necessary when `@prisma/client` is outdated relative to the schema without having gone through `migrate dev`:

```bash
npx prisma generate
```

---

### Seed the Database with Development Data

```bash
npx prisma db seed
```

Executes the `prisma/seed.ts` file and seeds the database with initial data: admin user, roles, permissions, farms, collars, cows, and sensor data.

---

### Reset the Database Completely

Deletes the database, recreates it, applies all migrations in order, and runs the seed automatically. Equivalent to a DROP + complete recreation.

```bash
npx prisma migrate reset
```

Useful during development when there are structural changes incompatible with existing data — for example, adding mandatory columns without default values to already populated tables.

---

### View Data in the Browser

```bash
npx prisma studio
```

Opens a visual interface at `http://localhost:5555` to inspect and edit records directly in the database.

---

## Usage in Code

`PrismaClient` is instantiated once in `src/lib/prisma.ts`. Always import from this file:

```ts
import { prisma } from "../lib/prisma";
```

### Query Examples

```ts
// List all records
const farms = await prisma.farm.findMany();

// Find with filter
const activeCows = await prisma.cow.findMany({
  where: { status: "HEALTHY" },
});

// Find a record by a unique field
const user = await prisma.user.findUnique({
  where: { email: "admin@cowhealth.com" },
});

// Find with relationships
const cow = await prisma.cow.findUnique({
  where: { id: 1 },
  include: { farm: true, collar: true },
});

// Create
const farm = await prisma.farm.create({
  data: { name: "Aurora Farm", cnpj: "00.000.000/0001-00" },
});

// Update
const updated = await prisma.cow.update({
  where: { id: 1 },
  data: { status: "ALERT" },
});

// Delete
await prisma.cow.delete({ where: { id: 1 } });
```

---

## Quick Reference

| Situation | Command |
|---|---|
| Changed `schema.prisma` | `prisma migrate dev --name description` |
| Pulling changes with new migrations | `prisma migrate dev` |
| Client outdated without new migration | `prisma generate` |
| Want to seed the database with initial data | `prisma db seed` |
| Want to delete everything and start from scratch | `prisma migrate reset` |
| Want to inspect the data | `prisma studio` |

---

## Notes

- `schema.prisma` is the **source of truth** for the database. Never change the database directly via Workbench or manual SQL — every change goes through the schema and `migrate dev`.
- Workbench is used only for **viewing and verifying** data, not for structural changes.
- `migrate reset` deletes all data. Use only in a development environment.
- The `.env` file should not be committed. Each team member maintains their own local file with their own credentials, based on `.env.example`.

---

## Massive Seed via SQL

To seed the database with a realistic volume of data (200 collars, 160 cows, 5 farms, 8 user profiles), there is an alternative seed based on pure SQL with stored procedures.

### Files

```
backend/
└── prisma/
    ├── seed_data.sql   # INSERT statements + stored procedures for mass generation
    └── run_seed.sh     # execution script with interactive confirmation
```

### Generated Structure

| Entity              | Qty    | Detail                                                               |
|---------------------|--------|----------------------------------------------------------------------|
| Permissions         | 37     | Complete CRUD per resource                                           |
| Roles               | 8      | SuperAdmin, Administrator, Veterinarian, Zootechnician, Farm Manager, Field Operator, Financial, Observer |
| Users               | 8      | One per role, `@cowhealth.com` emails                                |
| Farms               | 5      | PR, MG, GO, SP, MT                                                   |
| Collars             | 200    | 1-160 ACTIVE (assigned), 161-180 stock, 181-190 MAINTENANCE, 191-195 INACTIVE, 196-200 BATTERY |
| Cows                | 160    | 32/farm — ~69% HEALTHY, 12% HEAT_STRESS, 12% ALERT, 6% CALVING      |
| Sensor data         | ~81k   | 7 days × 160 cows × 3 tables (heart_rate, temperature, accelerometer) |
| Notifications       | 100    | Various alerts, 60% read                                             |

### How to Execute

```bash
cd backend/prisma
./run_seed.sh
```

The script checks the connection, asks for confirmation before deleting data, and displays a summary at the end.

To run the SQL directly:

```bash
mysql -u root -p -P 33071 cowhealth-db < backend/prisma/seed_data.sql
```

### Created Users

| Email                       | Role              | Profile |
|-----------------------------|-------------------|---------|
| admin@cowhealth.com         | SuperAdmin        | ADMIN   |
| gerente@cowhealth.com       | Administrator     | ADMIN   |
| vet@cowhealth.com           | Veterinarian       | MANAGER |
| zoot@cowhealth.com          | Zootechnician     | MANAGER |
| fazenda@cowhealth.com       | Farm Manager      | MANAGER |
| operador@cowhealth.com      | Field Operator    | VIEWER  |
| financeiro@cowhealth.com    | Financial         | VIEWER  |
| obs@cowhealth.com           | Observer          | VIEWER  |

### Activating Login (Passwords)

The SQL inserts placeholder hashes. To generate a real hash for `password123` and update all users:

```bash
node -e "require('bcrypt').hash('password123', 12).then(h => console.log('UPDATE users SET password_hash = \"' + h + '\";'))"
```

Paste the generated `UPDATE` into MySQL, or run `seed.ts` normally (`npx prisma db seed`) — it recreates the users with valid hashes.
