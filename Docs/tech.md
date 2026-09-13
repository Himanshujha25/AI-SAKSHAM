# Saksham AI — Complete Technology Stack & Engineering Architecture (`tech.md`)

---

## 1. Executive Architecture Overview

Saksham AI is an enterprise-grade, AI-assisted security assessment and vulnerability management workspace. Designed around strict scope enforcement and authorization controls, the platform automates attack surface discovery, technology fingerprinting, security header auditing, access control verification, structured AI impact analysis, and executive PDF reporting.

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              React 18 + Vite Client                             │
│ ┌──────────────────────┐ ┌────────────────────┐ ┌─────────────────────────────┐ │
│ │  React Flow Canvas   │ │ Monaco Code Editor │ │   xterm.js Cyber Console    │ │
│ └──────────────────────┘ └────────────────────┘ └─────────────────────────────┘ │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ REST API & WebSockets (Socket.IO)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Node.js + Express API                              │
│ ┌──────────────────────┐ ┌────────────────────┐ ┌─────────────────────────────┐ │
│ │ Authentication/RBAC  │ │ Mongoose (MongoDB) │ │   BullMQ Queue Controller   │ │
│ └──────────────────────┘ └────────────────────┘ └─────────────────────────────┘ │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Redis Job Dispatch
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        Background Security Scan Worker                          │
│ ┌──────────────────────┐ ┌────────────────────┐ ┌─────────────────────────────┐ │
│ │ Attack Surface Engine│ │ Verification Engine│ │    AI Analyst Layer (LLM)   │ │
│ └──────────────────────┘ └────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Technology Stack Matrix

| Tier | Primary Framework / Tool | Secondary Stack / Tooling | Purpose & Function |
|---|---|---|---|
| **Frontend Core** | React 18 + Vite | JavaScript (ESNext), React Router v6 | Single Page Application (SPA) framework with instant HMR. |
| **Frontend Styling** | Tailwind CSS | shadcn/ui, Radix UI Primitives, Lucide Icons | Utility-first responsive design; enterprise dark mode without monolithic CSS. |
| **Visualization & UX** | `@xyflow/react` (React Flow) | Monaco Editor, xterm.js, Recharts, Framer Motion | Interactive attack surface graph, PoC diff viewer, live cyber terminal console. |
| **Backend Core** | Node.js (v20 LTS) + Express.js | CORS, Helmet, dotenv | Modular REST API server following Clean Architecture principles. |
| **Database** | MongoDB | Mongoose ORM | Document database for multi-tenant projects, targets, assets, findings, and reports. |
| **Queue & Async** | Redis | BullMQ, ioredis | Distributed background task queue for long-running scan execution. |
| **Real-Time Stream** | Socket.IO | `socket.io-client` | Bi-directional WebSocket stream for live scan phase updates to client. |
| **AI Analyst Layer** | Gemini 2.5 / OpenAI API | Zod (Schema Validation) | Structured LLM analysis returning plain-English impact and code remedies. |
| **Reporting Engine** | `@react-pdf/renderer` | Puppeteer / PDFKit | Client/Server rendering of executive-ready security PDF documents. |

---

## 3. High-End Security Scanning & Reconnaissance Libraries (Backend Engine)

The background worker engine relies on modular Node.js/npm libraries to conduct authorized security assessments:

### 3.1 Endpoint Discovery & HTML Parsing
* **`cheerio`** (`v1.0.0`): Fast, lightweight HTML DOM parser (jQuery API) used during spidering to extract internal link references (`<a href>`), forms, action targets, and `<script src>` assets.
* **`puppeteer-core` / `playwright-core`** (`v22.0.0`): Headless browser automation engine used to render Single Page Applications (React/Vue/Angular), execute client-side JavaScript, capture dynamic routes, and extract hidden API endpoints.
* **`crawler`** (`v1.4.0`): Production-grade HTTP web crawler with concurrency control, rate limiting, and domain scope filtering.

### 3.2 Technology Stack Fingerprinting
* **`wappalyzer-core`** (`v6.10.0`): Core engine powering Wappalyzer. Fingerprints web technologies, frameworks (Express, React, Next.js, Nginx, Apache), CMS platforms, and dynamic libraries via HTML regex, header patterns, and global JS variables.

### 3.3 Network, TLS/SSL & Security Configuration Audit
* **`ssl-checker`** (`v2.0.0`): Validates target SSL/TLS certificates, expiration dates, protocol versions (TLS 1.2 / TLS 1.3), cipher suites, and issuer details.
* **`tls` & `https` (Native Node.js Modules)**: Native TLS socket tools to inspect certificate chains, handshake parameters, and HTTP/2 support.
* **`dns` & `net` (Native Node.js Modules)**: Low-level network utilities for target IP resolution, CNAME verification, port reachability checks, and reverse DNS lookups.

