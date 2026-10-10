# ArchSync AI — Production Deployment Guide

This guide details the end-to-end production deployment of **ArchSync AI** to **MongoDB Atlas**, **Render** (Backend API & WebSockets), and **Vercel** (Frontend SPA).

---

## Architecture Overview

```text
[Browser / Client]
       │
       ├── (HTTPS / Static Assets) ────────► [Vercel CDN] (React + Vite SPA)
       │                                         └─ rewrites: /index.html
       │
       ├── (HTTPS API + Credentials) ──────► [Render Web Service] (Node.js + Express)
       │   Set-Cookie: SameSite=None; Secure     ├─ trust proxy: 1
       │                                         ├─ CORS allowlist: CLIENT_URL
       │                                         └─ Liveness: /api/v1/health/live
       │                                            Readiness: /api/v1/health/ready
       │
       ├── (WSS / WebSockets) ─────────────► [Render Web Service] (Socket.IO)
       │                                         └─ Room-based collaboration
       │
       └─ Backend Persistence ─────────────► [MongoDB Atlas] (Mongoose)
```

---

## 1. MongoDB Atlas Setup

1. **Create an Atlas Cluster:**
   - Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a free (M0) or dedicated cluster in your target region.
2. **Database Access:**
   - Create a database user with `readWriteAnyDatabase` or scoped read/write permissions to the `archsync` database.
   - Use a strong, random password.
3. **Network Access (IP Whitelist):**
   - Under **Network Access**, add an IP entry allowing access:
     - Render uses dynamic IP addresses, so add `0.0.0.0/0` (Allow Access from Anywhere) with strong password authentication.
4. **Retrieve Connection String:**
   - Click **Connect** → **Drivers** (Node.js).
   - Copy connection URI (format: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/archsync?retryWrites=true&w=majority`).

---

## 2. Backend Deployment (Render)

Render hosts the Node.js Express server and Socket.IO collaboration engine.

### Method A: Blueprint Deployment (Recommended)
1. Commit and push the repository containing `render.yaml` to your Git remote.
2. In the [Render Dashboard](https://dashboard.render.com), click **New** → **Blueprint**.
3. Select your repository. Render will automatically read `render.yaml`.
4. Enter the required environment variables marked `sync: false` in the dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://archsync.vercel.app`).
   - `GEMINI_API_KEY`: (Optional) Your Google Gemini API key for AI assistant features.
5. Click **Apply**. Render will generate a cryptographically strong `JWT_SECRET`, build the project, and deploy the service.

### Method B: Manual Service Creation
- **Service Type:** Web Service
- **Runtime:** Node
- **Root Directory:** Leave blank (monorepo root)
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm run start -w @archsync/server`
- **Health Check Path:** `/api/v1/health/ready`

### Required Backend Environment Variables

| Variable | Recommended Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production security, cookie flags, and error sanitation |
| `PORT` | `10000` | Port assigned by Render |
| `CLIENT_URL` | `https://your-app.vercel.app` | Allowed CORS origin (comma-separated if multiple) |
| `MONGODB_URI` | `mongodb+srv://...` | Connection URI to MongoDB Atlas |
| `JWT_SECRET` | *32+ character random string* | Secret for signing JWTs (`openssl rand -base64 32`) |
| `JWT_EXPIRES_IN` | `7d` | Token expiration period |
| `COOKIE_NAME` | `auth_token` | Name of the authentication cookie |
| `COOKIE_SAME_SITE` | `none` | **CRITICAL:** Required for cross-site cookie delivery between Vercel & Render |
| `COOKIE_SECURE` | `true` | Ensures cookies are only sent over HTTPS |
| `TRUST_PROXY` | `true` | Enables Express proxy trust for client IP detection on Render |
| `GEMINI_API_KEY` | *Your Gemini API Key* | (Optional) Server-only key for architecture AI assistant |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model identifier |

---

