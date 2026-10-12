# ArchSync AI — UI/UX Audit & Remediation Plan

**Document:** `docs/ui-ux/UI_AUDIT.md`  
**Version:** 3.0.0  
**Purpose:** Track verified usability, visual consistency, accessibility, and interaction defects.

## 1. Audit rules

This document is an evidence-based audit, not a list of assumed defects.

Before assigning a finding:

1. Inspect the current source code.
2. Identify the affected route and component.
3. Verify the behavior in the browser when possible.
4. Check relevant tests and actual API behavior.
5. Record the evidence and the expected outcome.
6. Distinguish confirmed defects from unverified risks and future improvements.

Do not claim that a page was browser-tested if only its source code was inspected.

The supplied design images are reference material. They do not establish that any depicted feature exists in the implementation.

## 2. Product-wide audit objectives

Evaluate the following areas:

- Visual consistency with `DESIGN.md`.
- Product identity and software-architecture imagery.
- Navigation and information architecture.
- Project discovery and management.
- Studio canvas usability.
- Component placement and connection behavior.
- Properties inspection.
- Validation and AI assistance.
- Authentication and forms.
- Collaboration and role-based access.
- Save feedback and persistence.
- Responsive layouts.
- Accessibility and keyboard support.
- Performance and regression risk.

## 3. Historical issues to re-verify

The previous audit identified the following concerns. Each must be checked against the current repository before being classified as an active defect.

### A-01: Studio viewport containment

**Historical concern:** The editor was described as sitting inside a normal document layout with extra content below the canvas.

**Verification:**
- Inspect the current studio route and layout components.
- Check whether the canvas occupies the available viewport.
- Inspect document-level vertical and horizontal overflow.
- Verify panel scrolling independently from canvas scrolling.

**Expected outcome:** The studio has a dedicated layout, and only intended internal regions scroll.

**Priority:** P1 if confirmed.

### A-02: Internal engineering jargon in the interface

**Historical concern:** Milestone labels such as `F03`, `F04`, or `F12` appeared in user-facing screens.

**Verification:**
- Search rendered user-facing text.
- Inspect landing, dashboard, project, and assistant components.
- Check loading, error, and empty states as well as normal screens.

**Expected outcome:** Users see meaningful product language rather than internal development milestone names.

**Priority:** P1 if confirmed.

### A-03: Conflicting visual tokens

**Historical concern:** Several pages used different colors, gradients, and button styles.

**Verification:**
- Inspect global CSS variables, Tailwind configuration, shared components, and page-specific styles.
- Compare rendered pages with `DESIGN.md`.
- Check contrast for actual text and surface combinations.

**Expected outcome:** One consistent token system controls shared interface components.

**Priority:** P1 if confirmed.

### A-04: Component palette usability

**Historical concern:** Components were presented in an ungrouped list, making discovery difficult.

**Verification:**
- Inspect the current node catalog.
- Test component search and category expansion.
- Measure scrolling and keyboard access.
- Verify that the palette reflects actual supported node types.

**Expected outcome:** Components are searchable, categorized, and easy to place.

**Priority:** P1 if confirmed.

### A-05: Inspector and tool-panel transitions

**Historical concern:** Switching between properties, validation, and AI panels was described as abrupt or difficult to understand.

**Verification:**
- Test selection changes.
- Switch between panel modes.
- Verify that panel state, selected nodes, and keyboard focus remain predictable.
- Check narrow-screen behavior.

**Expected outcome:** Context changes are clear, panel controls are discoverable, and the canvas remains stable.

**Priority:** P2 if confirmed.

### A-06: Aspirational features presented as existing functionality

**Historical concern:** Some documentation mentioned features such as AI change previews or usage meters without clear implementation evidence.

**Verification:**
- Compare each documented feature with actual components, API contracts, and tests.
- Identify implemented, partially implemented, planned, and unsupported features.

**Expected outcome:** Documentation and interface claims accurately reflect product capability.

**Priority:** P1 if a misleading claim reaches users.

## 4. New design-direction audit

### A-07: Physical architecture imagery

