# AI-SAKSHAM: UI/UX Design Specification & Screen Wireframes

**Document Status**: Approved / Design System Baseline  
**Version**: 1.0.0  
**Design Aesthetic**: Modern Enterprise Glassmorphism / Slate Dark & Clean Light Themes  

---

## 1. Design System & Visual Aesthetics

AI-SAKSHAM implements a high-impact, premium user interface designed to inspire trust, transparency, and clarity for both student applicants and government officials.

### 1.1 Palette & Color Tokens

```css
:root {
  /* Surface Colors */
  --bg-dark: #0f172a;           /* Deep Slate Blue */
  --bg-card-dark: #1e293b;      /* Slate Card Surface */
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  
  /* Brand Accent Colors */
  --accent-primary: #3b82f6;    /* Vibrant Blue (Primary Buttons, Active States) */
  --accent-emerald: #10b981;    /* Emerald Green (Eligible / Approved Badges) */
  --accent-amber: #f59e0b;      /* Amber Yellow (Deficient / Pending Warnings) */
  --accent-rose: #ef4444;       /* Rose Red (Ineligible / Rejections) */
  --accent-purple: #8b5cf6;     /* AI Intelligence Indicator */

  /* Text & Contrast */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}
```

### 1.2 Typography & Glassmorphism Guidelines
- **Primary Font**: `Inter`, sans-serif (Google Fonts) for UI controls, data tables, and metrics.
- **Display Font**: `Outfit`, sans-serif for headings, metrics cards, and scheme titles.
- **Glassmorphism Spec**: `backdrop-filter: blur(12px); background: rgba(30, 41, 59, 0.75); border: 1px solid rgba(255, 255, 255, 0.08); shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);`

---

## 2. Screen Specifications & Wireframe Layouts

### 2.1 Screen: Applicant Portal Dashboard (`/applicant/dashboard`)

#### Layout Architecture
```
+-----------------------------------------------------------------------------------+
|  [Logo] AI-SAKSHAM                     [Notifications (3)] [Profile: Rahul K.]   |
+-----------------------------------------------------------------------------------+
|  Hello, Rahul 👋                                                                  |
|  Track your active scholarship & fellowship applications                          |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | MY APPLICATIONS                                                             |  |
|  |                                                                             |  |
|  | NFST - National Fellowship for ST Students (Ph.D)                           |  |
|  | Progress: [========================......] 80%                              |  |
|  | Stage: 🔍 Document Scrutiny  | Submitted: 10 Aug 2026                      |  |
|  | Status: 🟢 In Progress                                                      |  |
|  |                                                                             |  |
|  | NOS - National Overseas Scholarship (2026-27)                                |  |
|  | Progress: [===========================...] 90%                              |  |
|  | Stage: 🏆 Selection Review   | Submitted: 02 Aug 2026                      |  |
|  | Status: ⚠️ Action Required (1 Deficiency Flagged)                           |  |
|  |                                                                             |  |
|  | [ + Start New Application ]                                                 |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | ⚠️ ACTION REQUIRED: DEFICIENCY NOTICE (#NOS-2026-8812)                        |  |
|  | Income Certificate uploaded is close to expiry or illegible.                 |  |
|  | Requested by Officer: Please upload FY 2025-26 valid income proof.             |  |
|  | [ Resolve & Re-upload Document -> ]                                         |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

### 2.2 Screen: Official Verification Queue (`/official/queue`)

#### Layout Architecture
```
+-----------------------------------------------------------------------------------+
|  [Logo] AI-SAKSHAM OFFICIAL PORTAL      Role: Verifier  [Queue (820 New)] [User]  |
+-----------------------------------------------------------------------------------+
|  APPLICATION MANAGEMENT                                                           |
|                                                                                   |
|  Total: 8,420 | New: 820 | Under Verification: 2,140 | Deficient: 620 | Eligible: 4,280|
|                                                                                   |
|  Filter: [ All Schemes v ]  [ AI Risk: All v ]  [ Sort: High AI Score First v ]    |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | App ID     | Applicant    | Scheme | AI Score | AI Risk Flag | Action       |  |
|  +------------+--------------+--------+----------+--------------+--------------+  |
|  | APP10231   | Rahul Kumar  | NFST   | 96%      | 🟢 High Conf | [ Review ]   |  |
|  | APP10232   | Priya Soren  | NFST   | 72%      | 🟡 Needs Review| [ Review ]  |  |
|  | APP10233   | Anil Marandi | NOS    | 41%      | 🔴 Discrepancy| [ Review ]   |  |
|  | APP10234   | Sunita Munda | NFST   | 91%      | 🟢 High Conf | [ Review ]   |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

### 2.3 Screen: Split-Screen Document & AI Review Modal (`/official/review/:id`)

