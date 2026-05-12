# CowHealth AI — Design System

> Sistema de design para um app mobile de monitoramento contínuo de saúde bovina via coleira inteligente. Dark-first, projetado para uso em campo: alto contraste, áreas de toque generosas, densidade de dados controlada.

**Versão:** 1.0 · **Plataforma alvo:** iOS (iPhone 14/15 Pro — 390×844) · **Idioma:** PT-BR · **Tema:** Dark · **Última atualização:** 2026-05-08

---

## 1. Princípios de design

Cinco princípios não-negociáveis. Toda decisão de UI deve poder ser justificada por pelo menos um deles.

| # | Princípio | O que significa na prática |
|---|---|---|
| 1 | **Campo antes de tela** | O usuário pode estar de luva, ao sol, com pouco sinal. Tap targets ≥ 48px, contraste ≥ AA, sem hover-only states, modo offline declarado. |
| 2 | **Dado bruto, não decoração** | Gráficos e tabelas são protagonistas. Nada de gradientes ornamentais, nada de "glassmorphism" gratuito. Cor tem função. |
| 3 | **Triagem por severidade** | Sempre que houver alerta, ele dita a hierarquia da tela. Crítico > Atenção > Info > Conteúdo regular. |
| 4 | **Três cliques, no máximo** | Da Home até qualquer dado individual de qualquer animal: 3 toques. Atende RNFU2. |
| 5 | **Honestidade do estado** | Loading mostra skeleton (não spinner anônimo); offline é declarado, não escondido; erros oferecem ação. |

---

## 2. Cor

### 2.1 Paleta primária (marca)

| Token | Hex | Função |
|---|---|---|
| `--onyx` | `#131515` | Background principal · texto inverso |
| `--graphite` | `#2B2C28` | Superfícies elevadas em dark |
| `--verdigris` | `#339989` | **Primária** — CTAs, links, brand |
| `--pearl-aqua` | `#7DE2D1` | **Accent** — destaques, highlights de dado, estados ativos |
| `--snow` | `#FFFAFB` | Texto sobre dark · background light |

### 2.2 Superfícies (dark-first)

```css
--bg-canvas:  #0B0D0D;  /* canvas externo, mais profundo que --bg-app */
--bg-app:     #131515;  /* fundo do app (Onyx puro) */
--bg-elev-1:  #1B1D1D;  /* card padrão */
--bg-elev-2:  #2B2C28;  /* card sobre card · input */
--bg-elev-3:  #36383A;  /* tooltip · menu flutuante */
```

A elevação é comunicada **só por valor de cor** (nada de borda branca espessa nem sombra colorida). Uma sombra muito sutil (`--shadow-1`) reforça apenas o nível 1.

### 2.3 Bordas

```css
--border-subtle: rgba(255, 250, 251, 0.06);  /* divisores internos */
--border:        rgba(255, 250, 251, 0.12);  /* card · input em repouso */
--border-strong: rgba(255, 250, 251, 0.22);  /* input em foco · seleção */
```

### 2.4 Texto

| Token | Valor | Uso |
|---|---|---|
| `--text-primary` | `#FFFAFB` | títulos, dados primários |
| `--text-secondary` | `rgba(255,250,251,0.66)` | corpo, labels |
| `--text-muted` | `rgba(255,250,251,0.42)` | meta, placeholder, disabled |
| `--text-inverse` | `#131515` | texto sobre Verdigris/Pearl Aqua |

### 2.5 Papéis de marca

```css
--primary:        #339989;
--primary-hover:  #2C857A;
--primary-soft:   rgba(51,153,137,0.16);   /* fundo de chip/badge primário */
--primary-on:     #FFFAFB;                  /* texto sobre primary */

--accent:         #7DE2D1;
--accent-soft:    rgba(125,226,209,0.18);
--accent-on:      #131515;                  /* texto sobre accent */
```

### 2.6 Cores semânticas (derivadas, harmônicas)

Cores semânticas evitam o vermelho/verde de farmácia digital — elas são **terrosas** para combinar com o Onyx e o ambiente rural.

