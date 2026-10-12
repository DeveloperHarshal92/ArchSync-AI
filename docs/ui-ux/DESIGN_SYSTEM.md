# ArchSync AI — Canonical Design System

**Document:** `DESIGN_SYSTEM.md`  
**Version:** 3.0.0  
**Status:** Canonical implementation-level design system  
**Applies to:** React client, shared UI components, Tailwind CSS, global styles, architecture studio, and authenticated application screens

## 1. Design philosophy

ArchSync AI combines premium editorial design with the precision of a professional software architecture tool.

The visual identity has four principles:

1. **Editorial clarity:** Strong typography, thoughtful whitespace, and purposeful layouts.
2. **Technical precision:** Clear node relationships, structured panels, and readable architecture data.
3. **Functional restraint:** Minimal decoration, purposeful color, and no fake interactions.
4. **Operational trust:** Accurate save states, clear validation feedback, and consistent interface behavior.

The application must not look like a generic dashboard template or a physical architecture portfolio.

## 2. Relationship to other documents

This file defines implementation-level design tokens and component standards.

- `DESIGN.md` is the authority for brand identity and overall visual direction.
- `docs/ui-ux/UI_UX_PRD.md` defines product requirements.
- `docs/ui-ux/SCREEN_SPECS.md` defines route-level layouts.
- `docs/ui-ux/INTERACTION_SPEC.md` defines interaction behavior.
- `docs/ui-ux/UI_TESTS.md` defines acceptance criteria.

If a color or typography value conflicts with `DESIGN.md`, update the implementation token to match `DESIGN.md`.

Do not maintain two competing brand palettes or create a separate theme merely because an older component uses different colors.

## 3. Brand foundations

### 3.1 Canonical brand tokens

| Token | CSS custom property | Value | Usage |
|---|---|---|---|
| Warm Ivory | `--color-ivory` | `#eae6ed` | Primary light surfaces |
| Deep Editorial Blue | `--color-blue` | `#226192` | Brand emphasis and structural accents |
| Coral Orange | `--color-coral` | `#ef8557` | Primary actions and restrained highlights |

These values are canonical. Do not substitute the previous cyan-only brand identity.

### 3.2 Supporting tokens

Use the following supporting tokens to build readable application surfaces.

```css
:root {
  /* Brand */
  --color-ivory: #eae6ed;
  --color-blue: #226192;
  --color-coral: #ef8557;

  /* Light surfaces */
  --color-page: #eae6ed;
  --color-surface: #ffffff;
  --color-surface-muted: #f5f2f5;
  --color-surface-raised: #ffffff;

  /* Text */
  --color-text-primary: #202027;
  --color-text-secondary: #595660;
  --color-text-muted: #706a75;

  /* Borders */
  --color-border: #d9d3dc;
  --color-border-strong: #bcb4c2;

  /* Interactive */
  --color-action: #226192;
  --color-action-hover: #194b73;
  --color-focus: #226192;
  --color-highlight: #ef8557;

  /* Feedback */
  --color-success: #216e4e;
  --color-warning: #8a5200;
  --color-error: #b42318;
  --color-info: #226192;

  /* Typography */
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-interface: "Montserrat", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Layout */
  --height-topbar: 48px;
  --width-palette: 240px;
  --width-inspector: 340px;

  /* Shape */
  --radius-control: 8px;
  --radius-card: 12px;
  --radius-panel: 14px;

  /* Motion */
  --duration-fast: 140ms;
  --duration-normal: 220ms;
  --duration-smooth: 300ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1);
}
```

These supporting colors are implementation defaults. Test their contrast in the actual rendered combinations. Adjust individual text or status tokens when necessary to meet accessibility requirements without changing the canonical brand colors.

### 3.3 Token ownership

Define shared tokens in the existing global stylesheet or established token module.

- Do not duplicate the palette in every component.
- Do not hardcode alternate brand colors in page-specific CSS.
- Use semantic token names instead of repeatedly referencing raw hex values.
- Keep Tailwind configuration and CSS custom properties aligned.
- Prefer existing project conventions over creating a parallel token infrastructure.

## 4. Theme and surface policy

### 4.1 Marketing and public pages

Use the light editorial design system.

- Warm Ivory page backgrounds.
- White or muted light content surfaces.
- Deep blue structural emphasis.
- Coral for primary actions and selected highlights.
- Dark, readable typography.
- Product screenshots and software architecture illustrations.

Avoid oversized decorative imagery, excessive blur, and generic stock photography.

### 4.2 Authenticated application

Use the same light editorial system for the dashboard, project catalog, invitations, and settings.

