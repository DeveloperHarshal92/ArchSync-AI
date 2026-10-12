# ArchSync AI — UI/UX Testing & Acceptance Criteria

**Document:** `docs/ui-ux/UI_TESTS.md`  
**Version:** 3.0.0  
**Purpose:** Verify the visual system, usability, interactions, accessibility, and preservation of existing functionality.

## 1. Testing principles

- Test actual behavior, not merely component appearance.
- Use the current repository and actual route structure as the source of truth.
- Preserve existing automated tests.
- Prefer semantic queries and observable behavior over brittle CSS selectors.
- Test successful and failed operations.
- Do not report tests as passing unless they were executed.
- Do not use generated mockups as substitutes for functional integration tests.

Use the existing Vitest, React Testing Library, and browser-testing setup where available. Add Playwright or another browser-testing dependency only if the repository lacks suitable coverage and the addition is justified.

## 2. Design-system tests

### VIS-01: Brand token consistency

**Given** a rendered application route,

**When** shared components are inspected,

**Then** approved brand colors and typography tokens are used consistently.

Verify:
- Warm Ivory: `#eae6ed`.
- Deep Editorial Blue: `#226192`.
- Coral Orange: `#ef8557`.
- Cormorant Garamond for display headings.
- Montserrat for interface text.

**Pass condition:** Shared components do not introduce arbitrary competing brand palettes.

Semantic status colors and architecture node colors are permitted when they serve a defined functional purpose.

### VIS-02: Contrast

**Given** text, controls, focus indicators, and meaningful component boundaries,

**When** rendered color combinations are evaluated,

**Then** contrast meets WCAG 2.2 AA where applicable, with WCAG 2.1 AA as the minimum baseline.

Check actual foreground and background combinations rather than assuming a brand color is universally accessible.

### VIS-03: Product imagery

**Given** the landing page, dashboard, project catalog, and authentication screens,

**When** their imagery is inspected,

**Then** primary imagery depicts software architecture, application interfaces, or meaningful technical diagrams.

**Pass condition:**
- No houses or physical-building photography as primary product imagery.
- No broken image URLs.
- No repeated generic stock images used to fill empty space.
- All meaningful images have appropriate alternative text.
- Decorative images have empty alt text.
- Static previews are not presented as functioning controls.

### VIS-04: Typography and layout

**Given** all required routes,

**When** headings, forms, navigation, and content sections are rendered,

**Then** typography, spacing, and component styles follow `DESIGN.md`.

**Pass condition:** No clipped text, inconsistent shared controls, or unnecessary horizontal overflow at supported viewport sizes.

## 3. Navigation tests

### NAV-01: Public navigation

Verify that:
- The brand link reaches the intended public landing route.
- Sign in opens the login route.
- Get Started opens registration or the established onboarding flow.
- Product and Features links reach valid sections or routes.
- Documentation links work only when a valid destination exists.

### NAV-02: Authenticated navigation

Verify that:
- Dashboard navigation opens the correct route.
- Project navigation opens the selected project.
- Invitations navigation opens the invitation list.
- Settings navigation opens an implemented settings route.
- Active-route styling matches the current location.
- Browser back and forward navigation remain functional.

### NAV-03: Protected routes

Verify that:
- Unauthenticated users are handled according to existing authentication behavior.
- Protected destination redirects are preserved.
- Unauthorized users cannot access restricted project data.
- Refreshing a protected route does not bypass server authorization.

## 4. Authentication tests

### AUTH-01: Login validation

Test empty fields, invalid email formatting, valid input, rejected credentials, and network failure.

Expected:
- Appropriate validation messages.
- No duplicate submissions.
- Clear loading and error states.
- No sensitive server details exposed.

### AUTH-02: Registration

Verify that:
- Existing required fields are validated.
- Existing password requirements are enforced.
- API errors are presented clearly.
- Successful registration follows the established redirect behavior.
- Password values are not exposed through inappropriate UI or logs.

### AUTH-03: Keyboard operation

Verify that:
- Fields have accessible labels.
- Password visibility controls are keyboard accessible.
- Focus is visible.
- Error messages are associated with the relevant fields.
- Form submission can be completed without a pointer.

## 5. Dashboard and project tests

### PRJ-01: Project creation

**Given** an authorized user,

**When** they submit a valid project,

**Then** the project is created and appears in the relevant list after the server confirms success.

Verify:
- Validation errors.
- Duplicate submission prevention.
- API failure handling.
- Dialog focus management.
- Correct navigation after creation.

### PRJ-02: Project discovery

Verify that search, filters, sorting, and project actions produce the advertised behavior.

If a control is not implemented, it must not be presented as functional.

### PRJ-03: Project deletion

Verify that:
- The user receives an appropriate confirmation.
- Unauthorized deletion is prevented.
- Failed deletion preserves the project in the visible list.
- Successful deletion updates the interface.

## 6. Architecture studio tests

### STU-01: Viewport containment

**Given** `/projects/:projectId` on a supported desktop viewport,

**When** the studio renders,

**Then** the workspace occupies the available viewport and does not inherit the marketing page layout.

Verify:
- No unintended document-level horizontal overflow.
- No unnecessary marketing footer.
- Toolbar and panels remain within the available viewport.
- Internal panel scrolling works independently.
- The canvas remains usable when panels are opened or closed.

Do not prohibit intentional canvas panning or zooming merely to satisfy document-overflow tests.

