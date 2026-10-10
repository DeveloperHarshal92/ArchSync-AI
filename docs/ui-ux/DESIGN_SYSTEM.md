# ArchSync AI — Refined Canonical Design System

**Document:** `docs/ui-ux/DESIGN_SYSTEM.md`  
**Phase:** Phase 1 — UI/UX Discovery & Design Architecture  
**Role:** Design Systems Engineer & Senior UI Architect  
**Authority:** Single Source of Truth for Visual Design, Component Tokens, and Implementation Tokens  
**Applies To:** `@archsync/client`, `@archsync/shared`, Tailwind Configuration, Global CSS Tokens  

---

## 1. System Philosophy: "Precision Engineering Studio"

ArchSync AI's design system bridges rigorous architectural precision with modern creative fluidity. Built specifically for cloud architects and distributed systems engineers, it adheres to five visual tenets:

1. **Midnight Observatory Aesthetic:** Deep slate surfaces (`#0a0f1d`, `#0f172a`) eliminate eye strain during multi-hour diagramming sessions while allowing vibrant node semantics to stand out with high contrast.
2. **Singular High-Contrast Accent:** An uncompromising **Cyan / Sky Blue** identity (`#06b6d4`, `#0891b2`) calibrated to achieve WCAG 1.4.3 (>4.5:1) compliance against dark surfaces. Strictly no generic purple/magenta AI gradients.
3. **Structured Spatial Hierarchy:** Clear three-layer elevation: Base Canvas (`z-0`) → Floating Workspaces (`z-30`) → Docked Context Drawers (`z-40`) → Overlays & Dialogs (`z-50`).
4. **Tabular Information Density:** Monospace typography (`JetBrains Mono`) for version tags, coordinates, latencies, and node IDs; crisp geometric sans (`Inter`) for UI controls and labels.
5. **Restrained Tactile Motion:** Snappy CSS spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`) for micro-interactions without runtime library overhead.

---

## 2. Token Architecture & Foundations

### 2.1 Surfaces & Backgrounds

| Design Token | CSS Custom Property | Hex Value | Role & Applied Context |
| :--- | :--- | :--- | :--- |
| **`canvas-bg`** | `--color-canvas-bg` | `#0a0f1d` | React Flow primary canvas grid backdrop |
| **`surface-base`** | `--color-surface-base` | `#0f172a` | Global application shell, main dashboard body |
| **`surface-deep`** | `--color-surface-deep` | `#020617` | Dropdowns, dialog backdrops, command popovers |
| **`surface-elevated`**| `--color-surface-elevated`| `#1e293b` | Floating toolbars, docked sidebars, node cards |
| **`surface-subtle`** | `--color-surface-subtle` | `#334155` | Button hover states, canvas dots, inner card wells |

### 2.2 Borders & Structural Dividers

| Design Token | CSS Custom Property | Hex / Alpha Value | Role |
| :--- | :--- | :--- | :--- |
| **`border-structural`**| `--color-border-structural` | `rgba(30, 41, 59, 0.8)` (`slate-800/80`)| Standard 1px panel boundaries & card perimeters |
| **`border-subtle`**    | `--color-border-subtle`     | `rgba(51, 65, 85, 0.6)` (`slate-700/60`)| Internal dividers, table row lines, input frames |
| **`border-hover`**     | `--color-border-hover`      | `#475569` (`slate-600`)                 | Interactive card hover, button outline hover |
| **`border-focus`**     | `--focus-ring-color`        | `#06b6d4` (`cyan-500`)                  | Accessible 2px keyboard focus ring |

### 2.3 Typographic Scale & Hierarchy

