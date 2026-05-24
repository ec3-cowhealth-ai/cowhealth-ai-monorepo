# CowHealth AI — Design System

> Design system for a mobile app for continuous bovine health monitoring via a smart collar. Dark-first, designed for field use: high contrast, generous touch areas, controlled data density.

**Version:** 1.0 · **Target Platform:** iOS (iPhone 14/15 Pro — 390×844) · **Language:** EN-US · **Theme:** Dark · **Last update:** 2026-05-08

---

## 1. Design Principles

Five non-negotiable principles. Every UI decision must be justifiable by at least one of them.

| # | Principle | What it means in practice |
|---|---|---|
| 1 | **Field before screen** | The user may be wearing gloves, in the sun, with low signal. Tap targets ≥ 48px, contrast ≥ AA, no hover-only states, declared offline mode. |
| 2 | **Raw data, not decoration** | Graphs and tables are protagonists. No ornamental gradients, no gratuitous "glassmorphism". Color has function. |
| 3 | **Triage by severity** | Whenever there is an alert, it dictates the screen's hierarchy. Critical > Attention > Info > Regular content. |
| 4 | **Three clicks, at most** | From Home to any individual data of any animal: 3 touches. Meets RNFU2. |
| 5 | **State honesty** | Loading shows skeleton (not anonymous spinner); offline is declared, not hidden; errors offer action. |

---

## 2. Color

### 2.1 Primary Palette (Brand)

| Token | Hex | Function |
|---|---|---|
| `--onyx` | `#131515` | Main background · inverse text |
| `--graphite` | `#2B2C28` | Elevated surfaces in dark |
| `--verdigris` | `#339989` | **Primary** — CTAs, links, brand |
| `--pearl-aqua` | `#7DE2D1` | **Accent** — highlights, data highlights, active states |
| `--snow` | `#FFFAFB` | Text on dark · light background |

### 2.2 Surfaces (dark-first)

```css
--bg-canvas:  #0B0D0D;  /* external canvas, deeper than --bg-app */
--bg-app:     #131515;  /* app background (pure Onyx) */
--bg-elev-1:  #1B1D1D;  /* standard card */
--bg-elev-2:  #2B2C28;  /* card on card · input */
--bg-elev-3:  #36383A;  /* tooltip · floating menu */
```

Elevation is communicated **only by color value** (no thick white borders or colored shadows). A very subtle shadow (`--shadow-1`) reinforces only level 1.

### 2.3 Borders

```css
--border-subtle: rgba(255, 250, 251, 0.06);  /* internal dividers */
--border:        rgba(255, 250, 251, 0.12);  /* card · input at rest */
--border-strong: rgba(255, 250, 251, 0.22);  /* focused input · selection */
```

### 2.4 Text

| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#FFFAFB` | titles, primary data |
| `--text-secondary` | `rgba(255,250,251,0.66)` | body, labels |
| `--text-muted` | `rgba(255,250,251,0.42)` | meta, placeholder, disabled |
| `--text-inverse` | `#131515` | text on Verdigris/Pearl Aqua |

### 2.5 Brand Roles

```css
--primary:        #339989;
--primary-hover:  #2C857A;
--primary-soft:   rgba(51,153,137,0.16);   /* primary chip/badge background */
--primary-on:     #FFFAFB;                  /* text on primary */

--accent:         #7DE2D1;
--accent-soft:    rgba(125,226,209,0.18);
--accent-on:      #131515;                  /* text on accent */
```

### 2.6 Semantic Colors (Derived, Harmonic)

Semantic colors avoid digital pharmacy red/green — they are **earthy** to match Onyx and the rural environment.

| Token | Hex | Use |
|---|---|---|
| `--danger` | `#E87C5C` | fever, critical error, red alert |
| `--danger-strong` | `#C9613F` | border/icon on light background |
| `--warning` | `#E8C66B` | attention, low rumination, battery |
| `--success` | `#7DE2D1` | OK, within norm — reuses Pearl Aqua |
| `--info` | `#6BB4E8` | tip, system alert |

Each has a `-soft` version (alpha 14–18%) for chip/banner background.

### 2.7 Alert → Color Mapping

| Severity | Background color | Border/text color | Icon |
|---|---|---|---|
| Critical | `--danger-soft` | `--danger` | triangle |
| Attention | `--warning-soft` | `--warning` | bell |
| Info | `--info-soft` | `--info` | i |
| Success | `--success-soft` | `--success` | check |

### 2.8 Accessibility

- All text/background pairs respect **minimum WCAG AA (4.5:1 normal, 3:1 large)**.
- Verdigris on Onyx: 4.6:1 ✓
- Pearl Aqua on Onyx: 11.8:1 ✓
- Snow on Onyx: 15.2:1 ✓
- **Never** use Verdigris as small text on `--bg-elev-2`. Use Pearl Aqua.

