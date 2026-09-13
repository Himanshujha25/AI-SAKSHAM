# 📋 Gap Analysis — Missing Features Summary (`gap_analysis.md`)

> **Target System**: World Monitor Web & Mobile Application (NTRO PS 26163)  
> **Platform**: Saksham AI (AI-SAKSHAM Security Command Center)

---

## ⚠️ What is Missing (Brief & Simple)

### 1. 🧪 Interactive API & RBAC Sandbox (`/api-tester`)
- **What is missing**: An interactive testing page where security analysts can paste API endpoints, attach custom Bearer Tokens or cookies, and test for **IDOR** and **Broken Access Control** bugs.
- **Why needed**: Fulfills the requirement to test role-based access control (RBAC) and user isolation on World Monitor API endpoints.

---

### 2. 📋 One-Click PoC cURL Exporter 
- **What is missing**: A "Copy cURL Command" button inside the **Evidence Tab** of a vulnerability finding.
- **Why needed**: Allows security auditors to instantly copy a reproducible `curl` command to demonstrate the Proof-of-Concept (PoC) in a safe test environment.

---

### 3. 🛡️ CORS & Mobile Security Header Scanner Rules
- **What is missing**: Automated scanner checks for:
  - Wildcard CORS policy (`Access-Control-Allow-Origin: *`)
  - Missing Rate-Limiting headers (`X-RateLimit-Limit`)
  - Mobile API TLS/SSL security checks.
- **Why needed**: Fulfills mobile platform and API security testing requirements in PS 26163.

---

### 4. 🔄 Fix Verification & Re-Testing Workflow
- **What is missing**: A "Re-Test & Close" button on findings with an SLA fix countdown (e.g. Critical: 24h).
- **Why needed**: Allows security teams to run a targeted re-scan to confirm whether a vulnerability has been fixed.

---

### 5. 📜 System Activity Audit Log Page (`/activity`)
- **What is missing**: A dedicated timeline page logging user events (Logins, Scan Launches, Bug Verifications, Report Exports).
- **Why needed**: Provides audit trail history for security compliance reviews.
