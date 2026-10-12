# ArchSync AI — Interaction Specification

**Document:** `docs/ui-ux/INTERACTION_SPEC.md`  
**Version:** 3.0.0  
**Status:** Canonical interaction behavior specification  
**Applies to:** React client, architecture studio, project management, authentication, collaboration, and AI-assisted review

## 1. Purpose and authority

This document defines how the application behaves when users interact with its interface.

It complements the following documents:

- `DESIGN.md`: visual design and brand tokens.
- `DESIGN_SYSTEM.md`: implementation-level tokens and reusable UI primitives.
- `docs/ui-ux/UI_UX_PRD.md`: product goals and user requirements.
- `docs/ui-ux/SCREEN_SPECS.md`: route layouts and screen-level behavior.
- `docs/ui-ux/UI_AUDIT.md`: verified defects and remediation tracking.
- `docs/ui-ux/UI_TESTS.md`: acceptance tests.

Visual appearance must follow `DESIGN.md`. This document governs interaction behavior.

When an interaction conflicts with an existing backend contract, authentication rule, permission rule, or data model, preserve the existing functional contract and resolve the conflict explicitly.

## 2. Core interaction principles

1. Every visible interactive control must perform its advertised action.
2. Every asynchronous operation must have understandable pending and terminal states.
3. User work must not be silently discarded.
4. Selection, focus, hover, and disabled states must be distinguishable.
5. Keyboard interaction must provide practical alternatives to pointer gestures.
6. Server responses remain authoritative for persistence and permissions.
7. AI-generated recommendations must not silently modify architecture data.
8. Responsive layouts must preserve the user's current task and context.
9. Motion must communicate state changes without delaying input.
10. Interface feedback must describe what actually happened, not what the application hoped would happen.

## 3. Interaction-state model

Interactive components should define the states relevant to their behavior.

| State | Meaning | Expected feedback |
|---|---|---|
| Idle | Ready for input | Stable appearance and clear action |
| Hover | Pointer is over a target | Subtle visual emphasis |
| Focused | Target has keyboard focus | Visible focus indicator |
| Active | Action is being performed | Immediate response |
| Loading | Asynchronous operation is pending | Progress indicator and disabled duplicate submission where appropriate |
| Success | Operation was confirmed | Accurate completion feedback |
| Error | Operation failed | Understandable message and recovery path |
| Disabled | Action is unavailable | Clear disabled appearance and explanation where needed |
| Read-only | User may inspect but not modify | Editing controls disabled without hiding useful viewing functionality |
| Conflict | Concurrent changes cannot safely be reconciled automatically | Explicit conflict resolution path |

Do not implement every state on every component. Use the states appropriate to the operation.

## 4. Architecture studio interaction model

The studio is a dedicated, viewport-filling workspace.

- Do not render the global marketing footer inside the studio.
- Keep the toolbar and panels within the available application viewport.
- Allow the canvas to use the remaining space.
- Keep panel scrolling independent from canvas navigation.
- Preserve project context when switching between properties, validation, and AI.
- Use the existing React Flow implementation and current graph model.

The studio's primary interaction loop is:

1. Find a component.
2. Place it on the canvas.
3. Configure its properties.
4. Connect it to other components.
5. Inspect or validate the graph.
6. Save and verify the result.
7. Share or export the project when supported.

Each step must work without forcing the user to restart the workflow.

## 5. Component palette and node placement

### 5.1 Idle and hover

When the pointer enters a component item:

- Apply the hover treatment defined by `DESIGN_SYSTEM.md`.
- Reveal a drag affordance where appropriate.
- Use a grab cursor only when dragging is actually supported.
- Preserve the component label and category.

Do not rely exclusively on hover to expose essential actions.

### 5.2 Pointer-based drag-and-drop

1. The user starts dragging a component.
2. The component item enters a dragging state.
3. The canvas accepts the drag payload.
4. The cursor position is converted using React Flow's coordinate conversion utilities, such as `screenToFlowPosition`.
5. The application creates a node using the existing node factory and supported node schema.
6. The new node receives a unique ID generated through the established ID strategy.
7. The new node becomes selected if consistent with the existing editor behavior.
8. The inspector displays the new node's properties.
9. The graph enters the appropriate unsaved or pending-save state.

