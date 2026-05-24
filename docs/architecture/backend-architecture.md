# Backend Architecture

Reference guide for the current backend codebase.

## Stack

- Express 5
- TypeScript
- Prisma
- MySQL
- JWT
- bcrypt
- multer

## Current Folder Shape

```text
backend/
|-- prisma/      schema, seed, migrations
|-- src/
|   |-- controllers/
|   |-- helpers/
|   |-- lib/
|   |-- middlewares/
|   |-- routes/
|   |-- services/
|   `-- types/
|-- uploads/     cow photos
|-- prisma.config.ts
|-- package.json
`-- tsconfig.json
```

## Main Layers

- `routes/` wires middleware and controllers.
- `controllers/` handles request/response and delegates work.
- `services/` contains business logic and Prisma calls.
- `helpers/` contains cross-cutting utilities.
- `middlewares/` handles auth, permissions, and request guards.
- `lib/prisma.ts` exports the Prisma client singleton.

## Current Endpoints

- Auth, users, roles, permissions, permission groups
- Farms, collars, cows
- Dashboard summary and charts
- Notifications

## Operational Notes

- `backend/src/server.ts` currently enables open CORS.
- `backend/src/server.ts` serves `/uploads` statically.
- `backend/src/services/mqttIngestService.ts` still combines ingest validation, persistence, health analysis, and notification dispatch.
- Permission checks still traverse the database per request.

## Uploads

- Cow photos are stored under `uploads/`.
- Multer handles image uploads in the cows flow.
- The current server exposes uploaded files through Express static middleware.

