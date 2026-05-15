# CONTRIBUTING

This document defines mandatory contribution rules for this repository.

## 1. Branching Model

Allowed branch roles:

- `main` (production only)
- `develop` (integration)
- `feature/*` (new features)
- `bugfix/*` (bug fixes)
- `hotfix/*` (urgent production fixes)

## 2. Branch Naming (Mandatory)

Use one of these formats:

- `feature/<scope>-<short-description>`
- `bugfix/<scope>-<short-description>`
- `hotfix/<scope>-<short-description>`

Examples:

- `feature/frontend-routing-refactor`
- `feature/dashboard-recharts-wrappers`
- `bugfix/auth-login-validation`
- `hotfix/token-refresh-loop`

## 3. Commit Convention (Mandatory)

Use Conventional Commits:

- `feat:`
- `fix:`
- `docs:`
- `style:`
- `refactor:`
- `test:`
- `chore:`

Examples:

- `feat(frontend): centralize routes in AppRoutes`
- `docs(policies): add contribution workflow`

## 4. Pull Request Rules

Allowed PR targets:

- `feature/*` -> `develop`
- `bugfix/*` -> `develop`
- `hotfix/*` -> `main` (then back-merge to `develop`)

Forbidden:

- Direct delivery PR from personal branch naming as team standard.
- Direct PR to `main` except `hotfix/*`.

## 5. Required Validation Before PR

Run and pass before opening PR:

1. `npm run lint` (frontend)
2. `npm run build` (frontend)
3. Scope tests when available

## 6. Frontend Architecture Constraints

- New shared types must be created in `src/types/` (or feature `types/`), never inlined in component/page/service files.
- Follow strict SRD (single-responsibility discipline) for modules and type definitions.
- Use `Recharts` for all charts through shared chart wrappers/components.
- Use `TODO[NOME]` markers for cross-owner integration points.

## 7. Branch Protection and Merge

- Protect `main` and `develop`.
- Forbid direct push to `main`.
- Prefer squash merge for noisy PR histories.

## 8. Enforcement

Non-compliant branches, commits, or PRs must be corrected before merge.