Implementation requirements:

- Reuse the existing `NODE_CATALOG` and `nodeIcons` mappings.
- Do not create a parallel component registry.
- Do not invent node types that the shared domain model does not support.
- Use the actual component defaults and validation rules.
- Do not persist incomplete or invalid graph objects merely to simplify the UI.
- Cancel the operation safely if the drop target is invalid.

Default node dimensions must come from the existing node component and layout behavior. Avoid hardcoding dimensions into unrelated interaction handlers.

### 5.3 Keyboard-based placement

Keyboard users must be able to add a component without dragging.

1. Focus a component in the palette.
2. Press Enter or Space.
3. Place the component at a predictable position in the visible canvas.
4. Select the newly created component.
5. Move focus to an appropriate editor control or provide clear focus feedback.
6. Announce the result through the shared accessibility announcer.

The component's placement behavior must be documented and consistent. Do not move focus unpredictably between the palette, canvas, and inspector.

### 5.4 Read-only users

When the current user lacks editing permission:

- Prevent node creation.
- Prevent graph modification.
- Disable relevant controls.
- Communicate the read-only state accessibly.
- Preserve available navigation and inspection functions.

The frontend restriction is for usability. Backend authorization remains mandatory.

## 6. Node selection and editing

### 6.1 Node selection

Selecting a node must:

- Apply the selected-node style defined by the design system.
- Update the selected entity in the existing state architecture.
- Clear conflicting selection where appropriate.
- Display the relevant properties.
- Preserve canvas viewport state.
- Avoid triggering an unintended save solely because selection changed.

Selection state is UI state unless the existing domain model explicitly treats it otherwise.

### 6.2 Property editing

For each editable field:

1. Read the current value from the selected entity.
2. Validate user input according to the existing schema.
3. Update the authoritative client-side editing state.
4. Mark the graph dirty when an actual persisted value changes.
5. Schedule persistence according to the established save strategy.
6. Display validation or save errors without silently reverting valid user input.

Property editing must not create a second copy of the graph in a separate component's local state.

### 6.3 Deletion

For node or edge deletion:

- Respect the user's permissions.
- Prevent deletion when the application is in read-only mode.
- Follow existing domain rules for dependent connections.
- Confirm destructive actions when deletion could cause meaningful data loss.
- Update selection and inspector state after deletion.
- Announce successful deletion accessibly.
- Preserve undo behavior if the application supports it.

Do not bind deletion shortcuts globally in a way that deletes graph entities while a user is typing into an input, textarea, or editable field.

## 7. Connection creation and editing

### 7.1 Connection creation

1. The user activates a source handle.
2. A provisional connection follows the pointer.
3. Compatible targets receive a clear target-state indication.
4. The connection is validated against the existing graph rules.
5. A valid connection is committed to the graph.
6. The connection receives the appropriate selection and inspector behavior.
7. The graph enters the correct persistence state.

### 7.2 Invalid connections

Invalid connection attempts must:

- Provide a clear visual indication.
- Avoid committing invalid data.
- Explain the reason when the rule can be determined.
- Preserve the existing graph.
- Return the canvas to its normal state after cancellation.

Self-loops, cycles, duplicate connections, and incompatible node types must follow the actual domain rules. Do not impose a universal prohibition on cycles unless the existing architecture model requires it.

### 7.3 Connection properties

If the domain model supports connection labels or styles, expose them through the inspector.

Examples may include HTTP, HTTPS, gRPC, or asynchronous messaging labels. These are examples, not a requirement to add unsupported schema fields.

## 8. Canvas navigation and selection

Use existing React Flow utilities and capabilities for:

- Panning.
- Zooming.
- Fit-to-view.
- Selection.
- Viewport restoration where supported.
- Minimap interaction where implemented.

Expected behavior:

- Navigation does not accidentally select or modify graph elements.
- Panel visibility changes do not reset the viewport unnecessarily.
- Selecting a validation finding or related AI finding focuses the referenced element when possible.
- Missing or deleted target elements produce a recoverable message.
- Zoom controls provide clear current-state feedback when appropriate.

