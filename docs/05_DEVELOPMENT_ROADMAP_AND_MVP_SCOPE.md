# AI-SAKSHAM: Development Roadmap, MVP Scope & Seed Data Specification

**Document Status**: Approved / Execution Baseline  
**Version**: 1.0.0  
**Target Goal**: Hackathon MVP Demonstration & Production Phasing Strategy  

---

## 1. Hackathon MVP Scope & Core Demonstration Flow

To demonstrate the full power of AI-SAKSHAM during a live review or competition, the MVP focuses on a complete, end-to-end user journey around **NFST (National Fellowship for Higher Education of ST Students)**.

```
+-----------------------------------------------------------------------------------+
|                            HACKATHON DEMO STORYBOARD                              |
|                                                                                   |
| 1. STUDENT REGISTRATION & APPLICATION                                             |
|    - Rahul Kumar registers & fills NFST 2026 Application.                         |
|    - Self-declares: Category = ST, Annual Income = ₹2,00,000, M.Sc Marks = 92%.   |
|    - Uploads Documents: ST Certificate, Income Certificate, Marks Card.           |
|                                                                                   |
| 2. AI DOCUMENT INTELLIGENCE PIPELINE                                              |
|    - AI performs OCR & extracts text from uploaded PDFs.                          |
|    - AI matches Name & ST Certificate successfully (100% Match).                  |
|    - AI detects Income Discrepancy (Declared ₹2,00,000 vs Extracted ₹2,10,000).  |
|    - AI assigns Confidence Score: 88% (YELLOW_NEEDS_SCRUTINY).                   |
|                                                                                   |
| 3. OFFICIAL VERIFICATION QUEUE                                                    |
|    - Official opens Queue, sees Rahul's app flagged 🟡 with 88% Confidence.      |
|    - Opens Split-Screen view: Declared fields vs Extracted document values.       |
|    - Triggers One-Click Deficiency notice for income proof clarification.         |
|                                                                                   |
| 4. APPLICANT DEFICIENCY RESOLUTION                                                |
|    - Rahul receives instant notification & logs into Applicant Portal.            |
|    - Sees flagged deficiency modal, uploads updated Income Certificate.           |
|    - Status updates to APPLICANT_UPDATED.                                         |
|                                                                                   |
| 5. FINAL SCRUTINY & EXPLAINABLE SELECTION                                         |
|    - Official approves verified application.                                      |
|    - Merit Engine runs: Calculates Score 94.2/100 (Academic 38 + Proposal 23...). |
|    - Explainability view demonstrates exact mathematical score breakdown.          |
|                                                                                   |
| 6. MINISTRY ANALYTICS DASHBOARD                                                   |
|    - Executive dashboard updates macro KPIs (Total Apps, SLA average 7 days).     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Multi-Phase Implementation Roadmap

| Phase | Duration | Scope & Features | Key Milestone Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1: Hackathon MVP** | Current | Core Applicant Portal, Official Queue with AI Split Scrutiny, Configurable NFST/NOS Scheme Rules, Deficiency Engine, Merit Scoring & Explainability, Executive Dashboard. | Functional end-to-end demo prototype with seed data. |
| **Phase 2: Production Pilot** | Months 1-3 | Real OCR Integration (Tesseract / Google Cloud Vision API), Digilocker integration, Aadhaar OTP SSO, Advanced Visual Rule Builder, Production MongoDB Cluster. | Pilot rollout with 2 State Tribal Welfare Departments. |
| **Phase 3: National Scale** | Months 4-6 | Integration with Public Financial Management System (PFMS) for Direct Benefit Transfer (DBT), Multi-lingual AI Chatbot (JAGO Assistant), Geo-spatial Analytics, ISO 27001 Security Certification. | Full nationwide rollout across all Ministry schemes. |

---

## 3. Seed Data Specification & Blueprint

To ensure deterministic testing, the repository will be seeded with mock datasets representing realistic government records.

### 3.1 Seed Scheme: NFST 2026 (`schemes` collection)
```json
{
  "_id": "65a000000000000000000001",
  "code": "NFST_2026",
  "name": "National Fellowship for Higher Education of ST Students",
  "sponsoringMinistry": "Ministry of Tribal Affairs",
  "academicYear": "2026-2027",
  "isActive": true,
  "requiredDocuments": [
    { "documentType": "CASTE_CERTIFICATE", "label": "ST Caste Certificate", "isMandatory": true },
    { "documentType": "INCOME_CERTIFICATE", "label": "Family Income Certificate", "isMandatory": true },
    { "documentType": "ACADEMIC_TRANSCRIPT", "label": "Post-Graduation Marksheet", "isMandatory": true },
    { "documentType": "ADMISSION_PROOF", "label": "Ph.D Admission Letter", "isMandatory": true }
  ]
}
```

### 3.2 Seed Applicant & Application (`users` & `applications` collections)
```json
{
  "_id": "65a000000000000000000010",
  "applicationNo": "APP-NFST-2026-10231",
  "personalDetails": {
    "fullName": "Rahul Kumar",
    "dob": "1999-05-15T00:00:00.000Z",
    "category": "ST",
    "annualFamilyIncome": 200000
  },
  "academicDetails": {
    "degreeProgram": "Ph.D",
    "institutionName": "Indian Institute of Technology, Ranchi",
    "marksPercentage": 92.5
  },
  "status": "UNDER_VERIFICATION",
  "aiConfidenceScore": 88,
  "aiRiskFlag": "YELLOW_NEEDS_SCRUTINY"
}
```

---

## 4. Verification & Testing Strategy

### 4.1 Automated API & Security Verification
- **RBAC & Authorization Unit Tests**: Verify that `APPLICANT` role users receive `403 Forbidden` when attempting to access `/api/v1/official/queue` or `/api/v1/admin/schemes`.
- **IDOR Protection Tests**: Verify that `APPLICANT_A` receives `403 Forbidden` when attempting to access `/api/v1/applications/APP_OF_APPLICANT_B`.
- **Rule Engine Unit Tests**: Run evaluator against edge case applicant JSON payloads (e.g. Income = ₹6,00,001 vs ₹6,00,000 limit).

### 4.2 Manual Verification Walkthrough
1. **Applicant Submission**: Log in as `rahul@example.com`, complete application form, upload documents, click Submit.
2. **AI Inspection**: Confirm AI OCR extractions appear correctly in database and trigger `YELLOW_NEEDS_SCRUTINY` flag.
3. **Official Review**: Log in as `verifier@mota.gov.in`, open application `#APP-NFST-2026-10231`, review split-screen comparison, raise income deficiency.
4. **Deficiency Resolution**: Log back in as `rahul@example.com`, upload replacement income proof, submit resolution.
5. **Selection & Merit**: Log in as `selection_officer@mota.gov.in`, run merit generator, verify score breakdown rendering ($94.2/100$).
