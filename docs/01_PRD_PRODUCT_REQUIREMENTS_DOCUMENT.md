# AI-SAKSHAM: Product Requirements Document (PRD)

**Document Status**: Approved / Production Baseline  
**Version**: 1.0.0  
**Target Platform**: Ministry of Tribal Affairs (MoTA) & Central Scholarship Administrations  
**Core Domain**: AI-Enabled Scholarship & Fellowship Administration Management System  

---

## 1. Executive Summary & Problem Statement

### 1.1 Executive Summary
**AI-SAKSHAM** is a state-of-the-art, multi-tenant, configurable platform designed to automate and streamline the complete lifecycle of national scholarship and fellowship programs (such as NFST - National Fellowship for Higher Education of ST Students, and NOS - National Overseas Scholarship). 

By integrating **Human-in-the-Loop AI Intelligence**, dynamic workflow state machines, and a zero-code scheme configuration engine, AI-SAKSHAM dramatically reduces application verification overhead, eliminates repetitive manual document scrutiny, automates deficiency handling, and guarantees transparent, explainable merit selection.

### 1.2 The Problem Statement
Current government scholarship and fellowship administration processes suffer from critical systemic bottlenecks:
1. **Manual Verification Burden**: Administrative officials manually scrutinize thousands of multi-page PDFs (income certificates, caste certificates, admission offers, marksheet transcripts).
2. **Repetitive & Fragmented Correspondence**: Communication regarding document discrepancies occurs via disconnected channels (offline letters, scattered emails, legacy portals), causing months of delay.
3. **Rigid, Hardcoded Infrastructure**: Each new scholarship or policy change requires writing new software modules or altering application codebases.
4. **Lack of Explainability & Auditability**: Selection criteria and scoring mechanisms are often opaque, creating risk of disputes and administrative friction.
5. **Slow Processing Cycle Times**: End-to-end processing averages **18 to 45 days**, delaying vital financial disbursement to deserving students.

---

## 2. System Vision & Core Value Proposition

AI-SAKSHAM converts this broken sequential manual process into an automated, AI-assisted, event-driven workflow pipeline.

```
+-----------------------------------------------------------------------------------+
|                                   AI-SAKSHAM                                      |
|                                                                                   |
|  +-------------------+     +-------------------------+     +-------------------+  |
|  | APPLICANT PORTAL  | --> |  CENTRAL ENGINE (FSM)   | <-- |   ADMIN PORTAL    |  |
|  | - Simple Dashboard|     | - Rule Engine           |     | - Config Schemes  |  |
|  | - Upload & Track  |     | - Human-in-Loop AI      |     | - Define Workflows|  |
|  | - Resolve Defs    |     | - Explainable Selection |     | - Monitor KPIs    |  |
|  +-------------------+     +-------------------------+     +-------------------+  |
|                                         ^                                         |
|                                         |                                         |
|                            +-------------------------+                            |
|                            |     OFFICIAL PORTAL     |                            |
|                            | - AI Verification Queue |                            |
|                            | - Split Scrutiny View   |                            |
|                            | - One-Click Deficiency  |                            |
|                            +-------------------------+                            |
+-----------------------------------------------------------------------------------+
```

### Key Value Pillars
- **Zero-Hardcoding Architecture**: Admin officers can configure new schemes, eligibility matrices, required document checklists, and merit calculation rules visually.
- **Human-in-the-Loop AI Assistant**: AI performs OCR, field extraction, application cross-checking, and risk scoring, serving as an intelligent assistant to human officers (AI never auto-rejects applicants).
- **Automated Deficiency Management**: Missing or inconsistent documents trigger targeted deficiency notices with simple re-upload workflows for applicants.
- **Explainable Merit Engine**: Detailed mathematical breakdowns explaining *why* an applicant was selected or ranked, complete with immutable audit logs.

---

## 3. User Personas & Role Matrix

