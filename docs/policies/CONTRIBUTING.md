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
- **Const-enum objects in `src/types/` must be named in `UPPER_SNAKE_CASE`** (e.g. `COW_STATUS_VALUES`, not `CowStatusValues`). This is enforced by ESLint — `npm run lint` will fail otherwise. See [`docs/references/code-style.md`](../references/code-style.md) for the full pattern.

## 7. Branch Protection and Merge

- Protect `main` and `develop`.
- Forbid direct push to `main`.
- Prefer squash merge for noisy PR histories.

## 8. CHANGELOG Updates (Mandatory)

Every significant change must be documented in the CHANGELOG:

### Location
- File: `docs/change_control/CHANGELOG.md`
- Your section: `# Alterações e Progresso de <SEU_NOME>`

### How to Update

1. **Locate your section** in the CHANGELOG by your name
2. **Add a date header** using format: `## YYYY-MM-DD - <Brief Title>`
3. **Organize content** using these subsections as needed:
   - `### Novos arquivos e pastas` — List all new files/directories
   - `### Arquivos modificados` — List modified files with brief explanation
   - `### Exclusões` — Files/directories removed
   - `### Conformidade aplicada` — What standards/patterns were followed
   - `### Bugs fixados` — Bug fixes (if any)
   - `### Testes` — New test coverage (if any)

### Example Format

```markdown
## 2026-05-15 - Landing Page iOS/Android Responsivity

Scope: Frontend landing page iOS/Android optimization + bug fixes.

### Novos arquivos e pastas
- None (refactoring existing files)

### Arquivos modificados
- `frontend/index.html`
  - Added iOS/Android meta tags (viewport-fit, theme-color, mobile-web-app-capable)

- `frontend/src/styles/landing.css`
  - Added safe-area-inset padding for notch support
  - Replaced 100vh with 100dvh for dynamic viewport height
  - Added body[data-view="phone"] CSS for device frame preview

- `frontend/src/features/landing/pages/LandingPage.tsx`
  - Wrapped content in .stage div for proper viewport management
  - Fixed scroll wheel functionality (overflow-y: auto)

### Exclusões
None.

### Bugs fixados
- Fixed scroll wheel (rolo do mouse) not working on landing page
  - Issue: overflow-y: auto was missing from .app CSS
  - Solution: Restored overflow-y: auto; overflow-x: hidden; scrollbar-width: none;

### Conformidade aplicada
- iOS/Android safe area handling via env(safe-area-inset-*)
- Dynamic viewport height (100dvh) support for address bar
- Progressive Web App (PWA) meta tags for installability
- Mobile scroll behavior (overscroll-behavior-y: none)
```

**Commit message example:**
```
docs(changelog): update JCFS progress with landing page iOS/Android changes
```

## 9. Enforcement

Non-compliant branches, commits, PRs, or undocumented CHANGELOG entries must be corrected before merge.
