# Plano de Implementação Frontend (Baseado no guia-react-vite.pdf)

Escopo: aplicar somente no `frontend/`, sem mudanças na estrutura de backend.

## 1. Diretrizes extraídas do professor

- Organizar frontend com separação clara por camadas: `components`, `pages`, `hooks`, `services`, `routes`, `config`, `utils`, `styles`, `assets`, `store`.
- Priorizar componentes reutilizáveis e separação entre apresentação e lógica.
- Padronizar aliases de import no Vite.
- Centralizar acesso a variáveis de ambiente.
- Manter checklist operacional (lint, scripts, rotas, estrutura, env).

## 2. Estrutura alvo do frontend (TypeScript)

```text
frontend/
  src/
    assets/
    components/
      common/
      layout/
      feedback/
      charts/
    features/
      auth/
      dashboard/
      farms/
      cows/
      collars/
      notifications/
      access/
    pages/
    hooks/
    services/
    store/
      context/
      reducers/
    routes/
    config/
    lib/
    styles/
    types/
    utils/
    App.tsx
    main.tsx
```

Observações:

- `features/` concentra componentes e regras por domínio (sem backend).
- `components/` fica restrito a elementos compartilhados e agnósticos de domínio.
- `charts/` dentro de `components/` segue a decisão do time de usar `Recharts` no Design System mestre.

## 3. Matriz de implementação por responsável

- Renato: backend completo (responsabilidade total).
- Angelo: `features/auth`, telas de autenticação e registro de usuários.
- Ian: `features/dashboard` e `components/charts` (Recharts).
- Jafte: demais `features/*`, `routes`, `components/common`, `components/layout` e integrações globais.

Regra de dependência cruzada:

- Sempre criar esqueleto com marcação `TODO[NOME]` no ponto de integração pendente.

## 4. Plano de execução por fases

1. Fase 1: Preparação estrutural
- Criar diretórios faltantes em `src/` conforme estrutura alvo.
- Adicionar arquivos `index.ts` nos diretórios compartilhados que exigirem barrel export.
- Não mover backend nem alterar contratos da API nesta fase.

2. Fase 2: Roteamento e organização por domínio
- Criar `src/routes/AppRoutes.tsx` e centralizar definição de rotas.
- Manter `ProtectedRoute` e ajustar imports para nova organização.
- Criar páginas base por domínio com esqueleto e `TODO[NOME]` quando houver dependência entre colegas.

3. Fase 3: Reuso e baixo acoplamento
- Extrair UI repetida para `components/common` e `components/layout`.
- Mover gráficos para `components/charts` com wrappers padronizados.
- Garantir que `services` não importem componentes e que `pages/features` consumam hooks em vez de API direta.

4. Fase 4: Configuração técnica
- Atualizar `vite.config.ts` com aliases (`@`, `@components`, `@pages`, `@hooks`, `@services`, `@utils`, `@config`, `@routes`, `@features`).
- Criar `src/config/environment.ts` para centralizar `import.meta.env`.
- Revisar scripts do frontend (`dev`, `build`, `preview`, `lint` e demais existentes do projeto).

5. Fase 5: Validação
- Rodar lint e build do frontend.
- Validar imports por alias e navegação básica das rotas.
- Confirmar que dashboards usam apenas Recharts através dos wrappers do Design System.

## 5. Checklist frontend

- Estrutura de pastas criada no `frontend/src`.
- Rotas centralizadas em `src/routes`.
- Aliases configurados no `vite.config.ts`.
- `src/config/environment.ts` criado e adotado.
- Componentes reutilizáveis extraídos para `components/common` e `components/layout`.
- Gráficos padronizados em `components/charts` com Recharts.
- Marcações `TODO[NOME]` aplicadas em dependências cruzadas.

## 6. Ordem recomendada para execução imediata

1. Jafte cria estrutura base de diretórios e aliases.
2. Angelo implementa `features/auth` e integra com rotas públicas/privadas.
3. Ian implementa `components/charts` e `features/dashboard`.
4. Jafte integra demais features e remove esqueletos `TODO` concluídos.