Viewport position and zoom should remain UI state unless the current application explicitly persists them as project data.

## 9. Undo and redo

Use the application's existing history implementation, if available.

- Undo reverses the last supported graph modification.
- Redo reapplies a modification that was undone.
- Selection-only changes should not pollute the graph history unless the existing history model explicitly includes them.
- Saving must not unexpectedly clear the user's ability to undo.
- Keyboard shortcuts must not interfere with text editing.
- Undo and redo must respect permissions and collaboration semantics.

Do not introduce a second history stack alongside the existing implementation.

## 10. Right-panel behavior

The studio uses a unified contextual panel.

Supported panel modes, subject to the current implementation:

- Properties.
- Validation.
- AI Assistant.

Only one primary right-panel mode should occupy the same docked region at a time.

### Panel switching

When a user selects a different panel:

1. Preserve the current graph and viewport.
2. Update the active panel state.
3. Keep relevant selection context.
4. Move focus only when needed for keyboard accessibility.
5. Display the chosen panel with an appropriate transition.
6. Provide an accessible way to close the panel.

Panel transitions should generally last 180–240ms and use the motion tokens defined in `DESIGN_SYSTEM.md`.

Avoid separate overlapping panels that obscure one another.

### Narrow-screen behavior

Below 768px:

- Move panels into an accessible drawer.
- Use an explicit panel-opening control.
- Provide a visible close control.
- Allow Escape to close the drawer when appropriate.
- Return focus to the control that opened the drawer.
- Prevent background interaction while a modal drawer is active.
- Preserve the graph viewport when the drawer closes.

## 11. Validation interaction loop

### 11.1 Trigger

The user activates the validation action from the studio toolbar or the relevant panel.

### 11.2 Loading

- Indicate that validation is running.
- Prevent duplicate submissions when necessary.
- Keep the canvas usable when possible.
- Expose the operation's loading state to assistive technology.

### 11.3 Successful validation

When the actual result contains no findings:

- Display a clear success state.
- Report zero findings accurately.
- Update validation status using the returned result.
- Avoid implying that AI review has also occurred.

### 11.4 Findings

For each returned finding, display available information such as:

- Severity.
- Title.
- Explanation.
- Affected node or connection.
- Relevant recovery or remediation guidance.

Do not invent missing finding fields or display placeholder findings as real results.

### 11.5 Focus a finding

When the user activates a finding's navigation control:

1. Resolve the referenced graph entity.
2. Confirm it exists in the current graph.
3. Select or focus it using the established editor state.
4. Move the viewport to it if the relevant React Flow utility is available.
5. Apply a temporary visual emphasis.
6. Provide feedback if the referenced entity cannot be located.

Use a short, restrained focus animation. Do not disrupt the current editing session.

## 12. AI architecture assistant

### 12.1 Opening and context

Opening the AI Assistant must:

- Activate the AI panel.
- Preserve the current project and graph.
- Display a clear description of the assistant's role.
- Use the existing backend AI integration.
- Respect authentication, project permissions, and server-side authorization.

### 12.2 Quick queries

Contextual prompts may include:

- Review scalability.
- Identify potential single points of failure.
- Review security boundaries.
- Evaluate reliability.
- Identify potential cost inefficiencies.

Show only prompts supported by the current AI service. A prompt must not imply that the application performs an analysis it cannot actually execute.

### 12.3 Request lifecycle

The panel must handle:

1. Ready state.
2. Request pending.
3. Successful response.
4. Empty response.
5. Request failure.
6. Retry where appropriate.

During a request, prevent accidental duplicate submissions where necessary.

Never fabricate a successful response after a failed API request.

### 12.4 Result presentation

Render actual AI results using the supported response schema.

Where available, show:

- Finding severity.
- Explanation.
- Rationale.
- Tradeoffs.
- Recommended next steps.
- Related architecture entities.

Related entity controls should navigate to actual graph entities. Missing references must be handled gracefully.

### 12.5 Advisory boundary

The AI assistant is advisory.

- It must not silently modify graph state.
- It must not pretend that an unimplemented graph-diff workflow exists.
- It must not expose private data from other projects.
- It must not claim to have reviewed the current graph if the backend did not successfully analyze it.
- It must not execute architecture changes merely because a recommendation was generated.

