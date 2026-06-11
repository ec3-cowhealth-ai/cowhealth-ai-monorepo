# Master Plan — Landing Page Redesign
**Date**: 2026-05-25
**Author**: JCFS
**Status**: Planejado

---

## Template Disponível: `HerdHealthInsight`

> **`templates/HerdHealthInsight/`** — landing page completa, ~95% pronta para aproveitamento.

### O que é

Uma landing page independente construída com **TailwindCSS v4 + TanStack Start**, focada em produto/marketing. Possui 10 seções em português, imagens reais, copy validado e estrutura de seções muito mais rica do que a landing atual (que tem apenas 5 seções).

### Stack do template vs. projeto

| Aspecto | Template | Projeto | Compatível? |
|---|---|---|---|
| CSS | Tailwind v4 | Tailwind v4 + CSS custom (`landing.css`) | ✅ Idêntico |
| Icons | lucide-react | lucide-react (`^1.16.0`) | ✅ Idêntico |
| Form | react-hook-form + zod | react-hook-form + zod + @hookform/resolvers | ✅ Idêntico |
| Charts | recharts | recharts | ✅ Idêntico |
| Router | TanStack Start (SSR) | React Router v6 | ⚠️ Só afeta routing (não os componentes) |
| shadcn/ui components | Usa (accordion, dialog, etc.) | Não usa | ⚠️ Componentes `ui/*` não aproveitáveis |
| Color tokens Tailwind | `text-forest`, `bg-card`, `text-signal` | Tokens padrão Tailwind v4 | ⚠️ Tokens customizados precisam ser adicionados |
| Fonts | Inter + Instrument Serif (serif) | Space Grotesk + Manrope (sans) | ⚠️ Visual diferente — adaptar |

> **Conclusão revisada**: a stack é quase idêntica. A adaptação necessária é bem menor do que o estimado inicialmente — **apenas os tokens de cor e fonte precisam ser mapeados**. Os componentes podem ser portados quase diretamente.

---

## Análise de Cherry-Picking

### ✅ Aproveitável quase diretamente

| Item | Arquivo | Esforço |
|---|---|---|
| Copy PT-BR completo | todos os `.tsx` | Zero — copiar e colar |
| Imagens reais | `src/assets/*.jpg` | Zero — copiar para `frontend/src/assets/landing/` |
| SVG inline dos ícones de risco | `Intelligence.tsx` | Zero — inline, sem deps |
| Lógica de scroll do Nav | `Nav.tsx` | Zero — puro React |
| Schema zod + lógica do formulário | `Pilot.tsx` | Zero — zod já está no projeto |
| Dados estruturados (arrays) | todos | Zero — puro JS |
| JSX das seções | todos | **Muito baixo** — Tailwind v4 idêntico; só remapear tokens de cor |
| `SectionHeading` / `Eyebrow` | `Section.tsx` | Baixo — trocar `text-forest` → cor equivalente do projeto |
| `Intelligence.tsx` (cards + badges) | `Intelligence.tsx` | Baixo — badges de severidade usam classes de cor que precisam de mapping |
| `Pilot.tsx` (formulário completo) | `Pilot.tsx` | Baixo — inputs prontos, só ajustar estilo de foco/borda |

### ⚠️ Requer mapeamento de tokens de cor

O template define tokens customizados no `styles.css` que **não existem no projeto**. Para usar as classes como estão, seria necessário adicionar esses tokens ao `index.css` do projeto, OU substituí-los pelos equivalentes:

| Token do template | Equivalente no projeto |
|---|---|
| `text-forest` / `bg-forest` | `text-[#339989]` / `--verdigris` |
| `text-signal` / `bg-signal` | `text-[#7de2d1]` / `--pearl-aqua` |
| `text-cream` | `text-[#fffafb]` / `--snow` |
| `bg-graphite` | `bg-[#2b2c28]` / `--graphite` |
| `bg-background` | `bg-[#131515]` / `--bg-app` |
| `bg-card` | `bg-[#1b1d1d]` / `--bg-elev-1` |
| `bg-gradient-forest` | gradiente `--forest-deep → --forest` |
| `font-display` | `font-['Space_Grotesk']` (sans, não serif) |
| `shadow-elegant` / `shadow-soft` | `--shadow-2` do projeto |

