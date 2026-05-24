# Code Review Report

| Field     | Value                       |
| --------- | --------------------------- |
| Date      | 2026-05-23 22:40            |
| Prompt    | `architecture-refactor`     |
| Codebase  | `D:\Projects\cowhealthai`   |
| Generator | `review.py` via Claude Code |

---

I have a thorough picture of the entire system. Here is the full refactoring plan.

---

# Architecture Refactor Plan — CowHealth AI

---

## Step 1 — Define the Final Architecture

### Guiding Principle

Both backend and frontend share the same four-layer model, applied to the same set of business domains. The layers are not expressed as global folders — they are **nested inside each module**.

### Layers

| Layer              | Responsibility                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Domain**         | Entities, value objects, domain service interfaces. Zero infrastructure imports.                           |
| **Application**    | Use cases. Orchestrates domain objects and calls repository/gateway interfaces. No HTTP knowledge.         |
| **Infrastructure** | Implements repository and gateway interfaces. Holds Prisma, file system, JWT, bcrypt.                      |
| **Presentation**   | Controllers, routes (backend) / pages, components, hooks (frontend). Thin. Delegates to application layer. |

### Modules

| Module            | Backend role                                                               | Frontend role                                          |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| **auth**          | Login, JWT signing, `getMe`, permission check                              | Login/Register forms, `useAuth` hook, `ProtectedRoute` |
| **cows**          | Cow CRUD, photos, sensor queries, health status                            | Cow list/detail pages, sensor charts                   |
| **collars**       | Collar CRUD, status tracking                                               | Collar list/detail pages                               |
| **farms**         | Farm CRUD                                                                  | Farm list/detail pages, `FarmContext`                  |
| **telemetry**     | MQTT ingestion, sensor persistence, health analysis, notification dispatch | — (backend-only domain)                                |
| **notifications** | Notification CRUD, mark-read logic                                         | Notifications page, `useNotifications` hook            |
| **dashboard**     | Aggregated KPI queries                                                     | Dashboard page with KPI cards and charts               |
| **access**        | Users, roles, permissions, permission groups                               | Access management pages                                |
| **shared**        | Errors, middleware, lib singletons, common utils                           | Common UI components, API client, `queryClient`        |

---

## Step 2 — Final Folder Structure

### Backend

```
backend/src/
  modules/
    auth/
      domain/
        interfaces/
          IAuthRepository.ts       # findByEmail(email): Promise<User | null>
          ITokenService.ts         # sign(payload): string; verify(token): AuthPayload
      application/
        use-cases/
          LoginUseCase.ts
          GetMeUseCase.ts
          CheckPermissionUseCase.ts
        dtos/
          LoginDTO.ts
      infrastructure/
        repositories/
          PrismaAuthRepository.ts
        adapters/
          JwtTokenService.ts
          BcryptHashService.ts
      presentation/
        authController.ts
        authRoutes.ts

    cows/
      domain/
        entities/
          Cow.ts                   # pure class, no Prisma
        interfaces/
          ICowRepository.ts
          IFileStorageService.ts
        services/
          HealthStatusEvaluator.ts # pure domain logic (calving/heat-stress rules)
      application/
        use-cases/
          ListCowsUseCase.ts
          GetCowUseCase.ts
          CreateCowUseCase.ts
          UpdateCowUseCase.ts
          DeleteCowUseCase.ts
          UploadCowPhotoUseCase.ts
          RemoveCowPhotoUseCase.ts
          GetSensorDataUseCase.ts
        dtos/
          CreateCowDTO.ts
          UpdateCowDTO.ts
          SensorQueryDTO.ts
      infrastructure/
        repositories/
          PrismaCowRepository.ts
        adapters/
          DiskFileStorageService.ts
      presentation/
        cowsController.ts          # no Multer config here — imported from infrastructure
        cowsRoutes.ts

    collars/
      domain/interfaces/ICollarRepository.ts
      application/use-cases/
      infrastructure/repositories/PrismaCollarRepository.ts
      presentation/

    farms/
      domain/interfaces/IFarmRepository.ts
      application/use-cases/
      infrastructure/repositories/PrismaFarmRepository.ts
      presentation/

    telemetry/
      domain/
        interfaces/
          ISensorRepository.ts
          IHealthAnalyzer.ts
        services/
          CowHealthAnalyzer.ts     # extracted from mqttIngestService
      application/
        use-cases/
          IngestTelemetryUseCase.ts
      infrastructure/
        repositories/
          PrismaSensorRepository.ts
      presentation/
        mqttController.ts
        mqttRoutes.ts

    notifications/
      domain/interfaces/INotificationRepository.ts
      application/use-cases/
        GetNotificationsUseCase.ts
        MarkReadUseCase.ts
        DispatchHealthAlertUseCase.ts   # called by IngestTelemetryUseCase
      infrastructure/repositories/PrismaNotificationRepository.ts
      presentation/

    dashboard/
      application/use-cases/
        GetOverviewUseCase.ts
        GetCowsPerStatusUseCase.ts
        GetCowsPerFarmUseCase.ts
      infrastructure/repositories/PrismaDashboardRepository.ts
      presentation/

    access/
      domain/interfaces/
        IUserRepository.ts
        IRoleRepository.ts
        IPermissionRepository.ts
      application/use-cases/
      infrastructure/repositories/
      presentation/

  shared/
    errors/
      AppError.ts                  # base typed error
      NotFoundError.ts
      ConflictError.ts
      ForbiddenError.ts
    middlewares/
      requireAuth.ts
      requirePermission.ts
      requireApiKey.ts
    lib/
      prisma.ts
    utils/
      sensorAggregation.ts         # aggregateDailyAverage
      querySensorData.ts
```

