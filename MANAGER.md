# MANAGER

Operational quality guide for the repository.

## Purpose

Use this file as the working checklist for code and doc changes. For the current documentation model, start with [docs/README.md](/docs/README.md).

## Read Order

1. [README.md](/README.md)
2. [docs/README.md](/docs/README.md)
3. [agents/agents.md](/agents/agents.md)
4. [agents/design.md](/agents/design.md)
5. [docs/architecture/frontend-architecture.md](/docs/architecture/frontend-architecture.md)
6. [docs/architecture/backend-architecture.md](/docs/architecture/backend-architecture.md)

## Before Coding

- Check the current source-of-truth docs.
- Confirm the target workspace and branch.
- Prefer existing patterns over creating new ones.

## Required Validation

- Frontend: `npm run lint`, `npm run build`
- Backend: `npm run lint`, `npm run build`
- Run `npm run format` when the change touches many files or when formatting is intentionally part of the work.

## Documentation Rules

- Update the source-of-truth docs when behavior changes.
- Use [docs/change_control/CHANGELOG.md](/docs/change_control/CHANGELOG.md) for significant changes.
- Keep historical plans and reviews in their own files instead of mixing them into current guidance.

## Branching

- Follow [docs/policies/branching-policy.md](/docs/policies/branching-policy.md) and [docs/policies/CONTRIBUTING.md](/docs/policies/CONTRIBUTING.md).

## Review Standard

- Prefer small, reviewable changes.
- Flag security, auth, validation, and data-scope regressions explicitly.
- Treat docs that conflict with the repo as stale and update them or mark them historical.