| Token | Hex | Uso |
|---|---|---|
| `--danger` | `#E87C5C` | febre, erro crítico, alerta vermelho |
| `--danger-strong` | `#C9613F` | borda/ícone sobre fundo claro |
| `--warning` | `#E8C66B` | atenção, ruminação baixa, bateria |
| `--success` | `#7DE2D1` | OK, dentro da norma — reusa Pearl Aqua |
| `--info` | `#6BB4E8` | dica, alerta de sistema |

Cada uma tem versão `-soft` (alpha 14–18%) para fundo de chip/banner.

### 2.7 Mapeamento alerta → cor

| Severidade | Cor de fundo | Cor de borda/texto | Ícone |
|---|---|---|---|
| Crítico | `--danger-soft` | `--danger` | triângulo |
| Atenção | `--warning-soft` | `--warning` | sino |
| Info | `--info-soft` | `--info` | i |
| Sucesso | `--success-soft` | `--success` | check |

### 2.8 Acessibilidade

- Todos os pares texto/fundo respeitam **WCAG AA mínimo (4.5:1 normal, 3:1 large)**.
- Verdigris sobre Onyx: 4.6:1 ✓
- Pearl Aqua sobre Onyx: 11.8:1 ✓
- Snow sobre Onyx: 15.2:1 ✓
- **Nunca** usar Verdigris como texto pequeno sobre `--bg-elev-2`. Use Pearl Aqua.

---

## 3. Tipografia

### 3.1 Famílias (Google Fonts)

