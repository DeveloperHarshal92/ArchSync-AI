# ArchSync AI — Comprehensive Design System & UI/UX Specification

**Document:** DESIGN.md  
**Product:** ArchSync AI — Collaborative Architecture Diagramming & AI Co-Pilot Studio  
**Version:** 1.0.0 (Production Architecture & Design System)  
**Status:** Living Design Specification  
**Applies To:** Web Client (`@archsync/client`), Shared UI Tokens (`@archsync/shared`), Canvas Design Engine, Component Library

---

## 1. Executive Design Philosophy & Visual Atmosphere

ArchSync AI is a professional, high-density, real-time cloud architecture design studio. It bridges technical precision with modern creative fluidity, tailored for Solutions Architects, Principal Engineers, DevOps teams, and Engineering Leaders.

### 1.1 Aesthetic Mood & Personality
- **Studio Cockpit Density (Density Rating: 7.5 / 10):** Information-dense without clutter. Every pixel communicates functional state: node topology, edge flow, validation health, live collaborator presence, and AI-assisted recommendations.
- **Deep Slate Canvas ("Midnight Observatory"):** A deep, low-eye-fatigue background (`#0f172a`) paired with layered translucent glass surfaces (`slate-900/95`, `slate-950/70`) that recede into the backdrop, elevating colorful architectural nodes as the primary heroes.
- **Precision Engineering Over Generic AI Aesthetics:** 
  - Strictly **NO** uncalibrated neon glow floods or AI-purple tropes.
  - Singular high-contrast **Cyan / Sky Blue** accent system (`#06b6d4` / `#38bdf8`) balanced with specialized domain badges.
  - Strict mathematical grid alignment, crisp 1px structural dividing lines (`border-slate-800`), and tactile spring micro-interactions.

### 1.2 Experience Tenets
1. **Zero Spatial Ambiguity:** Visual hierarchy directly mirrors architectural hierarchy (Client tier → Gateway → Compute → Data layer).
2. **Deterministic Feedback:** Immediate visual acknowledgment for every state transition: autosave pulses, cursor presence, socket latency, and live AI streaming.
3. **Inclusive by Default (WCAG 2.1 AA/AAA):** Universal keyboard focus indicators, strict contrast thresholds (>4.5:1 body, >3:1 UI components), and `prefers-reduced-motion` compliance.

---

## 2. Color Palette & Token Architecture

The color system uses Tailwind CSS extensions and native CSS custom properties configured in `client/tailwind.config.js` and `client/src/index.css`.

### 2.1 Base & Surface Foundations

| Token Name | Hex Code | Tailwind Equivalent | Purpose & Role |
| :--- | :--- | :--- | :--- |
| **Canvas Midnight** | `#0f172a` | `slate-900` | Global application canvas background |
| **Surface Deep** | `#020617` | `slate-950` | Modals, backdrops, dropdown popovers |
| **Surface Elevated** | `#1e293b` | `slate-800` | Panels, toolbars, sidebar elevated containers |
| **Surface Subtle** | `#334155` | `slate-700` | Hover states, secondary action buttons, canvas dots |
| **Border Structural** | `#1e293b` / `rgba(30,41,59,0.8)` | `slate-800/80` | Default 1px dividing borders and panel frames |
| **Border Hover** | `#334155` | `slate-700` | Interactive border hover and card outlines |
| **Text Primary** | `#f8fafc` | `slate-50` / `white` | Headlines, active labels, node primary titles |
| **Text Secondary** | `#94a3b8` | `slate-400` | Descriptions, metadata, parameter annotations |
| **Text Muted** | `#64748b` | `slate-500` | Category watermarks, shortcuts, disabled states |

### 2.2 Brand & Interactive Accents

| Token Name | Hex Code | Role & WCAG Validation |
| :--- | :--- | :--- |
| **Brand Primary (Cyan 500)** | `#06b6d4` | Interactive focus rings (`--focus-ring-color`), active tab highlights |
| **Brand Action (Cyan 600)** | `#0891b2` | High-contrast button override (`.btn-primary`), 4.6:1 contrast against `#0f172a` |
| **Brand Focus Glow** | `rgba(6, 182, 212, 0.25)` | Focused card glow, active canvas node ring |
| **Brand Blue Scale** | `#0c8de4` (`brand-500`) | Secondary brand accent, project links |

