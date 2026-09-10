# SIH 2026 Project Documentation

## Project Title

# SentinelAI — Intelligent Security Assessment & Vulnerability Management Platform

**SIH 2026 Problem Statement:** 26163
**Organization:** National Technical Research Organisation (NTRO)
**Category:** Software
**Theme:** Smart Automation

---

# 1. Project Overview

SentinelAI is a web-based, AI-assisted security assessment platform designed to automate and simplify the process of analyzing a web application's security posture.

The primary target for this SIH problem statement is the **World Monitor application**. However, the architecture of SentinelAI should be designed as a reusable security assessment platform that can assess other authorized web applications as well.

The platform should not behave like a simple vulnerability scanner that only displays a list of possible vulnerabilities.

Instead, SentinelAI should provide a complete security assessment workflow:

```text
Target Application
        ↓
Attack Surface Discovery
        ↓
Endpoint & Technology Analysis
        ↓
Security Assessment
        ↓
Finding Detection
        ↓
Evidence Collection
        ↓
Verification
        ↓
AI Analysis
        ↓
Risk Prioritization
        ↓
CVSS Scoring
        ↓
Remediation Recommendations
        ↓
Professional Security Report
```

The main goal is to convert a complex security assessment workflow into a centralized platform where security findings, evidence, risk scores, remediation guidance, and reports can be managed from one dashboard.

---

# 2. Problem Statement Understanding

The problem requires performing a security assessment of the World Monitor application.

The solution should be capable of analyzing the application's attack surface and identifying security weaknesses.

Potential areas of assessment may include:

* Authentication weaknesses
* Authorization issues
* Broken access control
* Insecure configurations
* Input validation issues
* Cross-site scripting vulnerabilities
* Dependency-related vulnerabilities
* Exposed secrets
* Security header issues
* API security weaknesses
* Other genuine security findings discovered within the authorized assessment environment

For every meaningful finding, the platform should aim to provide:

```text
Finding
    ↓
Evidence
    ↓
Verification
    ↓
Impact Analysis
    ↓
CVSS Risk Score
    ↓
AI Explanation
    ↓
Remediation Recommendation
```

---

# 3. Core Product Vision

SentinelAI should be positioned as:

> An AI-assisted automated security assessment platform that discovers an application's attack surface, organizes security findings, supports safe verification, prioritizes risk using CVSS, and generates actionable remediation reports.

The project should focus on three major ideas:

## 3.1 Automation

Reduce manual effort involved in:

* Organizing assessment targets
* Discovering application components
* Collecting assessment findings
* Managing evidence
* Prioritizing risks
* Generating reports

## 3.2 Intelligence

Use AI to help analyze structured findings and evidence.

AI should help with:

* Vulnerability classification
* Human-readable explanation
* Impact analysis
* Finding prioritization support
* Remediation suggestions
* Executive summaries
* Report assistance

AI should not blindly perform uncontrolled actions against arbitrary targets.

## 3.3 Verification

The system should distinguish between:

```text
Potential Finding
```

and:

```text
Verified Finding
```

This is important because automated assessment tools can produce false positives.

The platform should therefore support statuses such as:

```text
Detected
Potential
Under Review
Verified
False Positive
Resolved
Accepted Risk
```

---

# 4. Target User

The primary users of SentinelAI can include:

* Security analysts
* Developers
* Application administrators
* Internal security teams
* Organizations performing authorized security assessments

For the SIH demonstration, the main user can be represented as:

> Security Analyst / Assessment Team Member

---

# 5. Primary User Workflow

The main workflow should be simple and clear.

## Step 1 — Create Project

The user creates a security assessment project.

Example:

```text
Project Name:
World Monitor Security Assessment

Description:
Authorized security assessment of the World Monitor application.

Environment:
Demo / Staging / Authorized Test Environment
```

---

## Step 2 — Add Target

The user adds an authorized application target.

Example:

```text
Target Name:
World Monitor

Target URL:
http://authorized-demo-app.local

Environment:
Testing

Authorization Status:
Authorized
```

