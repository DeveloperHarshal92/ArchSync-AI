# ArchSync AI — Design System & UI/UX Specification

**Document:** `DESIGN.md`  
**Product:** ArchSync AI — Collaborative Architecture Workspace  
**Version:** 3.0.0  
**Status:** Canonical visual source of truth  
**Applies to:** Public landing page, authentication, dashboard, project management, architecture studio, shared components, dialogs, forms, and responsive states.

> **Priority and scope:** This document defines the intended visual system and interaction principles. Preserve existing product behavior, data contracts, permissions, security, and architecture. If a reference image conflicts with real product behavior, preserve the behavior and adapt the design. If a skill, generated mockup, or old styling conflicts with this document, follow this document unless the user explicitly requests a different direction.

---

## 1. Product and Brand Direction

ArchSync AI is a collaborative architecture-design workspace. Its visual identity combines cinematic architectural imagery and editorial typography on public pages with a precise, high-density engineering interface inside the product.

The product should feel considered, technical, confident, and premium. It must not resemble a generic SaaS starter template, a gaming dashboard, or a collection of unrelated AI-generated screens.

### Core principles

- **One coherent system:** All routes must look like parts of the same product, not separate templates.
- **Product first:** The architecture canvas and actual project information take priority over decoration.
- **Cinematic marketing, practical application:** Use strong imagery and editorial composition on the landing and authentication pages. Keep the dashboard useful and the studio information-dense.
- **Purposeful asymmetry:** Use varied compositions when they improve hierarchy. Do not default to centered headlines and identical three-card sections.
- **No redundant controls:** A capability should have one clear primary entry point in its relevant context. Do not repeat AI Assistant, Analysis, Validation, or equivalent buttons in multiple permanent navigation areas.
- **Honest interface:** Do not invent user data, metrics, save status, API health, timestamps, testimonials, model latency, or security claims.
- **Preserve working behavior:** A visual redesign must not silently remove features, change API contracts, weaken permissions, alter authentication, or change persistence semantics.
- **Reference-led, not screenshot-led:** Use the supplied ArchSync AI reference images for art direction and layout principles. Rebuild functional interfaces using real components; do not use flattened screenshots as page backgrounds.

## 2. Reference Images and Intended Use

Use the supplied reference images as visual guidance. If they are stored in the repository, preserve their names and place them in a dedicated reference directory such as `design-references/`.

- `ArchSync AI_ Architect What Comes Next-1(1).png`: primary landing-page hero, cinematic composition, editorial headline, CTA hierarchy, and product preview.
- `ArchSync AI_ Intelligent Architecture Design-3(1).png`: landing-page storytelling, section composition, and architectural visualization.
- `ArchSync AI Architecture Platform-2(1).png`: product presentation and architecture workspace.
- `Cinematic ArchSync AI Login and Register Split-Screen-1.png`: login and registration composition.
- `ArchSync AI Architecture Dashboard(2).png`: architecture canvas, component library, and contextual inspector.
- `ArchSync AI Architecture Blueprint-3.png`: node styling, component library, diagram canvas, and technical detailing.
- `ArchSync AI Architecture Dashboard-2.png`: dashboard, project list, activity, and project preview composition.

Reference images are not authoritative for fake data, unsupported features, exact text, or controls that do not exist. Keep real application capabilities and data as the source of truth.

## 3. Design Tokens

### 3.1 Color palette

Use a cohesive dark architectural palette with warm bronze/amber accents. The earlier ivory/blue/coral palette is deprecated and must not be mixed into the current design.

Recommended base tokens:

| Token | Value | Intended use |
|---|---|---|
| `--color-bg` | `#090907` | Main page and application background |
| `--color-surface` | `#11110F` | Main panels and raised surfaces |
| `--color-surface-raised` | `#191814` | Dialogs, menus, raised panels |
| `--color-text` | `#F2EEE7` | Primary text on dark surfaces |
| `--color-text-muted` | `#B9B1A5` | Secondary text and descriptions |
| `--color-border` | `rgba(185, 157, 115, 0.22)` | Quiet structural borders |
| `--color-accent` | `#B99D73` | Primary bronze/amber accent |
| `--color-accent-deep` | `#6C5636` | Secondary earth-brown accent |
| `--color-focus` | `#D6B887` | Keyboard focus and high-visibility active states |

