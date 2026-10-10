# ArchSync AI — Screen Specifications & Visual Implementation Blueprints

**Document:** `docs/ui-ux/SCREEN_SPECS.md`  
**Phase:** Phase 1 — UI/UX Discovery & Design Architecture  
**Role:** Principal Product Designer & Design Systems Engineer  
**Scope:** Screen-by-screen architectural layouts, component wireframe structures, responsive behaviors, and tool recommendations  

---

## 1. Implementation Sequencing & Screen Priority

To maximize development efficiency and minimize architectural risk, screen redesigns must follow an **inside-out** priority sequence:

```text
Priority 1: Architecture Studio Workspace (The Core Product)
   ↓
Priority 2: Project Catalog & Dashboard (The Management Hub)
   ↓
Priority 3: Authentication (Login & Registration)
   ↓
Priority 4: Invitations & Team Access Management
```

- **Why Studio First?** ArchSync AI's primary value proposition lives inside the interactive canvas. Establishing the unified studio top bar, collapsible categorized palette, and docked drawer eliminates 80% of user friction immediately.
- **Why Auth Third?** Authentication logic is already fully functional with cookies and tests; upgrading auth to a split-screen layout is a self-contained visual enhancement.

---

## 2. Screen 1: Architecture Studio Workspace (`/projects/:projectId`)

### 2.1 Layout Architecture (Unified Studio Cockpit)

Replace the current three-tier stacked header with a single, dedicated **Studio Top Bar**, locked strictly to `100dvh` without page footers or body scrollbars.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STUDIO TOP BAR (48px height)                                                                     │
│ [◄ Projects] | [Project Name] (v2) | [Role: Editor] | [Autosaved ●] | [Avatars] | [Validate] [AI] [Export]│
├─────────────────┬──────────────────────────────────────────────────────────────┬─────────────────┤
│ COMPONENT       │ INTERACTIVE ARCHITECTURAL CANVAS                             │ CONTEXT DRAWER  │
│ PALETTE         │                                                              │ (320px - 384px) │
│ (240px wide)    │ - React Flow Infinite Canvas with subtle dot grid            │                 │
│                 │ - Centered Node Topology with Directional Flow Edges         │ [Node Inspector]│
│ [Search Nodes]  │ - Cardinal Port Handles (Top/Right/Bottom/Left)              │  or             │
│                 │ - Remote Collaborator Multi-Cursors with Name Tags           │ [Validation]    │
│ ▼ Compute (2)   │ - In-Canvas Floating Minimap & Zoom Controls (Bottom Right)   │  or             │
│ ▼ Storage (2)   │ - In-Canvas Empty State Prompt (if 0 nodes)                  │ [AI Co-Pilot]   │
│ ▼ Network (1)   │                                                              │                 │
│ ▼ Cloud (2)     │                                                              │                 │
├─────────────────┴──────────────────────────────────────────────────────────────┴─────────────────┤
│ TELEMETRY STATUS BAR (24px height): Latency: 24ms | Nodes: 6 | Edges: 8 | Zoom: 100% | Socket: Active   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Detailed Section Specifications

1. **Studio Top Bar (48px fixed height):**
   - **Left Zone:** Back link (`ArrowLeft` + `Projects`), breadcrumb divider, editable project title (inline input for `OWNER`/`EDITOR`), current version badge (`v1`, `v2`).
   - **Center Zone:** Live persistence indicator (green dot = "Saved", pulsing cyan = "Saving", red = "Conflict") + team member modal trigger with count pill.
   - **Right Zone:** Active peer avatars stack, "Validate Architecture" button (with issue badge counter), "AI Co-Pilot" trigger, and "Export" dropdown menu.