### 2.3 Semantic Status Palette

| State | Background Tint | Border | Text | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `rgba(16, 185, 129, 0.1)` | `border-emerald-500/30` | `#34d399` (`emerald-400`) | Autosaved, rule passed, 0 errors |
| **Warning** | `rgba(245, 158, 11, 0.1)` | `border-amber-500/30` | `#fbbf24` (`amber-400`) | Latency warning, validation alert, unlinked ports |
| **Error / Destructive** | `rgba(239, 68, 68, 0.1)` | `border-red-500/30` | `#f87171` (`red-400`) | Cycles detected, disconnected socket, role revoked |
| **Info / AI Co-Pilot** | `rgba(14, 165, 233, 0.1)` | `border-sky-500/30` | `#38bdf8` (`sky-400`) | AI suggestions, streaming status, hint tips |

### 2.4 Architecture Node Types Visual System

Each `ArchitectureNodeType` defined in `@archsync/shared` is mapped to an authoritative visual configuration (`NODE_TYPE_VISUALS`):

```
┌─────────────────┬──────────────────┬───────────────┬───────────────────────────┐
│ Node Type       │ Lucide Icon      │ Accent Hex    │ Badge Class Configuration │
├─────────────────┼──────────────────┼───────────────┼───────────────────────────┤
│ client          │ Monitor          │ #38bdf8 (Sky) │ bg-sky-500/10 text-sky-40 │
│ web-app         │ Globe            │ #06b6d4 (Cyan)│ bg-cyan-500/10 text-cyan  │
│ mobile-app      │ Smartphone       │ #3b82f6 (Blue)│ bg-blue-500/10 text-blue  │
│ api-gateway     │ Network          │ #a855f7 (Prpl)│ bg-purple-500/10 purple   │
│ server          │ Server           │ #6366f1 (Indg)│ bg-indigo-500/10 indigo   │
│ microservice    │ Boxes            │ #8b5cf6 (Vlt) │ bg-violet-500/10 violet   │
│ database        │ Database         │ #10b981 (Emrd)│ bg-emerald-500/10 emerald │
│ cache           │ Zap              │ #f59e0b (Ambr)│ bg-amber-500/10 amber     │
│ queue           │ Layers           │ #f97316 (Orng)│ bg-orange-500/10 orange   │
│ external-api    │ CloudUpload      │ #ec4899 (Pink)│ bg-pink-500/10 pink       │
│ cloud-service   │ Cloud            │ #0284c7 (Sky6)│ bg-sky-600/10 text-sky-30 │
└─────────────────┴──────────────────┴───────────────┴───────────────────────────┘
```

### 2.5 Real-Time Collaborative Cursor Palettes
Collaborative user avatars and multi-cursor overlays calculate deterministic hsl/hex values based on user ID hashes:
- `#f43f5e` (Rose)
- `#8b5cf6` (Violet)
- `#06b6d4` (Cyan)
- `#10b981` (Emerald)
- `#f59e0b` (Amber)
- `#ec4899` (Pink)

---

## 3. Typographic Architecture

The typographic hierarchy is designed for fast scanning across high-density diagrams, inspection property panels, and complex validation logs.

### 3.1 Font Stacks
- **Interface Primary:** `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - High legibility at small sizes (`10px`–`14px`), distinct glyph disambiguation, broad unicode symbol support.
- **Data & Monospace:** `JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  - Used for Node IDs, Coordinates `(x, y)`, Latency counters (`ms`), Schema definitions, and JSON/YAML exports.