### Frontend

```
frontend/src/
  features/
    auth/
      types/
        index.ts                   # LoginFormData, AuthPayload, User
      services/
        authService.ts             # moved from src/services/
      hooks/
        useAuth.ts                 # useLogin, useRegister, useMe
      components/
        LoginForm.tsx
        RegisterForm.tsx
      pages/
        LoginPage.tsx
        RegisterPage.tsx
      index.ts

    cows/
      types/
        index.ts                   # Cow, CowStatus, CreateCowInput, SensorDailyPoint
      services/
        cowsService.ts             # moved from src/services/
      hooks/
        useCows.ts
        useCowSensors.ts           # heart-rate, temperature hooks extracted
      components/
        CowCard.tsx
        CowStatusBadge.tsx
        SensorChart.tsx
      pages/
        CowsPage.tsx
        CowDetailPage.tsx
      index.ts

    collars/
      types/
      services/
        collarsService.ts
      hooks/
        useCollars.ts
      components/
        CollarCard.tsx
      pages/
        CollarsPage.tsx
        CollarDetailPage.tsx
      index.ts

    farms/
      types/
        index.ts                   # Farm, CreateFarmInput
      services/
        farmsService.ts
      hooks/
        useFarms.ts
      context/
        FarmContext.tsx             # moved from src/context/
      components/
        FarmCard.tsx
        FarmForm.tsx
      pages/
        FarmsPage.tsx
        FarmDetailPage.tsx
      index.ts

    notifications/
      types/
      services/
        notificationsService.ts
      hooks/
        useNotifications.ts        # moved from src/hooks/
      components/
      pages/
        NotificationsPage.tsx
      index.ts

    dashboard/
      types/
        index.ts
      services/
        dashboardService.ts
      hooks/
        useDashboard.ts
      components/
        DashboardKPICard.tsx
        CowsPerStatusChart.tsx
        CowsPerFarmChart.tsx
      pages/
        DashboardPage.tsx
      index.ts

    access/
      types/
      services/
        usersService.ts
        rolesService.ts
        permissionsService.ts
      hooks/
        useUsers.ts
        useRoles.ts
        usePermissions.ts
      components/
      pages/
        UsersPage.tsx
        RolesPage.tsx
        PermissionsPage.tsx
        AccessLayout.tsx
      index.ts

    landing/
      components/
      pages/
        LandingPage.tsx
      index.ts

    map/
      data/
        farmLayouts.ts             # moved from src/pages/map/
      pages/
        MapPage.tsx
      index.ts

  shared/
    components/
      ui/                          # Icon, StatusDot, Battery, CowMark, LineChart
      common/                      # LoadingSpinner, StatusBadge, ConfirmDialog, EmptyState, ErrorState, FormModal
      layout/                      # AppShell, AppBar, BottomNav
      charts/                      # ChartContainer
      ProtectedRoute/
    hooks/
      usePermission.ts
    lib/
      api.ts                       # Axios instance
      queryClient.ts
    config/
      environment.ts
    styles/
      index.css
      App.css
      landing.css

  routes/
    AppRoutes.tsx

  main.tsx
  App.tsx
```

