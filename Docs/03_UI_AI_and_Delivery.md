# 03 — UI System, AI, Safety & Delivery Plan
> Read third. Explains WHAT the UI must look like, HOW AI/safety work, and IN WHAT ORDER to build + demo.

## 1. Design Philosophy (strict)
Must feel like a real cybersecurity SaaS: professional, premium, clean, minimal, security-focused, enterprise-ready. Avoid overly colorful UI, excessive gradients, random animations, large illustrations, giant text, excessive cards, generic college-project look.

- **Styling:** Tailwind utility classes first + shadcn/ui (or Tailwind-compatible lib). Preferred: `<div className="flex items-center gap-4 rounded-lg border p-4">`. Forbidden: giant `dashboard.css / styles.css / components.css` for normal layout. Custom CSS only for complex animation, 3rd-party override, or truly unsupported styling.
- **Components:** Always reuse. Catalog: AppSidebar, TopNavbar, PageHeader, StatCard, SecurityScoreCard, SeverityBadge, StatusBadge, FindingTable, FindingRow, AssessmentProgress, AttackSurfaceCard, EvidencePanel, AIAnalysisPanel, CVSSCard, RemediationPanel, ReportCard, EmptyState, LoadingState. Rule: `<SeverityBadge severity="HIGH" />`, never HighSeverityBadge/MediumSeverityBadge duplicates. Keep pages small.
- **Design system:** One consistent style per value everywhere. Severities Critical/High/Medium/Low/Informational and statuses Running/Completed/Failed/Verified/Under Review/False Positive/Resolved must never change color/badge across pages.
- **Dark mode:** Proper tokens for background, cards, borders, tables, inputs, charts, sidebar, modal, dropdowns, badges — not a simple invert. Use Tailwind theme variables + semantic component styles.
- **Responsive:** Desktop-first (it is a security dashboard) but tablet/mobile must stay usable.

## 2. Pages & Key Screens
Routes:
```text
/auth/login, /auth/register, /dashboard, /projects, /projects/:id,
/targets, /assessments, /assessments/:id, /findings, /findings/:id,
/reports, /reports/:id, /settings
```

**Main Dashboard** (must not look generic): Top metrics `Security Score, Total Findings, Critical, High, Verified`; Severity Distribution chart (Recharts, only if meaningful); Assessment Activity feed (`Assessment Started, Recon Completed, Findings Detected, Verification Completed, Report Generated`); Recent Findings list (ex: `VUL-001 Broken Access Control HIGH VERIFIED`, `VUL-002 Security Configuration MEDIUM UNDER REVIEW`).

**Finding Details Page** (hero — make it strongest): Header Title + Severity + Status badges, then sections Overview, Affected Assets, Evidence, Verification (status, by, date, confidence, notes), AI Analysis, Impact, CVSS (score + severity + visual bar), Remediation, Activity Timeline. Example content: `Broken Access Control HIGH VERIFIED CVSS 8.1 /api/reports/{id}` + AI text `authorization control failure...` + fix `server-side ownership check + least privilege`.

**Project Page:** Overview header (Security Score, Total Assessments, Critical/High/Verified, Recent Activity) + child tabs Targets/Assessments/Findings/Reports/Activity.

**Attack Surface View:** Overview counts + endpoint table with search/filter/sort + detail drawer.

## 3. AI Integration Contract (mandatory)
AI is an analysis assistant on structured data, never a generic chatbot.
Flow: `Finding + Evidence + Verification → AI Analysis → Impact Explanation → Remediation`.

Backend must send structured input (finding title, category, severity, endpoint, evidence, app context, verificationStatus) and validate output before saving. Example:
Input:
```json
{ "title": "Broken Access Control", "endpoint": "/api/reports/{id}", "evidence": "Controlled auth test returned out-of-scope data", "verificationStatus": "VERIFIED", "severity": "HIGH" }
```
Output:
```json
{ "summary": "", "classification": "Broken Access Control", "confidence": 94, "impact": "Unauthorized access to protected resources.", "technicalExplanation": "", "remediation": ["Implement server-side authorization checks.", "Validate resource ownership."], "priorityReason": "" }
```
UI shows Classification, Confidence %, Impact, Business Impact, Recommended Fix steps, Priority reason. Label as assistance.

## 4. Safety & Demo Environment
Only authorized targets. Before start require Target Scope + Allowed Environment + Assessment Type + explicit auth checkbox. For SIH use Local / Demo App / Staging / Explicitly Authorized Test Env with safe, reproducible scenarios.

Separate controlled demo app for the live demo:
```text
SentinelAI → Authorized Demo App (User module, Auth, Reports, Admin, APIs)
 → Detection → Verification → Evidence → Risk → AI → Remediation (all visible in dashboard)
```

**8-step SIH demo script:** 1) Overview (projects, score, recent) 2) Open `World Monitor Security Assessment` 3) Show Target Authorized Confirmed 4) Start assessment, show live progress ✓ 5) Results `Score 72/100 Critical 1 High 3 Medium 5 Low 4` 6) Open finding `Broken Access Control HIGH 8.1 VERIFIED` + Evidence/Impact/AI/Remediation 7) Remediation tracking `OPEN HIGH server-side check` 8) Generate `WORLD MONITOR SECURITY ASSESSMENT REPORT` PDF.

## 5. Build Order, MVP & Agent Rules
Build in phases, never all at once:
P1 Foundation (React, Express, Mongo, Auth, Dashboard, Projects, Targets) → P2 Assessment mgmt (create, status, history, progress, queue) → P3 Attack Surface (assets, viz) → P4 Findings (DB, severity, evidence, details, filters) → P5 Verification (review, verified/false-positive, confidence) → P6 CVSS & Risk → P7 AI Analyst → P8 Reports (PDF) → P9 Polish (responsive, dark, loading/empty/error, performance, demo data).

MVP must include: Auth, Dashboard, Projects, Targets, Auth-confirm, Create+Progress Assessment, Attack Surface data, Findings+Severity+Verification+Evidence+CVSS+AI+Remediation, Report PDF. Non-goals: complex microservices, multi-DB, K8s, blockchain.

**10 coding rules for any AI agent:** 1) Focused changes, no full rewrites 2) Understand arch + related components + deps first, minimal change 3) Tailwind + reusable UI, no huge CSS 4) Buttons wire to real logic when backend exists, no fake core features 5) No hardcoded bulk data — use API/DB (mocks only early) 6) Keep structure/naming/API patterns consistent 7) All async has Loading/Success/Error/Empty 8) Small components 9) Secrets in env only 10) Before done check frontend+backend+API+DB+errors+responsive.