### 3.2 Scale & Hierarchy

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | `2.25rem` (36px) | 800 (Extrabold) | 1.15 | `-0.025em` | Marketing landing hero, primary splash |
| **Heading 1** | `1.5rem` (24px) | 700 (Bold) | 1.25 | `-0.02em` | Workspace header, project title, auth headers |
| **Heading 2** | `1.125rem` (18px) | 600 (Semibold) | 1.3 | `-0.015em` | Drawer panel headers, modal titles |
| **Heading 3** | `0.875rem` (14px) | 600 (Semibold) | 1.4 | `-0.01em` | Architecture node card label, section dividers |
| **Body (Default)** | `0.875rem` (14px) | 400 (Regular) | 1.5 | `normal` | Standard text, form labels, chat messages |
| **Body Small** | `0.75rem` (12px) | 400 (Regular) | 1.4 | `normal` | Node descriptions, helper text, panel metadata |
| **Micro Caption** | `0.625rem` (10px) | 500 (Medium) | 1.3 | `+0.01em` | Technology tags, timestamp logs, port annotations |
| **Badge Stamp** | `0.5625rem` (9px) | 700 (Bold) | 1.0 | `+0.05em` | Uppercase node type badge (`DATABASE`, `CACHE`) |

---

## 4. Layout Architecture & Workspace Blueprint

The application workspace uses a three-tier layout structure: Header bar, Full-height Workspace Canvas, and Contextual Floating Panels.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Project Title (Editable) | Status (Autosave/Sync) | Members | Export | Auth │
├──────────────┬─────────────────────────────────────────────────────────┬───────────────┤
│  PALETTE     │  ARCHITECTURAL CANVAS (React Flow)                      │  INSPECTOR    │
│  (Collapsible)│                                                         │  (Collapsible)│
│  - Search    │  ┌───────────────────────┐                              │  - Properties │
│  - Compute   │  │   [API-GATEWAY]       │                              │  - Config     │
│  - Storage   │  └───────────┬───────────┘                              │  - Tech Stack │
│  - Network   │              │ (animated flow edge)                     │  - Validation │
│  - Cloud     │  ┌───────────▼───────────┐     ┌─────────────────────┐  │  ──────────── │
│              │  │      [SERVER]         │────►│     [DATABASE]      │  │  AI CO-PILOT  │
│              │  └───────────────────────┘     └─────────────────────┘  │  - Prompts    │
│              │                                                         │  - Diffs      │
├──────────────┴─────────────────────────────────────────────────────────┴───────────────┤
│  FOOTER / STATUS BAR: Latency (24ms) | Node Count (14) | Edge Count (19) | Role (Editor)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Layout Principles
1. **Viewport Lock (`min-h-[100dvh]`):** The workspace canvas is locked to the dynamic viewport height without unintended body scrolling.
2. **Layered Z-Index Hierarchy:**
   - `z-0`: Canvas background grid (`React Flow Background`)
   - `z-10`: Canvas nodes and directional edges
   - `z-20`: Multi-user cursor overlays
   - `z-30`: In-canvas floating toolbars (Minimap, Zoom controls, Quick Actions)
   - `z-40`: Collapsible docked panels (Component Palette, Inspector, Validation Drawer)
   - `z-50`: Top navigation header, global modals, drop-down menus
   - `z-9999`: Skip navigation link, critical toast announcements

---

## 5. Component Specifications & Behavior

### 5.1 Architecture Node Cards (`ArchitectureNodeComponent`)
- **Dimensions:** Width `min-w-[210px]` to `max-w-[260px]`, dynamic height based on content.
- **Card Shape:** `rounded-2xl border` with smooth 150ms transitions.
- **Idle State:** Background `bg-slate-900/95`, border `border-slate-800`, shadow `shadow-lg shadow-black/40`.
- **Hover State:** Border transitions to `border-slate-700`, subtle background lift `bg-slate-900`.
- **Selected State:** Border `border-cyan-400`, ring `ring-2 ring-cyan-400/80`, glow `shadow-xl shadow-cyan-500/20`.
- **4-Point Cardinal Connection Ports:**
  - Handles placed at Top, Bottom, Left, and Right.
  - Diameter: `12px` (`w-3 h-3`), border `border-2 border-slate-900`, fill `bg-cyan-400`.
  - Hover feedback: `group-hover:scale-125` for easy mouse/touch targeting.
- **Header Section:** Badged node icon (`w-7 h-7`), uppercase category label, and node type identifier.
- **Body Section:** Component label (`text-sm font-semibold text-white break-words`), description (`text-xs text-slate-400`), technology badge pill (`bg-slate-800/80 border-slate-700/60 text-slate-300`).

