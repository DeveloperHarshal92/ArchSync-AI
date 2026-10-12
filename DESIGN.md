# ArchSync AI — Design System & Product Experience Specification

**Document:** `DESIGN.md`  
**Version:** 3.0.0  
**Status:** Canonical design source of truth  
**Product:** ArchSync AI — Collaborative Software Architecture Workspace

## 1. Product identity

ArchSync AI is a software architecture modeling platform for designing, documenting, validating, and reviewing complex software systems.

Users build diagrams from semantic components such as clients, services, databases, API gateways, caches, queues, and cloud infrastructure. They connect dependencies, collaborate with teammates, validate architectural structures, and receive AI-assisted recommendations.

ArchSync AI is not a building architecture, construction, interior design, or real-estate application.

Every design decision must communicate this distinction.

## 2. Design vision

Create a premium editorial engineering product that combines:

- The clarity of a well-designed technical publication.
- The precision of a professional architecture editor.
- The usability of a modern collaborative workspace.
- The restraint of a mature developer tool.
- The visual intelligence of a product with meaningful AI capabilities.

The result should feel deliberate, trustworthy, technical, and sophisticated.

Avoid generic SaaS templates, excessive gradients, meaningless glass panels, oversized decorative illustrations, and repetitive three-card layouts.

**Primary design principle: the product is the hero.** Architecture diagrams, functional editor previews, meaningful system relationships, and actual workflow states should communicate value better than decorative imagery.

## 3. Reference-image interpretation

Use the supplied ArchSync AI reference images as inspiration for:

- Editorial serif headings and restrained technical typography.
- Warm, premium surfaces and asymmetric compositions.
- Detailed architecture-editor interfaces.
- Component libraries, connected service graphs, and property inspectors.
- Collaboration indicators, cursors, and user presence.
- AI analysis panels with actionable findings.
- Project dashboards with diagram thumbnails and project management controls.
- Clean, focused authentication forms.

The images are visual references, not permission to reproduce every element literally.

Some references contain physical buildings, mountains, landscape photography, or a dark visual theme. Do not reproduce those elements as the product's primary imagery or switch themes inconsistently between pages.

Replace physical-architecture visuals with software architecture diagrams and product-interface imagery.

Do not copy incorrect text, fabricated product claims, fake data, or controls that do not exist in the implementation.

## 4. Brand palette

The following are the core brand tokens.

| Token | Value | Purpose |
|---|---|---|
| Warm Ivory | `#eae6ed` | Primary page and canvas foundation |
| Deep Editorial Blue | `#226192` | Brand typography, structural elements, and primary interface emphasis |
| Coral Orange | `#ef8557` | Primary calls to action, active markers, and restrained highlights |

Define these as CSS custom properties and reuse them throughout the application.

```css
:root {
  --color-ivory: #eae6ed;
  --color-blue: #226192;
  --color-coral: #ef8557;

  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-interface: "Montserrat", sans-serif;

  --radius-control: 8px;
  --radius-card: 12px;
  --radius-panel: 14px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  --height-topbar: 48px;
  --width-palette: 240px;
  --width-inspector: 340px;

  --motion-fast: 140ms;
  --motion-normal: 220ms;
}
```

Supporting neutral surfaces may use opacity variations of approved brand colors. Semantic colors may be introduced where necessary to distinguish success, warnings, errors, and architecture node types. They must be purposeful, consistent, and accessible.

Do not force every node type into one color merely to satisfy brand consistency. Architecture nodes must remain distinguishable by icon, label, shape, and semantic meaning even when color is unavailable.

## 5. Typography

Use Cormorant Garamond for editorial display headings and Montserrat for interface text.

### Display typography

- Large marketing headline: approximately 52–76px on wide desktop layouts.
- Section heading: approximately 36–52px.
- Compact editorial heading: approximately 26–36px.
- Use controlled line lengths and natural wrapping.
- Use italic or coral emphasis sparingly.

### Interface typography

- Primary interface text: 13–15px.
- Secondary descriptions: 12–14px.
- Compact labels and metadata: 11–12px, provided readability remains acceptable.
- Buttons: 12–14px, medium or semibold weight.
- Technical identifiers, coordinates, and version numbers may use a monospace font when appropriate.

Do not use small text merely to imitate a screenshot. Readability takes priority over visual density.

Load fonts efficiently, provide fallbacks, and avoid layout shifts while web fonts load.

## 6. Layout and spacing

Use an editorial grid with asymmetric columns and purposeful alignment.

- Marketing content: a centered maximum-width container, approximately 1280px.
- Main content gutters: approximately 32–56px on desktop.
- Tablet gutters: approximately 24px.
- Mobile gutters: approximately 16–20px.
- Section spacing: generally 64–112px on desktop, reduced appropriately on smaller screens.
- Form and inspector controls: compact, consistently aligned, and clearly grouped.
- Workspace panels: dense enough for real work without sacrificing clarity.

Do not center every section, repeat identical card grids, or fill available space with decorative content.

Use whitespace to separate concepts, not to inflate the page.

## 7. Product imagery policy

### Approved visual content

1. Software architecture diagrams.
2. Interactive architecture-editor screenshots.
3. Service dependency graphs.
4. Component palettes and properties inspectors.
5. AI architecture analysis interfaces.
6. Collaboration and version-history interfaces.
7. Project cards containing genuine diagram previews.
8. Infrastructure and data-flow illustrations.