| Família | Papel | Por quê |
|---|---|---|
| **Space Grotesk** | Display, headings, números grandes | Geometria precisa + personalidade técnica. Letterforms abertos para leitura em escala. |
| **Manrope** | Body, UI labels | Humanista neutra, ótima legibilidade em corpo pequeno, hinting limpo no mobile. |
| **JetBrains Mono** | Dados, IDs, timestamps, telemetria | Tabular figures por padrão. Diferencia 0/O e 1/l/I — crítico em IDs de animais e brincos. |

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-body:    'Manrope', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;
```

**Proibidas** (clichês de SaaS): Inter, Roboto, Arial, system-ui solo.

### 3.2 Escala (mobile, 390×844)

| Token | Tamanho | Linha | Peso típico | Uso |
|---|---|---|---|---|
| `--t-display` | **28px** | 1.1 | 700 | Hero da Home, título de seção XL |
| `--t-h1` | **22px** | 1.2 | 700 | Título de tela |
| `--t-h2` | **18px** | 1.3 | 600 | Título de card |
| `--t-body` | **15px** | 1.5 | 400/500 | Corpo padrão |
| `--t-sm` | **13px** | 1.45 | 500 | Label, caption, meta |
| `--t-xs` | **11px** | 1.4 | 600 | Eyebrow, badge, status |

### 3.3 Tracking & casing

- **Eyebrows e labels de seção**: `font-mono`, 11px, `letter-spacing: 0.18em`, `text-transform: uppercase`. Sempre antecedidos de regra de 28×1px na cor accent.
- **Display**: `letter-spacing: -0.025em` (Space Grotesk respira).
- **Body**: tracking padrão.
- **Numerais grandes (KPI)**: `font-display`, peso 700, `font-variant-numeric: tabular-nums`.

### 3.4 Hierarquia em uma tela

> **Regra do dominante único:** uma tela tem **um** elemento tipográfico dominante. Tudo o mais é satélite. Se houver dois "displays" competindo, um vira `--t-h1`.

---

## 4. Espaçamento

### 4.1 Escala 4px

```css
--s-1: 4px;   --s-2: 8px;   --s-3: 12px;
--s-4: 16px;  --s-5: 20px;  --s-6: 24px;
--s-7: 32px;  --s-8: 40px;  --s-9: 56px;
```

### 4.2 Convenções

| Contexto | Espaçamento |
|---|---|
| Padding lateral da tela (safe area) | `--s-4` (16px) |
| Margem topo abaixo da status bar | `--s-6` (24px) |
| Padding interno de card | `--s-4` (16px) — opcional `--s-5` em hero cards |
| Gap entre cards | `--s-3` (12px) |
| Gap entre seções | `--s-6` (24px) |
| Gap entre label e input | `--s-2` (8px) |
| Gap entre input e input | `--s-3` (12px) |
| Padding bottom (home indicator) | `--s-4` (16px) + safe area |

### 4.3 Grid baseline

Todo elemento alinha em múltiplos de **4px**. Exceções (apenas para evitar pixel hinting): bordas hairline (1px) e ícones de status bar.

---

## 5. Forma (Radii)

```css
--r-sm:   8px;   /* botões, inputs, chips pequenos */
--r-md:   12px;  /* cards padrão, modais */
--r-lg:   16px;  /* hero cards, sheets */
--r-xl:   20px;  /* cards full-bleed grandes */
--r-2xl:  28px;  /* bottom sheets */
--r-full: 999px; /* avatares, chips de estado, FAB */
```

**Regra de aninhamento:** o raio de um filho é sempre `≤ raio do pai − padding`. Card 12px com padding 16px hospeda elementos de até 8px (preferência) ou 4px.

---

## 6. Elevação

```css
--shadow-1:   0 1px 2px rgba(0,0,0,0.30), 0 0 0 1px var(--border-subtle);
--shadow-2:   0 8px 24px rgba(0,0,0,0.40), 0 0 0 1px var(--border-subtle);
--shadow-glow: 0 0 0 1px var(--primary-soft), 0 8px 32px rgba(51,153,137,0.18);
```

| Nível | Quando usar |
|---|---|
| `--shadow-1` | Card padrão sobre `--bg-app` |
| `--shadow-2` | Bottom sheet, modal, popover |
| `--shadow-glow` | CTA primário em estado de foco · alerta de parto iminente |

Em dark mode, sombra é sutil — o trabalho pesado é feito pelo gradiente de superfície (elev-1 → elev-2 → elev-3).

---

## 7. Iconografia

- **Família:** Lucide-style outline (stroke-width 1.6, lineCap round, lineJoin round).
- **Tamanhos:** 16 (inline), 18 (botão padrão), 20 (app bar), 24 (hero).
- **Cor:** `currentColor` herdado do contexto.
- **Set mínimo cobrindo o app:** `bell`, `search`, `menu`, `arrow-left`, `chevron-right`, `home`, `users`, `map-pin`, `bar-chart`, `user`, `settings`, `cow`, `thermometer`, `activity`, `alert-triangle`, `wifi-off`, `battery`, `signal`, `eye`, `eye-off`, `plus`, `check`, `x`, `more`, `download`, `filter`, `sort`.

**Proibido**: misturar outline com filled. Misturar dois pesos de stroke. Usar emojis no UI.

---

## 8. Componentes

Todos os componentes são `dark-first`. Variantes light derivam-se invertendo `--bg-*` e `--text-*`.

### 8.1 PhoneFrame
Bezel 414×868 com canto 56px (notch), status bar (hora · sinal · wifi · bateria) e home indicator. Wraps cada tela.

### 8.2 AppBar
Altura **56px**, padding lateral 16px. Slots: `left` (icon button ou back), `title` (h1), `right` (até 2 icon buttons). Subtítulo opcional 13px secondary abaixo.

### 8.3 IconBtn
Tap target **44×44px** mínimo (visual 36–40, área expandida via padding). Variantes: `ghost` (transparent), `solid` (`--bg-elev-2`). Badge no canto superior direito (8×8 dot ou 16×16 com número).

### 8.4 Btn (botão de ação)
Alturas: `sm 36 · md 48 · lg 56`. Variantes:

| Variante | Background | Texto | Borda |
|---|---|---|---|
| `primary` | `--primary` | `--primary-on` | — |
| `secondary` | `--bg-elev-2` | `--text-primary` | `--border` |
| `ghost` | transparent | `--primary` | — |
| `danger` | `--danger` | `--snow` | — |

Radius `--r-sm` (8px). Peso 600. Tracking 0. `full` ocupa 100% da largura. Ícone à esquerda gap 8px.

### 8.5 Input
Altura **48px**, radius 8px, background `--bg-elev-2`, borda `--border`. Foco: borda `--border-strong` + glow `--primary-soft`. Label 13px secondary acima, gap 8px. Erro: borda `--danger`, mensagem 13px abaixo.

### 8.6 Chip
Pill 24–28px de altura, radius `--r-full`. Tones:

| Tone | Bg | Fg |
|---|---|---|
| `neutral` | `--bg-elev-2` | `--text-secondary` |
| `primary` | `--primary-soft` | `--accent` |
| `success` | `--success-soft` | `--success` |
| `warn` | `--warning-soft` | `--warning` |
| `danger` | `--danger-soft` | `--danger` |

Usado para: status, filtro selecionado, papel do usuário, severidade.

### 8.7 Card
Background `--bg-elev-1`, radius `--r-md`, padding `--s-4`, sombra `--shadow-1`. Pode ter hero (imagem ou ilustração) ocupando full-bleed no topo, ignorando padding.

### 8.8 StatusDot
Círculo 8px com pulse opcional (anim `cowPulse` 1.6s ease-out infinite). Tones: `success`, `warn`, `danger`, `muted`.

### 8.9 Battery (mini)
Pictograma 24×12 com fill proporcional. Cor: ≥40% accent, 20–40% warning, <20% danger. Versão `mini` 16×8 para inline.

### 8.10 LineChart (SVG)
- Largura padrão 322px (full container − 32px padding).
- Altura 140 (compacto) / 200 (detalhado).
- Stroke 2px, cor `--accent` por padrão.
- Área sob curva preenche com gradiente accent → 0% alpha.
- Thresholds: linhas tracejadas horizontais com label à esquerda.
- Eixo Y: 4–5 ticks, labels 11px mono muted.
- Eixo X: timestamps em 11px mono muted, máximo 5 labels.
- Pontos de evento: círculo 6px com borda 2px na cor da severidade.

### 8.11 DataTable
Header sticky, background `--bg-elev-2`, font 11px mono uppercase tracking 0.12em. Linhas 44px altura, divider `--border-subtle`. Linha mais recente recebe fundo `--accent-soft`. Coluna de status usa `Chip` ou `StatusDot`.

### 8.12 TabBar (bottom)
Altura **64px** + safe area. 5 slots: Início · Rebanho · Alertas · Mapa · Perfil. Item ativo: ícone Pearl Aqua + label 11px primary. Inativo: ícone muted + label muted. Indicador de ativo: barra 24×3px Pearl Aqua sobre o ícone.

### 8.13 BottomSheet
Radius topo `--r-2xl`, background `--bg-elev-1`, sombra `--shadow-2`. Handle 32×4px `--border-strong` centralizado no topo (margem 8px).

### 8.14 EmptyState
Ilustração placeholder 120px (ou ícone 48), título 18px, descrição 15px secondary, CTA primary. Centralizado verticalmente.

### 8.15 Skeleton
Background `--bg-elev-2` com shimmer animado (gradient → translate 1.4s linear infinite). Radius idêntico ao do elemento que substitui.

---

## 9. Padrões de tela

### 9.1 Anatomia padrão (tela com app bar)

```
┌─────────────────────────────────┐ ← Status bar 44px
├─────────────────────────────────┤
│ [☰]  Título da tela     [🔔][👤] │ ← AppBar 56px
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │  Hero / KPI dominante     │   │ ← 1 elemento dominante
│ └───────────────────────────┘   │
│                                 │
│ ┌──────────┐ ┌──────────┐       │ ← Cards satélite
│ │  Card    │ │  Card    │       │
│ └──────────┘ └──────────┘       │
│                                 │
│ ┌───────────────────────────┐   │
│ │  Lista / tabela           │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ [🏠] [🐮] [🔔] [📍] [👤]         │ ← TabBar 64px
└─────────────────────────────────┘ ← Home indicator 34px
```

### 9.2 Hierarquia de alertas

Quando há alerta crítico, ele assume o lugar do hero — empurra todo o resto para baixo. Nunca empilhar dois "heroes" na mesma tela.

### 9.3 Estados obrigatórios

Toda tela com dado remoto deve cobrir explicitamente:

1. **Cheio** — estado padrão.
2. **Vazio** — primeira execução, filtro sem resultado.
3. **Loading** — skeleton da estrutura final, jamais spinner solo.
4. **Erro / offline** — banner persistente + dados em cache + ação clara.

### 9.4 Modo offline

Banner persistente no topo (abaixo da app bar), 32px altura, background `--warning-soft`, ícone `wifi-off` + texto "Modo offline · última sincronização: hh:mm". Dados ficam visíveis com badge `cache` no card relevante.

---

## 10. Microinterações

| Evento | Duração | Easing |
|---|---|---|
| Botão press | 120ms | `cubic-bezier(.2,.7,.3,1)` |
| Card hover/focus | 180ms | `ease-out` |
| Sheet open | 320ms | `cubic-bezier(.2,.9,.25,1)` |
| Sheet close | 240ms | `ease-in` |
| Skeleton shimmer | 1.4s | `linear` infinite |
| Pulse alerta crítico | 1.6s | `ease-out` infinite |
| Tab switch | 200ms | `ease-out` |

Reduzir movimento (`prefers-reduced-motion: reduce`): zerar todas as durações exceto `cowPulse` (que vira opacidade estática 0.6).

---

## 11. Conteúdo & voz

- **Idioma:** PT-BR. Vocabulário do domínio rural ("brinco eletrônico", "piquete", "lote", "colar inteligente", "pré-parto"). Evitar jargão de SaaS ("dashboard" virou "Início"; "settings" → "Ajustes").
- **Tom:** direto, profissional, calmo. Sem entusiasmo forçado. Sem emojis.
- **Erros:** descrevem o que aconteceu + oferecem ação. "Não foi possível sincronizar. Tentar novamente." (não: "Ops! Algo deu errado 🤔").
- **Números:** sempre com unidade explícita (`38.7 °C`, não `38.7`). Tabular nums no mono.
- **Datas:** relativo curto na UI ("há 12 min"), absoluto no detalhe ("08/05 · 08:42").

---

## 12. Tokens em código

Importar uma vez no app:

```html
<link rel="stylesheet" href="tokens.css"/>
```

Uso recomendado:

```jsx
<button style={{
  background: 'var(--primary)',
  color: 'var(--primary-on)',
  borderRadius: 'var(--r-sm)',
  padding: '0 var(--s-5)',
  height: 48,
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
}}>
  Entrar
