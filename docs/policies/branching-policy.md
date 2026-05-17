# Branching Policy (Imperative)

This policy is mandatory and must always be followed by all contributors.

## 1. Official Branch Model

The repository must use the following branch roles:

- `main`: production-ready code only.
- `develop`: integration branch for validated development work.
- `feature/*`: new features.
- `bugfix/*`: non-urgent bug fixes.
- `hotfix/*`: urgent production fixes.

No other branch category is allowed for delivery workflows.

## 2. Branch Naming Rules (Mandatory)

Branch names must follow this exact format:

- `feature/<scope>-<short-description>`
- `bugfix/<scope>-<short-description>`
- `hotfix/<scope>-<short-description>`

Examples:

- `feature/frontend-routing-refactor`
- `feature/dashboard-recharts-wrappers`
- `bugfix/auth-login-validation`
- `hotfix/token-refresh-loop`

Forbidden patterns:

- Personal naming as delivery standard (for example, `angelo/*`, `ian/*`, `jcfs/*`) for long-lived integration.
- Generic names such as `test`, `new`, `temp`, `ajuste`.

## 3. Commit Rules (Conventional Commits)

All commits must follow Conventional Commits:

- `feat:`
- `fix:`
- `docs:`
- `style:`
- `refactor:`
- `test:`
- `chore:`

Examples:

- `feat(frontend): centralize app routes in AppRoutes`
- `fix(auth): handle expired token redirect`
- `docs(policies): add mandatory branching policy`

Commits that do not follow this convention must not be merged.

## 4. Pull Request Flow (Mandatory)

Allowed PR directions:

- `feature/*` -> `develop`
- `bugfix/*` -> `develop`
- `hotfix/*` -> `main` and then back-merge to `develop`

Direct PR to `main` is forbidden, except `hotfix/*`.

Cross-person PR flow as default process (for example, `branchA -> branchB`) is forbidden.

## 5. Quality Gates Before PR

Before opening any PR, contributors must run and pass:

1. Frontend lint.
2. Frontend build.
3. Any required tests for the changed scope.

A PR without validation evidence must not be approved.

## 6. Merge and Protection Rules

- `main` and `develop` must be protected branches.
- Direct push to `main` is forbidden.
- Rebase or merge strategy must preserve clear history and traceability.
- Squash merge is recommended when PR includes many intermediate commits.

## 7. Urgent Fix Protocol

For production incidents:

1. Create `hotfix/*` from `main`.
2. Implement minimal safe fix.
3. Open PR to `main`.
4. After merge, back-merge the same fix into `develop` immediately.

Skipping back-merge is forbidden.

## 8. Enforcement

Any branch, commit, or PR that violates this policy must be corrected before merge.

This policy is effective immediately and applies to all active and future work.
