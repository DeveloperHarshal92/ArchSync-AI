# ArchSync AI

> Real-Time Collaborative Architecture Workspace & Diagramming Platform

ArchSync AI is a production-hardened web platform designed for visually architecting software and distributed systems in real time with interactive canvas editing, multi-user presence, deterministic architecture validation, server-side AI assistance (Gemini), multi-format export (PNG, SVG, JSON), and enterprise-grade reliability.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript 5 + Vite
- **Canvas Engine:** React Flow (`@xyflow/react`) with custom architecture nodes & edge routing
- **State Management:** Redux Toolkit + RTK Query (caching, optimistic updates, query invalidation)
- **Real-Time Client:** Socket.IO Client (`socket.io-client`)
- **Exporting:** `html-to-image` (PNG & SVG generation), JSON schema serialization
- **Styling & Icons:** Tailwind CSS, Lucide React
- **Routing:** React Router v6 (SPA routing with Vercel rewrite support)
- **Accessibility:** WCAG 2.2 AA compliant focus traps, skip links, aria-live regions, and reduced-motion support

### Backend
- **Runtime:** Node.js + Express + TypeScript
- **Real-Time Server:** Socket.IO with authenticated rooms and presence lifecycles
- **Database & ODM:** MongoDB Atlas + Mongoose 8 (atomic optimistic concurrency locking)
- **Security:** Helmet, CORS, HTTP-only SameSite cookies (`SameSite=None; Secure` in production), bcryptjs
- **Rate Limiting:** In-memory sliding window rate limiter on authentication endpoints (HTTP 429)
- **Validation:** Zod schemas for request payloads and domain models
- **AI Integration:** Google Gemini REST API (`gemini-2.5-flash` / `gemini-1.5-flash`) with server-side API key header transmission (`x-goog-api-key`)

### Shared Layer (`@archsync/shared`)
- Monorepo shared package with type-safe contracts, Zod schemas, validation rules, and export definitions across client and server.

### Deployment & Infrastructure
- **Frontend Hosting:** Vercel SPA with deep routing rewrites (`client/vercel.json`)
- **Backend Hosting:** Render Web Service configured via root `render.yaml`
- **Health Checks:** Liveness (`/api/v1/health/live`) and Readiness (`/api/v1/health/ready`) probes

---

## 2. Repository Structure

```text
Project1/
├── .agents/skills/      # Reusable AI Agent Skills catalog
├── client/              # React 18 + Vite + TypeScript frontend
│   ├── src/
│   │   ├── __tests__/   # Frontend test suites (accessibility, export, RTK, canvas)
│   │   ├── components/  # Canvas, nodes, toolbar, panels, modal dialogs
│   │   ├── hooks/       # Custom React hooks (keyboard, presence, canvas)
│   │   ├── lib/         # Socket client, API URL resolver, canvas utilities
│   │   ├── pages/       # Route-level pages (Login, Register, Dashboard, Workspace)
│   │   ├── store/       # Redux Toolkit store, auth, canvas, and RTK Query APIs
│   │   └── styles/      # Global CSS and Tailwind definitions
│   └── vercel.json      # Vercel SPA rewrite configuration
├── server/              # Node.js + Express + TypeScript backend
│   └── src/
│       ├── __tests__/   # Integration & behavioral test suites (F01–F15)
│       ├── ai/          # Gemini AI provider with header-based auth & validation
│       ├── config/      # Environment validation, database manager, cookie options
│       ├── controllers/ # HTTP route controllers
│       ├── middleware/  # Rate limiter, auth, error handler, validation
│       ├── models/      # Mongoose schemas (User, Project, Member, Architecture)
│       ├── routes/      # Express API routes (/auth, /projects, /health, etc.)
│       ├── services/    # Business logic (Architecture, AI, Permissions, Health)
│       ├── sockets/     # Socket.IO connection handling, rooms, presence
│       ├── utils/       # JWT helpers, cookies, custom error classes
│       ├── app.ts       # Express app configuration & middleware pipeline
│       └── server.ts    # Server startup, fail-fast DB check, graceful shutdown
├── shared/              # Shared TypeScript contracts & schemas
│   └── types/           # Cross-package interfaces and API definitions
├── render.yaml          # Infrastructure as Code blueprint for Render deployment
├── DEPLOYMENT.md        # Comprehensive production deployment & operations guide
├── PRD.md               # Product Requirements Document
├── SYSTEM.md            # AI Developer System Guidelines
├── RULES.md             # Technical Architecture Governance Rules
├── FEATURES.md          # Implementation Roadmap (F01–F15)
├── TESTS.md             # Machine-Verifiable Validation Contract
├── memory.md            # Cross-Agent Persistent State Anchor
├── .env.example         # Template for environment configuration
└── package.json         # Workspace root configuration
```