```css
/* Font Stacks */
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

| Type Role | Font Family | Size | Weight | Line Height | Tracking | Context |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | Sans | `32px` (2rem) | `800` (Extrabold)| `1.2` | `-0.025em`| Auth hero heading, splash titles |
| **Heading 1** | Sans | `22px` (1.375rem)| `700` (Bold) | `1.25`| `-0.02em` | Studio title, Dashboard heading |
| **Heading 2** | Sans | `16px` (1rem) | `600` (Semibold)| `1.3` | `-0.015em`| Panel drawers, modal dialog titles |
| **Heading 3** | Sans | `14px` (0.875rem)| `600` (Semibold)| `1.4` | `-0.01em` | Node card title, category group headers |
| **Body Default** | Sans | `13px` (0.8125rem)| `400` (Regular) | `1.5` | `normal` | Form labels, description text, chat body |
| **Body Small** | Sans | `12px` (0.75rem) | `400` (Regular) | `1.4` | `normal` | Metadata, helper hints, timestamps |
| **Tabular Data** | Mono | `11px` (0.6875rem)| `500` (Medium) | `1.2` | `0` | Node IDs, Coordinates `(x, y)`, latency `ms` |
| **Badge Stamp** | Sans | `9px` (0.5625rem)| `700` (Bold) | `1.0` | `+0.06em`| Node category pills, uppercase role tags |

### 2.4 Brand & Interactive Accent Tokens (Verified Contrast Ratios)

| Token Name | Hex Code | Purpose | Verified Foreground / Background Contrast & Standards |
| :--- | :--- | :--- | :--- |
| **`brand-action` (Default)** | `#0e7490` (`cyan-700`) | Primary button fill with white text (`.btn-primary`). | **5.36:1** with `#ffffff` text (Passes WCAG AA normal text threshold ≥ 4.5:1). |
| **`brand-action-hover`** | `#155e75` (`cyan-800`) | Primary button active/hover state. | **7.12:1** with `#ffffff` text (Passes WCAG AAA). |
| **`brand-action-cyan`** | `#06b6d4` (`cyan-500`) | High-luminance accent button (`.btn-primary-cyan`) with dark text. | **8.31:1** with `#020617` (Slate-950) text (Passes WCAG AAA ≥ 7:1). |
| **`brand-focus`** | `#06b6d4` (`cyan-500`) | Global focus ring (`*:focus-visible`) on canvas backdrop (`#0a0f1d`). | **7.87:1** against `#0a0f1d` (Exceeds WCAG 1.4.11 UI boundary ≥ 3:1). |
| **`brand-boundary`** | `#0891b2` (`cyan-600`) | Active card borders / outlines on `#0a0f1d`. *(Note: 3.68:1 with white text, therefore used for UI boundaries, not white text).* | **4.69:1** against `#0f172a` canvas (Passes UI component boundary ≥ 3:1). |
| **`brand-highlight`** | `rgba(6, 182, 212, 0.15)` | Active node card halo ring, selected edge halo glow. | Ambient focus halo. |

### 2.5 Semantic Status Colors

| State | Background Tint | Border Tint | Text Color | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `rgba(16, 185, 129, 0.12)` | `rgba(16, 185, 129, 0.35)` | `#34d399` (`emerald-400`)| Graph valid, autosaved, connection clean |
| **Warning** | `rgba(245, 158, 11, 0.12)` | `rgba(245, 158, 11, 0.35)` | `#fbbf24` (`amber-400`)  | Latency alert, isolated nodes, unsaved draft |
| **Error** | `rgba(239, 68, 68, 0.12)`  | `rgba(239, 68, 68, 0.35)`  | `#f87171` (`rose-400`)   | Cycles detected, sync conflict (409), offline |
| **Info / AI** | `rgba(14, 165, 233, 0.12)` | `rgba(14, 165, 233, 0.35)` | `#38bdf8` (`sky-400`)    | AI advisory findings, tips, notifications |

---

## 3. Architecture Node Type Specification

Every node in `@archsync/shared` (`ArchitectureNodeType`) is mapped to a calibrated icon, accent color, and badge:

```
┌─────────────────┬──────────────────┬──────────────┬────────────────────────────────────────┐
│ Node Type       │ Lucide Icon      │ Accent Hex   │ Visual Semantic Role                   │
├─────────────────┼──────────────────┼──────────────┼────────────────────────────────────────┤
│ client          │ Monitor          │ #38bdf8      │ End-user browser / workstation         │
│ web-app         │ Globe            │ #06b6d4      │ Frontend single-page / SSR application │
│ mobile-app      │ Smartphone       │ #3b82f6      │ iOS / Android native app client        │
│ api-gateway     │ Network          │ #a855f7      │ Ingress proxy, router, rate limiter    │
│ server          │ Server           │ #6366f1      │ Core backend service or monolith       │
│ microservice    │ Boxes            │ #8b5cf6      │ Domain microservice container          │
│ database        │ Database         │ #10b981      │ Primary relational / NoSQL persistence │
│ cache           │ Zap              │ #f59e0b      │ In-memory caching layer (Redis)        │
│ queue           │ Layers           │ #f97316      │ Event stream / message broker (Kafka)  │
│ external-api    │ CloudUpload      │ #ec4899      │ Third-party SaaS webhook / integration │
│ cloud-service   │ Cloud            │ #0284c7      │ Managed cloud infrastructure (S3/IAM)  │
└─────────────────┴──────────────────┴──────────────┴────────────────────────────────────────┘
```

---

## 4. Component Primitives Specifications

### 4.1 Buttons & Interactive Triggers

1. **Primary Action Button (`.btn-primary`):**
   - Solid fill: `#0891b2` (`cyan-600`), no gradient overlay.
   - Text: `text-white font-semibold text-xs tracking-wide`.
   - Padding: `px-3.5 py-2`, radius: `rounded-xl` (`10px`).
   - Tactile feedback: `active:scale-[0.98] transition-transform duration-100`.
   - Keyboard: 2px cyan `:focus-visible` ring with 2px offset.
