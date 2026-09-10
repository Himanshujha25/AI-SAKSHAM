# 01 — SentinelAI Product & Workflow Guide
> Read this first. Explains WHAT SentinelAI is, WHY it exists, WHO uses it, and HOW the end-to-end workflow works.

## 1. Project Identity (for AI agent)
- **Name:** SentinelAI — Intelligent Security Assessment & Vulnerability Management Platform
- **Event:** SIH 2026, Problem Statement 26163, Organization: NTRO, Category: Software, Theme: Smart Automation
- **Primary target:** World Monitor application (authorized test/demo environment)
- **Architecture rule:** Build as a reusable platform — World Monitor is the first target, but any authorized web app must be assessable without code rewrite.
- **Positioning:** `An AI-assisted automated security assessment platform that discovers attack surface, organizes findings, supports safe verification, prioritizes risk using CVSS, and generates actionable remediation reports.`

What it is NOT: a simple scanner that dumps a vulnerability list. It is a full lifecycle manager: findings + evidence + verification + AI + risk + remediation + reports in one dashboard.

Core pipeline every agent must follow:
```text
Target Application
  → Attack Surface Discovery
  → Endpoint & Technology Analysis
  → Security Assessment
  → Finding Detection
  → Evidence Collection
  → Verification
  → AI Analysis
  → Risk Prioritization + CVSS
  → Remediation Recommendations
  → Professional Security Report
```

## 2. Problem Statement Understanding
You must assess the World Monitor app's attack surface in an authorized environment and identify genuine weaknesses. Expected categories (not exhaustive):
Authentication weaknesses, authorization / broken access control, insecure configs, input validation, XSS, vulnerable dependencies, exposed secrets, missing security headers, API weaknesses.

Every meaningful finding must carry this chain — never store a title-only finding:
```text
Finding → Evidence → Verification → Impact Analysis → CVSS Score → AI Explanation → Remediation
```
Example: `Broken Access Control on /api/reports/{id}` must include controlled-test evidence, verification status, impact (data exposure), CVSS 8.1 High, AI explanation, and fix (server-side ownership check).

## 3. Three Product Pillars
### 3.1 Automation — reduce manual effort for:
Organizing targets, discovering components, collecting findings, managing evidence, prioritizing risk, generating reports.

### 3.2 Intelligence — AI assists, never acts blindly:
Classification, human-readable explanation, impact + business impact, prioritization support, remediation suggestions, executive summaries, report help. Rule: AI analyzes structured finding+evidence; it does NOT launch uncontrolled scans or give generic chatbot answers.

### 3.3 Verification — fight false positives:
Always distinguish `Potential Finding` vs `Verified Finding`. Allowed statuses:
```text
Detected, Potential, Under Review, Verified, False Positive, Resolved, Accepted Risk
```

## 4. Users & Roles
Primary persona for demo: **Security Analyst / Assessment Team Member**. Also serves developers, app admins, internal security teams.

Implement JWT auth with 3 roles:
- **ADMIN:** manage users, projects, assessments, view reports, configure integrations
- **ANALYST:** create projects, add targets, start assessments, review findings, generate reports
- **VIEWER:** view projects, findings, reports only
Features: register, login, logout, protected dashboard routes, profile.

## 5. 9-Step User Workflow (how the app works)
**Step 1 — Create Project:** Workspace for one assessment. Ex: Name `World Monitor Security Assessment`, Description `Authorized assessment...`, Env `Demo / Staging / Authorized Test`.

**Step 2 — Add Target:** The authorized app. Fields: Target Name, URL (e.g. `http://authorized-demo-app.local`), Environment, Authorization Status. UI must show `[✓] I confirm that I am authorized to assess this target.` before proceeding.

**Step 3 — Start Assessment:** Types: Quick / Standard / Comprehensive. Job lifecycle: `Assessment Created → Queued → Running → Analysis → Completed`. Backend states: `CREATED, QUEUED, RUNNING, PAUSED, COMPLETED, FAILED, CANCELLED`.

**Step 4 — Attack Surface Discovery:** Organize discovered assets: Routes, API Endpoints, JS Resources, Technologies, Headers, Dependencies. Show as visual map + counts (ex: Total 42, Public 18, Authenticated 20, Admin 4).

**Step 5 — Security Findings:** Stored cards. Ex: `VUL-001 | Broken Access Control | High | CVSS 8.1 | Verified | /api/reports/{id}`.

**Step 6 — Evidence & Verification:** Each finding has structured evidence (what test was done in authorized env), verification status, confidence (ex: High / 96%). Separate `Scanner Signal` from `Verified Security Finding`.

**Step 7 — AI Analysis:** Send structured JSON, receive structured JSON (see Doc 03 for contract). Display as assistance, not truth. Example input has title/endpoint/evidence/verificationStatus/severity; output has classification/confidence/impact/remediation[].

**Step 8 — Risk Prioritization:** Levels Critical/High/Medium/Low/Informational + CVSS number + visual indicator.

**Step 9 — Generate Report:** Must include: overview, target info, executive summary, posture summary, findings summary, severity distribution, per-finding details, evidence, verification, impact, CVSS, remediation. Export PDF (CSV/JSON optional).

## 6. The 11 Modules (what to build)
1. **Auth & Users** — above.
2. **Projects** — contains Targets, Assessments, Findings, Evidence, Reports, Activity. Header shows Security Score, Total/Critical/High/Verified counts, Recent Activity.
3. **Target Management** — fields: name, url, env, authConfirmed, status, metadata, createdDate, lastAssessment.
4. **Assessment Engine** — progress stages: Reconnaissance, Endpoint Discovery, Technology Analysis, Security Checks, Verification, AI Analysis, Risk Scoring, Report Generation (✓/●/○). Live updates via polling first, Socket.IO/SSE later.
5. **Attack Surface** — Target tree + endpoint table (`Endpoint | Method | Auth | Risk`, ex: `/api/login POST Public Medium`) with search/filter/sort + detail view.
6. **Findings** — fields: findingId, title, category, severity, cvssScore, status, confidence, affectedTarget/Endpoint, description, evidence, impact, aiAnalysis, remediation, timestamps. Filters + search.
7. **Verification** — flow `Potential → Under Review → Verified` or `→ False Positive`. Store verifiedBy, date, evidence, confidence, notes.
8. **AI Analyst** — panel shows Classification, Confidence %, Impact, Recommended Fix (numbered dev steps). Connected to workflow.
9. **CVSS & Risk** — mapping 9.0-10 Critical, 7.0-8.9 High, 4.0-6.9 Medium, 0.1-3.9 Low. Show score + severity badge.
10. **Remediation Center** — per finding: Problem, Why It Matters, Recommended Fix, Priority, Affected Component. Track `OPEN / IN PROGRESS / RESOLVED / ACCEPTED RISK`.
11. **Reports** — types Executive / Technical / Summary. 13 sections listed in Step 9.

## 7. Success Criteria & Final Flow
Judge must grasp in minutes: problem → assessment → attack surface → detection → verification → AI → risk → remediation → report. Must feel like a workflow platform, not random cards.
```text
USER → CREATE PROJECT → ADD AUTHORIZED TARGET → START ASSESSMENT
→ BACKGROUND JOB → (ATTACK SURFACE + SECURITY ANALYSIS)
→ FINDINGS → EVIDENCE → VERIFICATION → AI → CVSS/RISK → REMEDIATION → REPORT
```