The system must clearly indicate that assessments should only be performed against authorized targets.

---

## Step 3 — Start Assessment

The user selects an assessment type.

Example:

```text
Quick Assessment
Standard Assessment
Comprehensive Assessment
```

The platform creates an assessment job.

```text
Assessment Created
        ↓
Queued
        ↓
Running
        ↓
Analysis
        ↓
Completed
```

---

## Step 4 — Attack Surface Discovery

The system analyzes available application information and organizes discovered assets.

Examples:

```text
Application

├── Routes
├── API Endpoints
├── JavaScript Resources
├── Technologies
├── Headers
├── Dependencies
└── Application Components
```

The result should be presented visually as an attack surface map.

---

## Step 5 — Security Findings

Findings generated from the assessment should be stored and displayed.

Example:

```text
Finding ID:
VUL-001

Title:
Broken Access Control

Status:
Verified

Severity:
High

CVSS:
8.1

Affected Asset:
/api/reports/{id}
```

---

## Step 6 — Evidence and Verification

Each finding should contain structured evidence.

Example:

```text
Finding:
Broken Access Control

Affected Endpoint:
/api/reports/{id}

Evidence:
Controlled test demonstrated unauthorized access
within the authorized test environment.

Verification Status:
Verified

Confidence:
High
```

The application should clearly separate:

```text
Scanner Signal
```

from:

```text
Verified Security Finding
```

---

## Step 7 — AI Analysis

The structured finding is sent to the AI analysis layer.

Example input:

```json
{
  "title": "Broken Access Control",
  "endpoint": "/api/reports/{id}",
  "evidence": "Controlled authorization test returned data outside expected access scope",
  "verificationStatus": "VERIFIED",
  "severity": "HIGH"
}
```

The AI layer returns structured analysis such as:

```json
{
  "classification": "Broken Access Control",
  "confidence": 94,
  "impactSummary": "Unauthorized access to protected resources may occur.",
  "businessImpact": "Sensitive application data may be exposed.",
  "recommendedRemediation": [
    "Implement server-side authorization checks.",
    "Validate resource ownership before returning data."
  ]
}
```

AI output should always be presented as **analysis assistance**, not as unquestionable truth.

---

## Step 8 — Risk Prioritization

The system assigns risk information.

Example:

```text
Critical
High
Medium
Low
Informational
```

Where applicable, the platform should support CVSS scoring.

Example:

```text
CVSS Score: 8.1
Severity: High
```

---

## Step 9 — Generate Report

The user can generate a professional security assessment report.

The report should include:

* Assessment overview
* Target information
* Executive summary
* Security posture summary
* Findings summary
* Severity distribution
* Individual vulnerability details
* Evidence
* Verification status
* Impact
* CVSS score
* Remediation recommendations

---

# 6. Main Application Modules

The application should contain the following major modules.

---

# Module 1 — Authentication & User Management

Users should be able to:

* Register
* Login
* Logout
* Access protected dashboard routes
* Manage their profile

Recommended implementation:

```text
JWT Authentication
```

Possible roles:

```text
ADMIN
ANALYST
VIEWER
```

Role permissions:

### Admin

Can:

* Manage users
* Manage projects
* Manage assessments
* View reports
* Configure integrations

### Analyst

Can:

* Create projects
* Add targets
* Start assessments
* Review findings
* Generate reports

### Viewer

Can:

* View projects
* View findings
* View reports

---

# Module 2 — Projects

A project represents an application security assessment workspace.

Example:

```text
World Monitor Security Assessment
```

A project contains:

```text
Project
│
├── Targets
├── Assessments
├── Findings
├── Evidence
├── Reports
└── Activity
```

Project page should show:

```text
Project Overview

Security Score
Total Assessments
Critical Findings
High Findings
Verified Findings
Recent Activity
```

---

# Module 3 — Target Management

Users can add authorized assessment targets.

Target information:

```text
Target Name
Target URL
Environment
Authorization Status
Description
Created Date
Last Assessment
```

Example:

```text
World Monitor

URL:
https://authorized-world-monitor.example

Environment:
Testing

Status:
Active
```

Important UI requirement:

Show an authorization confirmation before starting an assessment.

Example:

```text
[✓] I confirm that I am authorized to assess this target.
```

---

# Module 4 — Assessment Engine

This module manages the complete assessment lifecycle.

Assessment states:

```text
CREATED
QUEUED
RUNNING
PAUSED
COMPLETED
FAILED
CANCELLED
```

Assessment progress:

```text
Assessment Progress

Reconnaissance             ✓
Endpoint Discovery         ✓
Technology Analysis        ✓
Security Checks            ●
Verification               ○
AI Analysis                ○
Risk Scoring               ○
Report Generation          ○
```

The frontend should receive live status updates.

Recommended approaches:

```text
Polling initially
```

Later:

```text
Socket.IO / Server-Sent Events
```

---

# Module 5 — Attack Surface Discovery

This module organizes information discovered during an authorized assessment.

The platform should represent:

```text
Target
│
├── Routes
├── API Endpoints
├── Technologies
├── Headers
├── JavaScript Assets
└── Dependencies
```

The frontend should provide:

### Attack Surface Overview

```text
Total Endpoints: 42

Public Endpoints: 18
Authenticated Endpoints: 20
Administrative Endpoints: 4
```

### Endpoint Table

| Endpoint         | Method | Authentication | Risk   |
| ---------------- | ------ | -------------- | ------ |
| /api/login       | POST   | Public         | Medium |
| /api/profile     | GET    | Required       | Low    |
| /api/reports/:id | GET    | Required       | High   |

The UI should support:

* Search
* Filter
* Sorting
* Endpoint details

---

# Module 6 — Security Findings

This is one of the most important modules.

Each finding should contain:

```text
Finding ID
Title
Category
Severity
CVSS Score
Status
Confidence
Affected Target
Affected Endpoint
Description
Evidence
Impact
AI Analysis
Remediation
Created At
Updated At
```

Example:

```text
VUL-001

Broken Access Control

Severity:
HIGH

CVSS:
8.1

Status:
VERIFIED

Affected Endpoint:
/api/reports/{id}
```

---

# Module 7 — Finding Verification

The system should support a verification workflow.

```text
Potential Finding
        ↓
Under Review
        ↓
Verification
        ↓
Verified
```

Alternative:

```text
Potential Finding
        ↓
Review
        ↓
False Positive
```

Verification information:

```text
Verification Status
Verified By
Verification Date
Evidence
Confidence
Notes
```

Example:

```text
Status:
Verified

Confidence:
96%

Evidence:
Controlled test confirmed unexpected access behavior.
```

---

# Module 8 — AI Security Analyst

The AI module should work as an analysis assistant.

AI input should contain structured information.

Example:

```text
Finding Title
Category
Severity
Affected Endpoint
Evidence
Application Context
Verification Status
```

AI should return:

```text
Vulnerability Explanation

Potential Impact

Risk Context

Developer-Friendly Explanation

Recommended Remediation

Priority Explanation
```

Example UI:

```text
AI SECURITY ANALYSIS

Classification
Broken Access Control

Confidence
94%

Impact
Unauthorized users may gain access to protected
application resources.

Recommended Fix

1. Validate authorization server-side.
2. Validate ownership of requested resources.
3. Apply least-privilege access rules.
```

Important:

AI analysis should be generated from evidence and structured data.

Do not create a random AI chatbot that gives generic cybersecurity answers.

The AI should be connected directly to the assessment workflow.

---

# Module 9 — CVSS & Risk Engine

The platform should calculate and display risk.

Possible structure:

```text
CVSS Score
        ↓
Severity
```

Example:

```text
9.0 – 10.0
Critical

7.0 – 8.9
High

4.0 – 6.9
Medium

0.1 – 3.9
Low
```

