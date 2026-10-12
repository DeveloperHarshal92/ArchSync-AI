# ArchSync AI — Screen Specifications & Interaction Blueprints

**Document:** `docs/ui-ux/SCREEN_SPECS.md`  
**Version:** 3.0.0  
**Authority:** Follows `DESIGN.md` and `UI_UX_PRD.md`

## 1. Implementation priorities

Implement the redesign in the following order:

1. Shared design tokens, buttons, inputs, dialogs, and navigation.
2. Architecture studio.
3. Project catalog and dashboard.
4. Authentication.
5. Invitations, settings, and project details.
6. Landing page and supporting public pages.
7. Responsive polish, accessibility, and regression testing.

Preserve existing functionality throughout. If dependencies require a different order, document the reason rather than skipping the shared foundations.

## 2. Global application structure

### Public application shell

Use a dedicated public shell for the landing page and other public content.

Header:
- Brand mark and ArchSync AI name.
- Product and Features links that navigate to valid destinations.
- Documentation link when available.
- Sign in link.
- Primary Get Started action.

Footer:
- Product links.
- Documentation and support links when implemented.
- Company links only when valid.
- Privacy and terms links only when available.

Interaction:
- Header navigation scrolls to the relevant section or navigates to a valid route.
- Mobile navigation opens an accessible menu.
- Menus close with Escape and after navigation.
- Primary actions preserve the expected authentication and redirect behavior.

### Authenticated application shell

Use a separate shell for dashboard, projects, invitations, and settings.

- Compact application navigation.
- Current workspace or project context where supported.
- Search only if it performs a real search.
- Notifications and account controls only when implemented.
- Clear active-route indication.
- A consistent content container.
- No marketing hero, marketing footer, or oversized promotional banner.

### Studio shell

The studio has its own viewport-filling layout. It must not inherit the standard document-page layout.

## 3. Landing page (`/`)

### Desktop composition

Use an asymmetric editorial hero with two main regions:

**Left region**
- Small uppercase product descriptor.
- Headline: “Design the systems behind what comes next.”
- Brief explanation of collaborative software architecture design.
- Primary CTA: “Start Building Free”.
- Secondary CTA: “Watch Demo” only when a demo exists.
- Compact capability indicators for architecture design, AI assistance, and collaboration.

**Right region**
- Large product-editor preview.
- A readable diagram showing a client, API gateway or load balancer, services, and storage.
- Optional contextual AI insight panel within the preview.
- The preview must not overpower the main headline or obscure navigation.

Use a real application screenshot where possible. Otherwise, build a faithful static mockup as an explicitly illustrative visual.

### Below the hero

Use a varied sequence of sections:

1. Architecture modeling: component placement and connections.
2. Product workflow: how a diagram moves from creation to validation.
3. Editor showcase: a large, detailed product screenshot.
4. Collaboration: presence, shared work, and permissions.
5. AI analysis: recommendations and validation findings.
6. Final CTA and footer.

Avoid repeating the same three-card structure for every section. Use alternating text/image compositions, compact feature lists, and a larger editor showcase.

### Interaction states

- CTA buttons navigate to working destinations.
- The demo opens a real video, dialog, or route if implemented.
- Product previews do not pretend to be interactive when they are images.
- Reduced-motion users receive a stable, readable page.
- Mobile content stacks in logical reading order.

## 4. Login (`/login`)

### Layout

Use a restrained split-screen layout at wide widths.

- Brand and concise product context in one region.
- A focused login form in the other.
- Product imagery may show a cropped architecture diagram or editor preview.
- Avoid full-screen building photographs.

At narrow widths, use a single-column form and reduce or remove decorative imagery.

### Form behavior

Fields:
- Email.
- Password.
- Remember-me option only if supported.
- Forgot-password link only if a working recovery flow exists.

Controls:
- Sign in.
- Password visibility toggle.
- Link to registration.