These values are starting tokens, not permission to introduce arbitrary accent colors. Small opacity variations of the palette are allowed for borders, overlays, hover states, and surfaces. Maintain sufficient contrast for all actual foreground/background combinations.

**Semantic colors:** Existing success, warning, error, and information states may retain distinct semantic treatments where required for meaning and accessibility. Define them centrally and use them sparingly. Do not recolor every component with a new hue. Status must never be communicated by color alone; pair it with text or an icon.

### 3.2 Color rules

1. Prefer near-black backgrounds, warm off-white text, bronze accents, and restrained earth-brown details.
2. Do not reintroduce the deprecated ivory/blue/coral visual system.
3. Avoid purple-to-blue gradients, neon cyan, excessive multicolor node palettes, and glowing outlines.
4. Do not apply gradients to text or use full-page gradients as a substitute for composition.
5. Use background imagery and lighting as controlled art direction, not as a reason to reduce text contrast.
6. Reserve the strongest accent for primary actions, selected states, focus, and meaningful diagram emphasis.
7. Keep the canvas grid subtle enough that nodes and edges remain the focus.
8. Do not use emoji as interface icons. Use Lucide or the existing project icon library.
9. Check contrast in the rendered UI rather than assuming the tokens automatically pass accessibility requirements.

### 3.3 Typography

Use this default pairing unless the repository already has a compatible, intentionally established equivalent:

- **Editorial/display headings:** `Cormorant Garamond`, Georgia, serif.
- **Interface/body/navigation/forms:** `Montserrat`, system-ui, sans-serif.
- **Technical metadata:** existing monospace stack, such as `JetBrains Mono`, `ui-monospace`, monospace.

Use the display face for marketing headlines and selected major page headings, not every panel title. Use the interface face for controls, forms, navigation, and dense workspace content. Use monospace only for IDs, code, coordinates, versions, and technical metadata.

Load fonts through the project's existing approved method, include fallbacks, and avoid blocking initial render. Keep font weights limited and use responsive `clamp()` sizes for large headings.

### 3.4 Motion tokens

- Micro-interactions: approximately 100–160 ms.
- Panel and dialog transitions: approximately 180–240 ms.
- Larger transitions: approximately 250–350 ms when they improve orientation.
- Prefer opacity and transforms. Avoid costly layout animation where possible.
- No perpetual decorative animation, unprompted pulsing, or glow loops.
- Honor `prefers-reduced-motion` throughout the product.

## 4. Layout and Information Hierarchy

### 4.1 Use viewport space intentionally

- Avoid oversized outer gutters and unnecessary nested containers.
- Marketing pages may use editorial composition and controlled whitespace. Do not waste the first viewport with empty space.
- The authenticated application should use available viewport width efficiently; do not constrain the entire dashboard or studio to a narrow marketing max-width.
- Establish one clear page gutter and avoid repeatedly adding horizontal padding at every nested level.
- Use `min-height: 100dvh` where appropriate. Keep the architecture canvas viewport-filling and prevent global footers from stealing workspace height.
- At narrow widths, retain safe gutters and avoid horizontal page overflow.

### 4.2 Avoid repetition

- Do not use the same card grid on every page or for every feature.
- Prefer lists and tables for data, compact rows for navigation, and cards only when grouping has real meaning.
- Do not wrap every section in a bordered rounded rectangle.
- Vary layout according to content purpose. Not every panel needs the same padding, height, border radius, or visual weight.
- Avoid redundant headings and repeated CTAs that compete for attention.

### 4.3 Shared application shell

Use consistent navigation, spacing, typography, iconography, and interaction states across routes. Reuse components where it improves consistency, but do not create excessive abstractions for trivial elements.

Define clear visual roles for primary, secondary, tertiary, and destructive actions. Buttons must have a single clear purpose and visible hover, pressed, disabled, loading, and focus states.

