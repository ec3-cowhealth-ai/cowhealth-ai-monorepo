# CHANGELOG

# Alterações e Progresso de JCFS


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


## 2026-05-15 - Landing Page iOS/Android Responsivity + Bug Fixes

Escopo: Landing page iOS/Android optimization, CSS responsividade e correção de funcionalidade.

### Arquivos modificados

- `frontend/index.html`
  - Adicionadas meta tags iOS/Android:
    - `viewport-fit=cover` — Suporte a notch/safe area
    - `theme-color: #131515` — Cor da barra de status (dark)
    - `mobile-web-app-capable: yes` — PWA (novo padrão recomendado)
    - `apple-mobile-web-app-capable: yes` — PWA (compatibilidade Safari)
    - `apple-mobile-web-app-status-bar-style: black-translucent` — Estilo da barra

- `frontend/src/styles/landing.css`
  - Adicionadas regras globais (`html`, `body`, `img`, `svg`, `button`)
  - `body { overscroll-behavior-y: none; }` — Previne scroll elástico no iOS
  - `.stage` — Novo container de viewport com `min-height: 100dvh`
  - `.app` — Atualizado com:
    - `min-height: 100dvh` — Altura dinâmica do viewport (considera address bar)
    - `overflow-y: auto; overflow-x: hidden; scrollbar-width: none;` — Scroll funcional com scrollbar oculta
    - `padding-top: calc(env(safe-area-inset-top, 0px) + var(--s-4));` — Padding superior com suporte a notch
    - `padding-bottom: calc(env(safe-area-inset-bottom, 0px) + var(--s-6));` — Padding inferior com suporte a home indicator
    - `padding-left: env(safe-area-inset-left, 0px);` — Padding para safe area esquerda
    - `padding-right: env(safe-area-inset-right, 0px);` — Padding para safe area direita
  - Adicionadas regras CSS para `body[data-view="phone"]` — Modo preview de dispositivo:
    - `.stage` com `display: grid; place-items: center;` — Centraliza device frame
    - `.app` com `height: 100%; overflow-y: auto;` — Conteúdo scrollável dentro do frame

- `frontend/src/features/landing/pages/LandingPage.tsx`
  - Envolvido conteúdo em `<div className="stage">` — Necessário para viewport management
  - Estrutura agora: `.stage` > `.app` > content sections

### Exclusões

Nenhum arquivo removido.

### Bugs fixados

- **Scroll do mouse não funcionava na landing page**
  - Causa: `overflow-y: auto` estava ausente no CSS do `.app`
  - Solução: Restaurado `overflow-y: auto; overflow-x: hidden;` + `scrollbar-width: none;` para scrollbar invisível

### Conformidade aplicada

- **iOS/Android Safe Area Handling:** Uso de `env(safe-area-inset-*)` para respeitar notches, dynamic islands e home indicators
- **Dynamic Viewport Height:** Substituição de `100vh` por `100dvh` (Dynamic Viewport Height) para lidar com address bar que aparece/desaparece
- **Progressive Web App (PWA):** Meta tags para instalação em home screen de dispositivos móveis
- **Mobile Scroll Behavior:** `overscroll-behavior-y: none` para melhor UX no iOS
- **Design System:** Todos os estilos respeitam CSS variables (cores, tipografia, espaçamento, radii, sombras)
- **Acessibilidade:** Contraste WCAG AA mantido, sem dependência de hover-only states

### Testes

- Build TypeScript: ✅ OK
- Build Vite: ✅ OK (sem erros)
- CSS Validação: ✅ Contém safe-area-inset (4x), 100dvh (2x), overscroll-behavior (1x)
- Meta tags: ✅ Presentes no dist/index.html


# Alterações e Progresso de Angelo

...


# Alterações e Progresso de Ian


...


# Alterações e Progresso de Renato


...