### 5.2 Edges & Connections
- **Edge Type:** Smooth step or curved bezier with dynamic arrowhead markers.
- **Idle Edge:** Stroke width `2px`, color `slate-600` (`#475569`).
- **Active / Selected Edge:** Stroke width `2.5px`, color `cyan-400` (`#22d3ee`).
- **Animated Data Flow:** Smooth `stroke-dashoffset` directional travel representing real-time API or message flow.
- **Connection Validation:** Instant red stroke when an illegal cyclic or invalid edge is dragged, reverting to idle upon release.

### 5.3 Buttons & Actions
- **Primary Button (`.btn-primary`):** 
  - Solid `#0891b2` (Cyan 600), bold white text, rounded `rounded-lg`, padding `px-4 py-2`.
  - Verified 4.6:1 contrast against dark background.
  - Active press feedback: `active:translate-y-[1px]` tactile click simulation.
- **Secondary / Ghost Button:**
  - Transparent fill with `border border-slate-700 hover:border-slate-600 hover:bg-slate-800/60`.
  - Text color `text-slate-300 hover:text-white`.
- **Destructive Button:**
  - Fill `bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20`.

### 5.4 Form Inputs & Dialog Fields
- **Container Structure:** High-contrast label above input, inline helper/error text below.
- **Field Appearance:** Background `bg-slate-950/80`, border `border-slate-800`, text `text-slate-100`, placeholder `placeholder-slate-500`.
- **Focus Treatment:** Zero fuzzy browser outlines. Strict 2px solid cyan focus ring (`--focus-ring-color: #06b6d4`) with 2px offset.

### 5.5 AI Co-Pilot Assistant Panel (`AIAssistantPanel`)
- **Docking:** Right-hand side sliding drawer with seamless collapse/expand toggle.
- **Chat Feed:** Markdown rendering for architecture recommendations, system design trade-offs, and scaling bottlenecks.
- **Architecture Diff Preview Card:** Displays added nodes (green badge), modified edges (yellow badge), and removed components (red badge) with a 1-click **"Apply to Canvas"** merge action.
- **Token / Context Meter:** Visual status of current context window and model latency.

### 5.6 Real-Time Collaboration & Synchronization Badges
- **Persistence Indicator (`PersistenceIndicator`):**
  - **Saved:** Emerald dot with "All changes saved" (`text-emerald-400`).
  - **Saving:** Pulsing cyan dot with "Saving..." (`text-cyan-400 animate-pulse`).
  - **Conflict / Error:** Red warning icon with "Sync conflict — click to retry" (`text-red-400`).
- **Connection & Role Badge (`CollaborationIndicator`):**
  - Displays project role (`Owner`, `Editor`, `Viewer`).
  - Shows connected peers count with stacked colorful avatars.
  - Displays instant toast if role is dynamically revoked or downgraded by project owner.

---

## 6. Motion Philosophy & Spring Dynamics

Micro-interactions in ArchSync AI are purposeful, providing spatial orientation without adding cognitive lag.

### 6.1 Motion Token Guidelines
- **Fast Micro-interactions (75ms – 150ms):** Button presses, handle hovers, tooltip appearances, dropdown reveals.
  - Curve: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out).
- **Standard Structural Transitions (200ms – 250ms):** Drawer expansions, panel collapse, modal popovers.
- **Canvas Viewport Easing (300ms – 400ms):** Canvas zoom-to-fit, center-on-node, auto-layout transitions.

### 6.2 WCAG 2.3.3 Reduced Motion Protocol
When the operating system or user agent signals `prefers-reduced-motion: reduce`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .react-flow__edge-path {
    animation: none !important;
    stroke-dashoffset: 0 !important;
  }
}
```
All UI elements jump immediately to their end state without animation frames.

---

## 7. Accessibility & Universal Usability (WCAG 2.1 AA)

ArchSync AI implements a comprehensive accessibility baseline established in Milestone F14:

### 7.1 Skip Navigation Link
A dedicated skip navigation link (`.skip-link`) is anchored to the top of the DOM:
- Visually hidden until keyboard focused (`top: -100%` transitions to `top: 0`).
- Targets `#main-content`, instantly bypassing headers and palette drawers for keyboard and screen-reader users.