Finding page should display:

```text
CVSS Score

8.1

HIGH
```

Also display a visual risk indicator.

---

# Module 10 — Remediation Center

This module should help developers understand how to address findings.

Each remediation should include:

```text
Problem

Why It Matters

Recommended Fix

Priority

Affected Component
```

Example:

```text
Problem:
Broken Access Control

Recommended Fix:

Perform authorization validation on the server
before returning protected resources.

Priority:
Immediate
```

The platform can also track remediation status:

```text
OPEN
IN PROGRESS
RESOLVED
ACCEPTED RISK
```

---

# Module 11 — Reports

Users should be able to generate professional reports.

Report types:

```text
Executive Report
Technical Security Report
Assessment Summary
```

Report sections:

```text
1. Executive Summary

2. Assessment Scope

3. Target Information

4. Assessment Overview

5. Security Score

6. Findings Summary

7. Severity Distribution

8. Detailed Findings

9. Evidence

10. Impact Analysis

11. CVSS Information

12. Remediation Recommendations

13. Conclusion
```

Reports should be exportable as:

```text
PDF
```

Optional:

```text
CSV
JSON
```

---

# 7. Recommended Technology Stack

The primary application should use MERN.

## Frontend

```text
React
Vite
Tailwind CSS
shadcn/ui
Lucide Icons
React Router
TanStack Query
Recharts
Framer Motion
```

## Backend

```text
Node.js
Express.js
JWT Authentication
Socket.IO
```

## Database

```text
MongoDB
Mongoose
```

## Background Processing

Recommended:

```text
Redis
BullMQ
```

This will allow long-running assessment jobs to execute separately from normal API requests.

## Security Assessment Worker

Use:

```text
Node.js initially
```

Architecture should allow additional worker services later if required.

Important:

Do not overcomplicate the MVP by immediately creating multiple microservices.

Start with:

```text
MERN Application
        +
Assessment Worker
        +
Redis Queue
```

Architecture:

```text
React Frontend
       │
       ▼
Node + Express API
       │
       ├──────────────► MongoDB
       │
       ▼
Redis Queue
       │
       ▼
Assessment Worker
       │
       ▼
Structured Findings
       │
       ▼
MongoDB
       │
       ▼
AI Analysis
       │
       ▼
Dashboard + Reports
```

---

# 8. Frontend Architecture

Use React with a clean feature-based structure.

Recommended:

```text
client/
│
├── src/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── findings/
│   │   └── shared/
│   │
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── assessments/
│   │   ├── findings/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── lib/
│   ├── utils/
│   ├── types/
│   └── App.jsx
```

Use reusable components.

Do not create large duplicated UI structures inside page files.

---

# 9. Backend Architecture

Recommended structure:

```text
server/
│
├── src/
│   │
│   ├── config/
│   │
│   ├── controllers/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── middleware/
│   │
│   ├── services/
│   │
│   ├── workers/
│   │
│   ├── queues/
│   │
│   ├── utils/
│   │
│   └── app.js
│
└── server.js
```

Important separation:

```text
Routes
    ↓
Controllers
    ↓
Services
    ↓
Models / External Services
```

Do not place all business logic directly inside route files.

---

# 10. MongoDB Data Model

## User

```text
User
├── name
├── email
├── password
├── role
├── avatar
├── createdAt
└── updatedAt
```

---

## Project

```text
Project
├── name
├── description
├── owner
├── members
├── status
├── createdAt
└── updatedAt
```

---

## Target

```text
Target
├── projectId
├── name
├── url
├── environment
├── authorizationConfirmed
├── status
└── metadata
```

---

## Assessment

```text
Assessment
├── projectId
├── targetId
├── type
├── status
├── progress
├── startedAt
├── completedAt
├── createdBy
└── summary
```

---

## Asset

```text
Asset
├── assessmentId
├── type
├── name
├── url
├── method
├── authentication
└── metadata
```

---

## Finding

