# ArchSync AI — UI/UX Testing & Machine-Verifiable Acceptance Criteria

**Document:** `docs/ui-ux/UI_TESTS.md`  
**Phase:** Phase 1 — UI/UX Discovery & Design Architecture  
**Role:** Senior React UI Engineer & QA / Test Architect  
**Validation Format:** Behavioral Contract (`GIVEN [context], WHEN [action], THEN [outcome]`)  
**Scope:** Visual Consistency, Responsive Layouts, Accessibility (WCAG 2.1 AA), Viewport Containment, Motion Integrity, and Non-Regression  

---

## 1. Visual Consistency & Design System Acceptance Criteria

### 1.1 Color Contrast & Token Compliance (WCAG 1.4.3 / 1.4.11)

- **Test VIS-01: Primary Button Contrast**
  - **GIVEN** any primary action button (e.g. `.btn-primary` on Login, Register, Project Create, or Canvas Save),
  - **WHEN** computed styles are inspected against the background surface (`#0f172a` or `#0a0f1d`),
  - **THEN** the button background must use solid Cyan (`#0891b2` / `cyan-600`) with white text, achieving a contrast ratio **≥ 4.5:1** (verifiable via contrast analyzer).
  - **AND** it must not contain raw linear gradient classes that reduce contrast below 4.5:1.

- **Test VIS-02: Text Label Contrast on Dark Surfaces**
  - **GIVEN** primary labels, secondary helper text, or metadata descriptions across any page,
  - **WHEN** text color values are evaluated,
  - **THEN** primary text must use `#f8fafc` (Slate 50 / White, contrast > 12:1),
  - **AND** secondary text must not drop below `#94a3b8` (Slate 400, contrast > 5.5:1).

- **Test VIS-03: Typography & Monospace Disambiguation**
  - **GIVEN** architecture version tags, node coordinate numbers, latency indicators, or node IDs,
  - **WHEN** rendered on screen,
  - **THEN** the font family must be `JetBrains Mono` or `ui-monospace` with `font-variant-numeric: tabular-nums` to eliminate jitter during value updates.

---

## 2. Responsive Layout & Viewport Lock Acceptance Criteria

### 2.1 Studio Workspace Viewport Containment

- **Test RESP-01: Studio 100dvh Viewport Lock**
  - **GIVEN** a user navigates to `/projects/:projectId`,
  - **WHEN** the workspace renders on any desktop or tablet viewport (from 768px to 3840px wide),
  - **THEN** the canvas container fills 100% of the viewport height minus the 48px top bar,
  - **AND** the global document `window.scrollY` remains strictly `0`, with **zero vertical or horizontal page scrollbars** outside the interactive canvas element.

- **Test RESP-02: Mobile Panel Drawer Behavior (< 768px)**
  - **GIVEN** the workspace is viewed on a mobile device (`viewport width: 375px`),
  - **WHEN** the canvas loads,
  - **THEN** desktop side panels (Component Palette, Inspector, AI) are hidden from normal flow,
  - **AND** tapping the top toolbar panel trigger opens the slide-in drawer (`role="dialog"`, `aria-modal="true"`),
  - **AND** tapping the dimmed backdrop or pressing `Escape` immediately closes the drawer and restores full canvas visibility.

- **Test RESP-03: Ultrawide Canvas Scaling (> 1440px)**
  - **GIVEN** the workspace is viewed on an ultrawide monitor (1920px to 3440px wide),
  - **WHEN** the page renders,
  - **THEN** the canvas expands fluidly to fill all available width,
  - **AND** side drawers remain pinned to their calibrated maximum widths (`320px` to `384px`) without stretching or distorting node layouts.

---

## 3. Accessibility & Universal Usability Criteria (WCAG 2.1 AA)

### 3.1 Keyboard Navigation & Focus Indicator Integrity

- **Test A11Y-01: Universal Keyboard Focus Ring (WCAG 2.4.7 / 2.4.11)**
  - **GIVEN** a keyboard-only user navigates through interactive buttons, inputs, links, and node cards using `Tab`,
  - **WHEN** any element receives focus,
  - **THEN** a high-visibility focus ring of `2px solid var(--focus-ring-color)` (`#06b6d4`) with `2px offset` must appear,
  - **AND** mouse clicks on the same element must not trigger an unnecessary persistent ring (`:focus:not(:focus-visible)`).

- **Test A11Y-02: Skip Navigation Link (WCAG 2.4.1)**
  - **GIVEN** any page in ArchSync AI is loaded,
  - **WHEN** the user presses `Tab` from document top,
  - **THEN** the `.skip-link` immediately becomes visible at the top of the viewport,
  - **AND** pressing `Enter` moves programmatic focus directly to `<main id="main-content">`, bypassing navigation headers.

- **Test A11Y-03: Modal Dialog Focus Trap & Escape Dismissal**
  - **GIVEN** any modal is open (e.g., Create Project Modal, Invite Member Modal, Remove Member Modal),
  - **WHEN** the modal opens,
  - **THEN** focus is programmatically set to the first input field,
  - **AND** pressing `Tab` cycles focus strictly within modal bounds,
  - **AND** pressing `Escape` closes the modal and returns focus to the initiating trigger button.

- **Test A11Y-04: Screen Reader Announcement Live Region**
  - **GIVEN** an asynchronous state update occurs (e.g. node dropped onto canvas, autosave saved, sync conflict, validation error found),
  - **WHEN** the action completes,
  - **THEN** an appropriate descriptive text string is rendered inside `#a11y-announcer` (`aria-live="polite"`), allowing assistive technology to announce the outcome without interrupting the user.

---

## 4. Motion & Performance Acceptance Criteria

- **Test MOT-01: Reduced Motion Preference (WCAG 2.3.3)**
  - **GIVEN** the user operating system or browser sets `prefers-reduced-motion: reduce`,
  - **WHEN** any page transition, drawer expansion, modal reveal, or edge flow animation executes,
  - **THEN** all CSS transition and animation durations must evaluate to `0.01ms`,
  - **AND** React Flow animated edge paths must deactivate dash offset animation instantly.

- **Test MOT-02: GPU-Accelerated Micro-Interactions**
  - **GIVEN** palette items, buttons, or canvas nodes during hover and active click states,
  - **WHEN** transitions execute,
  - **THEN** only `transform` and `opacity` properties may animate, ensuring 60fps frame rates without browser layout reflows or repaints.

---

## 5. Non-Regression & State Integrity Verification

- **Test REG-01: Redux Toolkit & RTK Query State Isolation**
  - **GIVEN** switching between projects or logging in/out,
  - **WHEN** routes change,
  - **THEN** `editorSlice` (`selectedNodeId`, `selectedEdgeId`, `currentVersion`) resets cleanly,
  - **AND** RTK Query cache invalidation tags (`Project`, `Architecture`, `Auth`) operate without stale memory retention.

- **Test REG-02: Preservation of Existing 316 Passing Automated Tests**
  - **GIVEN** all UI enhancements proposed in Phase 1,
  - **WHEN** `npm test` is executed across both `client` (164 tests) and `server` (152 tests),
  - **THEN** all 316 tests must pass with zero failures and zero typecheck errors.