## 5. Page-Specific Direction

### 5.1 Landing page

Use the cinematic architectural references as the primary art direction.

- Create an asymmetric hero with an expressive headline, concise supporting copy, a primary CTA, a secondary product-exploration action, and a large architectural/product visual.
- Use the headline “Design the systems behind what comes next.” or a product-appropriate alternative if content requires it.
- Show the real product through a functional UI preview or a carefully composed preview built from real components. Do not present fake functionality as live.
- Build a visual narrative about architecture design, connections, collaboration, AI insights, validation, and documentation.
- Use varied section compositions, editorial typography, architectural imagery, technical linework, and deliberate transitions.
- Avoid repetitive three-card feature grids, generic stock-photo teams, fake testimonials, invented metrics, and decorative sections that do not explain the product.
- The first viewport must communicate what the product does and how to begin using it.

### 5.2 Authentication

Use the split-screen authentication reference as guidance, adapting the layout to viewport size.

- Use atmospheric architectural artwork with enough contrast to keep text legible.
- Keep forms focused, compact, accessible, and easy to scan.
- Persistent labels are required; placeholders supplement labels and never replace them.
- Provide clear validation, loading, recoverable error, and password visibility states.
- Preserve current authentication, session, cookie, redirect, and backend behavior.
- Do not add social-login buttons unless the provider is implemented and supported.

### 5.3 Dashboard and project management

Use the dashboard reference for its clear project hierarchy, architectural previews, and compact data presentation.

- Show existing workspace selection, project creation, search, filtering, sorting, project status, collaborators, recent activity, and templates only where supported by the product.
- Prefer a featured project preview plus a useful list/table over many decorative cards.
- Use actual application data. Empty states and explicitly identified demo data are acceptable; invented live activity or statistics are not.
- Preserve project CRUD operations, sharing, ownership, roles, and navigation.
- Keep imagery selective so project information remains readable.

### 5.4 Architecture studio

The studio is a functional engineering workspace, not a marketing page. Keep the canvas as the largest and most visually important region.

**Top toolbar:** Show only relevant workspace-level actions, such as project selection, save status, undo/redo, collaboration, share, and export. Keep it compact.

**Left sidebar:** Provide component search, categories, and drag-and-drop. Keep secondary destinations such as Templates and Settings accessible without duplicating every capability as a permanent button.

**Canvas:** Preserve React Flow behavior, node/edge manipulation, pan, zoom, grid, alignment guides, selection, minimap, keyboard shortcuts, undo/redo, autosave, collaboration, and export. Keep grid lines subtle and labels readable at normal zoom.

**Right inspector:** Use one contextual inspector with distinct tabs:

1. **Properties:** node or edge configuration, labels, colors, border width, opacity, arrowheads, alignment, and advanced settings.
2. **Analysis:** AI-generated recommendations and architecture insights.
3. **Validation:** structural issues, warnings, and validation results.

Adapt Properties to the current selection. Preserve the selection when switching tabs. Analysis and Validation are different capabilities, but must not have duplicate permanent entry points across the sidebar, toolbar, and inspector. Use one primary trigger in the most relevant context.

AI suggestions are advisory. Never modify the graph without an explicit user action and a clear preview/confirmation where changes are applied.

## 6. Lenis and GSAP Scroll Animation Policy

**Lenis is for smooth scrolling on the public landing page. GSAP and ScrollTrigger are for scroll-linked animation. They have different responsibilities and must be integrated as one coherent system.**

### 6.1 Lenis scope

- Inspect the current dependencies and scrolling code first.
- Reuse Lenis if already installed. Install it only if it is missing and the landing-page implementation requires it.
- Use one Lenis instance for the landing-page scrolling context, not one instance per section or component.
- Follow the current installed Lenis API and official integration guidance for the project's GSAP/ScrollTrigger versions.
- Synchronize Lenis and ScrollTrigger correctly so trigger positions and progress remain accurate.
- Clean up listeners, animation frames, and instances on unmount.
- Avoid duplicate instances, competing smooth-scroll libraries, and unnecessary React renders on every scroll frame.
- Preserve anchor navigation, browser history, keyboard navigation, and expected focus behavior.
- Respect `prefers-reduced-motion`. Use native or reduced-motion scrolling when requested.
- Do not force smooth scrolling on touch devices when it harms native touch behavior.