```text
Finding
├── assessmentId
├── findingId
├── title
├── category
├── severity
├── cvssScore
├── status
├── confidence
├── affectedAssets
├── description
├── evidence
├── impact
├── remediation
├── aiAnalysis
├── verified
├── createdAt
└── updatedAt
```

---

## Report

```text
Report
├── projectId
├── assessmentId
├── type
├── generatedBy
├── fileUrl
├── status
└── createdAt
```

---

# 11. API Structure

Base:

```text
/api/v1
```

## Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
```

## Projects

```text
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
```

## Targets

```text
GET    /projects/:projectId/targets
POST   /projects/:projectId/targets
GET    /targets/:id
PATCH  /targets/:id
DELETE /targets/:id
```

## Assessments

```text
POST /assessments
GET  /assessments
GET  /assessments/:id
POST /assessments/:id/cancel
```

## Findings

```text
GET   /findings
GET   /findings/:id
PATCH /findings/:id
POST  /findings/:id/verify
POST  /findings/:id/ai-analysis
```

## Reports

```text
POST /reports/generate
GET  /reports
GET  /reports/:id
```

---

# 12. Main Dashboard

The dashboard should feel like a real-world cybersecurity SaaS product.

It should NOT look like a generic college project.

The dashboard should contain:

## Top Metrics

```text
Security Score

Total Findings

Critical Findings

High Findings

Verified Findings
```

---

## Severity Distribution

Display:

```text
Critical
High
Medium
Low
Informational
```

Use charts only where they provide meaningful information.

---

## Assessment Activity

Show:

```text
Assessment Started

Recon Completed

Findings Detected

Verification Completed

Report Generated
```

---

## Recent Findings

Example:

```text
VUL-001
Broken Access Control
HIGH
VERIFIED

VUL-002
Security Configuration Issue
MEDIUM
UNDER REVIEW
```

---

# 13. Required Pages

The application should include:

```text
/auth/login
/auth/register

/dashboard

/projects
/projects/:id

/targets

/assessments
/assessments/:id

/findings
/findings/:id

/reports
/reports/:id

/settings
```

---

# 14. Finding Details Page

This should be one of the strongest pages.

Layout:

```text
Finding Title
Severity Badge
Status Badge

Overview
────────────────────

Affected Assets
────────────────────

Evidence
────────────────────

Verification
────────────────────

AI Analysis
────────────────────

Impact
────────────────────

CVSS
────────────────────

Remediation
────────────────────

Activity Timeline
```

Example:

```text
Broken Access Control

HIGH      VERIFIED

CVSS
8.1

Affected Endpoint
/api/reports/{id}

AI Analysis

The evidence indicates a possible authorization
control failure where resource access may not
be sufficiently restricted.

Recommended Remediation