---

## Step 3 — Refactor the Main Problem Areas

### 3.1 `mqttIngestService.ts` — God Service (backend)

**Current problem:** One 207-line file does five completely different things: payload validation, DB reads, sensor persistence, a domain algorithm (calving/heat-stress analysis), and notification dispatch. If you want to unit-test the calving detection logic, you must bring up the entire Prisma stack.

**How it will be split:**

| Extracted piece                   | Destination                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `validatePayload()`               | `modules/telemetry/application/use-cases/IngestTelemetryUseCase.ts` — input validation at application boundary |
| `persistSensorData()`             | `modules/telemetry/infrastructure/repositories/PrismaSensorRepository.ts`                                      |
| `analyzeHealth()` — the algorithm | `modules/telemetry/domain/services/CowHealthAnalyzer.ts` — pure, no DB                                         |
| `notifyUsers()`                   | `modules/notifications/application/use-cases/DispatchHealthAlertUseCase.ts`                                    |
| Orchestration entry point         | `IngestTelemetryUseCase.execute()` calls each of the above via interfaces                                      |

**Destination:** `modules/telemetry/`

---

### 3.2 `cowsService.ts` — Infrastructure in the Service Layer (backend)

**Current problem:** `removeCowPhoto()` calls `fs.existsSync` and `fs.unlinkSync` directly — a file system operation in the business logic layer. You cannot test photo removal without the actual disk.

**How it will be split:**

| Piece                                                           | Destination                                                                                         |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| CRUD logic                                                      | `modules/cows/application/use-cases/` (CreateCowUseCase, UpdateCowUseCase, etc.)                    |
| Business rules (tag uniqueness, photo limit, collar assignment) | Same use cases, calling `ICowRepository` interface                                                  |
| File deletion                                                   | `modules/cows/infrastructure/adapters/DiskFileStorageService.ts` implementing `IFileStorageService` |

**Destination:** `modules/cows/`

---

### 3.3 `cowsController.ts` — Multer Configuration in the Presentation Layer (backend)

**Current problem:** The controller defines Multer `storage`, `fileFilter`, and `limits` — infrastructure decisions sitting in a presentation file. The upload configuration cannot be reused and ties the controller to the disk.

**How it will be split:**

| Piece                | Destination                                                    |
| -------------------- | -------------------------------------------------------------- |
| Multer configuration | `modules/cows/infrastructure/adapters/multerUpload.ts`         |
| Controller           | Imports the configured `upload` middleware from infrastructure |

**Destination:** `modules/cows/infrastructure/adapters/`

---

### 3.4 `authService.ts` — Three Responsibilities (backend)

**Current problem:** One file handles authentication (login + JWT), authorization check (`userHasPermission`), and user profile serialization (`getMe`). These are three separate concerns with different change rates.

**How it will be split:**

| Piece                    | Destination                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `login()`                | `modules/auth/application/use-cases/LoginUseCase.ts`                                   |
| JWT signing/verification | `modules/auth/infrastructure/adapters/JwtTokenService.ts` implementing `ITokenService` |
| `userHasPermission()`    | `modules/auth/application/use-cases/CheckPermissionUseCase.ts`                         |
| `getMe()`                | `modules/auth/application/use-cases/GetMeUseCase.ts`                                   |

**Destination:** `modules/auth/`

---

### 3.5 Frontend: Global Services and Types (frontend)

**Current problem:** `src/services/cowsService.ts`, `src/types/cows.ts`, `src/types/farms.ts` are global while the hooks that use them (`features/cows/hooks/useCows.ts`) are feature-scoped. The feature boundary is broken — you can change `cowsService.ts` without touching the `cows` feature folder. Also `src/hooks/useNotifications.ts` belongs to the `notifications` feature but lives globally.