### STU-02: Component discovery

Verify that:
- Component search filters the supported node catalog.
- Categories expand and collapse.
- Empty results are explained.
- Components can be reached with keyboard navigation.
- Placement follows existing application behavior.

### STU-03: Graph manipulation

Verify:
- Selecting a node updates the contextual inspector.
- Editing a supported property updates the actual graph state.
- Connections follow existing validation rules.
- Invalid operations receive understandable feedback.
- Canvas navigation controls work.
- The graph remains stable when the inspector opens or closes.

### STU-04: Panel behavior

Verify that:
- Properties, Validation, and AI panels can be accessed through implemented controls.
- Panel changes do not unexpectedly clear the selected node.
- Closing a panel restores appropriate canvas space.
- Keyboard focus remains predictable.
- Mobile drawers can be opened and closed accessibly.

### STU-05: Read-only permissions

Verify that a viewer cannot edit the graph through the UI and that the backend independently enforces the same restriction.

Disabling a button is not an authorization mechanism. The server must remain authoritative.

## 7. Persistence and collaboration tests

### DATA-01: Save-state accuracy

Verify the transition between:
- Saving.
- Saved.
- Save failed.
- Conflict, where supported.

The UI must not display a successful save before receiving the required confirmation from the backend.

### DATA-02: Reload persistence

**Given** a successfully saved project,

**When** the user reloads the page,

**Then** the saved project and graph state are restored from the actual persistence layer.

### DATA-03: Backend restart and redeployment

Verify that:
- Accounts persist according to the established database design.
- Projects and graph changes persist.
- References between users and projects remain valid.
- Restarting the backend does not erase committed data.
- Redeployment does not silently reset persistent storage.

Run this test against an appropriate test or staging environment, not a production database containing real user data.

### DATA-04: Failure recovery

Verify that:
- Network errors are visible.
- Unsaved work is not silently represented as saved.
- Conflicts are communicated.
- Recovery actions behave as documented.
- Retrying an operation does not unintentionally duplicate data.

### COL-01: Collaboration

Where real-time collaboration is implemented, verify:
- Presence reflects actual connected users.
- Updates propagate correctly.
- Permissions are enforced.
- Disconnects and reconnects are handled.
- The UI does not fabricate collaborator activity.

## 8. AI and validation tests

### AI-01: Analysis lifecycle

Verify loading, success, empty, and failure states.

The UI must not display invented analysis results when a request fails.

### AI-02: Finding navigation

When a finding references a graph element, activating it should navigate to the relevant element when supported.

### AI-03: Approved changes

If AI-proposed graph changes are implemented, verify that users can review and approve them before application.

### VAL-01: Validation feedback

Verify that findings have understandable descriptions and appropriate severity indicators.

Verify that an architecture with no findings receives an accurate success state.

## 9. Responsive tests

Test at representative viewport widths:

| Viewport | Required behavior |
|---|---|
| 1440px | Full desktop layout |
| 1024px | Compact multi-panel layout |
| 768px | Tablet layout without clipped primary actions |
| 390px | Mobile forms and drawer-based studio panels |
| 320px | No unintended horizontal page overflow |

Verify:
- Navigation remains accessible.
- Text is readable.
- Dialogs fit the viewport.
- Touch controls remain usable.
- The canvas retains practical editing capability.
- No essential action disappears without an alternative.

## 10. Accessibility tests

Verify:
- Keyboard navigation.
- Visible focus.
- Accessible names and labels.
- Dialog semantics and focus restoration.
- Error announcements.
- Contrast.
- Reduced-motion behavior.
- Screen-reader status announcements.
- Non-color indicators for meaningful states.
- No keyboard traps.

Use automated accessibility checks alongside manual keyboard testing. Automated scans alone do not establish full accessibility compliance.

## 11. Motion and performance tests

Verify:
- Motion respects reduced-motion preferences.
- Panels do not cause unnecessary layout shifts.
- Canvas interactions remain responsive.
- Images have appropriate sizing and loading behavior.
- Large product previews do not block essential controls.
- Animations do not interfere with dragging, selecting, or connecting nodes.

Do not invent a performance pass threshold without measuring the actual application and establishing an agreed target.

## 12. Regression and build tests

Run the repository's existing commands for:
- Unit tests.
- Component and integration tests.
- Type checking.
- Linting.
- Production build.

Preserve existing passing tests. Add tests for changed behavior rather than deleting failing tests to make the suite green.

Use the actual scripts declared in `package.json`; do not assume command names.

## 13. Completion checklist

- [ ] Design tokens and typography verified.
- [ ] Software-architecture imagery verified.
- [ ] Public and authenticated navigation verified.
- [ ] Login and registration tested.
- [ ] Project creation and management tested.
- [ ] Architecture editing tested.
- [ ] Validation and AI states tested.
- [ ] Persistence survives reload and backend restart.
- [ ] Permission restrictions verified.
- [ ] Responsive behavior inspected.
- [ ] Accessibility checks executed.
- [ ] Existing tests retained and passing.
- [ ] Production build succeeds.
- [ ] Final UI inspected in a real browser.

## 14. Reporting results

Every completed test run must record:

- Date and environment.
- Command or procedure used.
- Tests passed.
- Tests failed.
- Tests skipped.
- Known limitations.
- Relevant failure output.

Do not report a test as passing because the code appears correct. Run it, inspect the result, and record the evidence.