### 7.2 Focus Rings & Visual Feedback
- Global `:focus-visible` rule guarantees high-visibility outline rings:
  ```css
  *:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color) !important;
    outline-offset: var(--focus-ring-offset) !important;
    border-radius: 4px;
  }
  ```
- Mouse pointer clicks do not trigger focus outlines (`*:focus:not(:focus-visible) { outline: none; }`).

### 7.3 Semantic Landmarks & ARIA Architecture
- `<header role="banner">`: Project workspace navigation and identity.
- `<nav aria-label="Project actions">`: Export options and navigation links.
- `<main id="main-content" tabIndex={-1}>`: Primary interactive canvas workspace.
- `<aside role="complementary" aria-label="Component palette">`: Node catalog drawer.
- `<aside role="complementary" aria-label="Architecture inspector">`: Properties & AI co-pilot.
- Live Regions: `<div aria-live="polite" aria-atomic="true">` announces status changes (e.g., autosave confirmations, peer joins, validation errors).

### 7.4 Touch & Keyboard Usability
- Minimum tap target of `44px x 44px` on all interactive mobile and tablet buttons.
- Full keyboard canvas accessibility: Tab selection, arrow key node movement (`10px` nudge, `50px` Shift+nudge), `Delete` / `Backspace` removal, `Ctrl+Z` / `Ctrl+Y` history rollback.

---

## 8. Responsive & Adaptive Breakpoints

The workspace layout adapts seamlessly across devices:

| Breakpoint | Width Range | Layout Adaptation |
| :--- | :--- | :--- |
| **Mobile** | `< 768px` | Sidebars convert into sliding off-canvas bottom/side sheets; canvas supports single-touch pan and pinch-zoom; compact header with overflow menu. |
| **Tablet** | `768px – 1024px` | Palette collapses to icon-only dock; Inspector remains toggleable; header displays essential icons. |
| **Desktop** | `1024px – 1440px` | Full 3-column workspace with docked palette, expansive canvas, and side drawer. |
| **Ultra-Wide** | `> 1440px` | Maximum diagram canvas real estate; expanded multi-column inspector with simultaneous validation and AI co-pilot views. |

---

## 9. Design Anti-Patterns (Strictly Banned)

To preserve the professional integrity and performance of ArchSync AI, the following patterns are prohibited:

1. **NO Neon Glow Overkill:** Do not apply oversaturated drop shadows or neon glows to standard cards or buttons. Glows are strictly reserved for active canvas selection states.
2. **NO Low-Contrast Text on Dark Surfaces:** Never use text colors lighter than `#94a3b8` on dark backgrounds for readable body text; ensure minimum 4.5:1 contrast for all text elements.
3. **NO Unstyled Browser Scrollbars:** All scrollable drawers and modals must use slim, styled scrollbars matching `slate-800` track and `slate-600` thumb.
4. **NO Absolute Pixel Stacking Without Boundaries:** Never float uncontrolled absolute popups over the canvas that lack dismiss-on-outside-click or ESC key listener handlers.
5. **NO Emojis as Status Icons:** Use authoritative Lucide SVG icons (`Monitor`, `Database`, `AlertTriangle`, `CheckCircle2`) instead of emojis for state, status, or component badges.
6. **NO Generic AI Placeholders:** Avoid filler names like "Acme Corp" or "Lorem Ipsum" in default diagrams. Use realistic architectural archetypes (e.g., "Auth Service", "PostgreSQL Primary", "Redis Session Store", "Ingress Gateway").

---

## 10. Summary & Implementation Verification

This design system is implemented in:
- `client/src/index.css`: Global styles, focus ring variables, skip-link, and reduced-motion rules.
- `client/tailwind.config.js`: Brand tokens and color extensions.
- `client/src/lib/architecture/nodeIcons.tsx`: Architecture node visual specifications.
- `client/src/components/architecture/*`: Core canvas, node, palette, and panel components.
- `shared/types/architecture.ts`: Authoritative node and edge data structures.