## 3. Frontend Deployment (Vercel)

Vercel hosts the React single-page application.

1. **Import Project:**
   - In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New** → **Project**.
   - Select your GitHub repository.
2. **Project Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **SPA Routing Configuration:**
   - The repository contains `client/vercel.json` with rewrite rules:
     ```json
     {
       "rewrites": [
         { "source": "/(.*)", "destination": "/index.html" }
       ]
     }
     ```
   - This prevents 404 errors when users refresh deep links (e.g. `/projects/:projectId`).
4. **Required Frontend Environment Variables:**

| Variable | Production Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://archsync-server.onrender.com` | Base URL of the deployed Render backend |
| `VITE_SOCKET_URL` | `https://archsync-server.onrender.com` | WebSocket server URL for real-time collaboration |

5. Click **Deploy**.

---

## 4. Post-Deployment Verification & Smoke Test

Execute this verification sequence on the live deployed system:

1. **Health & Readiness Check:**
   - Open `https://<render-backend-url>/api/v1/health/live` in your browser. Confirm HTTP 200 with `status: "alive"`.
   - Open `https://<render-backend-url>/api/v1/health/ready`. Confirm HTTP 200 with `database: "connected"`.
2. **Registration & Cookie Storage:**
   - Visit `https://<vercel-frontend-url>/register`.
   - Create a new account.
   - Inspect browser DevTools → Application → Cookies. Confirm `auth_token` exists with flags:
     - `HttpOnly`: Checked
     - `Secure`: Checked
     - `SameSite`: `None`
3. **Session Persistence:**
   - Refresh the page. Confirm you remain logged in and current profile loads via `/api/v1/auth/me`.
4. **Project Lifecycle:**
   - Create a new architecture project. Confirm it appears on the dashboard.
   - Open the project workspace (`/projects/:projectId`).
5. **Canvas & Persistence:**
   - Drag and drop components from the component palette onto the canvas.
   - Connect components with an edge.
   - Wait 2 seconds for debounced autosave. Confirm save indicator turns to "Saved".
   - Reload browser. Confirm diagram state and viewport restore identically.
6. **Real-Time Collaboration (Multi-Tab / Multi-User):**
   - Open the same project in a second browser window or private window with a second user account.
   - Confirm active collaborator presence pill appears in the top toolbar.
   - Move a node in window 1. Confirm position updates in real-time in window 2.
7. **Deterministic Validation:**
   - Add a disconnected node. Click **Validate**. Confirm disconnected node warning appears in the Validation panel.
8. **AI Architecture Assistant (if GEMINI_API_KEY configured):**
   - Open the AI Assistant panel. Click **Analyze Architecture**.
   - Confirm structured executive summary and recommendations appear without mutating the canvas.
9. **Exporting:**
   - Click **Export** → **PNG Image**, **SVG Vector**, and **JSON Data**.
   - Confirm exported files download and contain complete architecture representations.
10. **Logout:**
    - Click **Sign Out**. Confirm cookie is cleared and user is redirected to login.

---

## 5. Architectural Considerations & Scaling Notes

- **Single-Instance Real-Time Constraint:**
  ArchSync AI's current Socket.IO collaboration engine and AI rate limiting use robust in-memory data structures (`roomPresences`, `projectVersions`, `InMemoryRateLimiter`).
  In production, keep Render scaled to **1 instance**.
  To scale horizontally across multiple instances in the future, configure `@socket.io/redis-adapter` and a shared Redis cache (e.g. Upstash or Redis Cloud).
- **Third-Party Cookie Policy:**
  Browsers require `SameSite=None; Secure` for cross-site cookies between `vercel.app` and `onrender.com`. If privacy-focused browser settings (such as Safari ITP) block third-party cookies, configure custom domains sharing a common parent (e.g. `app.yourdomain.com` for Vercel and `api.yourdomain.com` for Render) with `COOKIE_SAME_SITE=lax`.