An AI recommendation and a validated architecture change are separate operations.

**Explicit exclusions:** Do not implement AI-generated diff/apply workflows or an AI token-usage meter as part of this redesign. Those features are not authorized by this specification.

## 13. Persistence and autosave

### 13.1 State transitions

Use the following user-facing states:

| State | Meaning |
|---|---|
| Unsaved changes | The graph has changed and is not yet confirmed persisted |
| Saving | A persistence request is in progress |
| Saved | The backend has confirmed the latest relevant changes |
| Save failed | The persistence operation failed |
| Conflict | The server reports an incompatible concurrent update |
| Offline/unavailable | Connectivity or service availability prevents the expected operation, where detectable |

The visible wording may be refined for the UI, but the meaning must remain accurate.

### 13.2 Debouncing

If the existing implementation uses debounced autosave:

- Reuse its established timing and request strategy.
- Coalesce rapid node-movement events.
- Avoid dispatching a request for every pointer movement.
- Ensure the final state is submitted.
- Avoid overwriting a newer server version with a stale payload.

A debounce interval near one second may be appropriate for graph editing, but the implementation must follow the existing persistence contract rather than hardcoding a new interval into every editor component.

### 13.3 Save confirmation

- Do not show `Saved` before the backend confirms success.
- Do not treat local Redux state as proof of database persistence.
- Display the last successful save time only when it is known.
- Keep failed or unsaved changes distinguishable from persisted data.

### 13.4 Conflict resolution

When the backend reports a concurrency conflict:

1. Preserve the local working state.
2. Explain that a newer server version exists.
3. Offer only recovery actions that the application can implement safely.
4. Avoid automatic destructive replacement of local changes.
5. Refresh or reconcile data according to the established versioning strategy.

Possible actions include reloading the latest version or reviewing differences, but only when supported by the current application.

### 13.5 State ownership

Preserve the established architecture:

- `editorSlice`: editor-specific graph and editing state according to its existing responsibilities.
- `uiSlice`: interface state such as active panels, dialogs, and other UI controls.
- RTK Query: server data fetching, mutations, and cache lifecycle.
- Existing selectors and graph adapters: shared access to the relevant state.

Do not duplicate the entire graph in component-local state or introduce a second global state system.

RTK Query cache data and unsaved editor changes must have clearly defined ownership. Follow the current implementation's established boundaries.

## 14. Real-time collaboration

Use the existing Socket.IO collaboration architecture where implemented.

### 14.1 Presence

- Display connected collaborators using actual session or presence data.
- Use stable visual identifiers for collaborators.
- Provide accessible names or labels.
- Distinguish active presence from stale or disconnected presence.
- Do not fabricate online status.

### 14.2 Remote cursors

If remote cursors are implemented:

- Throttle cursor updates to prevent unnecessary network traffic.
- A rate around 20 updates per second is a reasonable upper target for pointer presence, subject to the existing collaboration design.
- Use stable user identity to select a consistent cursor color.
- Include a readable user label.
- Fade stale cursors only when the underlying presence logic supports it.
- Remove disconnected cursors when their sessions are no longer active.

Remote cursors must not interfere with local pointer interaction or graph editing.

### 14.3 Concurrent graph updates

- Apply server-authorized updates according to the existing collaboration protocol.
- Preserve graph consistency.
- Distinguish remote updates from local unsaved changes.
- Do not overwrite local changes silently.
- Surface conflicts where the backend reports incompatible edits.
- Do not invent operational-transformation, CRDT, or conflict-merging capabilities that the current implementation does not provide.

### 14.4 Disconnect and reconnect

Provide clear states when collaboration connectivity changes.

- Show reconnecting status when appropriate.
- Avoid claiming that remote changes are synchronized while disconnected.
- Preserve local work according to the established offline and persistence behavior.
- Reconcile state after reconnection using the existing protocol.

## 15. Forms, dialogs, and menus

### Forms

- Use persistent labels.
- Associate errors with their fields.
- Preserve recoverable input after failures.
- Disable duplicate submissions while requests are pending.
- Provide an accurate success state after server confirmation.
- Respect the existing authentication and API contracts.

