# ArchSync AI

> Real-Time Collaborative Architecture Workspace

ArchSync AI is a collaborative web platform designed for visually architecting software and distributed systems in real time with interactive canvas editing, multi-user presence, architecture validation, and server-side AI assistance.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit + RTK Query
- **Routing:** React Router v6
- **Canvas:** React Flow *(Planned for upcoming milestone)*

### Backend
- **Runtime:** Node.js + Express + TypeScript
- **Security:** Helmet, CORS, HTTP-only SameSite Cookies, bcrypt
- **Validation:** Zod schemas
- **Real-Time:** Socket.IO *(Planned for upcoming milestone)*
- **Database:** MongoDB + Mongoose *(Planned for upcoming milestone)*

### Shared Layer
- Type-safe shared contracts and API structures under `shared/types`

---

## 2. Repository Structure

```text
Project1/
├── .agents/skills/      # Reusable AI Agent Skills catalog
├── client/              # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/  # Reusable UI & layout components
│       ├── pages/       # Route-level pages
│       ├── routes/      # Application router configuration
│       ├── store/       # Redux Toolkit store, slices, and RTK Query APIs
│       └── styles/      # Global CSS and Tailwind definitions
├── server/              # Node.js + Express + TypeScript backend
│   └── src/
│       ├── config/      # Environment validation & configuration
│       ├── middleware/  # Centralized error and request middleware
│       ├── routes/      # Express API routes
│       ├── utils/       # Utility helpers & response formatters
│       ├── app.ts       # Express app setup and middleware pipeline
│       └── server.ts    # Server startup & lifecycle management
├── shared/              # Shared TypeScript contracts & schemas
│   └── types/           # Cross-package interfaces and API definitions
├── PRD.md               # Product Requirements Document
├── SYSTEM.md            # AI Developer System Guidelines
├── RULES.md             # Technical Architecture Governance Rules
├── FEATURES.md          # Implementation Roadmap
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

### Installation
Clone the repository and install all workspace dependencies from the root directory:

```bash
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` in the root (and/or server directory) and adjust values if needed:

```bash
cp .env.example .env
```

### Running in Development

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run services individually:
```bash
# Frontend only (http://localhost:5173)
npm run dev:client

# Backend only (http://localhost:5000)
npm run dev:server
```

### Type Checking & Building

```bash
# Type check all workspaces
npm run typecheck

# Build both client and server for production
npm run build
```

---

## 4. Health Check Endpoint

```http
GET /api/v1/health
```

Example response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-10-07T11:45:00.000Z",
    "uptime": 12.34
  }
}
```

---

## 5. Current Implementation Status

- **Completed Milestones:** `F01 Foundation`, `F02 Backend`, `F03 Auth`, `F04 Projects`, `F05 Membership`, `F06 Architecture Model`, `F07 Interactive Canvas`, `F08 Redux + RTK Query State Architecture` (Complete)
- **Next Milestone:** `F09 Architecture Persistence` (Debounced autosave, optimistic locking, version conflict handling)
