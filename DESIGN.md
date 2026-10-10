# ArchSync AI — Design System & UI/UX Specification

**Document:** `DESIGN.md`  
**Product:** ArchSync AI — Collaborative Architecture Workspace  
**Version:** 2.0.0  
**Status:** Canonical visual source of truth  
**Applies to:** All client routes, shared UI, architecture canvas, dialogs, forms, navigation, and responsive states

> **Priority rule:** This file is the source of truth for visual design. If an existing component, old token, generated mockup, skill suggestion, or previous design conflicts with this document, follow this document. Preserve working product behavior and architecture unless a change is explicitly required.

---

## 1. Brand Direction

ArchSync AI should feel like a **considered editorial engineering tool**: the precision of a systems-design workspace combined with the confidence and restraint of a premium technical publication. It must not look like a generic AI SaaS starter template.

### Design principles

- **Editorial, not futuristic cliché.** Use typography, alignment, proportion, and meaningful negative space to create character. Do not rely on glows, gradients, glassmorphism, or decorative dashboard cards to manufacture polish.
- **Dense where the work is; spacious where comprehension needs it.** The architecture studio is a high-density tool. Authentication and onboarding can be calmer, but must not waste large areas of a desktop viewport.
- **Asymmetry with purpose.** Use uneven columns, left-aligned content, varied grouping, and strong anchors when they improve hierarchy. Do not default to centered hero plus three equal cards.
- **Product-first.** The canvas and its architecture are the main event. Navigation, side panels, status, and AI assistance must support the work rather than compete with it.
- **Honest interface.** Only show real user data, API health, save state, member counts, timestamps, and security claims. Never invent successful status or decorative telemetry.
- **Respect existing functionality.** Do not remove real features, change API contracts, alter role permissions, or introduce silent AI mutations as part of visual redesign.

## 2. Brand Tokens

### 2.1 Complete Brand Palette (Strict 3-Color Restriction)

The entire ArchSync AI user interface uses strictly and exclusively these three approved hexadecimal colors. No other hex colors are permitted for backgrounds, text, borders, icons, shadows, charts, status badges, or architecture nodes:

| Token | Hex Value | RGB Value | Intended Use |
|---|---|---|---|
| **Warm Ivory** | `#eae6ed` | `rgb(234, 230, 237)` | Foundational canvas background, primary page background, card surfaces, inverted button text |
| **Deep Editorial Blue** | `#226192` | `rgb(34, 97, 146)` | Typography, structural lines, dividers, icons, and primary interface elements |
| **Coral Orange** | `#ef8557` | `rgb(239, 133, 87)` | Restrained accent, key calls-to-action, active markers, focus rings, warnings, and alerts |

### 2.2 Surface Layering & Opacity System (Light Editorial Studio)

In accordance with the strict 3-color palette restriction, no fourth color or unapproved hex code (such as black, gray, cyan, green, or red) is permitted. Surfaces, layering, dividers, borders, and interactive feedback are constructed exclusively through opacity variations of the three approved colors on a Warm Ivory base:

| Purpose | Approved Composition | Rendered Appearance |
|---|---|---|
| **Canvas & Page Background** | `#eae6ed` | Solid Warm Ivory root background |
| **Primary Panel / Surface** | `#eae6ed` + `rgba(34, 97, 146, 0.04)` | Subtle tinted raised surface layer on canvas |
| **Raised Card / Dialog** | `#eae6ed` + `rgba(34, 97, 146, 0.08)` | Distinct elevated panel / card with structural border |
| **Hover / Active Surface** | `rgba(34, 97, 146, 0.08)` | Interactive control hover / pressed state |
| **Structural Borders** | `rgba(34, 97, 146, 0.15)`–`0.25` | Fine technical linework, quiet dividers, container outlines |
| **Active / Focus Borders** | `#ef8557` (Coral Orange) | High-visibility focus indicators (WCAG 2.2 AA compliant) |
| **Primary Text & Headings** | `#226192` (Deep Editorial Blue) | 5.42:1 contrast against `#eae6ed` (exceeds WCAG AA 4.5:1) |
| **Secondary Text** | `rgba(34, 97, 146, 0.75)` | Supporting copy, descriptions, and labels |
| **Muted Metadata** | `rgba(34, 97, 146, 0.55)` | Monospace timestamps, versions, coordinates |
| **Critical / Attention Badge** | `#ef8557` + `rgba(239, 133, 87, 0.15)` | High-priority warnings, alerts, errors |
| **Informational / Valid Badge** | `#226192` + `rgba(34, 97, 146, 0.10)` | Normal status, valid state, editor roles |

### 2.3 Strict Color Usage Rules