Behavior:
- Validate required fields.
- Show inline validation errors.
- Disable duplicate submission while loading.
- Display authentication failures without exposing sensitive server details.
- Preserve the intended redirect destination.
- Restore keyboard focus appropriately after errors or dialogs.

## 5. Registration (`/register`)

Use the same shell, typography, spacing, and form styling as login.

Fields must match the existing registration contract. Do not add name, confirmation-password, or terms fields unless the application actually supports them.

Behavior:
- Validate required fields.
- Enforce existing password requirements.
- Show field-specific errors.
- Prevent duplicate submissions.
- Display success and failure states accurately.
- Navigate to the intended post-registration destination.

## 6. Dashboard (`/dashboard`)

### Layout

Header region:
- Page title and short explanation.
- New Project action.
- Workspace controls only when supported.

Primary content:
- Useful project summaries or recent projects.
- Pending invitations when available.
- Recent activity only when real activity data exists.
- Optional compact metrics derived from actual API data.

Secondary content:
- Templates or getting-started actions only if implemented.

### Interaction

- New Project opens a properly labelled dialog or existing creation flow.
- Project cards navigate to the correct project.
- Search and filters work against real data.
- Loading uses a stable skeleton or progress state.
- Empty state explains the next useful action.
- Errors provide a retry path where appropriate.

Do not show fabricated counts, invented collaborators, or fake recent activity.

## 7. Project catalog (`/projects`)

### Layout

Include:
- Page title.
- New Project action.
- Search and sorting controls where supported.
- Project list or grid.
- Useful metadata and diagram previews.
- Contextual project actions.

Project items should prioritize:
1. Project name.
2. Short description.
3. Diagram preview.
4. Last-modified information when available.
5. Access or status metadata when available.

Avoid using unrelated building photographs as thumbnails.

### Interactions

- Search filters the actual project collection.
- Sorting produces the advertised order.
- Clicking a project opens its intended route.
- Context menus expose only permitted actions.
- Deletion requires confirmation.
- Successful mutations update the visible list.
- Failed mutations retain relevant user context and show an error.

## 8. Project details

If a separate project overview route exists, use it to present:

- Project title and description.
- Diagram summary or preview.
- Collaborators and access information when available.
- Relevant project actions.
- Entry to the architecture editor.

Do not duplicate the entire editor inside the overview page.

If the existing application uses `/projects/:projectId` directly as the editor, preserve that routing behavior.

## 9. Architecture studio (`/projects/:projectId`)

### Desktop layout

Target a 48px top toolbar, a flexible canvas, a 240px component palette, and an approximately 340px inspector. Treat these as design targets, not fixed dimensions that must cause overflow on smaller screens.

```text
┌──────────────────────────────────────────────────────────────┐
│ Studio toolbar: Project | Save state | Presence | Actions    │
├──────────────┬──────────────────────────────┬────────────────┤
│ Components   │                              │ Properties     │
│ Search       │                              │ Analysis       │
│ Categories   │       Graph canvas           │ Validation     │
│              │                              │ AI Assistant   │
│ Node types   │       Connections            │                │
│              │                              │ Contextual data│
└──────────────┴──────────────────────────────┴────────────────┘
```

### Toolbar

Include the controls already supported by the application:

- Back to projects.
- Project name.
- Save status.
- Collaborator presence.
- Undo/redo when implemented.
- Validation.
- AI assistant.
- Share.
- Export.

Avoid putting every possible command into the toolbar. Use grouped menus for secondary actions.

### Component palette

Group components by their actual semantic categories, such as:

- Compute.
- Networking.
- Storage.
- Messaging.
- Integration.
- Client.

Use categories supported by the existing node model.

Required interactions:
- Search filters the component list.
- Categories expand and collapse.
- Selecting or dragging a component follows existing placement behavior.
- Empty search results provide a clear message.
- Keyboard users can reach and activate components.

### Canvas

Provide:
- Spatial reference grid.
- Nodes with semantic icons and readable labels.
- Connection handles and visible connection paths.
- Selection indicators.
- Pan and zoom.
- Fit-to-view and minimap where supported.
- Empty and loading states.
- Clear visual feedback for invalid operations.