**How it will be split:**

- Move each `src/services/<domain>Service.ts` into `features/<domain>/services/<domain>Service.ts`
- Move each `src/types/<domain>.ts` into `features/<domain>/types/index.ts`
- Move `src/hooks/useNotifications.ts` → `features/notifications/hooks/useNotifications.ts`
- Move `src/context/FarmContext.tsx` → `features/farms/context/FarmContext.tsx`
- Update feature `index.ts` barrels to re-export what other features need

**Destination:** `features/<domain>/`

---

### 3.6 Frontend: Scattered Pages (frontend)

**Current problem:** `src/pages/auth/RegisterPage.tsx` and `src/pages/map/MapPage.tsx` live outside the feature system while every other page is inside `features/`. The inconsistency makes it impossible to reason about ownership from the folder structure.

**How it will be split:**

- `src/pages/auth/RegisterPage.tsx` → `features/auth/pages/RegisterPage.tsx`
- `src/pages/map/MapPage.tsx` + `farmLayouts.ts` → `features/map/pages/MapPage.tsx` + `features/map/data/farmLayouts.ts`
- `src/pages/home/HomePage.tsx` → `features/home/pages/HomePage.tsx`
- `src/pages/profile/ProfilePage.tsx` → `features/profile/pages/ProfilePage.tsx`

---

## Step 4 — Define Contracts

### Backend Repository Interfaces (domain defines, Prisma implements)

```ts
// modules/cows/domain/interfaces/ICowRepository.ts
export interface ICowRepository {
  findAll(farmId?: number): Promise<CowListItem[]>;
  findById(id: number): Promise<Cow | null>;
  findByTag(tag: string): Promise<Cow | null>;
  findByCollarId(collarId: number, excludeId?: number): Promise<Cow | null>;
  create(data: CreateCowInput): Promise<Cow>;
  update(id: number, data: UpdateCowInput): Promise<Cow>;
  delete(id: number): Promise<void>;
  updatePhotos(id: number, photos: string[]): Promise<void>;
}
```

```ts
// modules/cows/domain/interfaces/IFileStorageService.ts
export interface IFileStorageService {
  exists(filename: string): boolean;
  delete(filename: string): void;
}
```

```ts
// modules/telemetry/domain/interfaces/ISensorRepository.ts
export interface ISensorRepository {
  saveHeartRate(cowId: number, bpm: number, measuredAt: Date): Promise<void>;
  saveTemperature(
    cowId: number,
    celsius: number,
    measuredAt: Date,
  ): Promise<void>;
  saveAccelerometer(
    cowId: number,
    data: AccelData,
    measuredAt: Date,
  ): Promise<void>;
  getRecentHeartRate(cowId: number, since: Date): Promise<HeartRateRecord[]>;
  getRecentTemperature(
    cowId: number,
    since: Date,
  ): Promise<TemperatureRecord[]>;
  getRecentAccelerometer(cowId: number, since: Date): Promise<AccelRecord[]>;
}
```

```ts
// modules/auth/domain/interfaces/ITokenService.ts
export interface ITokenService {
  sign(payload: AuthPayload): string;
  verify(token: string): AuthPayload;
}
```

### Application Use Cases

```ts
// modules/cows/application/use-cases/CreateCowUseCase.ts
export class CreateCowUseCase {
  constructor(
    private cowRepo: ICowRepository,
    private collarRepo: ICollarRepository,
    private farmRepo: IFarmRepository,
  ) {}

  async execute(dto: CreateCowDTO): Promise<Cow> {
    const tagConflict = await this.cowRepo.findByTag(dto.tag);
    if (tagConflict)
      throw new ConflictError("Já existe uma vaca com esta tag.");

    const farm = await this.farmRepo.findById(dto.farmId);
    if (!farm) throw new NotFoundError("Fazenda não encontrada.");

    if (dto.collarId) {
      const collar = await this.collarRepo.findById(dto.collarId);
      if (!collar) throw new NotFoundError("Colar não encontrado.");

      const collarInUse = await this.cowRepo.findByCollarId(dto.collarId);
      if (collarInUse)
        throw new ConflictError("Este colar já está vinculado a outra vaca.");
    }

    return this.cowRepo.create(dto);
  }
}
```