- Clear navigation.
- Compact data presentation.
- Restrained borders.
- Readable tables and metadata.
- Consistent form controls and buttons.

Do not create a separate palette for authenticated routes.

### 4.3 Architecture studio

The studio must use the canonical brand tokens for shared controls and interface chrome.

The canvas may use a dark technical surface when it improves diagram readability. This is a surface treatment, not a second brand identity.

Example canvas tokens:

```css
:root {
  --color-canvas-bg: #17191e;
  --color-canvas-grid: rgba(255, 255, 255, 0.07);
  --color-canvas-node: #242830;
  --color-canvas-node-selected: #303641;
  --color-canvas-border: #454b56;
  --color-canvas-text: #f5f4f6;
  --color-canvas-text-muted: #c1c4cc;
}
```

Use these tokens only for the graph surface and components that must remain legible on it.

The palette, toolbar, inspector, dialogs, and buttons must retain consistent brand identity. Do not automatically make every application screen dark.

### 4.4 Theme switching

Do not add a theme toggle unless the application already supports it or an explicit product requirement authorizes it.

The presence of dark screenshots does not imply that users need a persistent theme preference.

## 5. Typography system

### 5.1 Font families

- Display: Cormorant Garamond.
- Interface: Montserrat.
- Technical metadata: JetBrains Mono.

Use reliable system fallbacks.

