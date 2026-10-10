# ArchSync AI — UI/UX Product Requirements Document (PRD)

**Document:** `docs/ui-ux/UI_UX_PRD.md`  
**Phase:** Phase 1 — UI/UX Discovery & Design Architecture  
**Role:** Principal Product Designer, Design Systems Engineer, Senior React UI Engineer  
**Product:** ArchSync AI — Real-Time Collaborative Architecture Workspace  
**Status:** Living Design PRD  

---

## 1. Executive Product Vision & Design Mandate

ArchSync AI is a specialized cloud and software architecture diagramming studio engineered for Solutions Architects, Principal Engineers, DevOps Specialists, and Engineering Leaders.

Unlike generic diagramming whiteboards (e.g., Miro, Excalidraw) or static drawing tools (e.g., Lucidchart), ArchSync AI treats architecture as a **first-class structural domain model**:
- Components have semantic architectural types (`database`, `api-gateway`, `microservice`, `cache`, `queue`).
- Connections represent directional dependencies and communication protocols.
- The system runs automated **graph validation** to detect cycles, isolated nodes, and misconfigurations.
- An embedded **AI Co-Pilot** provides contextual advisory reviews on scalability, security, single points of failure, and cost.
- Engineering teams collaborate simultaneously with real-time multi-cursor presence and role-based permissions (`OWNER`, `EDITOR`, `VIEWER`).

### Design Mandate: "Precision Engineering Studio"
The interface must reflect the dignity, speed, and precision of high-end developer tools (Linear, Xcode, VS Code, Figma, SimuFlow). It rejects generic SaaS marketing templates, uncalibrated purple/pink neon glows, and superficial decorative filler. The UI must feel like a focused engineering cockpit: dark, high-contrast, mathematically aligned, fast, and ergonomic during multi-hour diagramming sessions.

---

## 2. Target User Personas & Context of Use

| Persona | Primary Goal | Critical Pain Points in Existing Tools | Key Workspace Needs in ArchSync AI |
| :--- | :--- | :--- | :--- |
| **Principal Solutions Architect** | Design scalable distributed systems and present architecture to stakeholders. | Static diagrams go out of sync; no automated validation; tedious manual redrawing. | High visual clarity, node categorization, clean export (SVG/PNG/JSON), validation checks. |
| **Backend & Cloud Engineer** | Model microservice communications, queues, databases, and API gateways. | Switching between documentation, drawing tools, and ChatGPT for architectural critique. | In-canvas AI assistant, technology tagging, port-to-port directional data flow edges. |
| **Engineering Manager / Tech Lead** | Review team PRs/RFCs, audit infrastructure risks, manage project access. | Unclear permissions, missing context on single points of failure, friction inviting members. | Role management (`OWNER`, `EDITOR`, `VIEWER`), invitations inbox, clear project cards. |
| **Security & Compliance Auditor** | Verify perimeter boundaries, public vs private subnets, external API hooks. | Unstructured diagrams lack clear semantic typing and connection clarity. | Distinct node archetypes, validation issue summaries, deterministic audit states. |

---

## 3. Core User Journeys

### Journey 1: Authentication & Onboarding
1. **Entry:** User arrives at ArchSync AI via `/login` or `/register`.
2. **Context:** Split-pane interface presenting system capabilities on the left, high-contrast login card on the right.
3. **Action:** Enters email/password with instant field validation, clear error feedback, and accessible keyboard focus.
4. **Transition:** Redirected immediately to `/dashboard` or the deep-linked project workspace with zero layout flash.

### Journey 2: Project Management & Dashboard Overview
1. **Landing:** User views `/dashboard` with aggregated metrics: total projects, active collaborations, pending invitations, and system status.
2. **Catalog Navigation:** Clicks `/projects` to access searchable, filterable project cards.
3. **Project Creation:** Clicks "New Project" — opens an accessible modal with auto-focused name input and optional description.
4. **Access:** Instant optimistic addition to project grid; 1-click "Open Workspace" navigates to `/projects/:projectId`.

### Journey 3: Interactive Architecture Modeling (The Studio Core)
1. **Canvas Viewport:** User enters an immersive, full-height (`100dvh`), distraction-free canvas without intrusive global headers or marketing footers.
2. **Component Discovery:** Left collapsible palette groups 11 architectural nodes into logical categories (`Compute`, `Storage`, `Networking`, `Messaging`, `Integration`, `Client`).
3. **Placement:** Drag-and-drop onto the dot-grid canvas or click-to-place with instant coordinate feedback.
4. **Wiring:** Drag connection between 4-cardinal port handles; edge displays directional flow marker; system rejects illegal self-loops with instant visual feedback.
5. **Configuration:** Clicking a node opens the right-docked Property Inspector to edit label, description, technology stack, and custom parameters.