Implement server-side authorization validation
and verify ownership before returning resources.
```

---

# 15. UI and Design Requirements

This project must have a polished SaaS-style interface.

The design should feel:

* Professional
* Premium
* Clean
* Security-focused
* Minimal
* Enterprise-ready

Avoid:

* Overly colorful UI
* Excessive gradients
* Random animations
* Large unnecessary illustrations
* Giant text
* Excessive cards
* Generic student-project design

---

# 16. Tailwind Styling Rules

This is extremely important.

## Primary Styling Approach

Use:

```text
Tailwind CSS utility classes
```

and reusable component libraries such as:

```text
shadcn/ui
```

or other Tailwind-compatible components when appropriate.

The goal is to avoid large traditional CSS files.

### Preferred

```jsx
<div className="flex items-center gap-4 rounded-lg border p-4">
```

### Avoid

Creating large files like:

```text
dashboard.css
styles.css
components.css
responsive.css
```

containing hundreds or thousands of lines of custom CSS.

---

## CSS Rules

Custom CSS should only be used when absolutely necessary.

Examples:

```text
Complex animation
Third-party component override
Very specific unsupported styling
```

Otherwise use Tailwind.

The project should not depend on massive CSS files for normal layout and styling.

---

# 17. Component Rules

Prefer reusable components.

Examples:

```text
AppSidebar
TopNavbar
PageHeader
StatCard
SecurityScoreCard
SeverityBadge
StatusBadge
FindingTable
FindingRow
AssessmentProgress
AttackSurfaceCard
EvidencePanel
AIAnalysisPanel
CVSSCard
RemediationPanel
ReportCard
EmptyState
LoadingState
```

Do not create duplicate versions of the same UI.

For example:

```text
Bad:
HighSeverityBadge
MediumSeverityBadge
LowSeverityBadge
```

Instead:

```text
<SeverityBadge severity="HIGH" />
```

---

# 18. Design System

Create reusable semantic styles.

Example:

```text
Severity:
Critical
High
Medium
Low
Informational
```

Each should use consistent styling throughout the application.

Same for statuses:

```text
Running
Completed
Failed
Verified
Under Review
False Positive
Resolved
```

Never use inconsistent badges or colors for the same status across different pages.

---

# 19. Dark Mode

The application should support dark mode.

Dark mode should not simply invert every color.

Use a proper design system.

Important areas:

* Background
* Cards
* Borders
* Tables
* Inputs
* Charts
* Sidebar
* Modal
* Dropdowns
* Badges

Use Tailwind theme variables and component-level semantic styling.

---

# 20. Responsive Design

The application must work on:

```text
Desktop
Laptop
Tablet
Mobile
```

Priority:

```text
Desktop First
```

because this is a professional security dashboard.

However, mobile layouts must remain usable.

---

# 21. AI Integration Rules

AI should be integrated into meaningful product workflows.

Good:

```text
Finding
    ↓
Evidence
    ↓
AI Analysis
    ↓
Impact Explanation
    ↓
Remediation
```

Bad:

```text
Random AI Chatbot
```

The AI layer should provide structured output.

Recommended response format:

```json
{
  "summary": "",
  "classification": "",
  "confidence": 0,
  "impact": "",
  "technicalExplanation": "",
  "remediation": [],
  "priorityReason": ""
}
```

The backend must validate AI responses before storing them.

---

# 22. Security and Safety Rules for the Platform

The platform should be designed around authorized assessments.

Before an assessment begins:

```text
User must confirm authorization.
```

The system should support:

```text
Target Scope
Allowed Environment
Assessment Type
Authorization Confirmation
```

For the SIH demonstration, use:

```text
Local Environment
Demo Application
Staging Environment
Explicitly Authorized Test Environment
```

The demonstration should focus on safe and controlled assessment scenarios.

---

# 23. Demo Environment

For the SIH demo, create a separate controlled target application.

Architecture:

```text
SentinelAI Platform
        │
        ▼
Authorized Demo Application
        │
        ├── User Module
        ├── Authentication
        ├── Reports
        ├── Admin Area
        └── APIs
```

The demo application should provide controlled, reproducible security scenarios suitable for demonstrating:

```text
Detection
Verification
Evidence Collection
Risk Classification
AI Analysis
Remediation
```

The SentinelAI dashboard should show the entire lifecycle.

---

# 24. Ideal SIH Demo Flow

The final demonstration should follow a clear story.

## Step 1

Open SentinelAI.

```text
Security Overview
```

Show:

```text
Projects
Assessments
Security Score
Recent Findings
```

---

## Step 2

Open:

```text
World Monitor Security Assessment
```

---

## Step 3

Show the target.

```text
Target:
Authorized Demo Environment

Authorization:
Confirmed
```

---

## Step 4

Start an assessment.

Show live progress:

```text
Assessment Running

Attack Surface Discovery      ✓
Endpoint Analysis             ✓
Security Assessment           ✓
Finding Analysis              ✓
Verification                  ✓
AI Analysis                   ✓
Risk Scoring                  ✓
```

---

## Step 5

Open dashboard results.

```text
Security Score: 72/100

Critical: 1
High: 3
Medium: 5
Low: 4
```

---

## Step 6

Open a finding.

```text
Broken Access Control