1. **Strictly 3 Hexadecimal Colors:** Use only `#eae6ed`, `#226192`, and `#ef8557`. Never introduce cyan, teal, purple, indigo, green, red, amber, gray, or black hex codes.
2. **Opacity Variations Only:** You may use opacity variations of the three approved colors for layering, borders, hover states, and subtle surfaces. Do not introduce a different hue through these variations.
3. **No Gradient Text:** All headings and body copy use solid `#226192` or `#ef8557`.
4. **No Full-Page Gradients:** Avoid gradient backgrounds; use layered solid Warm Ivory surfaces with subtle opacity tinting and fine structural lines.
5. **No Neon Glows:** Remove all glowing shadows (`shadow-cyan-500/20`, neon rings).
6. **Icon & Pattern Differentiation:** Differentiate all 11 architecture node types and statuses through Lucide icons, labels, border styles (solid, dashed, double), and patterns rather than introducing new colors.
7. **Accessibility First:** Maintain readable contrast (minimum 4.5:1 for normal text, 3:1 for large text and UI boundaries) and visible focus rings. Deep Editorial Blue `#226192` on Warm Ivory `#eae6ed` delivers 5.42:1 contrast ratio.
8. **No Emoji:** Use Lucide icons or the project's established icon library. **Never use emoji as interface icons.**
9. **Informative States:** Never rely on color alone to convey saved/error/permission states. Pair color with text or a proper icon.

## 3. Typography

### 3.1 Font pairing

- **Display and editorial headings:** `Cormorant Garamond`, Georgia, serif.
- **Interface, body, controls, navigation, and labels:** `Montserrat`, system-ui, sans-serif.
- **Technical data only:** the existing monospace stack, such as `JetBrains Mono`, ui-monospace, monospace, for IDs, coordinates, JSON, code, node metadata, and measured latency.

Load Cormorant Garamond and Montserrat through the project's existing approved font-loading method. Include sensible fallbacks and avoid blocking initial rendering. If a font fails to load, the layout must remain usable.

### 3.2 Type hierarchy

| Role | Guidance | Use |
|---|---|---|
| Editorial display | Cormorant Garamond, 500–600, responsive `clamp()` sizing | Landing and auth statement, key page titles |
| Page heading | Cormorant Garamond, 600; avoid overly tight tracking | Page identity and major section headings |
| Panel heading | Montserrat, 600–700 | Inspector, dialog, toolbar and utility panel titles |
| Body | Montserrat, 400–500, 14–16px typical | Explanations, forms, product copy |
| Labels | Montserrat, 600, 12–14px | Form labels, section labels, button text |
| Technical metadata | Monospace, 11–13px | Node IDs, version numbers, coordinates, code-like values |

Do not use uppercase micro-labels everywhere. Use uppercase sparingly for short technical overlines, not for ordinary prose. Establish hierarchy through scale, weight, line length, and spacing, not by making every label bold.

## 4. Layout and Screen Real Estate

### 4.1 Use the viewport efficiently

The supplied screenshots show oversized outer gutters and a centered, max-width composition that leaves large unused strips on both sides. Avoid repeating this pattern on primary application screens.

- On desktop, the main application shell should use the available viewport width. Use responsive gutters rather than a narrow fixed-width container: typically `clamp(16px, 2.4vw, 36px)` for marketing/auth routes and tighter functional gutters for workspace screens.
- Do not set an arbitrary `max-width` on the whole authenticated application when it needlessly shrinks the canvas or dashboard. A max-width is acceptable for long-form reading content, not for the architecture workspace.
- Avoid nested containers that each add horizontal padding. Establish one clear page gutter and let inner sections align to it.
- At 1440px and wider, use the available width intentionally. Do not leave large blank left/right columns unless they are a deliberate part of a specific composition.
- On small screens, retain a safe 16–20px gutter and prevent horizontal overflow. Full-width does not mean controls should touch the screen edge.
- Prefer `min-height: 100dvh` for page shells and a viewport-filling canvas for the studio. Keep footer behavior route-specific; a global footer must not steal vertical space from the architecture canvas.

### 4.2 Layout variation

- Use asymmetrical split layouts, aligned editorial copy, varied section widths, and different groupings when useful.
- Do not use the same card grid on every route. Use tables/lists for data, compact rows for navigation, and cards only when grouping has real meaning.
- Avoid wrapping every section in a bordered rounded rectangle. Use spacing, typography, dividers, and surface changes before adding another card.
- Avoid equal padding, equal heights, and identical corner radii by default. Component geometry should reflect its function.

### 4.3 Architecture studio

