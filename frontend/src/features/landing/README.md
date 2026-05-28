# Feature: Landing

Components and logic for the landing page (public, no authentication required).

## Structure

- `components/` — Reusable landing components (Hero, Features, CTA, Footer)
- `hooks/` — Custom hooks to manage landing state (e.g., tweaks/variations)
- `pages/` — Main landing page
- `styles/` — Specific CSS (included in `src/styles/landing.css`)

## Components

### Hero

Main section with title, subtitle, visualization, and CTAs.

### Features

Cards with icons, titles, descriptions, and live data (optional).

### CTA

Call-to-action card with message and action buttons.

### Footer

Footer with institutional links and copyright.

## Responsible

Jcfs (according to the responsibility matrix)

## Notes

- The landing is **public** — it does not require authentication.
- Uses the design system from `docs/agents/design.md`.
- Fixed palette in `src/styles/landing.css` (CSS variables).
- Optional components: tweaks for A/B testing.