> **Estratégia recomendada**: adicionar os tokens do template ao `index.css` do projeto (mapeados para os valores do design system existente) — isso elimina a necessidade de reescrever classes nos componentes portados.

### ❌ Não aproveitar

| Item | Motivo |
|---|---|
| `components/ui/*` (shadcn) | 60+ arquivos Radix/shadcn — nosso projeto não usa |
| `styles.css` do template | Não importar — apenas referenciar os tokens para mapeamento |
| `@tanstack/react-start` setup | SSR — não usamos |
| `--font-display: Instrument Serif` | Serif — visual incompatível com Space Grotesk do projeto |

---

## Impacto no Escopo: Expansão de Seções

O template revela que a landing atual está **muito aquém** do potencial. A comparação de seções:

| Seção | Landing atual | Template | Ação recomendada |
|---|---|---|---|
| Nav/Header | Brand strip (estático) | Nav com scroll behavior | Substituir → aproveitar lógica de scroll |
| Hero | ✅ Existe | Hero com foto fullscreen | Enriquecer com `hero-cow.jpg` |
| Problem | ❌ Ausente | 3 cards de problema | **Criar nova seção** |
| Solution | Features (genérico) | 3 steps (Sentir/Analisar/Alertar) + pipeline | **Substituir ou enriquecer** |
| Collar/Produto | ❌ Ausente | Foto da coleira + lista de specs | **Criar nova seção** |
| Intelligence | ❌ Ausente | 7 cards de risco com severidade | **Criar nova seção** |
| Dashboard preview | ❌ Ausente | Screenshot + 8 feature pills | **Criar nova seção** (ou usar AppPreview) |
| Value/Negócio | ❌ Ausente | 4 cards sobre ROI/bem-estar | **Criar nova seção** |
| Trust/Ciência | ❌ Ausente | Princípios + tech stack | **Criar nova seção** |
| CTA/Pilot | ✅ Existe (simplificado) | Formulário completo com zod | Enriquecer com formulário |
| Footer | ✅ Existe | Footer com colunas + tagline | Enriquecer |

**Conclusão**: o template basicamente entrega uma landing page completa — o trabalho principal é a **adaptação de estilo** (Tailwind → CSS vars), não a criação de conteúdo.

---

## Objetivo (revisado)

Redesenhar a landing page pública (`/`) para elevar a percepção de qualidade do produto. O foco é adicionar uma seção de preview com **mockups 3D de celular** exibindo telas reais do app — padrão visual comum em startups de referência (Stripe, Linear, Vercel).

---

## Estado Atual

A landing page (`frontend/src/features/landing/pages/LandingPage.tsx`) possui 5 seções:

1. Brand strip (cabeçalho sticky)
2. Hero (título, subtítulo, CTAs)
3. Features (3 cards: monitorar, alertas, relatórios)
4. CTA (cadastro, agendar demo, trust row)
5. Footer

**Problema**: nenhuma seção exibe o app em si. O usuário não vê como o produto se parece antes de se cadastrar.

---

## O que Será Construído

### Nova Seção: `AppPreviewSection`

Inserida **entre FeaturesSection e CTASection**.

**Layout**: Três celulares em cena 3D via CSS perspective:

| Posição | Tela | Transform |
|---------|------|-----------|
| Esquerda | AlertsScreen | `rotateY(20deg) rotateX(4deg) scale(0.88)` |
| Centro | HomeScreen | `rotateY(0) scale(1)` — ponto focal |
| Direita | CowDetailScreen | `rotateY(-20deg) rotateX(4deg) scale(0.88)` |

**Copy da seção:**
- Eyebrow: `PLATAFORMA`
- Título: `Tudo que você precisa, na palma da mão.`
- Subtítulo: `Monitore, receba alertas e acompanhe o histórico de cada animal — de qualquer lugar.`

