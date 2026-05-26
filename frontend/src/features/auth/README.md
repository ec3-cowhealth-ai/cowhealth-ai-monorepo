# Auth Feature

Auth is implemented and should be documented as current behavior, not as a task list.

## Scope

- Login and registration forms
- Session bootstrap and logout
- Protected routing
- Shared auth hooks and services

## Current Implementation

- `LoginForm` and `RegisterForm` use React Hook Form + Zod.
- `useAuth.ts` exposes the auth flow used across the app.
- `authService.ts` handles the HTTP calls for login, register, and me.
- The token is currently persisted in `localStorage` and read by the API client.

## Related Files

- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/RegisterForm.tsx`
- `src/hooks/useAuth.ts`
- `src/services/authService.ts`
- `src/pages/auth/LoginPage.tsx`
- `src/pages/auth/RegisterPage.tsx`

## When To Update

- If the auth contract changes, update this file and the frontend architecture doc.
- If the token storage strategy changes, update the auth docs and the API client docs together.
