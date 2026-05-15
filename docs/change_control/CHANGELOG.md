# CHANGELOG

## 2026-05-14 - Aplicacao das instrucoes do Professor (Frontend)

Escopo aplicado: apenas `frontend/` (sem alteracoes de estrutura no backend).

### Novos arquivos e pastas

- `frontend/src/routes/`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/config/`
- `frontend/src/config/environment.ts`
- `frontend/src/components/charts/`
- `frontend/src/components/charts/ChartContainer.tsx`
- `frontend/src/components/charts/index.ts`
- `frontend/src/components/common/`
- `frontend/src/components/common/index.ts`
- `frontend/src/components/layout/`
- `frontend/src/components/layout/index.ts`
- `frontend/src/components/feedback/`
- `frontend/src/components/feedback/index.ts`
- `frontend/src/utils/`
- `frontend/src/utils/index.ts`

### Arquivos modificados

- `frontend/src/App.tsx`
  - Arquivo simplificado para composicao de providers globais e roteamento centralizado via `AppRoutes`.

- `frontend/vite.config.ts`
  - Inclusao de `path` e configuracao de aliases:
    - `@`, `@components`, `@features`, `@pages`, `@hooks`, `@services`, `@routes`, `@config`, `@utils`, `@types`.

- `frontend/tsconfig.app.json`
  - Inclusao de `baseUrl` e `paths` para refletir os mesmos aliases do Vite.

- `frontend/src/lib/api.ts`
  - `baseURL` passa a usar `environment.apiUrl` de `src/config/environment.ts`.

- `frontend/.env.example`
  - Inclusao de variaveis padrao:
    - `VITE_API_URL`
    - `VITE_APP_NAME`
    - `VITE_ENV`

### Exclusoes

- Nenhum arquivo removido.

### Conformidade aplicada

- Rotas centralizadas em `src/routes/AppRoutes.tsx`.
- Configuracao de ambiente centralizada em `src/config/environment.ts`.
- Estrutura base proposta pelo professor criada para frontend.
- Placeholders com dependencia cruzada marcados com `TODO[IAN]`, `TODO[ANGELO]` e `TODO[JAFTE]`.
- Base para componentes reutilizaveis (`common`, `layout`, `feedback`) e charts via Recharts (`components/charts`) estabelecida.