HIGH
CVSS 8.1

Status:
VERIFIED
```

Show:

```text
Evidence
Impact
AI Analysis
Remediation
```

---

## Step 7

Show remediation tracking.

```text
Status:
OPEN

Priority:
HIGH

Recommended Action:
Implement server-side authorization checks.
```

---

## Step 8

Generate report.

```text
WORLD MONITOR

SECURITY ASSESSMENT REPORT
```

The report should look professional and contain all important findings.

---

# 25. Development Phases

Do not attempt to build everything at once.

---

## Phase 1 — Foundation

Build:

```text
React Frontend
Express Backend
MongoDB Connection
Authentication
Basic Dashboard
Project Management
Target Management
```

---

## Phase 2 — Assessment Management

Build:

```text
Create Assessment
Assessment Status
Assessment History
Progress Tracking
Background Job Architecture
```

---

## Phase 3 — Attack Surface Module

Build:

```text
Target Information
Endpoint Discovery Data
Technology Detection Data
Asset Storage
Attack Surface Visualization
```

---

## Phase 4 — Findings Module

Build:

```text
Findings Database
Severity
Status
Evidence
Affected Assets
Finding Details Page
Filters
Search
```

---

## Phase 5 — Verification

Build:

```text
Potential Finding
Review
Verification
Verified Status
False Positive
Confidence Score
```

---

## Phase 6 — CVSS & Risk

Build:

```text
CVSS Storage
Severity Classification
Risk Dashboard
Finding Prioritization
```

---

## Phase 7 — AI Analyst

Build:

```text
Structured Finding Input
AI Analysis
Impact Explanation
Remediation Suggestions
Executive Summary
```

---

## Phase 8 — Reports

Build:

```text
Assessment Report
PDF Generation
Executive Summary
Detailed Findings
Remediation Section
```

---

## Phase 9 — Final Polish

Focus on:

```text
Responsive UI
Dark Mode
Loading States
Empty States
Error States
Animations
Performance
Professional Demo Data
```

---

# 26. MVP Features

The first working version should include:

```text
✓ Authentication

✓ Dashboard

✓ Projects

✓ Targets

✓ Authorization Confirmation

✓ Create Assessment

✓ Assessment Progress

✓ Attack Surface Data

✓ Findings

✓ Severity

✓ Verification Status

✓ Evidence

✓ CVSS Score

✓ AI Analysis

✓ Remediation

✓ Report Generation
```

Do not start with:

```text
Complex microservices
Multiple databases
Kubernetes
Over-engineered infrastructure
Unnecessary blockchain
Unnecessary IoT
```

The priority is:

> Build a complete, working, impressive product before adding unnecessary complexity.

---

# 27. Suggested Repository Structure

```text
sentinel-ai/
│
├── client/
│
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── lib/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── queues/
│   │   ├── workers/
│   │   └── utils/
│   │
│   └── server.js
│
├── docs/
│
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── development.md
│
└── README.md
```

---

# 28. Coding Rules for AI Agent

The AI coding agent must follow these rules.

## Rule 1

Do not rewrite the entire project unnecessarily.

Make focused changes.

---

## Rule 2

Before modifying a feature:

```text
Understand existing architecture
Check related components
Identify dependencies
Make minimal required changes
```

---

## Rule 3

Do not create huge CSS files.

Prefer:

```text
Tailwind CSS
Reusable UI components
shadcn/ui
```

---

## Rule 4

Do not use fake UI-only functionality for core features.

Important buttons should connect to actual application logic whenever the backend feature exists.

---

## Rule 5

Do not hardcode large amounts of duplicated data.

Use:

```text
API
Database
Reusable mock data only during early development
```

---

## Rule 6

Maintain consistency.

Do not randomly change:

```text
Folder structure
Naming conventions
Component patterns
API response patterns
```

without a reason.

---

## Rule 7

Use loading and error states.

Every important asynchronous operation should handle:

```text
Loading
Success
Error
Empty State
```

---

## Rule 8

Keep components reasonably small.

Avoid giant page components containing thousands of lines.

Extract reusable sections when appropriate.

---

## Rule 9

Use environment variables for:

```text
Database URL
JWT Secret
AI API Key
Redis URL
Application URLs
```

Never hardcode secrets.

---

## Rule 10

Before marking a feature complete:

```text
Check frontend
Check backend
Check API integration
Check database flow
Check error handling
Check responsive behavior
```

---

# 29. Product Success Criteria

The final project should demonstrate a complete story.

A judge should understand within a few minutes:

```text
1. What problem does SentinelAI solve?