---

## 3. Getting Started

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** Local instance (`mongodb://127.0.0.1:27017/archsync`) or MongoDB Atlas connection URI

### Installation
Clone the repository and install all workspace dependencies from the root directory:

```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` in the root and server directories:

```bash
cp .env.example .env
cp .env.example server/.env
```

Ensure the following variables are configured:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing (minimum 32 characters in production)
- `CLIENT_URL`: URL of the frontend application (`http://localhost:5173` for development)
- `GEMINI_API_KEY`: Google Gemini API key for AI assistant capabilities
- `VITE_API_URL` & `VITE_SOCKET_URL`: Client-side backend targets (defaults to proxy in development)

---

## 4. Running the Application

### Development
Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run individual services:
```bash
# Frontend only (http://localhost:5173)
npm run dev:client

# Backend only (http://localhost:5000)
npm run dev:server
```

### Verification & Quality Assurance
```bash
# Type check all workspaces (shared, server, client)
npm run typecheck

# Run test suites across all workspaces
npm test

# Build all packages for production
npm run build
```

---

## 5. Health & Monitoring Endpoints

ArchSync AI provides health endpoints designed for cloud orchestration and uptime checks:

| Endpoint | Method | Purpose | Response |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Overall diagnostic health | HTTP 200 with service, uptime, and database state |
| `/api/v1/health/live` | `GET` | Process liveness probe | HTTP 200 if server process is running |
| `/api/v1/health/ready` | `GET` | Dependency readiness probe | HTTP 200 when MongoDB is connected; HTTP 503 if disconnected |

---

## 6. Implementation Status (All Milestones Complete)

ArchSync AI has completed all 15 planned architectural milestones:

- **F01: Monorepo Foundation** — Workspace structure, npm workspaces, TypeScript configurations, and shared typing contracts.
- **F02: Backend Architecture** — Express API foundation, centralized error hierarchy, Zod request validation, and health checks.
- **F03: Authentication & Security** — Cookie-based JWT authentication, bcrypt password hashing, session management, and auth guards.
- **F04: Project Workspace CRUD** — Project creation, listing, updating, deletion, and strict multi-tenant isolation.
- **F05: Project Membership & RBAC** — Role-based access control (`OWNER`, `EDITOR`, `VIEWER`), invitations, and permission guards.
- **F06: Architecture Domain Model** — Graph schema definition (nodes, edges, viewport, versioning) and graph integrity validation.
- **F07: Interactive Canvas** — React Flow canvas with custom nodes (Client, Gateway, Server, Database, Message Queue), minimap, and controls.
- **F08: Client State Management** — Redux Toolkit and RTK Query cache synchronization, optimistic updates, and auth persistence.
- **F09: Architecture Persistence** — Debounced autosave engine, manual save controls, optimistic locking, and conflict resolution modal.
- **F10: Real-Time Collaboration** — Socket.IO bidirectional synchronization, multi-user cursor tracking, active node selection, and room lifecycle.
- **F11: Architecture Validation Engine** — Deterministic graph validator checking dangling edges, circular dependencies, isolated nodes, and security rules.
- **F12: AI Architecture Assistant** — Server-side Google Gemini integration providing architecture analysis, recommendations, and risk assessments.
- **F13: Architecture Export & Sharing** — PNG and SVG diagram rendering with custom background modes, structured JSON export, and clipboard sharing.
- **F14: UX, Polish & Accessibility** — WCAG 2.2 AA accessibility, keyboard navigation, focus traps, aria-live status announcements, and responsive design.
- **F15: Production Hardening & Cloud Deployment** — Dynamic WebSocket authorization & instant role revocation, cross-site cookie security (`SameSite=None; Secure`), strict JWT secret validation, auth rate limiting, atomic DB version concurrency, fail-fast startup, graceful shutdown, Render blueprint, and Vercel SPA routing.

For complete deployment instructions, see [DEPLOYMENT.md](file:///c:/College%20Work/Internship/Infyntrek/Project1/DEPLOYMENT.md).