**Problem to check:** Hero images, cards, login screens, or dashboard thumbnails show houses, buildings, interiors, or landscapes instead of software architecture.

**Expected outcome:**
- Product imagery depicts architecture graphs, component libraries, editor previews, or AI findings.
- Decorative assets do not compete with product demonstrations.
- Genuine screenshots are preferred over unrelated stock images.

**Priority:** P1 for the primary landing hero; P2 for secondary imagery.

### A-08: Product preview versus actual application

**Problem to check:** A screenshot or generated image looks like a functioning editor but is not connected to the actual graph state.

**Expected outcome:**
- Static illustrations are clearly used as illustrations.
- The real studio renders actual components and graph data.
- No fake interaction is attached to decorative imagery.

**Priority:** P1 if users could reasonably be misled.

### A-09: Inconsistent route experiences

**Problem to check:** Public, authenticated, and studio screens use inconsistent headers, spacing, active states, or navigation behavior.

**Expected outcome:**
- Public and authenticated shells are distinct.
- Shared components follow the canonical design system.
- The studio is optimized for work rather than marketing.

**Priority:** P1 if navigation or core workflow is impaired; otherwise P2.

### A-10: Missing interaction feedback

**Problem to check:** Buttons, forms, menus, save indicators, dialogs, or AI actions provide no clear response.

**Expected outcome:**
- Every visible control has a real action.
- Asynchronous operations show pending and terminal states.
- Errors explain what happened and how to recover.
- Destructive actions require suitable confirmation.

**Priority:** P1 for data-loss, authentication, or permission issues; P2 for other interaction defects.

### A-11: Accessibility and responsive behavior

**Problem to check:** Poor contrast, missing focus indicators, inaccessible dialogs, clipped controls, or unusable mobile panels.

**Expected outcome:**
- Keyboard access works for essential workflows.
- Contrast and semantic labels are verified.
- Mobile layouts support actual tasks.
- Reduced-motion preferences are respected.

**Priority:** P1 for blocking accessibility defects; P2 for non-blocking issues.

### A-12: Persistence trust

**Problem to check:** The interface displays `Saved` before the backend confirms success, or fails to communicate save conflicts.

**Expected outcome:**
- Save states reflect actual outcomes.
- Conflicts and failures are visible.
- A reload retrieves successfully saved data.
- UI redesign does not change persistence contracts.

**Priority:** P0 if work can be silently lost; otherwise P1.

## 5. Severity definitions

| Priority | Definition |
|---|---|
| P0 | Critical security, data-loss, or application-blocking defect |
| P1 | Core workflow broken, serious usability defect, or misleading product behavior |
| P2 | Significant visual, accessibility, or interaction issue with a usable workaround |
| P3 | Minor polish or non-blocking consistency improvement |

## 6. Required audit record

For every verified finding, record:

- Finding ID.
- Route and component.
- Evidence or reproduction steps.
- Actual behavior.
- Expected behavior.
- Severity.
- Proposed fix.
- Relevant tests.
- Status: open, in progress, fixed, or verified.

Example:

```text
ID: A-04
Route: /projects/:projectId
Component: ComponentPalette
Status: Unverified until inspected
Priority: P1 if component discovery is impaired
Evidence: Record observed search/category behavior
Acceptance: Search and category expansion work by keyboard and pointer
```

Do not mark an item fixed merely because code was edited. Reproduce the original issue and verify the expected outcome.

## 7. Remediation order

1. Security, data loss, persistence, and authorization defects.
2. Broken routes and core editor workflows.
3. Navigation and interaction failures.
4. Design-token and layout inconsistencies.
5. Image and product-presentation corrections.
6. Accessibility and responsive refinements.
7. Animation and visual polish.

## 8. Exit criteria

The audit can be closed when:

- Every P0 and P1 finding is resolved and verified.
- Remaining P2 and P3 items have documented status.
- The main routes have been inspected.
- Core product workflows pass regression tests.
- No unsupported product claims remain.
- Actual imagery follows the approved product-visual policy.
- The production build succeeds.

**Important:** Until a finding has been verified against the current repository, its status must remain unverified. Historical findings are useful leads, not proof of current defects.