| Role | Primary User | Key Responsibilities | Access Boundaries |
| :--- | :--- | :--- | :--- |
| **Applicant** | Students / Scholars | Scheme discovery, profile setup, document submission, tracking, deficiency resolution. | Own applications & profile only. |
| **Verification Official** | Desk Verification Officers | First-pass document scrutiny, AI discrepancy review, validating document authenticity. | Assigned scheme applications in 'Submitted' state. |
| **Scrutiny Officer** | Senior Administrative Officers | Institutional verification, eligibility cross-checking, approving compliance. | Assigned scheme applications in 'Verified' state. |
| **Selection Officer** | Committee / Board Members | Merit list review, ranking validation, final sanction approval. | Selection queue & sanction workflows. |
| **Ministry Admin** | System Administrators | Scheme creation, rule configuration, workflow building, user RBAC management. | Full administrative configuration rights. |
| **Ministry Executive** | Joint Secretary / Directors | Macro analytics monitoring, bottleneck detection, SLA compliance oversight. | Read-only analytics & executive dashboards. |

---

## 4. Detailed Functional Requirements

### Module 1: Applicant Experience & Portal
- **FR-APP-01 (Single Sign-On & Profile)**: Applicants can register using Email/Mobile OTP or Aadhaar SSO. Profile holds persistent demographics, academic history, and bank details.
- **FR-APP-02 (Scheme Explorer & Wizard)**: Dynamic multi-step wizard tailored to the specific target scheme (e.g., NFST vs NOS).
- **FR-APP-03 (Document Vault & Pre-flight Validation)**: Upload interface supporting PDF/JPEG with instant file size, MIME type, and preliminary resolution checks.
- **FR-APP-04 (Real-Time Application Timeline)**: Visual progress tracker displaying stage-by-stage status (`Submitted` -> `AI Scrutiny` -> `Verification` -> `Selection Review` -> `Sanctioned`).
- **FR-APP-05 (Interactive Deficiency Hub)**: Dedicated tab highlighting missing or rejected documents with specific officer comments and direct re-upload controls.

### Module 2: Official Portal & AI Verification Queue
- **FR-OFF-01 (Intelligent Priority Queue)**: Applications sorted by AI Confidence Score (`High Risk`, `Needs Scrutiny`, `High Confidence Ready for Approval`).
- **FR-OFF-02 (Split-Screen Document Scrutiny View)**: Dual-pane interface showing extracted document data on the left alongside original PDF viewer on the right with bounding box highlights.
- **FR-OFF-03 (AI Inconsistency Inspector)**: Displays side-by-side comparison between self-declared application fields and extracted document data (e.g., Application Income ₹2,00,000 vs Certificate Income ₹2,10,000).
- **FR-OFF-04 (One-Click Deficiency Dispatcher)**: Official can flag specific document fields, append notes, and send an immediate structured notification to the applicant.
- **FR-OFF-05 (Action Bar & Governance)**: Explicit action buttons: `Approve Verification`, `Raise Deficiency`, `Forward to Scrutiny`, `Reject with Reason`.

### Module 3: AI Document Intelligence Pipeline
- **FR-AI-01 (Multi-Format OCR & Layout Parser)**: Extract printed and semi-structured text from government certificates (ST/SC Caste, Income Certificates, Marks Cards, Admission Letters).
- **FR-AI-02 (Document Classification)**: Auto-classify uploaded documents into type categories (e.g., ST Certificate vs Aadhaar vs Income Document) and detect missing mandatory uploads.
- **FR-AI-03 (Field Extraction & Normalization)**: Extract names, certificate numbers, issue dates, issuing authorities, income values, and percentage marks.
- **FR-AI-04 (Cross-Verification Matrix)**: Compare extracted text with student self-declarations using fuzzy string matching and numeric variance checks.
- **FR-AI-05 (AI Confidence Scoring Engine)**: Generate composite score (0-100%) based on Document Completeness, Identity Match, Academic Consistency, and Authenticity indicators.