### 6.2 GSAP and ScrollTrigger

Use GSAP/ScrollTrigger selectively for:
- Staggered heading and text reveals
- Image-mask reveals
- Subtle architectural-artwork parallax
- Section entrance transitions
- Fine-line animations that trace diagram connections
- Sequential content reveals when they improve comprehension

Avoid perpetual animation, unnecessary pinning, excessive blur, animated layout dimensions, or motion that delays access to content. Elements must remain visible if animation initialization fails.

Use scoped GSAP contexts or an equivalent cleanup strategy. Refresh trigger measurements when image loading or layout changes materially. Prevent duplicate triggers during React development/remounts. Ensure all motion has a reduced-motion alternative.

### 6.3 Where Lenis must not be applied

- Do not globally wrap every route in Lenis.
- Do not apply Lenis to the architecture canvas, React Flow interactions, component library, inspector, dialogs, or nested scrollable panels.
- Authentication and dashboard routes should retain native scrolling unless a separately justified, tested requirement exists.
- GSAP may animate modest UI transitions elsewhere, but it must not interfere with editor state, pointer events, keyboard shortcuts, or scrollable panels.

## 7. Component and Interaction Rules

### 7.1 Buttons and actions

- Use one primary action per context where possible.
- Avoid duplicate Analyze, AI Assistant, Validate, Export, or other actions in multiple permanent locations.
- Secondary actions should be visually quieter than primary actions.
- Destructive actions require explicit wording and confirmation when appropriate.
- Never show an action as successful until the actual operation succeeds.

### 7.2 Forms and inputs

- Always show persistent labels.
- Use consistent control heights within a form and readable contrast.
- Provide visible focus states and useful error text.
- Password visibility controls need accessible names and must not accidentally submit forms.
- Prevent duplicate submissions while a request is in flight and preserve input values when showing recoverable errors.

### 7.3 Navigation and status

- Use compact navigation with clear active states and readable labels where space allows.
- Use one icon library with consistent size and stroke weight.
- Show save/sync status only when backed by actual state. Distinguish authentication state, API health, and project synchronization.
- Do not expose developer-only test jargon, internal milestones, or placeholder account information in the product UI.

### 7.4 Architecture nodes and edges

- Preserve existing node types, edge semantics, and shared contracts.
- Centralize node icon and visual configuration rather than scattering conditionals across components.
- Use the established brand palette with restrained semantic differentiation. Do not introduce arbitrary colors solely to make node categories look colorful.
- Distinguish categories using icons, labels, border treatments, and subtle accents.
- Keep node labels readable and connection handles usable.
- Invalid connections must have a visible treatment and accessible textual feedback.
- Edge animation is optional and must not make dense graphs noisy.

### 7.5 AI and validation

- Render AI responses as structured, readable content, not raw nested JSON.
- Separate findings, severity, explanation, and recommendations.
- Do not fabricate model status, token counts, latency, or capabilities.
- Validation must only display results from an actual validation run or clearly identify a pending state.
- AI suggestions require explicit user action before modifying the architecture.

## 8. Accessibility and Quality Bar

- Target WCAG 2.2 AA where practical.
- Aim for contrast of at least 4.5:1 for normal text and 3:1 for large text and essential UI boundaries.
- Measure actual color combinations. Do not assume the palette automatically passes.
- Provide visible `:focus-visible` states, semantic landmarks, correct heading order, accessible dialogs, labels, live status announcements, and keyboard access.
- Aim for touch targets of at least 44×44 CSS pixels where layout permits.
- Do not communicate status by color alone.
- Respect `prefers-reduced-motion` for CSS, GSAP, and Lenis.
- Do not make essential content dependent on animation.

## 9. Responsive Rules

Verify actual rendering at 1440×900, 1280×800, 768×1024, and 375×812.