Use actual graph data. Do not create a second static diagram that appears editable while leaving the real graph unchanged.

### Property inspector

Show the selected component's supported fields, such as:
- Label.
- Description.
- Type.
- Technology metadata.
- Other existing properties.

Behavior:
- Inputs reflect the selected node.
- Changes update the actual application state.
- Validation errors appear beside relevant fields.
- Unsaved changes are handled according to existing save semantics.
- The inspector adapts when no node is selected.

### Validation panel

Display:
- Overall result.
- Issue severity.
- A concise explanation.
- Affected node or connection.
- Navigation to the affected graph element when supported.

Clicking a finding should preserve the current project and move focus to the relevant element. The panel must distinguish structural validation from AI recommendations.

### AI assistant panel

Provide:
- A clear explanation of its scope.
- Supported analysis actions.
- A query field if conversational input is implemented.
- Loading and failure states.
- Findings with rationale and next steps.
- Links to relevant nodes when supported.

Any proposed modification to the graph must be explicitly reviewed and approved by the user before application.

### Save and conflict states

Display accurate states for:
- Saving.
- Saved.
- Save failed.
- Conflict.
- Offline or unavailable service, where detectable.

Do not optimistically claim permanent persistence before server confirmation.

### Permission states

For viewers or other restricted roles:
- Preserve visibility of the diagram.
- Disable editing controls that the role cannot use.
- Explain the read-only state.
- Keep permitted navigation and viewing functions available.

The server remains the authority for permissions.

## 10. Mobile studio

At widths below 768px:

- Keep the canvas as the main workspace.
- Collapse the palette and inspector into accessible drawers.
- Use a compact toolbar with clearly grouped actions.
- Ensure drawers close through Escape and an explicit close control.
- Trap focus only while a modal dialog is active.
- Return focus to the opening control after closing a drawer or dialog.
- Prevent background content from scrolling when an appropriate modal drawer is open.
- Preserve the user's canvas position when switching panels.

Do not force desktop columns into a narrow viewport.

## 11. Invitations (`/invitations`)

Provide:
- Invitation list.
- Sender or project context.
- Role information.
- Invitation status.
- Accept, decline, resend, or revoke actions only where permitted and implemented.

Every mutation must show pending, success, and failure feedback. Refresh or update the relevant data after successful actions.

Empty states should explain that there are no pending invitations, rather than displaying a blank page.

## 12. Settings and profile

Use a consistent authenticated shell with clearly labelled sections.

- Profile.
- Preferences.
- Team or workspace settings where implemented.
- Integrations where implemented.
- Security-related settings where implemented.

Do not expose controls that have no working behavior. Preserve existing security-sensitive flows.

## 13. Dialogs, menus, and notifications

Dialogs:
- Have a descriptive title.
- Use the correct semantic role.
- Support Escape where appropriate.
- Restore focus on close.
- Prevent accidental dismissal of critical confirmations.

Menus:
- Have visible active and focus states.
- Close after selection where appropriate.
- Support keyboard navigation.

Notifications:
- Communicate a specific event.
- Avoid repetitive success toasts for minor actions.
- Remain visible long enough to understand.
- Use accessible announcements for important asynchronous results.

## 14. Global responsive behavior

- Desktop: full navigation and multi-panel layouts.
- Tablet: compact navigation and reduced panel width.
- Mobile: stacked public pages, focused forms, and drawer-based workspace panels.

Do not hide primary actions without providing a clear alternative.

## 15. Completion checklist

- [ ] Every required route has a defined layout.
- [ ] Navigation destinations are valid.
- [ ] Product imagery represents software architecture.
- [ ] Every visible control has an implemented action.
- [ ] Loading, empty, success, and error states are defined.
- [ ] Role restrictions are reflected in the UI.
- [ ] Keyboard and mobile interactions are supported.
- [ ] Existing API contracts and product behavior remain unchanged.
- [ ] The final application has been inspected in a browser.