- Keep the canvas as the largest visual region and preserve its usable area.
- Header should be compact, functional, and single-tier where possible.
- Palette and inspector should be collapsible/contextual and must not permanently consume excessive width on smaller screens.
- Keep save state, collaborator presence, role, validation, AI, and export actions visible or predictably reachable without cluttering the canvas.
- Use panel dividers and restrained surface contrast instead of bright outlines or floating neon cards.
- AI output is advisory. Never apply proposed architecture changes to the graph without an explicit user action and clear preview of the changes.

## 5. Component and Interaction Rules

### 5.1 Surfaces and borders

- Use mostly solid surfaces, subtle border contrast, and limited shadow depth.
- Reserve the strongest surface contrast for active work areas, selected items, and modal layers.
- Use corner radii according to component scale: small controls modestly rounded, larger panels slightly more rounded. Avoid pill-shaped everything.
- A selected canvas node may use a clear brand-colored border or outline, but avoid persistent glow/shadow effects.

### 5.2 Buttons

- Primary action: use Deep Editorial Blue or another brand-token combination that passes contrast checks. Coral Orange may be used for a key CTA when its text pairing is accessible.
- Secondary action: restrained surface or outline, clear label, no glow.
- Destructive action: semantic danger styling and explicit wording.
- Provide hover, pressed, disabled, loading, and focus-visible states. Keep motion short and functional.
- Never make a button look active if it is unavailable or its action has not succeeded.

### 5.3 Inputs and forms

- Always show persistent labels. Placeholders supplement labels and never replace them.
- Use consistent field heights within a form, readable placeholder contrast, clear error text, and visible keyboard focus.
- Password visibility controls require accessible names and must not submit the form accidentally.
- Prevent duplicate submissions while a request is in flight and preserve entered data when showing recoverable errors.

### 5.4 Navigation and status

- Prefer compact navigation with clear active states and readable text labels where space allows.
- Use Lucide icons with consistent stroke weight and size. Do not mix unrelated icon styles.
- Show health/sync indicators only when backed by real state. Distinguish API health from user authentication and project synchronization.
- Avoid internal milestone language, test jargon, placeholder account information, and developer-only implementation details in user-facing UI.

### 5.5 Architecture nodes and edges

Preserve the application's existing node types and semantic distinctions. Keep node labels readable at normal zoom, make handles usable, and use the strict 3-color palette (`#eae6ed`, `#226192`, `#ef8557`). Differentiate all 11 node categories through distinct Lucide icons, labels, border styles (solid, dashed, double), and patterns rather than introducing unapproved colors.

- Idle node: Warm Ivory (`#eae6ed`) card surface with subtle Deep Editorial Blue tint (`rgba(34, 97, 146, 0.04)`), Deep Editorial Blue (`#226192`) icon & label, quiet structural border (`rgba(34, 97, 146, 0.22)`).
- Hover: subtle Deep Editorial Blue border enhancement (`rgba(34, 97, 146, 0.45)`).
- Selected: Coral Orange (`#ef8557`) active outline and handle accent.
- Edges: Deep Editorial Blue (`#226192`) or Coral Orange (`#ef8557`) stroke; animation is optional and must not make dense graphs noisy.
- Invalid connection: visible Coral Orange (`#ef8557`) alert treatment plus accessible textual feedback.
- Use established Lucide icons for node types. Keep the mapping centralized in the existing node visual configuration.

### 5.6 AI co-pilot

- Present recommendations, trade-offs, assumptions, and confidence/limitations clearly.
- If architecture changes are proposed, show a human-readable diff and require an explicit user confirmation before applying anything.
- Do not fabricate token counts, model latency, model health, or capabilities.
- Do not style the AI panel with purple gradients, glowing borders, or generic “AI magic” motifs.

## 6. Motion

Motion should explain state change, preserve spatial orientation, and make controls feel responsive. It must not be decorative noise.

- Micro-interactions: approximately 100–160ms.
- Panel/dialog transitions: approximately 180–240ms.
- Larger canvas transitions: approximately 250–350ms when they improve orientation.
- Animate opacity/transform when practical; avoid animating layout dimensions if it causes jank.
- No perpetual decorative animations, unprompted pulse effects, or glow loops.
- Honor `prefers-reduced-motion: reduce` and disable non-essential animation.

## 7. Accessibility and Quality Bar

- Target WCAG 2.2 AA where practical; minimum contrast is 4.5:1 for normal text and 3:1 for large text and essential UI boundaries.
- Measure actual foreground/background combinations. Do not assume a brand color automatically passes contrast.
- Provide visible `:focus-visible` styles, semantic landmarks, correct heading order, accessible dialog behavior, labels, live status announcements, and keyboard access.
- Interactive touch targets should aim for at least 44×44 CSS pixels where layout permits.
- Do not communicate status by color alone.
- Respect reduced-motion preferences.
- Verify layouts at 1440×900, 1280×800, 768×1024, and 375×812. Test actual browser rendering when available; unit tests and DOM assertions alone are not visual QA.

