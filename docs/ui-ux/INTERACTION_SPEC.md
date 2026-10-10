# ArchSync AI — Detailed Interaction Specification

**Document:** `docs/ui-ux/INTERACTION_SPEC.md`  
**Phase:** Phase 1 — UI/UX Discovery & Design Architecture  
**Role:** Senior React UI Engineer & Interaction Designer  
**Scope:** Interactive states, micro-interactions, gesture feedback, focus traps, and real-time collaboration transitions  

---

## 1. Canvas Authoring & Node Manipulation Interactions

### 1.1 Node Drag-and-Drop from Palette to Canvas

| Phase | User Action | System Feedback | ARIA / Accessibility Behavior |
| :--- | :--- | :--- | :--- |
| **Idle** | Hover over palette node item | Item highlights (`bg-slate-900/80 border-cyan-500/40`), grip icon becomes visible (`text-slate-400`). Cursor changes to `grab`. | Item is focusable with `tabIndex={0}`, announces label and category. |
| **Pick-up** | Mouse `mousedown` & drag start | Native drag payload set: `application/reactflow` = `nodeType`. Item opacity dips to `0.5`. Cursor switches to `grabbing`. | Screen reader user can press `Enter` or `Space` to place node at viewport center. |
| **Canvas Hover** | Dragging payload over canvas | React Flow handles `onDragOver` with `event.preventDefault()` and `dropEffect = 'move'`. Dot grid displays subtle hover coordinate focus. | Canvas announced as active drop target. |
| **Drop** | Mouse `mouseup` over canvas | Calculates canvas coordinates via `screenToFlowPosition({ x, y })`. Node is created with default dimensions (`width: 240, height: 120`), auto-generated ID (`node_<hash>`), and automatically selected. Inspector panel immediately opens to Node Details. | Announcement pushed to `#a11y-announcer`: `"Added [NodeType] component to canvas at coordinates X, Y."` |
| **Viewer Attempt** | Viewer attempts to drag | Drag is blocked (`event.preventDefault()`). Palette items display `cursor-not-allowed` and `aria-disabled="true"`. | Screen reader receives: `"Component creation disabled in Viewer mode."` |

### 1.2 Cardinal Port Hover & Edge Connection

| State | Visual Treatment | Animation / Transition |
| :--- | :--- | :--- |
| **Port Idle** | `12px` solid circle (`bg-cyan-400 border-2 border-slate-900`), positioned at Top, Bottom, Left, Right edges. | Base state. |
| **Port Hover** | Scale transforms to `125%` (`transform: scale(1.25)`). Subtle cyan ring expands (`ring-2 ring-cyan-400/50`). Cursor becomes crosshair (`cursor-crosshair`). | Snappy 100ms spring (`cubic-bezier(0.16, 1, 0.3, 1)`). |
| **Connection Drag** | A dynamic curved bezier or smoothstep line extends from the source port to the current cursor position. Stroke: `2px solid #22d3ee` (`cyan-400`). | Smooth hardware-accelerated SVG line render at 60fps. |
| **Target Port Snap** | As cursor approaches a target port within `20px` radius, connection magnetically snaps to the port. Target port pulses cyan. | Instant magnetic lock. |
| **Self-Loop / Cycle Rejection** | Dragging back to the same node or attempting an illegal self-loop turns the edge stroke to `rose-400` (`#f87171`) with a dashed pattern. Releasing cancels the connection. | Instant color shift with tooltip: `"Self-referential connections are not allowed."` |
| **Valid Connection Made** | Edge solidifies with smooth arrowhead marker. An autosave cycle is scheduled. Inspector switches to Connection Properties. | Subtle 150ms stroke flash from `#22d3ee` to `#475569`. |

### 1.3 Node & Edge Selection States

1. **Node Selection:**
   - Single click on a node highlights its perimeter with `border-cyan-400`, `ring-2 ring-cyan-400/80`, and an ambient halo (`shadow-xl shadow-cyan-500/20`).
   - The right docked drawer updates to `NodeDetailsPanel` displaying editable title, description, and technology tags.
   - Any previously selected edge or node is automatically deselected.
2. **Edge Selection:**
   - Clicking an edge increases stroke width to `3px` and highlights color to `cyan-400`.
   - Edge properties open in the inspector to allow setting labels (e.g. `HTTPS`, `gRPC`, `Pub/Sub`) and line styles (`solid`, `dashed`, `animated flow`).
3. **Canvas Pane Click:**
   - Clicking on the empty background grid deselects active nodes/edges, closes the details panel, and clears selection halos.

---

## 2. Real-Time Collaboration & Concurrency Interactions

### 2.1 Multi-User Remote Cursors

```text
User Cursor Structure:
[ ▲ Cursor Pointer ] 
┌────────────────────────┐
│ Alex (Principal Arch)  │  <-- Deterministic user color tag
└────────────────────────┘
```

- **Coordinates Streaming:** Socket.IO throttles cursor movement events at 50ms intervals.
- **Color Hashing:** User colors are generated deterministically from `userId` string hash (`Rose`, `Violet`, `Cyan`, `Emerald`, `Amber`).
- **Inactivity Fade:** If a collaborator remains stationary for > 3000ms, their cursor fades to `opacity-30`. On disconnect, cursor disappears with a 150ms fade-out.