2. How does it assess an authorized application?

3. How does it organize the attack surface?

4. How are findings detected and managed?

5. How are findings verified?

6. How does AI assist the analyst?

7. How is risk prioritized?

8. How does the developer receive remediation guidance?

9. How is the final report generated?
```

The product should not feel like:

> A dashboard with random vulnerability cards.

It should feel like:

> A complete security assessment workflow platform.

---

# 30. Final Product Flow

```text
USER
 │
 ▼
CREATE PROJECT
 │
 ▼
ADD AUTHORIZED TARGET
 │
 ▼
START ASSESSMENT
 │
 ▼
BACKGROUND ASSESSMENT JOB
 │
 ├──────────────┐
 ▼              ▼
ATTACK SURFACE  SECURITY ANALYSIS
DISCOVERY             │
 │                    │
 └──────────┬─────────┘
            ▼
        FINDINGS
            │
            ▼
         EVIDENCE
            │
            ▼
       VERIFICATION
            │
            ▼
       AI ANALYSIS
            │
            ▼
       CVSS / RISK
            │
            ▼
       REMEDIATION
            │
            ▼
       FINAL REPORT
```

---

# Final AI Agent Instruction

You are building **SentinelAI**, an AI-assisted security assessment and vulnerability management platform for **SIH 2026 Problem Statement 26163**.

The primary target context is the security assessment of the World Monitor application, but the platform architecture should remain reusable for authorized web applications.

Use the following primary stack:

```text
Frontend:
React + Vite

Styling:
Tailwind CSS

UI Components:
shadcn/ui and reusable Tailwind-based components

Backend:
Node.js + Express.js

Database:
MongoDB + Mongoose

Authentication:
JWT

Background Jobs:
Redis + BullMQ

Real-Time Updates:
Socket.IO where useful

AI:
LLM API for structured finding analysis,
impact explanation, remediation guidance,
and executive summaries.
```

The application must follow this workflow:

```text
Project
    ↓
Authorized Target
    ↓
Assessment
    ↓
Attack Surface Discovery
    ↓
Security Findings
    ↓
Evidence
    ↓
Verification
    ↓
AI Analysis
    ↓
CVSS Risk Prioritization
    ↓
Remediation
    ↓
Security Report
```

UI requirements:

```text
Professional
Premium SaaS
Minimal
Security-focused
Responsive
Dark mode
Consistent
```

Styling requirements:

```text
Use Tailwind CSS as the primary styling system.

Prefer shadcn/ui and reusable Tailwind-based components.

Do NOT create long CSS files for normal styling.

Custom CSS should only be used when Tailwind is not sufficient.
```

Engineering requirements:

```text
Clean folder structure
Reusable components
Feature-based organization
RESTful APIs
Proper error handling
Loading states
Empty states
Responsive design
Environment variables for secrets
Minimal unnecessary dependencies
No unnecessary microservices
No unnecessary rewrites of existing working code
```

The project should be built incrementally.

First create a solid foundation:

```text
Authentication
Dashboard
Projects
Targets
Assessment Management
Findings
```

Then add:

```text
Attack Surface
Verification
CVSS
AI Analysis
Remediation
Reports
```

The final result should feel like a real-world security SaaS platform and demonstrate a complete, understandable workflow from authorized target assessment to actionable security reporting.