### Module 4: Configurable Scheme & Rule Engine
- **FR-SCH-01 (Dynamic Scheme Builder)**: Admin UI to define Scheme Name, Code, Sponsoring Ministry, Description, Financial Grant amount, and active dates.
- **FR-SCH-02 (Eligibility Matrix Engine)**: Visual rule builder supporting logical operators (`AND`, `OR`, `NOT`) across parameters: Category, Max Income, Min Qualification %, Age Limit, Institution Tier.
- **FR-SCH-03 (Document Requirement Matrix)**: Define mandatory and optional document lists per scheme, including expiry date requirements.
- **FR-SCH-04 (Workflow FSM Designer)**: Admin can define custom state transitions (e.g., NFST 5-stage workflow vs NOS 7-stage workflow with Foreign University Verification).

### Module 5: Transparent Selection & Explainability Engine
- **FR-SEL-01 (Automated Merit Scoring)**: Calculate composite merit scores based on configured scheme weights (e.g., Academic Marks 40%, Research Proposal 25%, Social Criteria 20%, Institution Rank 15%).
- **FR-SEL-02 (Merit List Generator)**: Auto-generate rank lists filtered by quota, reservation category, and budget sanction limits.
- **FR-SEL-03 (Explainable Selection Breakdown)**: Clickable audit view showing explicit mathematical calculation breakdown (`Score: 94.2/100 -> Academic: 38/40, Proposal: 23/25, Eligibility: 20/20, Institution: 13.2/15`).
- **FR-SEL-04 (Sanction Order Generation)**: Automated PDF sanction letter generation with digital signatures.

### Module 6: Communication Hub & Executive Analytics
- **FR-COM-01 (Multi-Channel Notification Engine)**: Trigger automated SMS, Email, and In-App alerts on state transitions (Application Received, Deficiency Flagged, Selected, Disbursed).
- **FR-ANL-01 (Ministry Executive Dashboard)**: Macro KPIs: Total Applications, Processing SLA (Average Days to Approve), Deficiency Rates by Scheme, Geo-spatial Distribution by State/District.
- **FR-ANL-02 (Officer Workload & SLA Tracker)**: Real-time tracking of pending queues per official to identify administrative bottlenecks.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Scalability
- **Page Load Time**: Applicant and Official portal views render in `< 1.5 seconds` under standard 4G connections.
- **API Response Latency**: 95th percentile API response time `< 250ms` (excluding OCR execution).
- **Document Processing Throughput**: AI OCR & Extraction pipeline processes standard multi-page PDF documents in `< 4 seconds` per document.
- **Concurrency**: System architecture scales horizontally to handle peak loads during deadline windows (up to **50,000 concurrent active users**).

### 5.2 Security & Compliance
- **Authentication**: JWT with short expiry (15 mins) and Secure HTTP-Only Refresh Tokens. Role-based access control (RBAC) enforced at gateway and route level.
- **Data Protection**: Encryption at rest (AES-256) for documents and sensitive PII; Encryption in transit (TLS 1.3).
- **IDOR Protection**: Strict tenant and user ownership checks on every single `/api/v1/applications/:id` endpoint.
- **Immutable Audit Trail**: All official actions (approvals, rejections, deficiencies, override decisions) logged to an immutable append-only collection with timestamp, IP, user ID, and diff payload.

### 5.3 Reliability & Availability
- **System Uptime**: Target SLA of **99.9% uptime** during active application cycles.
- **Graceful Failure**: If AI service fails or times out, applications fall back seamlessly to standard human manual verification queues without data loss.

---

## 6. Success Metrics & Key Performance Indicators (KPIs)

1. **Processing SLA Reduction**: Reduce average application verification and sanction time from **18 days down to 7 days**.
2. **Deficiency Resolution Efficiency**: Reduce repetitive correspondence loops by **65%** via structured AI deficiency detection.
3. **Official Throughput**: Increase applications processed per official per day by **3x** using AI pre-scoring and split-screen comparison.
4. **Data Accuracy**: Maintain `> 96%` precision in AI cross-verification field matching.