</button>
```

**Nunca** repetir hex codes em código de feature — sempre via token. Se precisa de cor que não existe, é um indício de que o sistema precisa crescer; abra discussão antes de hardcodar.

---

## 13. Mapa de telas

```
Splash
  └─→ Onboarding (3 steps)
        └─→ Login
              └─→ Home ──┬─→ Detalhe da Vaca ──→ Histórico (tabela)
                         ├─→ Rebanho ────────→ Detalhe da Vaca
                         ├─→ Alertas ────────→ Detalhe da Vaca
                         ├─→ Mapa ───────────→ Detalhe da Vaca
                         └─→ Perfil ─────────→ Configurações

Estados (transversais): Vazio · Sincronizando · Sem conexão
```

12 telas hi-fi entregues em `CowHealth AI - Hi-Fi.html` (canvas) e `CowHealth AI - Deck.html` (apresentação).

---

## 14. Roadmap do sistema

Crescimentos previstos, em ordem de prioridade:

1. **Light mode** espelhando a mesma paleta com inversão de superfícies.
2. **Variações do Dashboard** por papel (produtor / veterinário / gestor).
3. **Token de motion** dedicado (atualmente inline).
4. **Componente Map** com pins · clusters · geofence.
5. **Componente Form Wizard** para cadastro de animal/colar.
6. **Tabela responsiva** com scroll horizontal travado e colunas pinadas.
7. **Versionamento dos tokens** via Style Dictionary (export para iOS/Android).

---

## 15. Resumo executivo (1 pager)

| Categoria | Resumo |
|---|---|
| Cores | 5 brand · 5 superfícies dark · 4 semânticas terrosas |
| Type | Space Grotesk + Manrope + JetBrains Mono · escala 11→28 |
| Espaço | Base 4px · escala s-1…s-9 |
| Forma | Radii 8/12/16/20/28/full |
| Elevação | 3 sombras (shadow-1, shadow-2, shadow-glow) |
| Ícones | Lucide outline · 1.6 stroke |
| Componentes | 15 primitivos cobrem 100% das 12 telas |
| Telas | 12 hi-fi · estados completos · navegação ≤3 cliques |

— fim —
