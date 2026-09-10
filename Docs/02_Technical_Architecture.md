# 02 — Technical Architecture & Implementation Spec
> Read second. Explains HOW to build it: stack, structure, database, APIs. For any AI coding agent implementing features.

## 1. Technology Stack (fixed)
- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui, Lucide Icons, React Router, TanStack Query, Recharts, Framer Motion
- **Backend:** Node.js + Express.js, JWT auth, Socket.IO (start with polling, upgrade later)
- **Database:** MongoDB + Mongoose
- **Background jobs:** Redis + BullMQ + Node.js assessment worker
- **AI:** LLM API for structured analysis (summaries, impact, remediation) — see Doc 03 for contract

Why this shape: long scans must not block API requests, so API pushes jobs to Redis, worker processes, writes back to Mongo, frontend polls/subscribes.

```text
React Frontend
     │
     ▼
Node + Express API ──► MongoDB
     │
     ▼
Redis Queue (BullMQ)
     │
     ▼
Assessment Worker → Structured Findings → MongoDB → AI Analysis → Dashboard + Reports
```

Anti-goals for MVP: no microservices split, no K8s, no multiple DBs, no blockchain/IoT. Start with `MERN + Worker + Redis`.

## 2. Repository & Folder Structure (do not change arbitrarily)
```text
sentinel-ai/
 client/src/
  components/ui, layout, dashboard, findings, shared/
  pages/auth, dashboard, projects, assessments, findings, reports, settings/
  hooks/ services/ store/ lib/ utils/ types/ App.jsx
 client/package.json
 server/
  src/config, controllers, models, routes, middleware, services, queues, workers, utils, app.js
  server.js
 docs/01_Product_and_Workflow.md, 02_Technical_Architecture.md, 03_UI_AI_and_Delivery.md
 README.md
```

Layer rule (backend): `Routes → Controllers → Services → Models / External Services`. Never put business logic in route files. Keep frontend components small; extract reusable sections instead of 1000-line pages.

## 3. Frontend Architecture Notes
- Feature-based pages + shared `components/`. Reuse StatCard, badges, tables (full catalog in Doc 03).
- Data fetching via TanStack Query + `services/` (axios wrappers per resource).
- Auth guard on `/dashboard`, `/projects/*`, etc. Store JWT, attach to requests, handle 401.
- Assessment progress: poll `GET /assessments/:id` every few seconds while `RUNNING`; later replace with Socket.IO/SSE without changing UI contract.

## 4. Backend Architecture Notes
- `config/`: DB, Redis, JWT, AI keys from env vars only.
- `routes/`: thin route definitions. `controllers/`: req/res handling. `services/`: assessment logic, finding logic, AI service, report service. `queues/`: BullMQ setup. `workers/`: assessment job processor. `middleware/`: auth, role-check, error handler.
- Assessment job stages to update in `progress`: Reconnaissance, Endpoint Discovery, Technology Analysis, Security Checks, Verification, AI Analysis, Risk Scoring, Report Generation.

## 5. Database Models (Mongoose)
Relations: User 1—N Project; Project 1—N Target, Assessment, Report; Assessment 1—N Asset, Finding.

- **User:** name, email (unique), password (hashed), role [ADMIN|ANALYST|VIEWER], avatar, timestamps
- **Project:** name (ex: World Monitor Security Assessment), description, owner (User ref), members (User refs), status, timestamps
- **Target:** projectId (ref), name, url, environment [Testing|Staging|Demo|Production-authorized], authorizationConfirmed (bool, required true to start), status [Active|Archived], metadata (object), createdDate, lastAssessment
- **Assessment:** projectId, targetId, type [Quick|Standard|Comprehensive], status [CREATED|QUEUED|RUNNING|PAUSED|COMPLETED|FAILED|CANCELLED], progress (object with stage booleans/percent), startedAt, completedAt, createdBy, summary (counts, securityScore)
- **Asset:** assessmentId, type [route|api|technology|header|js|dependency], name, url, method [GET|POST|...], authentication [Public|Required|Admin], metadata
- **Finding:** assessmentId, findingId (human string VUL-001, auto-increment per project), title, category, severity [Critical|High|Medium|Low|Informational], cvssScore (0-10), status [Detected|Potential|Under Review|Verified|False Positive|Resolved|Accepted Risk], confidence (0-100), affectedAssets (refs/strings, ex: /api/reports/{id}), description, evidence (string/object), impact, remediation (string[]), aiAnalysis (object, validated), verified (bool), verifiedBy, verificationDate, timestamps
- **Report:** projectId, assessmentId, type [Executive|Technical|Summary], generatedBy, fileUrl, status, createdAt

## 6. REST API (base `/api/v1`, RESTful, consistent JSON + proper errors)
```text
Auth:      POST /auth/register, POST /auth/login, GET /auth/me, POST /auth/logout
Projects:  GET /projects, POST /projects, GET /projects/:id, PATCH /projects/:id, DELETE /projects/:id
Targets:   GET /projects/:projectId/targets, POST /projects/:projectId/targets
           GET /targets/:id, PATCH /targets/:id, DELETE /targets/:id
Assessments: POST /assessments (body: projectId, targetId, type + authConfirm), GET /assessments,
           GET /assessments/:id, POST /assessments/:id/cancel
Findings:  GET /findings?assessmentId=&severity=&status=&search=, GET /findings/:id,
           PATCH /findings/:id (status, severity, remediation status),
           POST /findings/:id/verify (status, evidence, confidence, notes),
           POST /findings/:id/ai-analysis (trigger / refresh AI)
Reports:   POST /reports/generate (body: assessmentId, type), GET /reports, GET /reports/:id
```
Every protected route requires JWT; role middleware enforces ADMIN/ANALYST/VIEWER per Doc 01.

## 7. Env & Engineering Rules
Env vars (never hardcode): `MONGODB_URI, JWT_SECRET, AI_API_KEY, REDIS_URL, CLIENT_URL, PORT`. Every async UI op handles Loading/Success/Error/Empty. Keep naming, folder, and API response patterns consistent. Minimal dependencies.
