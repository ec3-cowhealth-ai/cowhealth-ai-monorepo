# Dashboard Feature

Dashboard is implemented and should be documented as current behavior, not as a backlog.

## Scope

- KPI cards
- Status and farm charts
- Dashboard data hooks
- Aggregated counts from the backend

## Current Implementation

- The dashboard uses React Query hooks and Recharts.
- KPI cards are driven by the overview endpoint.
- Chart data comes from `cows-per-status` and `cows-per-farm`.
- The hooks accept an optional farm filter when the selected farm is available.

## Related Files

- `src/features/dashboard/components/DashboardKPICard.tsx`
- `src/features/dashboard/components/CowsPerStatusChart.tsx`
- `src/features/dashboard/components/CowsPerFarmChart.tsx`
- `src/features/dashboard/hooks/useDashboard.ts`
- `src/services/dashboardService.ts`
- `src/pages/home/HomePage.tsx`

## When To Update

- If the backend dashboard contract changes, update this file and the architecture docs.
- If the chart set changes, keep this file and the frontend feature index in sync.