```ts
// modules/telemetry/application/use-cases/IngestTelemetryUseCase.ts
export class IngestTelemetryUseCase {
  constructor(
    private collarRepo: ICollarRepository,
    private sensorRepo: ISensorRepository,
    private healthAnalyzer: IHealthAnalyzer,
    private cowRepo: ICowRepository,
    private alertUseCase: DispatchHealthAlertUseCase,
  ) {}

  async execute(body: unknown): Promise<IngestResult> {
    const payload = parseMqttPayload(body); // validation — throws on bad input

    const collar = await this.collarRepo.findByName(payload.device_id);
    if (!collar)
      throw new NotFoundError(`Colar não encontrado: ${payload.device_id}`);
    if (!collar.cow)
      throw new NotFoundError(
        `Nenhuma vaca vinculada ao colar ${payload.device_id}`,
      );

    await this.sensorRepo.saveAll(collar.cow.id, payload);

    const detectedStatus = await this.healthAnalyzer.evaluate(collar.cow.id);

    if (detectedStatus && collar.cow.status !== detectedStatus) {
      await this.cowRepo.updateStatus(collar.cow.id, detectedStatus);
      await this.alertUseCase.execute(collar.cow, detectedStatus);
    }

    return { received: true, cowId: collar.cow.id };
  }
}
```

```ts
// modules/telemetry/domain/services/CowHealthAnalyzer.ts
// Pure domain service — no Prisma, no imports from infrastructure
export class CowHealthAnalyzer implements IHealthAnalyzer {
  evaluate(recentData: CowSensorSnapshot): CowStatus | null {
    if (this.isCalving(recentData)) return CowStatus.CALVING;
    if (this.isHeatStress(recentData)) return CowStatus.HEAT_STRESS;
    return null;
  }

  private isCalving(data: CowSensorSnapshot): boolean {
    return (
      data.posturalChanges > 10 && data.avgHeartRate > 90 && data.tempDelta < 0
    );
  }

  private isHeatStress(data: CowSensorSnapshot): boolean {
    return (
      data.avgTemperature > 39.0 &&
      data.avgHeartRate > 100 &&
      data.restlessPeaks > 15
    );
  }
}
```

### Typed Error Classes (shared)

```ts
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}
```

### Frontend Service Interface

```ts
// features/cows/services/cowsService.ts
// The service is the API gateway. It maps HTTP responses to domain types.
// The hook is the only consumer — never call the service directly from a component.
export const cowsService = {
  list: (filters?: CowFilters) =>
    api.get<CowListItem[]>("/cows", { params: filters }).then((r) => r.data),
  get: (id: string) => api.get<Cow>(`/cows/${id}`).then((r) => r.data),
  create: (dto: CreateCowInput) =>
    api.post<Cow>("/cows", dto).then((r) => r.data),
  update: (id: string, dto: UpdateCowInput) =>
    api.put<Cow>(`/cows/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/cows/${id}`),
};
```

---

## Step 5 — Code Examples (Before and After)

### 5.1 mqttIngestService — the health analysis algorithm

**BEFORE** — domain logic, DB queries, and notification dispatch all entangled in one function:

```ts
// backend/src/services/mqttIngestService.ts — current state
const analyzeHealth = async (cowId: number): Promise<CowStatus | null> => {
  const now = new Date();
  const oneHourAgo   = new Date(now.getTime() - 60 * 60 * 1000);
  const twelveHrsAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  // Directly queries Prisma — cannot be tested without a DB
  const [recentAccel, recentHr, recentTemps] = await Promise.all([
    prisma.accelerometerData.findMany({ where: { cowId, measuredAt: { gte: oneHourAgo } }, ... }),
    prisma.heartRateData.findMany({ ... }),
    prisma.temperatureData.findMany({ ... }),
  ]);

  // Calving detection mixed with query results
  const posturalChanges = recentAccel.reduce(...);
  const avgHr = ...;
  const tempDelta = ...;
  if (posturalChanges > 10 && avgHr > 90 && tempDelta < 0) return CowStatus.CALVING;

  // Heat stress detection queries more Prisma tables mid-function
  const [recentAccelXY, recentTemp30] = await Promise.all([...]);
  ...
  if (avgTemp > 39.0 && avgHr > 100 && restlessPeaks > 15) return CowStatus.HEAT_STRESS;
  return null;
};
```