---

## 3. Typography

### 3.1 Families (Google Fonts)

| Family | Role | Why |
|---|---|---|
| **Space Grotesk** | Display, headings, large numbers | Precise geometry + technical personality. Open letterforms for scale reading. |
| **Manrope** | Body, UI labels | Neutral humanist, great legibility in small body, clean hinting on mobile. |
| **JetBrains Mono** | Data, IDs, timestamps, telemetry | Tabular figures by default. Differentiates 0/O and 1/l/I — critical in animal IDs and earrings. |

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;
--font-body:    'Manrope', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;
```

**Prohibited** (SaaS clichés): Inter, Roboto, Arial, system-ui solo.

### 3.2 Scale (mobile, 390×844)

| Token | Size | Line | Typical weight | Use |
|---|---|---|---|---|
| `--t-display` | **28px** | 1.1 | 700 | Home Hero, XL section title |
| `--t-h1` | **22px** | 1.2 | 700 | Screen title |
| `--t-h2` | **18px** | 1.3 | 600 | Card title |
| `--t-body` | **15px** | 1.5 | 400/500 | Standard body |
| `--t-sm` | **13px** | 1.45 | 500 | Label, caption, meta |
| `--t-xs" | **11px** | 1.4 | 600 | Eyebrow, badge, status |

### 3.3 Tracking & casing

- **Eyebrows and section labels**: `font-mono`, 11px, `letter-spacing: 0.18em`, `text-transform: uppercase`. Always preceded by a 28×1px rule in the accent color.
- **Display**: `letter-spacing: -0.025em` (Space Grotesk breathes).
- **Body**: standard tracking.
- **Large numerals (KPI)**: `font-display`, weight 700, `font-variant-numeric: tabular-nums`.

### 3.4 Hierarchy on a screen

> **Single dominant rule:** a screen has **one** dominant typographic element. Everything else is satellite. If there are two competing "displays", one becomes `--t-h1`.

---

## 4. Spacing

### 4.1 4px Scale

```css
--s-1: 4px;   --s-2: 8px;   --s-3: 12px;
--s-4: 16px;  --s-5: 20px;  --s-6: 24px;
--s-7: 32px;  --s-8: 40px;  --s-9: 56px;
```

### 4.2 Conventions

| Context | Spacing |
|---|---|
| Screen side padding (safe area) | `--s-4` (16px) |
| Top margin below status bar | `--s-6` (24px) |
| Internal card padding | `--s-4` (16px) — optional `--s-5` in hero cards |
| Gap between cards | `--s-3` (12px) |
| Gap between sections | `--s-6` (24px) |
| Gap between label and input | `--s-2` (8px) |
| Gap between input and input | `--s-3` (12px) |
| Bottom padding (home indicator) | `--s-4` (16px) + safe area |

### 4.3 Baseline Grid

Every element aligns to multiples of **4px**. Exceptions (only to avoid pixel hinting): hairline borders (1px) and status bar icons.

---

## 5. Shape (Radii)

```css
--r-sm:   8px;   /* buttons, inputs, small chips */
--r-md:   12px;  /* standard cards, modals */
--r-lg:   16px;  /* hero cards, sheets */
--r-xl:   20px;  /* large full-bleed cards */
--r-2xl:  28px;  /* bottom sheets */
--r-full: 999px; /* avatars, state chips, FAB */
```

**Nesting rule:** a child's radius is always `≤ parent radius − padding`. A 12px card with 16px padding hosts elements up to 8px (preferred) or 4px.

---

## 6. Elevation

```css
--shadow-1:   0 1px 2px rgba(0,0,0,0.30), 0 0 0 1px var(--border-subtle);
--shadow-2:   0 8px 24px rgba(0,0,0,0.40), 0 0 0 1px var(--border-subtle);
--shadow-glow: 0 0 0 1px var(--primary-soft), 0 8px 32px rgba(51,153,137,0.18);
```

| Level | When to use |
|---|---|
| `--shadow-1` | Standard card on `--bg-app` |
| `--shadow-2` | Bottom sheet, modal, popover |
| `--shadow-glow` | Primary CTA in focus state · imminent birth alert |

In dark mode, shadow is subtle — the heavy lifting is done by the surface gradient (elev-1 → elev-2 → elev-3).

---

## 7. Iconography