2. **Secondary / Outline Button:**
   - Fill: `bg-slate-900/80 hover:bg-slate-800`.
   - Border: `border border-slate-800 hover:border-slate-700`.
   - Text: `text-slate-300 hover:text-white`.
3. **Destructive Button:**
   - Fill: `bg-rose-500/10 hover:bg-rose-500/20`.
   - Border: `border border-rose-500/30`.
   - Text: `text-rose-400 hover:text-rose-300`.
4. **Icon Action Button (Canvas Toolbar & Kebab Menus):**
   - Size: `32px x 32px` (`w-8 h-8`), centered icon (`w-4 h-4`).
   - Border: `border border-slate-800 bg-slate-900/90`.
   - Touch target: Minimum `44px x 44px` invisible tap target on mobile.

### 4.2 Form Inputs, Textareas & Selects

- **Container:** High-contrast label above input (`text-xs font-semibold uppercase tracking-wider text-slate-300`).
- **Input Surface:** `bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500`.
- **Focus State:** `focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none`.
- **Disabled State:** `disabled:opacity-50 disabled:cursor-not-allowed bg-slate-950/40`.
- **Error State:** `border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40`.

### 4.3 Architecture Node Card (`ArchitectureNodeComponent`)

- **Anatomy:**
  ```text
  ┌────────────────────────────────────────────────────────┐
  │ [● top port]                                           │
  │ [Icon] TYPE BADGE                    Category Tag     │
  │ ────────────────────────────────────────────────────── │
  │ Component Title (Bold, break-words)                    │
  │ Optional description (truncated, 2 lines max)          │
  │ [Tech Stack Pill]                                      │
  │ [● left port]                          [● right port]  │
  │ [● bottom port]                                        │
  └────────────────────────────────────────────────────────┘
  ```
- **Dimensions:** Min width `220px`, max width `260px`.
- **Surfaces:**
  - Idle: `bg-slate-900/95 border border-slate-800 shadow-lg shadow-black/40 rounded-2xl`.
  - Hover: `border-slate-700 bg-slate-900`.
  - Selected: `border-cyan-400 ring-2 ring-cyan-400/80 shadow-xl shadow-cyan-500/20`.
- **Ports (4 Cardinal Handles):**
  - Diameter: `12px` (`w-3 h-3`), border `border-2 border-slate-900`, fill `bg-cyan-400`.
  - Hover feedback: `group-hover:scale-125 transition-transform duration-100`.

### 4.4 Modals, Dialogs & Panel Drawers

- **Backdrop:** `fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50`.
- **Modal Box:** `rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-w-md w-full`.
- **Docked Panel Drawer (Inspector, AI Co-Pilot, Validation):**
  - Dock: Fixed right edge of canvas container, full canvas height (`h-full`).
  - Width: `320px` (Properties/Validation), `384px` (AI Co-Pilot).
  - Border: `border-l border-slate-800/80 bg-slate-950/95 backdrop-blur-md`.
  - Header: 48px sticky header with icon, title, close button, and tab actions.

---

## 5. Motion Guidelines & Spring Dynamics

ArchSync AI relies strictly on lightweight, GPU-accelerated CSS transitions:

```css
/* Motion Timing Tokens */
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);  /* Snappy ease-out with slight momentum */
--duration-fast: 100ms;                        /* Buttons, handles, badges */
--duration-normal: 200ms;                      /* Panel drawers, toolbars */
--duration-smooth: 300ms;                      /* Viewport fit, modal reveals */
```

### 5.1 Rules for Motion
1. **Never animate layout properties (`top`, `left`, `width`, `height`).** Always use `transform` (`translate`, `scale`) and `opacity`.
2. **Never delay user input.** Form controls and port handles must react in `< 100ms`.
3. **Respect `prefers-reduced-motion`:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

---

## 6. Strict Banned Anti-Patterns

1. **NO Neon Glow Floods:** Never apply oversaturated outer glows or AI-purple gradients to cards or buttons. Glows are strictly reserved for active canvas selection states.
2. **NO Viewport-Breaking Footers:** Never render the global marketing footer inside the studio canvas layout.
3. **NO Internal Developer Jargon in UI:** Never expose internal epic names (`F03`, `F04`, `F12`), validator names (`Zod`), or raw test descriptions in customer-facing interfaces.
4. **NO Low-Contrast Text:** Never use text lighter than `#94a3b8` on dark backgrounds for readable body text.
5. **NO Unstyled Browser Scrollbars:** All scrollable drawers must use slim 6px scrollbars (`slate-800` track, `slate-600` thumb).