**AFTER** — pure domain service receives data snapshot, no DB knowledge:

```ts
// modules/telemetry/domain/services/CowHealthAnalyzer.ts
export class CowHealthAnalyzer implements IHealthAnalyzer {
  evaluate(snapshot: CowSensorSnapshot): CowStatus | null {
    if (snapshot.posturalChanges > 10 && snapshot.avgHeartRate > 90 && snapshot.tempDelta < 0) {
      return CowStatus.CALVING;
    }
    if (snapshot.avgTemperature > 39.0 && snapshot.avgHeartRate > 100 && snapshot.restlessPeaks > 15) {
      return CowStatus.HEAT_STRESS;
    }
    return null;
  }
}

// modules/telemetry/infrastructure/repositories/PrismaSensorRepository.ts
export class PrismaSensorRepository implements ISensorRepository {
  async getSensorSnapshot(cowId: number): Promise<CowSensorSnapshot> {
    const now        = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    // all DB queries live here, not in the domain service
    const [accel, hr, temps] = await Promise.all([...]);
    return buildSnapshot(accel, hr, temps);   // pure data mapping
  }
}

// modules/telemetry/application/use-cases/IngestTelemetryUseCase.ts
const snapshot = await this.sensorRepo.getSensorSnapshot(cow.id);
const status   = this.healthAnalyzer.evaluate(snapshot);   // no await — pure function
```

The health algorithm is now a pure function. It can be tested with zero database setup:

```ts
// modules/telemetry/domain/services/CowHealthAnalyzer.test.ts
it("detects calving", () => {
  const analyzer  = new CowHealthAnalyzer();
  const snapshot  = { posturalChanges: 12, avgHeartRate: 95, tempDelta: -0.3, ... };
  expect(analyzer.evaluate(snapshot)).toBe(CowStatus.CALVING);
});
```

---

### 5.2 Thin Controller (Backend)

**BEFORE** — controller owns Multer configuration + dispatches to service with raw body:

```ts
// backend/src/controllers/cowsController.ts — current state
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), "uploads"));
  },
  filename: (_req, file, cb) => {
    cb(null, `cow-${Date.now()}${path.extname(file.originalname)}`);
  },
});
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const storeCow = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await handleRequest(response, () => createCow(request.body), 201);
  // createCow receives raw request.body — no validation, no typed DTO
};
```

**AFTER** — controller only parses, delegates, maps response:

```ts
// modules/cows/presentation/cowsController.ts
export class CowsController {
  constructor(private createCow: CreateCowUseCase) {}

  async store(request: Request, response: Response): Promise<void> {
    const dto = CreateCowDTO.parse(request.body); // Zod parse — throws on invalid input
    const cow = await this.createCow.execute(dto);
    response.status(201).json(cow);
  }
}

// modules/cows/presentation/cowsRoutes.ts — Multer imported from infrastructure
import { cowUpload } from "../infrastructure/adapters/multerUpload";
router.post(
  "/:id/photos",
  requireAuth,
  requirePermission("Update Cow"),
  cowUpload.single("photo"),
  controller.uploadPhoto,
);
```

---

### 5.3 Error Handling (Before and After)

**BEFORE** — `handleRequest` maps any Error to a fixed status code:

```ts
// Any thrown Error → 400, no way to distinguish conflict from bad input
await handleRequest(response, () => createCow(request.body), 201);
```

**AFTER** — typed errors propagate through use cases and are mapped centrally:

```ts
// shared/middlewares/errorHandler.ts
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
};

// controller just throws — no try/catch needed
async store(request: Request, response: Response): Promise<void> {
  const dto = CreateCowDTO.parse(request.body);
  const cow = await this.createCow.execute(dto);   // may throw NotFoundError(404) or ConflictError(409)
  response.status(201).json(cow);
}
```

---

### 5.4 Frontend — Feature-Scoped Services (Before and After)

**BEFORE** — service lives globally, type imported from a separate global folder:

```ts
// frontend/src/features/cows/hooks/useCows.ts — current state
import { cowsService } from "@services/cowsService"; // global services/
import type { CreateCowInput } from "../../../types/cows"; // global types/
```

**AFTER** — service and types are owned by the feature:

```ts
// frontend/src/features/cows/hooks/useCows.ts — after
import { cowsService } from "../services/cowsService"; // feature-local
import type { CreateCowInput } from "../types"; // feature-local
```

The `cows` feature index re-exports what other features need:

```ts
// frontend/src/features/cows/index.ts
export { CowsPage, CowDetailPage } from "./pages";
export type { Cow, CowStatus } from "./types";
// hooks and services are NOT re-exported — they are implementation details
```

---

## Step 6 — Infrastructure Isolation Strategy

### 6.1 Prisma — Repository Pattern

Every service currently imports `prisma` directly. After the refactor, only infrastructure layer files import Prisma:

```ts
// modules/cows/infrastructure/repositories/PrismaCowRepository.ts
import { prisma } from "@shared/lib/prisma";
import type { ICowRepository } from "../../domain/interfaces/ICowRepository";

export class PrismaCowRepository implements ICowRepository {
  async findById(id: number) {
    return prisma.cow.findUnique({ where: { id }, select: { ... } });
  }
  async create(data: CreateCowInput) {
    return prisma.cow.create({ data, select: { ... } });
  }
  // ... other methods
}
```

The use case imports only the interface:

```ts
// modules/cows/application/use-cases/CreateCowUseCase.ts
import type { ICowRepository } from "../../domain/interfaces/ICowRepository";
// prisma is never imported here
```

Swapping MySQL for another database means implementing a new `ICowRepository` — zero changes to the use cases.

### 6.2 JWT / bcrypt — Adapter Pattern

```ts
// modules/auth/infrastructure/adapters/JwtTokenService.ts
import jwt from "jsonwebtoken";
import type { ITokenService } from "../../domain/interfaces/ITokenService";

export class JwtTokenService implements ITokenService {
  sign(payload: AuthPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
  }
  verify(token: string): AuthPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
  }
}
```

`LoginUseCase` depends on `ITokenService` — test it by injecting a `FakeTokenService`.

### 6.3 File Storage — Adapter Pattern

```ts
// modules/cows/domain/interfaces/IFileStorageService.ts
export interface IFileStorageService {
  exists(filename: string): boolean;
  delete(filename: string): void;
}

// modules/cows/infrastructure/adapters/DiskFileStorageService.ts
export class DiskFileStorageService implements IFileStorageService {
  private dir = path.resolve(process.cwd(), "uploads");
  exists(filename: string) {
    return fs.existsSync(path.join(this.dir, filename));
  }
  delete(filename: string) {
    fs.unlinkSync(path.join(this.dir, filename));
  }
}
```

The `RemoveCowPhotoUseCase` depends on `IFileStorageService` — test photo removal with an in-memory fake.

### 6.4 Frontend — Axios as Gateway

The `api` Axios instance in `shared/lib/api.ts` is the only place that knows the base URL and auth header injection. Feature services import `api` but never configure Axios themselves.

```ts
// shared/lib/api.ts
const api = axios.create({ baseURL: environment.apiUrl });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

No feature service ever reads `localStorage` or constructs headers.

---

## Step 7 — Coupling Reduction Strategy

### Backend: Manual Dependency Injection via Factory Functions

No DI framework is needed. Each route file acts as the composition root:

```ts
// modules/cows/presentation/cowsRoutes.ts
import { PrismaCowRepository }   from "../infrastructure/repositories/PrismaCowRepository";
import { PrismaFarmRepository }  from "../../farms/infrastructure/repositories/PrismaFarmRepository";
import { PrismaCollarRepository } from "../../collars/infrastructure/repositories/PrismaCollarRepository";
import { DiskFileStorageService } from "../infrastructure/adapters/DiskFileStorageService";
import { CreateCowUseCase }      from "../application/use-cases/CreateCowUseCase";
import { CowsController }        from "./cowsController";

const cowRepo    = new PrismaCowRepository();
const farmRepo   = new PrismaFarmRepository();
const collarRepo = new PrismaCollarRepository();
const fileStore  = new DiskFileStorageService();