### 2.2 Autosave Debounce & Concurrency Conflicts

| Persistence State | Indicator Pill Appearance | Behavior |
| :--- | :--- | :--- |
| **Clean / Saved** | Solid emerald dot (`bg-emerald-400`) + `"All changes saved"` | Idle state. |
| **Dirty / Pending** | Solid amber dot (`bg-amber-400`) + `"Unsaved changes..."` | Triggered on node move/edit; starts 1000ms debounce timer. |
| **Saving** | Pulsing cyan dot (`bg-cyan-400 animate-pulse`) + `"Saving..."` | HTTP PUT payload dispatched with current architecture `version`. |
| **Success** | Emerald checkmark (`text-emerald-400`) + `"Saved"` | Server confirms write, advances client version counter. |
| **Conflict (409)** | Warning icon (`text-rose-400`) + `"Sync conflict — click to retry"` | Server reports another user saved a newer version. A non-destructive modal offers: **"Reload Latest Diagram"** or **"Review Differences"**. |

---

## 3. Side Panel Docking & Drawer Transitions

### 3.1 Mutual Exclusivity & Single Active Drawer Model

To maintain maximal diagram real estate on standard laptop viewports (`1280px–1440px`), the right panel acts as a **unified docked workspace container**:
- **Slot A:** Node / Edge Property Inspector (`NodeDetailsPanel`)
- **Slot B:** Structural Validation Results (`ValidationPanel`)
- **Slot C:** AI Architecture Co-Pilot (`AIAssistantPanel`)

When a user clicks "AI Assistant", any open Validation or Properties view collapses, and the AI panel expands smoothly.

```
Transition Curve: cubic-bezier(0.16, 1, 0.3, 1)
Duration: 200ms
CSS Properties: transform: translateX(0) / translateX(100%), opacity: 1 / 0
```

### 3.2 Mobile & Narrow Tablet Drawer (< 768px)

On narrow screens:
1. Side panels hide from document layout.
2. A floating panel button (`PanelRightOpen`) in the canvas toolbar opens a full-height off-canvas sheet (`w-80 max-w-[90vw]`).
3. An accessible backdrop (`panel-drawer-backdrop`) covers the canvas. Tapping backdrop or pressing `Escape` closes the drawer.

---

## 4. Architecture Validation Interactions

1. **Trigger:** User clicks "Validate" in canvas action toolbar.
2. **In-Flight:** Button displays spinning refresh icon (`animate-spin`), `aria-busy="true"`.
3. **Clean Graph Result:**
   - Toolbar button displays green shield with checkmark (`text-emerald-400`).
   - Brief toast announcement: `"Architecture graph is valid. 0 issues detected."`
4. **Issues Detected:**
   - Toolbar button turns amber or red and displays an exact issue count badge (e.g. `[3]`).
   - The Validation Panel automatically slides out.
   - Each issue card (`ERROR: Circular Dependency`, `WARNING: Disconnected Node`) displays an interactive **"Focus Component"** button.
   - Clicking an issue smoothly pans and centers the canvas (`setCenter(x, y, { duration: 300 })`) directly onto the problematic node with a temporary highlight pulse.

---

## 5. AI Co-Pilot Advisory Loop

1. **Opening:** User clicks "AI Assistant" button in toolbar.
2. **Contextual Quick Queries:**
   - Horizontal pills provide 1-click prompts: *"Find Single Points of Failure"*, *"Analyze Scalability"*, *"Evaluate Security"*.
   - Clicking a pill populates the query and triggers immediate advisory review.
3. **Advisory Stream & Presentation:**
   - Displays a clean typing indicator / skeleton during server inference.
   - Formatted output renders:
     - **Findings:** Categorized by severity (`HIGH`, `MEDIUM`, `LOW`).
     - **Tradeoffs:** Specific pros and cons of suggested architectures.
     - **Related Node Chips:** Interactive node buttons (e.g. `[server_1]`, `[db_main]`). Clicking any chip immediately selects and centers the node in the canvas.
4. **Safety & Advisory Boundary:**
   - The AI panel clearly states: `"Advisory only — ArchSync AI will never silently modify your architecture diagram."`

---

## 6. Keyboard Shortcut & Focus Management Protocol

| Key Combination | Scope | Action | Accessibility Contract |
| :--- | :--- | :--- | :--- |
| **`Tab` / `Shift+Tab`** | Global | Navigates interactive elements in logical order | Cyan `:focus-visible` ring strictly visible on all controls. |
| **`Escape`** | Modal / Drawer | Closes open dialog, drawer, or dropdown menu | Focus returns smoothly to the trigger button that opened it. |
| **`Delete` / `Backspace`**| Canvas | Deletes currently selected node(s) or edge(s) | Blocked in Viewer mode. Announces deletion to screen reader. |
| **`Arrow Keys`** | Canvas Node | Nudges selected node by `10px` | Coordinates update in real-time. |
| **`Shift + Arrow Keys`**| Canvas Node | Nudges selected node by `50px` | Rapid layout adjustment. |
| **`Ctrl+Z` / `Cmd+Z`** | Canvas | Undo previous node position or property change | Standard history stack rollback. |
| **`Enter` / `Space`** | Palette | Adds focused component to center of viewport | Full keyboard parity for drag-and-drop. |