## 8. Responsive Rules

- **Mobile (<768px):** Single-column content, compact navigation, side panels as drawers/sheets, safe gutters, no horizontal page overflow. The canvas must remain navigable with touch and accessible controls.
- **Tablet (768–1023px):** Collapse secondary panels by default where necessary; preserve a useful canvas width and accessible navigation.
- **Desktop (1024–1439px):** Use full available width with a compact shell, contextual side panels, and a generous canvas.
- **Wide desktop (1440px+):** Increase working area rather than simply increasing empty margins. Use asymmetrical layouts where appropriate.

## 9. Anti-Patterns: Explicitly Prohibited

1. No gradient text of any kind.
2. No full-screen gradient backgrounds or default purple-to-blue AI styling.
3. No centered hero plus three equal cards as the automatic page template.
4. No huge empty outer margins caused by unnecessary max-width containers or nested horizontal padding.
5. No generic repeated cards for every content group.
6. No identical spacing, heights, radii, or typography across components with different purposes.
7. No emoji as interface icons. Use the established Lucide icon library.
8. No unprompted neon glows, glowing borders, excessive glassmorphism, or ornamental pulse effects.
9. No unverified success indicators, invented metrics, placeholder user data, or false security claims.
10. No redesign that silently removes product features, weakens permissions, changes API contracts, or changes data behavior.
11. No AI-generated architecture mutation without explicit review and user confirmation.
12. No claiming visual/browser validation based solely on unit tests, snapshots, or static source inspection.

## 10. Required Design Workflow for AI Coding Agents

Before making UI changes:

1. Read `PRD.md`, `SYSTEM.md`, `RULES.md`, `FEATURES.md`, `TESTS.md`, `memory.md`, this `DESIGN.md`, and relevant `docs/ui-ux/` files.
2. Inspect the current implementation and identify the specific route/components responsible for the requested visual issue.
3. Use only relevant installed skills. Do not activate every available skill indiscriminately. Skills provide methods; this file controls the final design decisions.
4. If Google Stitch is available, use it to explore/reference layout direction before implementation where appropriate. Treat output as inspiration, not as authority over this design system. Respect any tool or daily-use limits.
5. If using 21st.dev, use it selectively for a component that genuinely benefits from it. Do not add dependencies or copy a component that conflicts with this design system.
6. Make the smallest coherent set of changes. Reuse project components, tokens, and icon libraries. Do not replace working architecture with a generated demo.
7. Check responsive behavior, accessibility, existing flows, permissions, loading/error/empty states, and real API-backed data.
8. Run the complete relevant test suites, typecheck, and production build. Report exactly what was run and what was not.
9. If browser automation is available, inspect real rendered pages at the viewport sizes listed above. Clearly separate browser evidence from unit-test evidence.
10. Do not begin a second UI implementation task while another implementation task is actively running. Wait for it to finish, inspect its diff and report, then continue with the next scoped task to avoid overlapping edits and conflicting agents.

### Installed skill selection

Use explicit skill invocation in Google Antigravity with the available slash-command syntax, for example `/ui-ux-pro-max`, `/design-taste-frontend`, `/stitch-design-taste`, `/minimalist-ui`, `/high-end-visual-design`, `/redesign-existing-projects`, and `/ui-styling`, **only when those exact skills are installed and their invocation format is supported**. Do not assume every listed skill exists or invoke all of them for every task. For a focused visual redesign, select a small complementary set, such as:

- `/ui-ux-pro-max` for design audit and UX heuristics
- `/design-taste-frontend` or `/stitch-design-taste` for stronger visual direction
- `/redesign-existing-projects` for improving existing screens without rebuilding the product
- `/ui-styling` for implementation details

Use `Google Stitch` as a design exploration tool if its MCP integration is available. Do not claim a skill or MCP tool was used unless it was actually invoked successfully. When a slash command is not supported, read the corresponding skill file and follow its instructions instead.

## 11. Implementation References

Keep these existing technical sources of truth aligned with the brand tokens when implementing:

- `client/src/index.css` — CSS custom properties, base styles, focus and reduced-motion rules
- `client/tailwind.config.js` — Tailwind theme extension and semantic colors
- `client/src/lib/architecture/nodeIcons.tsx` — centralized node icon/visual configuration
- `client/src/components/architecture/*` — canvas, nodes, palette, and panels
- `shared/types/architecture.ts` — authoritative node and edge contracts

This document defines the intended design, not proof that the current UI already implements it. After implementation, update the actual tokens and components, inspect the rendered UI, and report any gaps honestly.