2. **Component Palette (240px fixed width, collapsible to 48px icon rail):**
   - **Search Input:** Compact 32px search box with clear button (`Esc` to clear).
   - **Category Accordions:** Foldable sections with badge counts:
     - `Compute` (`Server`, `Microservice`)
     - `Storage` (`Database`, `Cache`)
     - `Networking` (`API Gateway`)
     - `Messaging` (`Message Queue`)
     - `Integration` (`External API`)
     - `Client & Edge` (`Client`, `Web App`, `Mobile App`, `Cloud Service`)
   - **Compact Node Tiles:** Crisp icon with category-tinted badge, bold title, and subtle drag grip handle.
3. **Canvas Viewport (`100%` remaining width & height):**
   - Pure `#0a0f1d` deep background with `#334155` subtle dot grid (`gap: 20px, size: 1.2px`).
   - Floating zoom & fit-to-screen controls (`Controls`) positioned bottom-left.
   - Floating interactive minimap (`MiniMap`) positioned bottom-right with node color indicators.
4. **Docked Context Drawer (Right Side, 320px–384px):**
   - Slides smoothly over canvas or docks cleanly.
   - Houses `NodeDetailsPanel`, `ValidationPanel`, or `AIAssistantPanel`.
   - Never stacks multiple panels side-by-side on screens below 1600px width.

---

## 3. Screen 2: Project Catalog (`/projects`) & Dashboard (`/dashboard`)

### 3.1 Dashboard Page (`/dashboard`) Layout

Inspired by modern engineering telemetry platforms (Neowise reference screenshot):

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GLOBAL HEADER: ArchSync AI Logo | Projects | Invites (1) | User Avatar Menu                      │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (max-w-6xl mx-auto, px-6 py-8)                                                      │
│                                                                                                  │
│ 1. Welcome Banner & Quick Action Bar:                                                            │
│    "Welcome back, [Architect Name]" | Role: [Admin/User] | [+ Create New Architecture]          │
│                                                                                                  │
│ 2. Telemetry & Summary Bento Grid:                                                               │
│    ┌───────────────────────────┬───────────────────────────┬───────────────────────────┐         │
│    │ TOTAL ARCHITECTURES       │ ACTIVE COLLABORATORS      │ PENDING INVITATIONS       │         │
│    │ 12 Active Projects        │ 8 Engineers across teams  │ 2 Access requests         │         │
│    │ [Donut: 8 Owner, 4 Shared]│ [Recent collaborator list]│ [Review Invites Button]   │         │
│    └───────────────────────────┴───────────────────────────┴───────────────────────────┘         │
│                                                                                                  │
│ 3. Recent Architectures Rail:                                                                    │
│    - Card 1: E-Commerce Microservices (Edited 2h ago by Sarah • 14 nodes • Valid Graph)         │
│    - Card 2: Payment Gateway Ingress (Edited yesterday by You • 8 nodes • 1 Warning)            │
│    - Card 3: Realtime Event Pipeline (Edited 3d ago • 22 nodes • Valid Graph)                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Projects Catalog Page (`/projects`) Layout

1. **Toolbar Header:**
   - Page title: "Architecture Projects".
   - Search bar (`w-72` with instant filter).
   - View toggle: **Grid View** (visual cards) vs **Table View** (dense list with sortable columns: Name, Nodes, Role, Last Updated, Actions).
   - Primary CTA: "+ New Project" button (`.btn-primary`).
2. **Project Card Anatomy (Grid View):**
   - **Header:** Category icon with cyan/blue accent, project title, role badge (`OWNER`/`EDITOR`/`VIEWER`), and kebab menu (Rename, Duplicate, Delete).
   - **Body:** Description (2-line clamp) + architectural metadata chip row (e.g. `12 Components`, `v3`).
   - **Footer:** Creation/update timestamp, collaborator avatar stack, and "Open Workspace →" action.

---

## 4. Screen 3: Authentication (Login `/login` & Register `/register`)

Inspired by high-end SaaS split-screen layouts (ChatConnect Pro benchmark):