- **Family:** Lucide-style outline (stroke-width 1.6, lineCap round, lineJoin round).
- **Sizes:** 16 (inline), 18 (standard button), 20 (app bar), 24 (hero).
- **Color:** `currentColor` inherited from context.
- **Minimum set covering the app:** `bell`, `search`, `menu`, `arrow-left`, `chevron-right`, `home`, `users`, `map-pin`, `bar-chart`, `user`, `settings`, `cow`, `thermometer`, `activity`, `alert-triangle`, `wifi-off`, `battery`, `signal`, `eye`, `eye-off`, `plus`, `check`, `x`, `more`, `download`, `filter`, `sort`.

**Prohibited**: mixing outline with filled. Mixing two stroke weights. Using emojis in the UI.

---

## 8. Components

All components are `dark-first`. Light variants derive by inverting `--bg-*` and `--text-*`.

### 8.1 PhoneFrame
414×868 bezel with 56px corner (notch), status bar (time · signal · wifi · battery) and home indicator. Wraps every screen.

### 8.2 AppBar
Height **56px**, side padding 16px. Slots: `left` (icon button or back), `title` (h1), `right` (up to 2 icon buttons). Optional 13px secondary subtitle below.

### 8.3 IconBtn
Tap target **44×44px** minimum (visual 36–40, area expanded via padding). Variants: `ghost` (transparent), `solid` (`--bg-elev-2`). Badge on the top right corner (8×8 dot or 16×16 with number).

### 8.4 Btn (Action Button)
Heights: `sm 36 · md 48 · lg 56`. Variants:

| Variant | Background | Text | Border |
|---|---|---|---|
| `primary` | `--primary` | `--primary-on` | — |
| `secondary` | `--bg-elev-2` | `--text-primary` | `--border` |
| `ghost` | transparent | `--primary` | — |
| `danger` | `--danger` | `--snow` | — |

Radius `--r-sm` (8px). Weight 600. Tracking 0. `full` occupies 100% width. Icon on the left, 8px gap.

### 8.5 Input
Height **48px**, radius 8px, background `--bg-elev-2`, border `--border`. Focus: `--border-strong` border + `--primary-soft` glow. 13px secondary label above, 8px gap. Error: `--danger` border, 13px message below.

### 8.6 Chip
24–28px height pill, radius `--r-full`. Tones:

| Tone | Bg | Fg |
|---|---|---|
| `neutral` | `--bg-elev-2` | `--text-secondary` |
| `primary" | `--primary-soft` | `--accent` |
| `success` | `--success-soft` | `--success` |
| `warn` | `--warning-soft` | `--warning` |
| `danger` | `--danger-soft` | `--danger` |

Used for: status, selected filter, user role, severity.

### 8.7 Card
Background `--bg-elev-1`, radius `--r-md`, padding `--s-4`, shadow `--shadow-1`. Can have a hero (image or illustration) occupying full-bleed at the top, ignoring padding.

### 8.8 StatusDot
8px circle with optional pulse (anim `cowPulse` 1.6s ease-out infinite). Tones: `success`, `warn`, `danger`, `muted`.

### 8.9 Battery (mini)
24×12 pictogram with proportional fill. Color: ≥40% accent, 20–40% warning, <20% danger. `mini` version 16×8 for inline.

### 8.10 LineChart (SVG)
- Standard width 322px (full container − 32px padding).
- Height 140 (compact) / 200 (detailed).
- 2px stroke, `--accent` color by default.
- Area under curve fills with accent → 0% alpha gradient.
- Thresholds: horizontal dashed lines with label on the left.
- Y-axis: 4–5 ticks, 11px mono muted labels.
- X-axis: 11px mono muted timestamps, maximum 5 labels.
- Event points: 6px circle with 2px border in severity color.

### 8.11 DataTable
Sticky header, `--bg-elev-2` background, 11px mono font uppercase tracking 0.12em. 44px height rows, `--border-subtle` divider. Most recent row receives `--accent-soft` background. Status column uses `Chip` or `StatusDot`.

### 8.12 TabBar (bottom)
Height **64px** + safe area. 5 slots: Home · Herd · Alerts · Map · Profile. Active item: Pearl Aqua icon + 11px primary label. Inactive: muted icon + muted label. Active indicator: 24×3px Pearl Aqua bar over the icon.

### 8.13 BottomSheet
Top radius `--r-2xl`, background `--bg-elev-1`, shadow `--shadow-2`. 32×4px `--border-strong` handle centered at the top (8px margin).

### 8.14 EmptyState
120px placeholder illustration (or 48 icon), 18px title, 15px secondary description, primary CTA. Vertically centered.

### 8.15 Skeleton
`--bg-elev-2` background with animated shimmer (gradient → translate 1.4s linear infinite). Radius identical to the element it replaces.

---

## 9. Screen Patterns

### 9.1 Standard Anatomy (screen with app bar)

```
┌─────────────────────────────────┐ ← Status bar 44px
├─────────────────────────────────┤
│ [☰]  Screen Title       [🔔][👤] │ ← AppBar 56px
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │  Hero / Dominant KPI      │   │ ← 1 dominant element
│ └───────────────────────────┘   │
│                                 │
│ ┌──────────┐ ┌──────────┐       │ ← Satellite cards
│ │  Card    │ │  Card    │       │
│ └──────────┘ └──────────┘       │
│                                 │
│ ┌───────────────────────────┐   │
│ │  List / Table             │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ [🏠] [🐮] [🔔] [📍] [👤]         │ ← TabBar 64px
└─────────────────────────────────┘ ← Home indicator 34px
```

### 9.2 Alert Hierarchy

When there is a critical alert, it takes the hero's place — pushing everything else down. Never stack two "heroes" on the same screen.

### 9.3 Mandatory States

Every screen with remote data must explicitly cover:

1. **Full** — default state.
2. **Empty** — first run, filter with no result.
3. **Loading** — skeleton of the final structure, never just a spinner.
4. **Error / offline** — persistent banner + cached data + clear action.

### 9.4 Offline Mode

Persistent banner at the top (below the app bar), 32px height, `--warning-soft` background, `wifi-off` icon + "Offline Mode · last sync: hh:mm" text. Data remains visible with a `cache` badge on the relevant card.

---

## 10. Microinteractions

| Event | Duration | Easing |
|---|---|---|
| Button press | 120ms | `cubic-bezier(.2,.7,.3,1)` |
| Card hover/focus | 180ms | `ease-out` |
| Sheet open | 320ms | `cubic-bezier(.2,.9,.25,1)` |
| Sheet close | 240ms | `ease-in` |
| Skeleton shimmer | 1.4s | `linear` infinite |
| Critical alert pulse | 1.6s | `ease-out` infinite |
| Tab switch | 200ms | `ease-out` |

Reduce motion (`prefers-reduced-motion: reduce`): zero all durations except `cowPulse` (which becomes static opacity 0.6).

---

## 11. Content & Voice

- **Language:** EN-US. Rural domain vocabulary ("electronic earring", "paddock", "lot", "smart collar", "pre-calving"). Avoid SaaS jargon ("dashboard" became "Home"; "settings" → "Adjustments").
- **Tone:** direct, professional, calm. No forced enthusiasm. No emojis.
- **Errors:** describe what happened + offer an action. "Unable to sync. Try again." (not: "Oops! Something went wrong 🤔").
- **Numbers:** always with explicit unit (`38.7 °C`, not `38.7`). Tabular nums in mono.
- **Dates:** short relative in UI ("12 min ago"), absolute in detail ("05/08 · 08:42").

---

## 12. Tokens in Code

Import once in the app:

```html
<link rel="stylesheet" href="tokens.css"/>
```

Recommended usage:

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
  Login
</button>
```

**Never** repeat hex codes in feature code — always via token. If a color is needed that doesn't exist, it's an indication that the system needs to grow; open a discussion before hardcoding.

---

## 13. Screen Map

```
Splash
  └─→ Onboarding (3 steps)
        └─→ Login
              └─→ Home ──┬─→ Cow Detail ──→ History (table)
                         ├─→ Herd ────────→ Cow Detail
                         ├─→ Alerts ──────→ Cow Detail
                         ├─→ Map ─────────→ Cow Detail
                         └─→ Profile ─────→ Settings

States (cross-cutting): Empty · Syncing · No connection
```

12 hi-fi screens delivered in `CowHealth AI - Hi-Fi.html` (canvas) and `CowHealth AI - Deck.html` (presentation).

---

## 14. System Roadmap

Planned growth, in priority order:

1. **Light mode** mirroring the same palette with surface inversion.
2. **Dashboard Variations** by role (producer / veterinarian / manager).
3. **Dedicated motion token** (currently inline).
4. **Map Component** with pins · clusters · geofence.
5. **Form Wizard Component** for animal/collar registration.
6. **Responsive table** with locked horizontal scroll and pinned columns.
7. **Token versioning** via Style Dictionary (export to iOS/Android).

---

## 15. Executive Summary (1 pager)

| Category | Summary |
|---|---|
| Colors | 5 brand · 5 dark surfaces · 4 earthy semantic |
| Type | Space Grotesk + Manrope + JetBrains Mono · 11→28 scale |
| Space | 4px base · s-1…s-9 scale |
| Shape | Radii 8/12/16/20/28/full |
| Elevation | 3 shadows (shadow-1, shadow-2, shadow-glow) |
| Icons | Lucide outline · 1.6 stroke |
| Components | 15 primitives cover 100% of the 12 screens |
| Screens | 12 hi-fi · complete states · ≤3 clicks navigation |

— end —