---

## Arquivos a Criar / Modificar

### 1. CRIAR — `frontend/src/features/landing/components/AppPreviewSection.tsx`

Componentes:

#### `PhoneMockup`
Frame estilo iPhone adaptado do template `templates/NewCowHealthAI/components.jsx`:
- Props: `children`, `label`, `tilt?: "left" | "center" | "right"`
- Inline: bezel arredondado, dynamic island, status bar, home indicator
- **Sem dependências externas** — tudo inline

#### `ScreenHome`
Conteúdo faux (dados estáticos, sem API):
- Card de saúde do rebanho com score `92/100`
- Barra de progresso preenchida a 92%
- 3 KPI pills: Saudáveis (142) / Atenção (8) / Crítico (2)
- Row de ações rápidas: Mapa, Alertas, Relatório

#### `ScreenAlerts`
- Título "Alertas"
- 4 cards com borda esquerda color-coded:
  - 🌡️ Febre detectada — Vaca #A-041 · 39.8°C · há 3 min → `danger`
  - 💓 FC elevada — Vaca #B-017 · 98 bpm · há 12 min → `warning`
  - ✅ Recuperada — Vaca #C-008 · normal · há 1h → `success`
  - 🏃 Atividade baixa — Vaca #A-029 · 12 passos/h · há 2h → `warning`

#### `ScreenCowDetail`
- Header: avatar 🐄 + nome "Estrela #A-041" + meta (Holandesa · 4 anos · 650 kg)
- Arc SVG de risco de saúde: **70% · Alto** (stroke laranja)
- 3 vital chips: Temp 39.8°C (danger) / FC 78 bpm / Atividade 18/h (warning)
- Mini sparkline SVG de temperatura 24h (linha ascendente em laranja)

---

### 2. EDITAR — `frontend/src/features/landing/components/index.ts`

```ts
export { AppPreviewSection } from "./AppPreviewSection";
```

### 3. EDITAR — `frontend/src/features/landing/pages/LandingPage.tsx`

```tsx
<FeaturesSection showLiveVitals={true} />

<AppPreviewSection />   {/* ← INSERIR AQUI */}

<CTASection ... />
```

### 4. EDITAR — `frontend/src/styles/landing.css`

Adicionar no final do arquivo:

```css
/* ═══════════════════════════════════════════════════════════════════
   APP PREVIEW SECTION — 3D Phone Mockups
   ═══════════════════════════════════════════════════════════════════ */

/* Section wrapper */
.app-preview-section {
  padding: var(--s-9) var(--s-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-8);
  overflow: hidden;
}

/* Copy block */
.app-preview-copy {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  max-width: 480px;
}
.section-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--t-xs);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.app-preview-title {
  font-family: var(--font-display);
  font-size: var(--t-h1);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
  text-wrap: balance;
}
.app-preview-subtitle {
  font-size: var(--t-body);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 3D stage */
.phone-stage {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: var(--s-6);
  perspective: 1400px;
  width: 100%;
}

/* Phone wrappers */
.phone-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}
.phone-wrap--left {
  transform: rotateY(20deg) rotateX(4deg) scale(0.88);
}
.phone-wrap--center {
  transform: rotateY(0deg) scale(1);
}
.phone-wrap--right {
  transform: rotateY(-20deg) rotateX(4deg) scale(0.88);
}
.phone-wrap:hover {
  transform: rotateY(0deg) rotateX(0deg) scale(1) !important;
}

/* Phone frame */
.phone-frame {
  width: 220px;
  height: 476px;           /* 220 * (844/390) */
  border-radius: 32px;
  background: #0d0f0f;
  box-shadow:
    inset 0 0 0 1.5px rgba(255, 250, 251, 0.12),
    0 40px 80px rgba(0, 0, 0, 0.7),
    0 4px 12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 4px 8px;
  gap: 0;
  position: relative;
}
.phone-island {
  width: 72px;
  height: 20px;
  background: #0d0f0f;
  border-radius: 10px;
  flex-shrink: 0;
  margin-bottom: 4px;
  box-shadow: inset 0 0 0 1px rgba(255,250,251,0.08);
}
.phone-screen {
  flex: 1;
  width: 100%;
  border-radius: 26px;
  overflow: hidden;
  background: var(--bg-app);
}
.phone-home-bar {
  width: 80px;
  height: 4px;
  background: rgba(255, 250, 251, 0.22);
  border-radius: 2px;
  margin-top: 6px;
  flex-shrink: 0;
}

/* Phone label */
.phone-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* ── Screen content (scaled ~0.564x from 390px base) ─────────────── */

.ps-screen {
  width: 100%;
  height: 100%;
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  padding: 6px 8px 8px;
  box-sizing: border-box;
  overflow: hidden;
  gap: 6px;
}

/* Status bar */
.ps-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  height: 14px;
  flex-shrink: 0;
}
.ps-time {
  font-family: var(--font-display);
  font-size: 8px;
  font-weight: 700;
  color: var(--text-primary);
}
.ps-status-icons {
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

/* ── HomeScreen ───────────────────────────────────────────────────── */
.ps-greeting {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ps-greeting-label {
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 700;
  color: var(--text-primary);
}
.ps-greeting-date {
  font-family: var(--font-mono);
  font-size: 7px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

.ps-score-card {
  background: linear-gradient(135deg, rgba(51,153,137,0.18), rgba(51,153,137,0.04));
  border: 1px solid rgba(51,153,137,0.25);
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ps-score-label {
  font-family: var(--font-mono);
  font-size: 7px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.ps-score-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.ps-score-num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}
.ps-score-den {
  font-family: var(--font-display);
  font-size: 10px;
  color: var(--text-muted);
}
.ps-score-bar {
  height: 3px;
  background: rgba(255,250,251,0.1);
  border-radius: 2px;
  overflow: hidden;
}
.ps-score-fill {
  height: 100%;
  background: var(--verdigris);
  border-radius: 2px;
}
.ps-score-badge {
  font-family: var(--font-mono);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}

.ps-kpi-row {
  display: flex;
  gap: 4px;
}
.ps-kpi {
  flex: 1;
  background: var(--bg-elev-1);
  border-radius: 7px;
  padding: 5px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--border-subtle);
}
.ps-kpi-val {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}
.ps-kpi-lbl {
  font-family: var(--font-mono);
  font-size: 6px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ps-kpi--success .ps-kpi-val { color: var(--success); }
.ps-kpi--warning .ps-kpi-val { color: var(--warning); }
.ps-kpi--danger .ps-kpi-val  { color: var(--danger); }

.ps-section-label {
  font-family: var(--font-mono);
  font-size: 7px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.ps-actions-row {
  display: flex;
  gap: 4px;
}
.ps-action-btn {
  flex: 1;
  background: var(--bg-elev-1);
  border: 1px solid var(--border-subtle);
  border-radius: 7px;
  padding: 5px 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: default;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 6.5px;
}
.ps-action-icon { font-size: 10px; }

/* ── AlertsScreen ─────────────────────────────────────────────────── */
.ps-screen-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}
.ps-alert-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}
.ps-alert-card {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: var(--bg-elev-1);
  border-radius: 7px;
  padding: 6px 7px;
  border-left: 3px solid transparent;
}
.ps-alert-card--danger  { border-left-color: var(--danger); }
.ps-alert-card--warning { border-left-color: var(--warning); }
.ps-alert-card--success { border-left-color: var(--success); }
.ps-alert-icon { font-size: 10px; flex-shrink: 0; margin-top: 1px; }
.ps-alert-body { display: flex; flex-direction: column; gap: 1px; }
.ps-alert-title {
  font-family: var(--font-display);
  font-size: 8px;
  font-weight: 600;
  color: var(--text-primary);
}
.ps-alert-sub {
  font-family: var(--font-body);
  font-size: 7px;
  color: var(--text-secondary);
}
.ps-alert-time {
  font-family: var(--font-mono);
  font-size: 6px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

/* ── CowDetailScreen ──────────────────────────────────────────────── */
.ps-cow-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ps-cow-avatar {
  font-size: 18px;
  background: var(--bg-elev-1);
  border-radius: 8px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.ps-cow-name {
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 700;
  color: var(--text-primary);
}
.ps-cow-meta {
  font-family: var(--font-body);
  font-size: 7px;
  color: var(--text-muted);
}

.ps-risk-card {
  background: var(--bg-elev-1);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border: 1px solid var(--border-subtle);
}
.ps-risk-label {
  font-family: var(--font-mono);
  font-size: 7px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  align-self: flex-start;
}
.ps-risk-arc { display: flex; justify-content: center; }
.ps-risk-badge {
  font-family: var(--font-mono);
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}
.ps-risk-badge--high {
  background: rgba(232, 124, 92, 0.15);
  color: var(--danger);
}

.ps-vitals-grid {
  display: flex;
  gap: 4px;
}
.ps-vital-chip {
  flex: 1;
  background: var(--bg-elev-1);
  border: 1px solid var(--border-subtle);
  border-radius: 7px;
  padding: 5px 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.ps-vital-icon { font-size: 9px; }
.ps-vital-val {
  font-family: var(--font-display);
  font-size: 8px;
  font-weight: 700;
  color: var(--text-primary);
}
.ps-vital-val--danger  { color: var(--danger); }
.ps-vital-val--warning { color: var(--warning); }
.ps-vital-lbl {
  font-family: var(--font-mono);
  font-size: 6px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ps-chart-label {
  font-family: var(--font-mono);
  font-size: 7px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
.ps-sparkline {
  background: var(--bg-elev-1);
  border-radius: 7px;
  padding: 6px;
  border: 1px solid var(--border-subtle);
}

/* ── Responsive ───────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .phone-stage {
    flex-direction: column;
    align-items: center;
    gap: var(--s-6);
    perspective: none;
  }
  .phone-wrap--left,
  .phone-wrap--right {
    display: none;
  }
  .phone-wrap--center {
    transform: none;
  }
}
```