### Prohibited primary imagery

- Houses and residential buildings.
- Architectural photography and construction projects.
- Interior design and real-estate photography.
- Mountain landscapes used as generic hero backgrounds.
- Unrelated stock photographs.
- Generic AI brains, glowing robots, or meaningless circuit-board imagery.

### Asset hierarchy

Use the following order of preference:

1. Genuine screenshots of the current application.
2. Purpose-built product mockups that accurately represent implemented features.
3. Generated technical illustrations that clearly communicate software architecture.
4. Abstract supporting graphics only when they add information or improve comprehension.

Never present a static mockup as a functioning application.

Store approved assets locally where practical and document their purpose in an asset manifest.

Suggested directory:

```text
client/src/assets/images/
├── architecture-hero.webp
├── editor-preview.webp
├── dashboard-preview.webp
├── ai-analysis-preview.webp
├── collaboration-preview.webp
└── validation-preview.webp
```

Adapt this directory to the actual repository structure. Do not create duplicate assets if suitable equivalents already exist.

## 8. Component design

### Buttons

Support primary, secondary, tertiary, and destructive variants.

Every button must have:

- A clear action label.
- Hover, focus, active, disabled, and loading states where applicable.
- A visible focus indicator.
- Appropriate hit-area dimensions.
- An explicit type when placed inside a form.

Do not use decorative buttons that do nothing.

### Cards

Cards should represent meaningful entities or tasks, such as a project, template, validation finding, or AI recommendation.

Use consistent internal spacing, restrained borders, and clear hierarchy. Do not wrap every paragraph in a card.

### Inputs and forms

- Use persistent labels.
- Provide concise validation messages.
- Preserve user input after recoverable errors.
- Distinguish invalid, disabled, loading, and successful states.
- Ensure password visibility controls and other icon-only actions have accessible names.

### Navigation

Use distinct navigation shells for public pages and authenticated application pages.

The architecture studio must have its own compact workspace toolbar. Do not add the marketing footer or oversized marketing navigation to the editor.

## 9. Architecture canvas design

The architecture canvas is the primary functional surface of the product.

It must support the existing React Flow implementation and current domain model.

Required visual characteristics:

- Subtle dot-grid or equivalent spatial reference.
- Clearly differentiated semantic nodes.
- Readable labels and secondary technology metadata.
- Directional connections where supported by the domain model.
- Visible selection and focus states.
- Predictable connection handles.
- Zoom, pan, fit-to-view, and minimap controls where supported.
- A component palette with searchable, collapsible categories.
- A contextual inspector.
- Clear empty, loading, saving, error, and read-only states.

Do not add new architecture semantics or connection rules solely for visual reasons.

## 10. Interaction and motion

Use motion to explain state changes, not to decorate everything.

- Hover feedback: approximately 140ms.
- Panel transitions: approximately 180–240ms.
- Dialog entrance: subtle opacity and positional transition.
- Canvas manipulation: immediate and responsive.
- Save indicators: explicit state changes rather than perpetual animation.

Respect `prefers-reduced-motion`.

Avoid scroll hijacking, forced parallax, autoplaying decorative video, and motion that interferes with drag-and-drop.

## 11. Accessibility

Target WCAG 2.2 AA where practical, with WCAG 2.1 AA as the minimum project baseline.

Requirements:

- Text contrast of at least 4.5:1 for normal text.
- At least 3:1 for qualifying large text and meaningful UI boundaries.
- Visible keyboard focus.
- Keyboard-accessible controls and menus.
- Semantic headings and landmarks.
- Accessible names for icon-only buttons.
- Error messages connected to their respective fields.
- Status announcements for important save and validation changes.
- Reduced-motion support.
- Adequate touch targets on mobile.

Do not assume that the brand coral or blue automatically passes contrast against every surface. Test actual combinations.

## 12. Responsive behavior

### Desktop: 1280px and above

Use the full editorial grid and the complete studio layout when screen space permits.

### Tablet: 768–1279px

Reduce gutters, collapse secondary navigation, and convert appropriate side panels into drawers.

### Mobile: below 768px

Prioritize the active task, stack marketing content, use full-width forms, and expose editor panels through accessible drawers.

The architecture canvas must remain usable. Do not simply shrink the entire desktop interface until it becomes microscopic.

## 13. Performance and implementation constraints

- Reuse the existing React, Tailwind CSS, Lucide React, and React Flow stack.
- Reuse existing components and tokens when possible.
- Avoid adding heavy UI frameworks without a demonstrated need.
- Lazy-load non-critical imagery.
- Prevent layout shifts from images and fonts.
- Avoid unnecessary rerenders during canvas manipulation.
- Preserve route behavior, authentication, persistence, project CRUD, permissions, collaboration, validation, and export.
- Do not claim a feature is implemented until the corresponding behavior exists and has been tested.

## 14. Definition of design completion

The design is complete only when:

1. All required routes share a coherent design language.
2. The actual application matches the approved visual references in composition and product emphasis.
3. Images depict software architecture rather than physical buildings.
4. Navigation and interactive controls work.
5. Responsive layouts have been inspected.
6. Accessibility and contrast checks pass.
7. Existing product functionality and automated tests remain intact.
8. The production build succeeds.

**Authority rule:** When another design document conflicts with this file, follow this file for visual design. Preserve functional requirements from the PRD and interaction specifications. If a conflict affects functionality or security, resolve it explicitly rather than silently removing the behavior.