### 3.4 HTTP Probing & Security Header Engine
* **`axios`** (`v1.7.0`) / **`got`** (`v13.0.0`): Advanced HTTP clients supporting custom redirect handling, cookie jar management, proxy support, and exact HTTP header inspection.
* **`tough-cookie`** (`v4.1.0`): RFC 6265 cookie management engine for tracking session state across multi-step authorization checks.

### 3.5 Input & Schema Validation Engine
* **`validator`** (`v13.12.0`): String validation and sanitization library used for target URL verification, domain parsing, and input sanitation.
* **`zod`** (`v3.23.0`): TypeScript/JavaScript schema validation engine used to enforce rigid JSON structures on AI outputs, scan job payloads, and database DTOs.
* **`cvss-calculator`** (`v1.1.0`): CVSS v3.1 vector string parser and base score calculator.

---

## 4. UI & Visual Engine Libraries (Client Side)

| Library Name | Package Name | Purpose in Saksham AI |
|---|---|---|
| **React Flow** | `@xyflow/react` | Visualizes target attack surface as an interactive graph topology connecting targets, API endpoints, technologies, and vulnerabilities. |
| **Monaco Editor** | `@monaco-editor/react` | Embedded VS Code code viewer displaying raw HTTP PoC requests/responses and side-by-side vulnerable vs. remediated code diffs. |
| **XTerm.js** | `@xterm/xterm`, `@xterm/addon-fit` | Embedded cyber terminal executing real-time colorized scan logs (`ANSI colors`) for security analysts. |
| **Recharts** | `recharts` | Visualizes security posture scores, severity breakdowns (Critical, High, Medium, Low), and historical trend charts. |
| **Framer Motion** | `framer-motion` | Micro-animations, dynamic modal reveals, tab transitions, and status badge pulses. |
| **Sonner & use-sound**| `sonner`, `use-sound` | Enterprise toast alert notifications with tactile audio feedback on critical findings and scan completion. |

---

## 5. Background Task Queue & Real-Time Streaming Architecture

```text
 Client (React)               Express API Server                Redis + BullMQ Queue
 ──────────────               ──────────────────                ────────────────────
  POST /assessments ───────► Validate Target Auth ────────────► Enqueue Scan Task
                                                                        │
  Socket.IO Client  ◄────── Connect Workspace Room                  Job Worker Runs
                                                                        │
  Live Log Stream   ◄────── Push Progress Event ◄────────────── Publish Progress
```

### Redis + BullMQ Queue Workflow
1. **Job Enqueue**: Express API receives `POST /assessments`, validates the authorization consent flag, and pushes a job to Redis:
   ```javascript
   const scanJob = await assessmentQueue.add('run-assessment', {
     assessmentId: assessment._id,
     targetUrl: target.url,
     scanType: 'STANDARD'
   }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
   ```
2. **Worker Execution**: Worker handles sequential scan pipelines:
   * **Recon**: DNS lookup, Ping reachability, Port check.
   * **Discovery**: Crawler + JS parser endpoint extraction.
   * **Analysis**: Security header check + IDOR access control check.
   * **Verification**: Reproducibility verification test.
   * **AI Synthesis**: Send finding JSON to Gemini/OpenAI API via Zod schema.
3. **Socket.IO Event Stream**: Pushes live progress percentages and ANSI terminal logs directly to the user's browser.

---

## 6. Complete Package Manifests

### 6.1 Backend (`server/package.json`)
```json
{
  "name": "saksham-ai-server",
  "version": "1.0.0",
  "description": "Saksham AI Security Assessment Backend API & Worker Engine",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "worker": "node src/workers/scanWorker.js"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "axios": "^1.7.2",
    "bcryptjs": "^2.4.3",
    "bullmq": "^5.8.0",
    "cheerio": "^1.0.0-rc.12",
    "cors": "^2.8.5",
    "cvss-calculator": "^1.1.0",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "ioredis": "^5.4.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.1",
    "puppeteer-core": "^22.10.0",
    "socket.io": "^4.7.5",
    "ssl-checker": "^2.0.7",
    "tough-cookie": "^4.1.4",
    "validator": "^13.12.0",
    "wappalyzer-core": "^6.10.66",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "nodemon": "^3.1.2"
  }
}
```

### 6.2 Frontend (`client/package.json`)
```json
{
  "name": "saksham-ai-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@react-pdf/renderer": "^3.4.4",
    "@tanstack/react-query": "^5.40.0",
    "@tanstack/react-table": "^8.17.3",
    "@xyflow/react": "^12.0.0",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/xterm": "^5.5.0",
    "axios": "^1.7.2",
    "clsx": "^2.1.1",
    "framer-motion": "^11.2.10",
    "lucide-react": "^0.383.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "recharts": "^2.12.7",
    "socket.io-client": "^4.7.5",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.3.0",
    "use-sound": "^4.0.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.12"
  }
}
```