```
┌──────────────────────────────────────────────────────┬───────────────────────────────────────────┐
│ LEFT HERO ZONE (55% width, hidden on mobile)         │ RIGHT AUTH CARD (45% width, centered)     │
│                                                      │                                           │
│ [ArchSync AI Logo]                                   │ [Welcome Back / Create Account]           │
│                                                      │ Enter your credentials to access studio.  │
│ "Architect Distributed Systems                       │                                           │
│  With Intelligent Precision."                        │ Email Address                             │
│                                                      │ [ name@company.com ]                      │
│ - Real-time multi-user canvas modeling               │                                           │
│ - Deterministic architectural graph validation       │ Password                                  │
│ - Advisory AI co-pilot for scalability & security    │ [ ••••••••••••                 (Eye) ]    │
│                                                      │                                           │
│ [Realistic Architecture Blueprint Diagram Graphic]   │ [ Sign In to Studio → ]  (.btn-primary)   │
│                                                      │                                           │
│ Trusted by engineering teams designing cloud systems │ Don't have an account? Register free      │
└──────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```

- **Clean Inputs:** Inset hardware-style inputs with clear focus ring (`--focus-ring-color`).
- **Submission Feedback:** High-contrast solid cyan action button (`.btn-primary`) with inline spinner during network flight.
- **Error Presentation:** High-contrast rose banner (`border-rose-500/30 bg-rose-500/10 text-rose-300`) with clear explanation.

---

## 5. Screen 4: Project Invitations & Access Inbox (`/invitations`)

1. **Information Architecture:**
   - Unified inbox showing pending invitations from team owners.
   - Clear project metadata: Project name, Owner name & email, Granted Role (`EDITOR` or `VIEWER`), and Timestamp.
2. **Action Controls:**
   - 2-button action cluster per row:
     - **Accept:** `.btn-primary` (Cyan 600) with instant optimism and redirect option.
     - **Decline:** Ghost button (`border-slate-800 text-slate-400 hover:text-rose-400`).
3. **Empty State:**
   - Composed "All Caught Up" state with clean envelope icon and direct link back to `/projects`.

---

## 6. Recommended Google Stitch Design Sequence

When using Google Stitch MCP to generate design references and screen comps, execute in this order:

1. **`stitch_screen_01_architecture_studio`**:
   - Prompt: High-density dark engineering diagram studio, 48px unified top bar, left 240px categorized palette (Compute, Storage, Network), interactive dot-grid canvas with connected cloud nodes, right docked property inspector, midnight slate `#0a0f1d` with cyan `#06b6d4` accents.
2. **`stitch_screen_02_projects_catalog`**:
   - Prompt: Engineering project dashboard, dark theme `#0f172a`, search bar, grid/list view switcher, project cards with component count pills, member avatar stacks, role badges (Owner, Editor), clean cyan primary button.
3. **`stitch_screen_03_auth_split_pane`**:
   - Prompt: B2B developer tool login screen, split layout, left half dark architectural blueprint graphic with headline, right half sleek high-contrast authentication form with cyan action button.
4. **`stitch_screen_04_ai_copilot_drawer`**:
   - Prompt: Slide-out AI architectural advisory drawer, dark theme, query suggestions pills, structured findings cards with severity badges (High, Medium), related node buttons, markdown typography.

---

## 7. Recommended 21st.dev Component References

To maintain speed and avoid reinventing standard accessible patterns, reference these 21st.dev components:

| Component Need | 21st.dev Reference Archetype | Applicable Page / Area |
| :--- | :--- | :--- |
| **Categorized Palette Accordion** | Minimal Collapsible Sidebar / Bento Tree | Architecture Canvas Left Palette |
| **Interactive Inspector Drawer** | Docked Sliding Panel with Tabbed Header | Architecture Canvas Right Panel |
| **Split-Pane Auth Container** | Minimalist High-Contrast Auth Split Layout | `/login` and `/register` |
| **Project Card Grid** | Machined Engineering Card with Micro-Badges | `/projects` Catalog Grid |
| **Collaborator Avatar Stack** | Overlapping Facepile with Tooltip Status | Studio Top Bar & Project Cards |
| **Telemetry Status Pill** | Tabular Monospace Latency & Health Indicator | Canvas Top Bar & Header |