const createCow = new CreateCowUseCase(cowRepo, farmRepo, collarRepo);
const controller = new CowsController(createCow, ...);

router.post("/", requireAuth, requirePermission("Create Cow"), controller.store.bind(controller));
```

**Inversion of control boundaries:**

- Domain layer → no imports from infrastructure
- Application layer → imports only domain interfaces
- Infrastructure layer → imports domain interfaces + external libraries (Prisma, fs, jwt)
- Presentation layer → imports application use cases and infrastructure adapters

### Frontend: No Cross-Feature Service Calls

Features only communicate by publishing to React Query or via shared state (context). A feature hook never imports another feature's service:

```ts
// BAD — creates coupling between features
import { farmsService } from "@features/farms/services/farmsService"; // in cows feature

// GOOD — depend on shared types only; each feature fetches its own data
const { data: farms } = useFarms(); // imported from @features/farms — the hook is the boundary
```

Features import **hooks** from other features (through their index barrel), never services.

### Replace the Two-Argument `handleRequest` with Typed Error Propagation

The current `handleRequest(response, fn, 200, 404)` couples the controller to the error classification (it decides what 404 means). After the refactor, the use case throws `NotFoundError` and the central `errorHandler` maps it. Controllers never see error codes.

---

## Step 8 — Expected Outcome

### Maintainability

**Before:** To understand where calving detection lives, you must open `mqttIngestService.ts` and search through 207 lines. To change the threshold values, you change a file that also touches Prisma and notification dispatch — any error in the edit can break ingestion entirely.

**After:** `CowHealthAnalyzer.ts` is 30 lines of pure comparisons. A vet changes a threshold, a developer reviews a 1-line diff in a file with zero infrastructure risk.

Adding a new sensor type (e.g., rumination data) only touches `ISensorRepository`, `PrismaSensorRepository`, and `CowHealthAnalyzer` — nothing in auth, farms, or dashboard.

### Testability

| Layer            | Testable? Before           | Testable? After                    |
| ---------------- | -------------------------- | ---------------------------------- |
| Health algorithm | No — needs live DB         | Yes — unit test with plain objects |
| Use cases        | No — directly calls Prisma | Yes — inject fake repositories     |
| Controllers      | No — needs Express + DB    | Yes — inject mock use cases        |
| Frontend hooks   | Partial — needs API mock   | Same, but isolated per feature     |

### Scalability

A new module (e.g., `veterinary-records`) is added by creating `modules/veterinary/` with its own domain, application, infrastructure, and presentation. It does not touch any existing module. The same pattern applies on the frontend: `features/veterinary/`.

### Architectural Clarity

A developer joining the project opens `backend/src/modules/` and immediately knows the bounded contexts. Opening `modules/telemetry/` answers: "what does this system do with sensor data." Opening `modules/telemetry/domain/services/CowHealthAnalyzer.ts` answers: "what are the rules for classifying cow health." No grep required.

On the frontend, opening `features/cows/` contains everything you need to understand, modify, and test cow-related functionality: types, API contract, query hooks, components, and pages — nothing outside that folder except shared primitives.

---

## Migration Priority (Suggested Order)

These are not phases to execute all at once — they are ordered by risk and value:

1. **Backend shared errors** — introduce `AppError`, `NotFoundError`, `ConflictError` and replace `handleRequest` with a central `errorHandler`. Zero structural change, immediate improvement in HTTP semantics.

2. **Extract `CowHealthAnalyzer`** — highest-value isolation. Creates the first testable domain service.

3. **Extract repository interfaces for `cows` and `farms`** — enables testing of use cases without Prisma.

4. **Extract `DiskFileStorageService`** — removes `fs` from business logic.

5. **Split `authService.ts`** — `LoginUseCase`, `CheckPermissionUseCase`, `GetMeUseCase`.

6. **Frontend: co-locate services and types inside features** — low risk, high clarity gain. Move `src/services/` and `src/types/` into their feature folders one domain at a time, update imports.

7. **Frontend: move scattered pages** — `RegisterPage`, `MapPage`, `HomePage`, `ProfilePage` into features.

8. **Frontend: move `FarmContext`** — into `features/farms/context/`.