### Journey 4: Real-Time Collaborative Session
1. **Joining:** User opens a project where teammates are working.
2. **Presence:** Peer avatars appear in the header status cluster; remote cursors display live with deterministic user colors and name tags.
3. **Autosave & Concurrency:** Changes trigger an autosave debounce cycle (`Saving...` → `Saved`); optimistic concurrency prevents silent overwrite with clear conflict indicators (`409 VERSION_CONFLICT`).
4. **Permission Enforcement:** Viewers see a clear read-only banner; palette node dragging and inspector inputs are disabled with explicit `aria-disabled` feedback.

### Journey 5: Architecture Validation & AI Co-Pilot Review
1. **Validation Check:** User clicks "Validate" in the canvas toolbar. The deterministic validation engine checks structural DAG health.
2. **Remediation:** Validation drawer slides out displaying categorized issues (`ERROR`, `WARNING`, `INFO`). Clicking any issue pans the canvas directly to the offending node/edge.
3. **AI Consultation:** User opens AI Co-Pilot panel, runs quick queries ("Analyze Single Points of Failure", "Evaluate Scalability bottlenecks"), or asks custom architectural questions.
4. **Advisory Feedback:** Structured findings, tradeoffs, and recommendations appear with related node chips for 1-click canvas navigation.

### Journey 6: Export & Team Sharing
1. **Menu Trigger:** User opens "Export" dropdown from canvas toolbar.
2. **Formats:** Selects PNG (high-res with dark background), SVG (vector for documentation), or JSON (machine-readable state).
3. **Safety Check:** System warns if unsaved changes are pending before generating the export.

---

## 4. UI/UX Design Principles

### Principle 1: Studio Cockpit Density (Density Level: 7 / 10)
Information must be compact, readable, and structured. Use `12px–14px` primary type, tabular monospace numbers for coordinates and counts, and tight `8px–16px` padding inside inspector panels. Never pad out tools with vacant whitespace.

### Principle 2: Zero Spatial Ambiguity
The interactive canvas is the hero. Surrounding toolbars, palettes, and inspectors must clearly feel docked or floating *above* the canvas with subtle elevation (`shadow-xl`) and hairline borders (`border-slate-800`), never competing with the nodes.

### Principle 3: Deterministic Status Feedback
State must never be mysterious:
- **Autosave:** Green dot (`Saved`), pulsing cyan (`Saving`), amber/red (`Sync Error / Conflict`).
- **Network / Socket:** Explicit latency and peer count.
- **Validation:** Green checkmark (`Valid Graph`) or amber/red badge with exact issue count.

### Principle 4: High-Contrast Dark Ergonomics ("Midnight Observatory")
Deep slate foundation (`#0a0f1d` / `#0f172a`) paired with singular high-contrast cyan/sky accents (`#06b6d4`, `#0891b2`). Avoid uncalibrated neon glow floods, purple/pink AI tropes, or harsh solid black (`#000000`).

### Principle 5: Accessible by Construction (WCAG 2.1 AA)
Every interactive element must have:
- Minimum `4.5:1` text contrast and `3:1` UI boundary contrast.
- Global, high-visibility keyboard focus rings (`:focus-visible` in cyan).
- Meaningful ARIA labels, semantic roles (`toolbar`, `dialog`, `complementary`, `list`), and screen-reader announcements via `#a11y-announcer`.
- Full compliance with `prefers-reduced-motion`.

---

## 5. Non-Goals (What ArchSync AI is NOT)

1. **Not a General Whiteboard:** We do not support freehand scribbles, sticky notes, emojis, or drawing shapes. All canvas items are semantic architecture components.
2. **Not a Marketing Landing Page App:** The interior workspace should never display marketing splash banners, promotional footers, or oversized decorative hero sections.
3. **Not an Autonomous Mutator:** The AI assistant is strictly advisory. It does not silently mutate the canvas or make unapproved layout changes.
4. **Not a Multi-Theme Consumer App (for MVP):** The design system is optimized for a dark engineering studio environment. A light mode is an anti-goal for this phase to preserve contrast tuning and component density.
5. **Not a Heavy External UI Dependency Rewrite:** All components must leverage our existing stack (React 18, Tailwind CSS, Lucide React, React Flow). We will not install heavy component frameworks that invalidate existing tests.

---

## 6. Measurable Success Criteria

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **Canvas Usability (Viewport Lock)** | 100% viewport containment | Zero unintended vertical body scrollbars when working in `/projects/:projectId`. |
| **Accessibility Compliance** | 100% WCAG 2.1 AA Pass | Automated axe-core / Vitest checks + zero keyboard trap or focus ring defects. |
| **Text & Button Contrast** | > 4.5:1 on all surfaces | Color contrast analyzer across primary buttons, labels, and status badges. |
| **Time-to-First-Node** | < 5 seconds | User navigates into project, finds component in palette, and drops it onto canvas. |
| **Panel Navigation Speed** | < 150ms state transition | Snappy, hardware-accelerated drawer open/close without canvas stutter. |
| **Information Jargon Elimination** | 0 internal developer terms in UI | Complete removal of "F03", "F04", "F12", "Zod Contract", "Owner Isolation" from user-facing screens. |
| **Automated Test Retention** | 316/316 tests passing | Full preservation of all client and server test suites without regressions. |
