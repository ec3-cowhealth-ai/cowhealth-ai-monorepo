# Feature: Landing

Componentes e lógica da página de landing (pública, sem autenticação necessária).

## Estrutura

- `components/` — Componentes reutilizáveis da landing (Hero, Features, CTA, Footer)
- `hooks/` — Custom hooks para gerenciar estado da landing (ex: tweaks/variações)
- `pages/` — Página principal da landing
- `styles/` — CSS específico (incluído em `src/styles/landing.css`)

## Componentes

### Hero

Seção principal com título, subtítulo, visualização e CTAs.

### Features

Cards com ícones, títulos, descrições e dados ao vivo (opcional).

### CTA

Call-to-action card com mensagem e botões de ação.

### Footer

Rodapé com links institucionais e copyright.

## Responsável

Jcfs (conforme matriz de responsabilidades)

## Notas

- A landing é **pública** — não requer autenticação.
- Usa design system de `agents/design.md`.
- Paleta fixa em `src/styles/landing.css` (variáveis CSS).
- Componentes opcionais: tweaks para A/B testing.
