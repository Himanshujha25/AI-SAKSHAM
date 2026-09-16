# Saksham AI Backend Architecture

> **Inventory ownership**: Routes, models, and core security scanning engines are defined by their respective directories in `src/`. Documentation and API testing protocols should be updated concurrently with any changes to the scanner or AI analysis pipeline.
>
> **Ownership rule**: When the authentication model, scanner engine logic, or database schema changes, this document must be updated in the same PR.

Saksham AI is a comprehensive security assessment and vulnerability management platform. The backend is an Express.js application designed to manage user authentication, project isolation, active security scanning, real-time assessment progress tracking via WebSockets, and AI-driven finding analysis.

---

## 1. System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                         Browser (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │
│  │Dashboard │  │ Projects │  │Assessments│  │   Findings  │  │
│  └────┐─────┘  └────┐─────┘  └─────┐─────┘  └──────┐──────┘  │
│       └─────────────┴──────────────┴───────────────┘         │
│                         │ fetch /api/*                       │
└─────────────────────────┴────────────────────────────────────┘
                          │
           ┌──────────────┼──────────────┐
           │                             │
    ┌──────▼──────┐               ┌──────▼──────┐
    │  Express.js │               │  Socket.io  │
    │  (REST API) │               │(Real-time)  │
    └──────┬──────┘               └──────┬──────┘
           │                             │
    ┌──────┴─────────────────────────────┴──────┐
    │              Node.js Event Loop           │
    │  ┌────────────┐            ┌───────────┐  │
    │  │ Assessment │            │ AI Service│  │
    │  │ Worker     │            │(Gemini)   │  │
    │  └────────────┘            └───────────┘  │
    └──────────────────────┬────────────────────┘
                           │
             ┌─────────────┼──────────────┐
             │             │              │
      ┌──────▼─────┐ ┌─────▼─────┐ ┌──────▼──────┐
      │  MongoDB   │ │ Target    │ │  External   │
      │ (Mongoose) │ │ Servers   │ │  AI APIs    │
      └────────────┘ └───────────┘ └─────────────┘
```

---

## 2. Deployment Topology

| Component | Technology | Role |
|-----------|------------|------|
| **API Server** | Node.js + Express | Serves REST endpoints, handles business logic, auth, and validations. |
| **Database** | MongoDB | Stores users, projects, targets, assessments, assets, and findings. |
| **Real-Time** | Socket.io | Streams assessment progress and live scan updates to the client. |
| **Background Tasks** | Node.js Worker/Queues | Orchestrates the multi-stage security scanning process without blocking the main event loop. |
| **AI Integration** | Google GenAI SDK | Analyzes vulnerabilities, generates remediations, and filters false positives. |

---

## 3. Application Architecture

### Entry and Initialization
`server.js` acts as the primary entry point. It binds the Express application (`app.js`) to the HTTP server and initializes the `Socket.io` instance, attaching it to the Express `app` context so controllers can emit events globally.

`app.js` configures the middleware stack:
- **Security**: `helmet`, `cors`, `express-mongo-sanitize`, and `express-xss-sanitizer`.
- **Parsing**: `express.json` with a 1MB payload limit.
- **Rate Limiting**: Global rate limiting (500 req/15m) applied to `/api/v1`.

### Data Model (MongoDB/Mongoose)
The data layer is strictly relational despite using MongoDB:
- **User**: Identity and RBAC (ADMIN, ANALYST, VIEWER).
- **Project**: The boundary for authorization. Users have access to projects they own or are members of.
- **Target**: API endpoints, domains, or web applications to be assessed. Linked to a Project.
- **Assessment**: A point-in-time security scan against a Target.
- **Finding**: A discovered vulnerability, linked to an Assessment and Project.
- **Asset**: Discovered routes, APIs, or technologies during the reconnaissance phase.

### Security & Authorization
- **Authentication**: Stateless JWT-based authentication. A custom in-memory token denylist is used for immediate logout invalidation. Google OAuth is supported via `google-auth-library`.
- **Authorization**: Project-based isolation. The `hasProjectAccess` middleware utility ensures that users can only read, update, or scan targets/assessments belonging to projects they explicitly have access to.

---

## 4. Security Scanner Engine (`scannerEngine.js`)

The core of Saksham AI's active testing capabilities. It performs a live security probing sequence against target URLs.

### Probing Sequence
1. **Connectivity & Protocol Checks**: Validates reachability, HTTP methods, and basic authentication boundaries.
2. **Security Headers**: Audits CSP, HSTS, CORS (wildcard origin + credentials), and X-Frame-Options.
3. **Asset Extraction**: Parses HTML/JS bodies to dynamically extract linked routes, API endpoints, and included JavaScript bundles.
4. **Active Injection Screens (Read-Only)**:
   - **IDOR Check**: Probes discovered parameterized routes without authentication to detect broken access control.
   - **SQLi Screen**: Appends single-quote payloads to detect unhandled database error disclosures.
   - **Auth Bypass**: Strips credentials and attempts to access protected routes.

> **Design philosophy**: The scanner engine adheres to a strict "do no harm" policy. It performs read-only GET probes and uses lightweight error-disclosure signals (like a single quote) rather than destructive payloads or heavy fuzzing.

---

## 5. Assessment Pipeline & Workers

The assessment pipeline is decoupled from the synchronous HTTP request/response cycle.

1. **Queueing (`assessmentController.js`)**: A user initiates a scan. An `Assessment` record is created with status `QUEUED`.
2. **Execution (`assessmentWorker.js`)**: A worker picks up the ID. It loops through predefined `STAGES` (e.g., `endpointDiscovery`, `vulnerabilityScanning`).
3. **Live Streaming (`Socket.io`)**: As the worker transitions between stages, it calls `emit(io, assessment)` to push UI updates to the browser.
4. **Analysis (`aiService.js`)**: Discovered raw findings are enriched using the AI Service to classify severity, explain the impact, and generate remediation steps.
5. **Completion**: Assets and Findings are materialized in the database, and a final security score is calculated.

---

## 6. Directory Reference

```
server/
├── config/                 Environment variables and database connection setup
├── controllers/            HTTP request handlers and response formatting
│   ├── assessmentController.js   # Manages assessment lifecycle
│   ├── authController.js         # JWT and Google OAuth logic
│   └── projectController.js      # Project CRUD and finding aggregation
├── middleware/             Express middleware functions
│   ├── auth.js                   # JWT verification, Token Denylist, and RBAC
│   └── errors.js                 # Global error handler and async wrappers
├── models/                 Mongoose schemas (User, Project, Target, Finding, Assessment)
├── queues/                 Task queuing logic for background jobs
├── routes/                 Express routers mapping URLs to controllers
├── services/               Core business logic and external integrations
│   ├── aiService.js              # Interacts with Google GenAI
│   └── scannerEngine.js          # The active security probing engine
├── utils/                  Shared utilities (security scoring, logging)
├── workers/                Background job processors
│   └── assessmentWorker.js       # Orchestrates the scan and AI analysis
├── app.js                  Express application setup and middleware stack
└── server.js               HTTP and WebSocket server initialization
```