- **Mobile (<768px):** Single-column marketing content, compact navigation, side panels as drawers/sheets, safe gutters, and no horizontal page overflow. Keep the canvas navigable with touch and accessible controls.
- **Tablet (768–1023px):** Collapse secondary panels when needed; preserve a useful canvas width and accessible navigation.
- **Desktop (1024–1439px):** Use viewport width efficiently with compact shell elements and contextual panels.
- **Wide desktop (1440px+):** Expand useful working area rather than adding empty margins.
- Verify that images crop intentionally, headings do not overflow, CTAs remain visible, and animation remains stable across breakpoints.

## 10. Explicit Anti-Patterns

1. No reverting to the deprecated ivory/blue/coral palette.
2. No generic purple-to-blue AI gradients, neon glows, or excessive glassmorphism.
3. No centered hero plus three equal cards as the default layout for every page.
4. No unnecessary max-width containers or nested gutters that waste viewport space.
5. No repetitive cards for content better presented as rows, tables, or editorial layouts.
6. No redundant permanent navigation or duplicate primary actions for the same capability.
7. No emoji as interface icons.
8. No perpetual decorative animation or forced smooth scrolling across the whole application.
9. No Lenis on the architecture editor, nested panels, dialogs, or React Flow canvas.
10. No unverified success indicators, invented metrics, placeholder user data, or false security claims.
11. No silent removal of features, weakened permissions, unnecessary API contract changes, or altered persistence behavior.
12. No AI-generated architecture mutation without explicit review and user confirmation.
13. No claiming visual/browser validation based only on unit tests, snapshots, or static source inspection.

## 11. Required Workflow for AI Coding Agents

Before UI changes:

1. Read `PRD.md`, `SYSTEM.md`, `RULES.md`, `FEATURES.md`, `TESTS.md`, `memory.md`, this file, and relevant UI documentation where available.
2. Inspect the actual routes, components, styles, current dependencies, and Git changes.
3. Read relevant installed skills. Do not activate every available skill indiscriminately. Skills provide methods; this document defines the intended visual direction.
4. Map the reference images to the pages they are meant to influence.
5. Make a concise implementation plan before editing.
6. Implement in small, reviewable stages. Do not run overlapping tasks that edit the same files.
7. Reuse existing components, tokens, and libraries where sensible. Do not replace working architecture with a generated demo.
8. Check responsive behavior, accessibility, existing flows, permissions, loading/error/empty states, and real API-backed data.
9. Run relevant tests, typecheck, and production build. Report exactly what ran and what did not.
10. If browser automation is available, inspect actual rendered pages at the viewport sizes above. Separate browser evidence from unit-test evidence.
11. Do not claim a skill, MCP tool, browser check, generated asset, or integration was used unless it was actually used successfully.

### Skill selection

Use explicit skill invocation only when the exact skill is installed and the invocation format is supported. For a visual redesign, select a small complementary set such as:

- `ui-ux-pro-max` for UX audit and heuristics
- `design-taste-frontend` or `stitch-design-taste` for visual direction
- `redesign-existing-projects` for improving existing screens safely
- `ui-styling` for implementation details
- Relevant React, accessibility, animation, or testing skills for their specific work

If a skill is unavailable, do not invent it. Read the installed skill file when direct invocation is unsupported. Use Google Stitch or 21st.dev only if the integration is available and useful; respect any tool-use limits and do not let generated output override this document.

## 12. Implementation References

Keep existing technical sources of truth aligned with the design tokens when these files exist:

- `client/src/index.css` — CSS custom properties, base styles, focus and reduced-motion rules
- `client/tailwind.config.js` — Tailwind theme extension and semantic colors
- `client/src/lib/architecture/nodeIcons.tsx` — centralized node icon/visual configuration
- `client/src/components/architecture/*` — canvas, nodes, palette, and panels
- `shared/types/architecture.ts` — authoritative node and edge contracts

Paths may differ in the current repository. Inspect the actual structure before editing; do not create duplicate files just because a documented path is absent.

This document defines intended design, not proof that the current application implements it. After implementation, update actual tokens and components, inspect the rendered UI, and report any remaining gaps honestly.