```css
:root {
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-interface: "Montserrat", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

### 5.2 Type scale

| Role | Desktop size | Weight | Usage |
|---|---:|---:|---|
| Marketing hero | 52–76px | 400–500 | Landing-page headline |
| Editorial section heading | 36–52px | 400–500 | Major marketing sections |
| Page heading | 28–36px | 500–600 | Dashboard and project pages |
| Panel heading | 16–20px | 600 | Inspector, dialogs, tool panels |
| Component title | 13–15px | 600 | Architecture nodes and list items |
| Body text | 13–15px | 400 | General interface copy |
| Supporting text | 12–14px | 400 | Descriptions and helper text |
| Technical metadata | 11–12px | 400–500 | IDs, version values, timestamps |
| Small status label | 11–12px | 600 | Badges and status indicators |

These sizes are starting points, not permission to make essential text unreadably small.

### 5.3 Typography rules

- Use serif typography for editorial display headings.
- Use the interface font for controls, forms, tables, and general application text.
- Use monospace for technical identifiers where it adds clarity.
- Keep body text readable against its actual background.
- Avoid excessive uppercase labels.
- Avoid long all-caps paragraphs.
- Use fluid sizing where necessary for responsive layouts.

## 6. Spacing and layout tokens

Use a consistent spacing scale.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

### Layout guidelines

- Marketing container: approximately 1280px maximum width.
- Desktop content gutters: 32–56px.
- Tablet content gutters: approximately 24px.
- Mobile content gutters: 16–20px.
- Marketing section spacing: approximately 64–112px on desktop.
- Studio toolbar: approximately 48px high.
- Component palette: approximately 240px wide on suitable desktop screens.
- Inspector: approximately 340px wide on suitable desktop screens.

Use flexible sizing and available viewport dimensions rather than treating these values as rigid constraints.

## 7. Elevation, borders, and shape

### 7.1 Border tokens

```css
:root {
  --border-subtle: #e6e1e8;
  --border-default: #d9d3dc;
  --border-strong: #bcb4c2;
  --border-interactive: #226192;
}
```

Use borders to define structure, not to decorate every container.

### 7.2 Radius scale

| Token | Value | Usage |
|---|---:|---|
| Small | 4px | Compact badges and small technical indicators |
| Control | 8px | Buttons, inputs, selects |
| Card | 12px | Project cards and feature cards |
| Panel | 14px | Large workspace panels |
| Pill | 999px | Compact status badges where appropriate |

Avoid mixing numerous unrelated radii across the same screen.

### 7.3 Shadows

Use restrained shadows on light surfaces.

```css
:root {
  --shadow-card:
    0 2px 8px rgba(32, 32, 39, 0.05),
    0 8px 24px rgba(32, 32, 39, 0.04);

  --shadow-popover:
    0 12px 32px rgba(32, 32, 39, 0.12);
}
```

Use stronger elevation only for actual overlays, floating menus, and selected objects where it improves hierarchy.

Avoid persistent neon glows and large decorative shadows.

## 8. Button system

### 8.1 Primary button

Use for the most important action in a context.

- Background: canonical deep blue or an approved accessible brand-action token.
- Text: high-contrast text color.
- Radius: 8px.
- Padding: approximately 12–16px horizontally and 8–12px vertically.
- Clear hover, active, disabled, loading, and focus states.

The coral token may be used for primary actions where the actual contrast combination passes accessibility requirements. Do not assume coral with white text is automatically accessible.

### 8.2 Secondary button

- Light or transparent surface.
- Clear border.
- Readable dark text.
- Visible hover and focus states.

### 8.3 Tertiary button

Use for low-emphasis actions that remain discoverable.

### 8.4 Destructive button

- Distinguishable destructive color.
- Clear action label.
- Appropriate confirmation for irreversible or high-impact operations.

### 8.5 Icon buttons

- Accessible name.
- Visible focus indicator.
- Tooltip where an icon's meaning is not obvious.
- Appropriate hit area.
- No decorative or inert controls styled as buttons.

Target a 44 × 44px touch area on mobile wherever practical.

## 9. Form controls

Use consistent styling for text inputs, textareas, selects, checkboxes, and toggles.

Requirements:

- Persistent labels.
- Readable input text.
- Clear placeholder contrast.
- Visible focus state.
- Disabled styling.
- Invalid-state styling.
- Field-specific error messages.
- Appropriate autocomplete and input types.
- Accessible icon controls.
- No dependence on placeholder text as the only label.

Use the existing form library or component conventions where available.

## 10. Cards, tables, and metadata

### Cards

Use cards for meaningful entities such as projects, templates, findings, and collaboration summaries.

Each card should have:
- A clear title.
- Relevant supporting information.
- An obvious primary interaction, when interactive.
- Consistent padding.
- Appropriate focus and hover behavior.

Do not turn every text section into a card.

### Tables

- Keep column labels clear.
- Align data consistently.
- Avoid excessive horizontal density.
- Preserve readable row spacing.
- Provide responsive behavior for smaller screens.
- Use actual project and collaboration data.

### Metadata

Show timestamps, status, identifiers, and counts only when the information exists and is relevant.

Never fabricate activity or project metrics to fill visual space.

## 11. Architecture node visual system

### 11.1 Semantic identity

Reuse the existing `NODE_CATALOG`, `nodeIcons`, shared `ArchitectureNodeType`, and current node-rendering architecture.

These are the authoritative mappings for supported node types.

Do not create a competing registry inside the design system or hardcode different node meanings in separate components.

### 11.2 Node anatomy

A typical node may contain:

- Semantic icon.
- Node type or category.
- Component title.
- Optional description.
- Optional technology metadata.
- Supported connection handles.

Render only fields supported by the existing model.

### 11.3 Node states

| State | Visual behavior |
|---|---|
| Default | Stable border and readable content |
| Hover | Subtle border or surface emphasis |
| Selected | Clear outline and additional visual emphasis |
| Focused | Visible keyboard focus |
| Connecting | Relevant handles and targets are emphasized |
| Invalid target | Clear warning treatment |
| Read-only | No misleading editing affordances |

Selection must remain identifiable without relying solely on a color change.

### 11.4 Node dimensions

Node width and height should follow the actual node component, text length, and graph-layout behavior.

Avoid hardcoding one fixed size for every node type when content and semantics differ.

Text must wrap or truncate predictably. Essential component labels must remain understandable.

## 12. Connection and edge styling

- Connections must remain distinguishable from the canvas grid.
- Use directional markers when the graph semantics support direction.
- Provide clear hover and selected states.
- Display invalid connection feedback using both color and another visual cue.
- Avoid unnecessary edge animation.
- Keep labels readable at supported zoom levels.

Connection styling must follow the actual graph model. The design system does not impose new graph rules.

## 13. Component palette

The component palette should prioritize discovery and placement.

Requirements:

- Searchable component catalog.
- Collapsible categories where supported.
- Consistent component icons.
- Clear distinction between draggable, selectable, and disabled items.
- Keyboard-accessible placement.
- Useful empty search state.

Reuse existing category and icon mappings.

## 14. Inspector and workspace panels

Use a shared panel structure.

Typical anatomy:

1. Panel header.
2. Contextual title or tabs.
3. Scrollable content.
4. Optional action area.

Properties, validation, and AI must share a consistent panel framework rather than implementing unrelated layouts.

Panel widths are flexible. On mobile, use drawers instead of forcing multiple desktop panels into the viewport.

## 15. Status colors and feedback

Semantic colors represent operational meaning, not decoration.

```css
:root {
  --status-success: #216e4e;
  --status-warning: #8a5200;
  --status-error: #b42318;
  --status-info: #226192;
}
```

Use them for:
- Successful saves.
- Validation findings.
- Errors and failed requests.
- Warnings and conflicts.
- Informational feedback.

Check contrast on every relevant surface.

Use icons, labels, and text in addition to color.

Never communicate a save failure, validation warning, or permission restriction through color alone.

## 16. Motion system

```css
:root {
  --duration-fast: 140ms;
  --duration-normal: 220ms;
  --duration-smooth: 300ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Motion rules

- Use brief transitions for hover and focus feedback.
- Use restrained transitions for drawers and dialogs.
- Prefer transform and opacity for animation.
- Do not animate layout properties unnecessarily.
- Never delay essential user input.
- Do not animate every node continuously.
- Avoid scroll hijacking and unnecessary parallax.
- Respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Preserve essential feedback and state changes when motion is reduced.

## 17. Accessibility

Target WCAG 2.2 AA where practical, with WCAG 2.1 AA as the minimum project baseline.

- Normal text contrast: at least 4.5:1.
- Qualifying large text contrast: at least 3:1.
- Meaningful component boundaries and graphical elements: meet applicable non-text contrast requirements.
- Visible keyboard focus.
- Semantic headings and landmarks.
- Accessible names for icon-only controls.
- Correct dialog and menu semantics.
- Accessible form errors.
- Keyboard alternatives to drag-and-drop.
- Status announcements for meaningful asynchronous events.
- Reduced-motion support.

Do not claim accessibility compliance based only on the selected hex values. Verify rendered combinations and actual interactions.

## 18. Responsive design

### Desktop: 1280px and above

- Full navigation.
- Editorial marketing layouts.
- Multi-panel architecture studio when space allows.

### Tablet: 768–1279px

- Reduced gutters.
- Compact navigation.
- Collapsible panels.
- Fewer simultaneous secondary controls.

### Mobile: below 768px

- Stacked public layouts.
- Full-width forms.
- Drawer-based studio panels.
- Touch-friendly actions.
- No unnecessary horizontal page scrolling.

The studio must preserve useful canvas space. Do not simply scale down the entire desktop application.

## 19. Imagery and asset policy

Primary imagery must represent software architecture and the actual product.

Approved:
- Real architecture editor screenshots.
- Graph and component previews.
- Validation and AI-analysis interfaces.
- Collaboration interface previews.
- Technical illustrations with a clear purpose.

Avoid:
- Houses and construction photography.
- Generic landscape backgrounds.
- Unrelated stock imagery.
- Decorative AI graphics that communicate no product capability.

Use existing assets when they accurately represent the current application.

Store new assets in the established asset directory and reuse them rather than duplicating similar images.

Do not replace functional React components with screenshots to make a page easier to style.

## 20. Prohibited implementation patterns

1. **No competing brand systems.** Do not reintroduce the previous cyan-only palette as the global identity.
2. **No fake functionality.** Buttons, forms, menus, and links must work.
3. **No fake data.** Do not invent project counts, collaborators, AI results, or save confirmations.
4. **No misleading product imagery.** Static previews must not masquerade as live editors.
5. **No marketing footer in the studio.** The editor must remain viewport-contained.
6. **No internal engineering jargon in customer-facing UI.** Hide milestone IDs, internal validator names, and raw test descriptions.
7. **No inaccessible color-only states.** Pair color with labels, icons, or other meaningful indicators.
8. **No silent data loss.** Saving and conflict states must accurately reflect the persistence layer.
9. **No unsupported product claims.** Do not add aspirational AI, collaboration, or export features as if they already exist.
10. **No unnecessary framework replacement.** Preserve the existing React, Tailwind CSS, Redux Toolkit, RTK Query, and React Flow architecture.

## 21. Implementation checklist

- [ ] Canonical brand tokens are defined once.
- [ ] Typography follows the approved type system.
- [ ] Supporting surfaces are consistent across routes.
- [ ] Studio canvas styling is distinct but brand-aligned.
- [ ] Existing node catalog and icon mappings are preserved.
- [ ] Buttons and inputs use shared component styles.
- [ ] Panels and dialogs have consistent structure.
- [ ] Status states are readable and accessible.
- [ ] Responsive layouts are defined.
- [ ] Reduced-motion support is implemented.
- [ ] Product imagery depicts software architecture.
- [ ] Existing application functionality is preserved.
- [ ] Contrast and keyboard behavior are verified.
- [ ] The production build succeeds.

**Final authority rule:** `DESIGN.md` defines the brand and visual direction. This file translates that direction into reusable implementation tokens and component standards. Interaction behavior remains governed by `docs/ui-ux/INTERACTION_SPEC.md`.