### Dialogs

- Have a descriptive title.
- Use semantic dialog behavior.
- Move focus appropriately when opened.
- Contain focus while modal.
- Close with Escape when appropriate.
- Restore focus to the triggering control.
- Require suitable confirmation for destructive operations.

### Menus

- Support keyboard access.
- Have visible focus and active states.
- Close appropriately after selection.
- Do not depend exclusively on hover.
- Avoid actions that appear available but have no implementation.

## 16. Keyboard shortcut protocol

The following shortcuts are required where the corresponding feature exists and must not conflict with text inputs or browser behavior.

| Shortcut | Scope | Action |
|---|---|---|
| Tab / Shift+Tab | Application | Move through interactive controls |
| Enter / Space | Focused control | Activate the control according to its semantics |
| Escape | Dialog, menu, or drawer | Close the active transient surface when appropriate |
| Delete / Backspace | Canvas | Delete selected graph entities when permitted |
| Arrow keys | Selected node | Move the node by a predictable increment if implemented |
| Shift + Arrow keys | Selected node | Use a larger increment if supported |
| Ctrl+Z / Cmd+Z | Editor | Undo the last supported graph modification |
| Ctrl+Shift+Z / Cmd+Shift+Z | Editor | Redo a supported modification if implemented |

Implementation requirements:

- Do not intercept typing shortcuts inside text inputs, textareas, or editable fields.
- Prevent deletion when the user lacks permission.
- Announce meaningful graph changes.
- Ensure keyboard placement and editing remain possible without drag-and-drop.
- Do not advertise shortcuts that are not actually implemented.

## 17. Accessibility and announcements

Use the existing shared accessibility utilities where available.

Preserve or implement:

- A skip link to the main content.
- A shared live announcer for meaningful asynchronous events.
- Visible `:focus-visible` styling.
- Accessible labels for icon-only controls.
- Correct semantic headings and landmarks.
- Accessible form errors.
- Keyboard-operable menus and dialogs.
- Reduced-motion behavior.

Announce meaningful events such as:

- Component added or removed.
- Connection created or rejected.
- Save completed or failed.
- Validation completed.
- A relevant collaboration state change.
- A significant asynchronous error.

Avoid announcing every pointer movement, keystroke, or animation frame.

## 18. Motion and feedback

Use motion tokens from `DESIGN_SYSTEM.md`.

Suggested targets:

- Immediate input response.
- Approximately 140ms for hover feedback.
- Approximately 180–240ms for panel transitions.
- Approximately 250–300ms for optional viewport focus transitions.

Prefer `transform` and `opacity` when animating panels and overlays.

Respect `prefers-reduced-motion`.

Never delay a graph operation to finish a decorative animation.

## 19. Responsive interaction rules

### Desktop

- Support simultaneous canvas use and docked panels.
- Preserve clear separation between toolbar, canvas, palette, and inspector.

### Tablet

- Reduce panel width.
- Allow secondary panels to collapse.
- Keep important actions accessible.

### Mobile

- Use accessible drawers for secondary panels.
- Keep the canvas viewport stable.
- Avoid shrinking desktop controls into unusable targets.
- Provide explicit panel open and close actions.
- Preserve the active project and selected entity when switching panels.

## 20. Implementation constraints

- Reuse existing React components where possible.
- Preserve Redux Toolkit and RTK Query architecture.
- Preserve existing Socket.IO collaboration behavior.
- Preserve HTTP-only cookie authentication and existing security boundaries.
- Keep AI processing and authorization on the backend.
- Reuse the current node catalog and icon mappings.
- Do not replace existing persistence logic during a visual redesign.
- Do not add unsupported API fields, routes, or graph capabilities.
- Do not remove existing tests to hide regressions.

## 21. Interaction completion criteria

An interaction is complete when:

1. It works with pointer and keyboard input where applicable.
2. Its states are visually and accessibly distinguishable.
3. Asynchronous success and failure are handled.
4. Permissions are respected.
5. The graph and persistence state remain consistent.
6. No user work is silently discarded.
7. Responsive behavior is defined.
8. The relevant automated tests pass.
9. The behavior is verified in the actual application.

