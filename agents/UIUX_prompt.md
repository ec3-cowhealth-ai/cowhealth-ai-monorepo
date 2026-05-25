# Prompt — Mobile Layout Generation (High-Fidelity Mockups)

> **Usage:** Paste this prompt into Claude (with artifacts/visualizer enabled), attaching the project files as indicated.

---

## Prompt

```
You are a senior UI/UX Designer specialized in mobile applications (iOS and Android). Your task is to generate a complete set of high-fidelity screens for a mobile application, based on the files I am attaching.

---

### ATTACHED FILES (interpret each according to its category):

1. **Blueprints / Technical Design** — Flow diagrams, wireframes, screen architecture, user flows, or technical specifications of the project. Extract from them:
   - Navigation hierarchy and screen structure
   - User flows (onboarding, authentication, core features)
   - Mentioned UI components and elements
   - Business rules that impact the UI

2. **Project Documentation** — PRDs, functional requirements, user stories, or any descriptive doc. Extract from them:
   - Functionalities and features to represent
   - Target audience and personas (adapt the visual tone)
   - Constraints and non-functional requirements relevant to the UI
   - Domain nomenclature and taxonomy (use the correct terms on the screens)

3. **Color Palette** — Design tokens file, palette image, or color definition. Extract from them:
   - Primary, secondary, and accent colors
   - Surface, background, and text colors
   - Semantic colors (success, error, alert, info)
   - Gradients, if any

---

### GENERATION INSTRUCTIONS:

**Base Design System:**
- Derive a mini design system from the inputs: typography (display + body), spacing scale (4px base), border radii, shadows, and elevation
- Typography: choose Google Fonts that match the project's tone — NEVER use Inter, Roboto, or Arial. Seek personality. Justify the choice
- Icons: use Lucide or equivalent. Consistent style (outline or filled, do not mix)

**Mandatory screens (generate ALL, unless they do not apply):**
1. Splash Screen
2. Onboarding (carousel or stepper)
3. Login / Sign Up
4. Home / Main Dashboard
5. Listing (feed, catalog, search)
6. Item Detail
7. Creation/Edition Form
8. User Profile
9. Settings
10. Empty, loading, and error states

**For EACH screen, render a React (JSX) mockup that:**
- Simulates mobile viewport (390×844px — iPhone 14 Pro)
- Uses the color palette extracted via CSS variables
- Implements microinteractions with CSS (hover, focus, transitions)
- Shows realistic mocked data (Brazilian names, English texts)
- Includes status bar (time, battery, signal) for realism
- Respects safe areas (notch top, home indicator bottom)

**Visual quality — NON-NEGOTIABLE:**
- No generic "AI slop" aesthetic — each screen must have intent and personality
- Clear visual hierarchy: one dominant element per screen
- Generous and consistent spacing
- Minimum WCAG AA contrast between text and background
- Consistent corners, shadows, and elevations across components

**Deliverables per screen:**
- Rendered visual mockup (React artifact)
- Brief note (2-3 lines) justifying design decisions

**At the end, also deliver:**
- Navigation map (diagram showing the relationship between screens)
- Summary of the derived design system (color tokens, typography, spacing)

---

### PROCESS:

1. **Analysis** — Read all files. List what you extracted from each (identified screens, parsed palette, mapped features). Ask for confirmation before proceeding.
2. **Design System** — Present the proposed mini design system (colors, fonts, spacing). Ask for approval.
3. **Generation** — Produce the screens one by one or in groups of 2-3, starting with the most critical flow.
4. **Review** — After all screens, present the navigation map and ask about adjustments.

Start with step 1. I await your analysis of the files.
```

---

## Usage notes

- **Accepted formats in attachments:** PDF, PNG, MD, TXT, JSON (design tokens), Figma exports
- **If the palette comes as an image:** Claude will extract the dominant colors via visual analysis
- **If any file is missing:** the prompt instructs Claude to ask for confirmation before assuming defaults
- **Quick customization:** adjust the list of "mandatory screens" according to your app's scope