---

## Dimensionamento

- Frame: `220px` largura × `476px` altura (ratio iPhone 390×844)
- Scale factor vs template: `220/390 ≈ 0.564`
- Fontes de tela: 6–11px (proporcional ao scale)
- Hover no phone: reseta o tilt para `rotateY(0) scale(1)` — micro-interação

---

## Reuso do Design System

| Token usado | Onde |
|---|---|
| `--col-primary / --verdigris` | score bar, badge, KPI success |
| `--col-accent / --pearl-aqua` | score number |
| `--col-danger` | alert border, risk arc, temp vital |
| `--col-warning` | alert border, activity vital |
| `--col-success` | alert border, KPI success |
| `--bg-elev-1 / --bg-elev-2` | cards de tela |
| `--font-display / --font-body / --font-mono` | todos os textos |
| `.pulse-dot` | (disponível para uso futuro em ScreenHome) |

---

## Checklist de Verificação

- [ ] `cd frontend && npm run dev` — sem erros TypeScript
- [ ] Navegar para `/` — nova seção visível entre Features e CTA
- [ ] Desktop (>1024px): 3 celulares com perspectiva 3D correta
- [ ] Mobile (≤768px): apenas o celular central aparece, sem overflow horizontal
- [ ] Hover no celular: remove o tilt suavemente (transition 0.4s)
- [ ] Conteúdo das telas é legível e alinhado ao tema dark/verde

---

## Dependências / Bloqueios

- Nenhuma nova dependência externa necessária para AppPreviewSection
- Template `templates/HerdHealthInsight/` usado como fonte de conteúdo — **não importado diretamente**
- Dados das telas são 100% estáticos (sem hooks, sem API calls)
- Para o formulário do Pilot: `zod` já está no frontend (`@hookform/resolvers` usa zod internamente — confirmar se zod está em `package.json` antes de implementar)

---

## Estratégia de Implementação (faseada)

O template HerdHealthInsight muda o escopo de "adicionar uma seção" para "redesenhar a landing page completa". Proposta de fases:

### Fase 1 — AppPreviewSection (escopo original deste plano)
Conforme detalhado acima: `AppPreviewSection` com 3 phones 3D, inserida entre Features e CTA.
**Fonte do template**: sem aproveitamento direto nesta fase (telas são faux data).

### Fase 2 — Enriquecer seções existentes com assets reais
Usar as 4 imagens do template:
- `hero-cow.jpg` → Hero como fundo fullscreen (substituir visual atual)
- `dashboard.jpg` → Nova seção Dashboard ou enriquecer FeaturesSection
- `collar.jpg` → Nova seção Produto/Coleira
- `herd.jpg` → Seção Value (fundo com overlay)

**Fonte**: copiar `templates/HerdHealthInsight/src/assets/*.jpg` → `frontend/src/assets/landing/`

### Fase 3 — Novas seções (cherry-pick de conteúdo)
Criar as seções ausentes usando o copy e estrutura do template, adaptando estilos:

| Componente novo | Fonte | Copy reutilizável |
|---|---|---|
| `ProblemSection.tsx` | `Problem.tsx` | Cards: "Sinais ocultos", "Intervenção tardia", "Perdas de produtividade" |
| `SolutionSection.tsx` (substituir Features) | `Solution.tsx` | Steps: Sentir / Analisar / Alertar + pipeline |
| `CollarSection.tsx` | `Collar.tsx` | 8 specs da coleira + foto + status badge |
| `IntelligenceSection.tsx` | `Intelligence.tsx` | 7 cards de risco + SVG icons + severidade |
| `ValueSection.tsx` | `Value.tsx` | 4 cards numerados + foto herd.jpg |
| `TrustSection.tsx` | `Trust.tsx` | Princípios (5 items) + tech stack (7 items) |

**Adaptação necessária**: mínima — os componentes usam Tailwind v4 idêntico. O principal trabalho é remapear tokens de cor (ex: `text-forest` → `text-[#339989]`) e fonte (`font-display` → Space Grotesk). Se os tokens forem adicionados ao `index.css` na Fase 0, os componentes são portados praticamente sem alteração de classes.

### Fase 4 — Formulário de Piloto
Substituir `CTASection` pelo formulário completo do template (`Pilot.tsx`):
- Reutilizar: schema zod, lógica de validação, estado `sent/errors`
- Reescrever: inputs com classes CSS do projeto (sem shadcn)
- Adicionar: tags de programa piloto ("Implantação piloto", "Onboarding veterinário", "Suporte dedicado")

### Fase 5 — Nav com scroll behavior
Substituir brand strip estático pelo `Nav` com transparência/blur on scroll:
- Reutilizar: lógica `useState + useEffect + window.scroll`
- Adaptar: links para seções, CTA button com tokens CSS do projeto
- Adicionar: links de seções (`#product`, `#technology`, `#dashboard`, `#welfare`, `#pilot`)

---

## Estimativa de Esforço

| Fase | Componentes | Esforço estimado |
|---|---|---|
| 0 — Token bridge | Adicionar tokens do template ao `index.css` | ~20 linhas CSS |
| 1 — AppPreviewSection | 1 novo componente + CSS | ~250 linhas |
| 2 — Assets | Copiar 4 imagens + ajustar Hero | Muito baixo |
| 3 — Novas seções (6) | Port quase direto de `Problem`, `Solution`, `Collar`, `Intelligence`, `Value`, `Trust` | ~80 linhas cada (sem reescrever classes) |
| 4 — Formulário Pilot | Port de `Pilot.tsx` — lógica reutilizável, só ajustar estilo de inputs | ~130 linhas |
| 5 — Nav | Port de `Nav.tsx` — lógica de scroll reutilizável diretamente | ~70 linhas |
| **Total** | **9 componentes novos/modificados** | **~800 linhas** |

> A Fase 0 (token bridge) é pré-requisito para as Fases 3–5 e elimina a necessidade de reescrever classes nos componentes portados. As demais fases são independentes entre si.

---