#### Layout Architecture
```
+-----------------------------------------------------------------------------------+
| APPLICATION #APP10231 - Rahul Kumar (NFST 2026)             [ Close X ]           |
+-----------------------------------------------------------------------------------+
| LEFT PANE: AI Summary & Comparison Data | RIGHT PANE: Document PDF Viewer         |
|                                         |                                         |
| 🧠 OVERALL AI CONFIDENCE: 95% (GREEN)   |  +-----------------------------------+  |
|                                         |  | GOVERNMENT OF JHARKHAND           |  |
| 1. Personal Identity Check              |  | INCOME CERTIFICATE                |  |
|    Declared Name: Rahul Kumar           |  |                                   |  |
|    Extracted Name: Rahul Kumar          |  | Name: Rahul Kumar                 |  |
|    Match: ✅ 100% Match                 |  | Cert No: INC/2026/12345           |  |
|                                         |  | Annual Income: Rs 2,10,000        |  |
| 2. Income Verification Discrepancy      |  | Date: 12/06/2026                  |  |
|    Declared Income: ₹2,00,000           |  |                                   |  |
|    Extracted Income: ₹2,10,000          |  | [ Page 1 of 2 ]  [ Zoom + / - ]    |  |
|    Variance: ⚠️ 5% Discrepancy          |  +-----------------------------------+  |
|                                         |                                         |
| 3. Mandatory Documents Checklist        |                                         |
|    [✓] Identity (Aadhaar)               |                                         |
|    [✓] ST Caste Certificate             |                                         |
|    [✓] Academic Transcripts             |                                         |
|    [✓] Research Proposal                |                                         |
|                                         |                                         |
| OFFICIAL ACTION BAR:                                                              |
| [ 🟢 Approve Verification ]   [ ⚠️ Raise Deficiency ]   [ 🔴 Reject Application ]|
+-----------------------------------------------------------------------------------+
```

---

### 2.4 Screen: Selection Merit & Explainability View (`/official/selection`)

#### Layout Architecture
```
+-----------------------------------------------------------------------------------+
|  SCHEME SELECTION & MERIT LIST (NFST 2026)                                        |
|  Approved Quotas: 1,500 Seats  | Calculated Applications: 4,280 Eligible           |
+-----------------------------------------------------------------------------------+
|  RANK | APPLICANT    | MERIT SCORE | ELIGIBILITY STATUS | EXPLAINABILITY          |
|  -----+--------------+-------------+--------------------+-----------------------+ |
|  1    | Rahul Kumar  | 94.2 / 100  | 🟢 Selected        | [ View Breakdown -> ] | |
|  2    | Priya Soren  | 93.8 / 100  | 🟢 Selected        | [ View Breakdown -> ] | |
|  3    | Anil Hembram | 91.5 / 100  | 🟢 Selected        | [ View Breakdown -> ] | |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 🔍 SELECTION EXPLANATION BREAKDOWN (Rahul Kumar)                            |  |
|  |                                                                             |  |
|  | Metric                      | Max Score | Awarded Score | Audit Source      |  |
|  | ----------------------------+-----------+---------------+------------------ |  |
|  | Academic Marks (M.Sc)       | 40.0      | 38.0 (95.0%)  | Extracted Trans.  |  |
|  | Research Proposal Quality   | 25.0      | 23.0          | Expert Rating     |  |
|  | Category / Socio-Economic   | 20.0      | 20.0          | Verified Income   |  |
|  | NIRF Rank of Institution    | 15.0      | 13.2 (Rank #14| Govt Registry     |  |
|  | ----------------------------+-----------+---------------+------------------ |  |
|  | TOTAL COMPOSITE MERIT SCORE | 100.0     | 94.2          | Formula ID: #M-01 |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

### 2.5 Screen: Admin Scheme Builder & Dynamic Workflow Engine (`/admin/schemes/builder`)

#### Layout Architecture
```
+-----------------------------------------------------------------------------------+
|  ADMINISTRATION: DYNAMIC SCHEME BUILDER                                           |
+-----------------------------------------------------------------------------------+
|  1. BASIC INFO  -->  2. ELIGIBILITY RULES  -->  3. DOCUMENTS  -->  4. WORKFLOW     |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  SCHEME ELIGIBILITY MATRIX CONFIGURATOR                                           |
|                                                                                   |
|  [ Add Rule Condition + ]                                                         |
|                                                                                   |
|  IF Category [ EQUALS v ] [ ST ]                                                  |
|  AND Annual Family Income [ LESS_THAN_EQUAL v ] [ ₹ 6,00,000 ]                    |
|  AND Graduation Marks % [ GREATER_THAN_EQUAL v ] [ 55.0% ]                        |
|  AND Age Limit [ LESS_THAN_EQUAL v ] [ 36 Years ]                                 |
|                                                                                   |
|  DYNAMIC WORKFLOW STAGE DESIGNER                                                  |
|  +-----------+     +-----------+     +-----------+     +-----------+              |
|  | SUBMITTED | --> | AI SCRUTINY| -->| VERIFY    | --> | SELECTION |              |
|  +-----------+     +-----------+     +-----------+     +-----------+              |
|                          |                                 |                      |
|                          v                                 v                      |
|                     (DEFICIENCY)                       (SANCTIONED)               |
|                                                                                   |
|  [ Save & Publish Scheme Configuration ]                                          |
+-----------------------------------------------------------------------------------+
```
