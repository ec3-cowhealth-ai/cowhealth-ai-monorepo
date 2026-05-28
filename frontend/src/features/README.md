# Features

Each feature is a self-contained domain module with its own UI, hooks, services, types, and local documentation.

## Recommended Shape

```text
features/<name>/
|-- components/
|-- hooks/
|-- pages/
|-- services/
|-- types/
|-- README.md
`-- index.ts
```

## Import Rules

- Use shared UI from `src/components/` for reusable building blocks.
- Keep feature-specific code inside the feature folder.
- Move cross-feature logic to `src/hooks/`, `src/services/`, or `src/types/` only when it is truly shared.

## Current Features

- `auth/` - login, register, session bootstrap
- `dashboard/` - KPI cards and charts
- `farms/` - farm management
- `cows/` - cow management and health views
- `collars/` - collar management
- `notifications/` - alert center
- `access/` - users, roles, permissions
- `landing/` - public landing page

## Status Rule

- Feature READMEs should describe the current implementation, not an old TODO list.
- If a feature is still incomplete, say exactly what is missing and who owns it.
- If a feature is stable, keep the README short and current.
