# AI-SAKSHAM: Scheme Workflow & Rule Engine Specification

**Document Status**: Approved / State Machine Baseline  
**Version**: 1.0.0  
**Core Modules**: Finite State Machine (FSM), Dynamic Eligibility Evaluator, Deficiency Resolution Loop  

---

## 1. Finite State Machine (FSM) Specification

AI-SAKSHAM manages application lifecycles using a deterministic, event-driven Finite State Machine (FSM). Invalid state transitions are rejected at the service layer.

```
                      +-------------------+
                      |       DRAFT       |
                      +-------------------+
                                |
                                v (Action: SUBMIT_APPLICATION)
                      +-------------------+
                      |     SUBMITTED     |
                      +-------------------+
                                |
                                v (Action: TRIGGER_AI_SCRUTINY)
                      +-------------------+
                      |   AI_VERIFYING    |
                      +-------------------+
                                |
         +----------------------+----------------------+
         |                                             |
         v (Deficiency Flagged)                        v (All Docs Valid)
+-------------------+                         +-------------------+
|     DEFICIENT     |                         | UNDER_VERIFICATION|
+-------------------+                         +-------------------+
         |                                             |
         v (Action: RESOLVE_DEFICIENCY)                v (Action: APPROVE_VERIFICATION)
+-------------------+                         +-------------------+
| APPLICANT_UPDATED |                         |  SCRUTINY_PENDING |
+-------------------+                         +-------------------+
         |                                             |
         +---------------------------------------------+
                                |
                                v (Action: APPROVE_ELIGIBILITY)
                      +-------------------+
                      | SCREENING_PENDING |
                      +-------------------+
                                |
                                v (Action: GENERATE_MERIT_LIST)
                      +-------------------+
                      |  SELECTION_POOL   |
                      +-------------------+
                                |
         +----------------------+----------------------+
         |                                             |
         v (Action: SELECT_APPLICANT)                  v (Action: REJECT_APPLICANT)
+-------------------+                         +-------------------+
|     SELECTED      |                         |     REJECTED      |
+-------------------+                         +-------------------+
         |
         v (Action: ISSUE_SANCTION)
+-------------------+
|    SANCTIONED     |
+-------------------+
```

---

## 2. State Transition Matrix & Security Guards

| Current State | Trigger Event | Next State | Allowed Roles | System Safeguards / Requirements |
| :--- | :--- | :--- | :--- | :--- |
| `DRAFT` | `SUBMIT_APPLICATION` | `SUBMITTED` | `APPLICANT` | All mandatory scheme documents must be uploaded. |
| `SUBMITTED` | `TRIGGER_AI_SCRUTINY`| `AI_VERIFYING` | `SYSTEM_AI` | System triggers OCR worker job. |
| `AI_VERIFYING` | `AI_COMPLETE_PASS` | `UNDER_VERIFICATION` | `SYSTEM_AI` | AI Confidence Score $\ge 70\%$. |
| `AI_VERIFYING` | `FLAG_DEFICIENCY` | `DEFICIENT` | `SYSTEM_AI` / `VERIFIER` | Creates `deficiencies` record with missing items. |
| `DEFICIENT` | `RESOLVE_DEFICIENCY`| `APPLICANT_UPDATED` | `APPLICANT` | Applicant uploads replacement document. |
| `APPLICANT_UPDATED`| `REVERIFY_AI` | `UNDER_VERIFICATION` | `SYSTEM_AI` | Re-evaluates missing field extractions. |
| `UNDER_VERIFICATION`| `APPROVE_VERIFICATION`| `SCRUTINY_PENDING` | `VERIFIER` | Official confirms document verification. |
| `SCRUTINY_PENDING` | `APPROVE_SCRUTINISE` | `SCREENING_PENDING` | `SCRUTINY_OFFICER` | Validates institutional eligibility. |
| `SCREENING_PENDING`| `GENERATE_MERIT` | `SELECTION_POOL` | `SELECTION_OFFICER`| Calculates composite merit rank. |
| `SELECTION_POOL` | `SELECT_APPLICANT` | `SELECTED` | `SELECTION_OFFICER`| Within merit rank cutoff limit. |
| `SELECTED` | `ISSUE_SANCTION` | `SANCTIONED` | `MINISTRY_ADMIN` | Generates official digitally signed sanction letter. |

---

## 3. Real-World Scheme Lifecycles: NFST vs NOS

### 3.1 NFST Lifecycle (National Fellowship for ST Students)
- **Target Audience**: Scheduled Tribe students pursuing M.Phil / Ph.D. in Indian Universities.
- **Workflow Pipeline**: 
  1. `SUBMITTED`: Student submits M.Sc marksheet, ST Certificate, Income proof, UGC-NET card, and Admission letter.
  2. `AI_VERIFYING`: System cross-checks ST Certificate number with State Registry API & extracts M.Sc percentage.
  3. `UNDER_VERIFICATION`: Verifier approves document completeness.
  4. `SCRUTINY_PENDING`: Scrutiny Officer verifies UGC/NIRF institution accreditation.
  5. `SELECTION_POOL`: Merit calculated based on M.Sc % (40%), UGC-NET score (30%), Research proposal rating (30%).
  6. `SANCTIONED`: Monthly fellowship stipend disbursed via DBT Direct Benefit Transfer.

### 3.2 NOS Lifecycle (National Overseas Scholarship)
- **Target Audience**: ST students pursuing Master's / Ph.D. in foreign universities (QS Rank top 500).
- **Workflow Pipeline**:
  1. `SUBMITTED`: Student submits Passport, Unconditional Foreign University Offer Letter, GRE/IELTS score, ST Certificate, Income proof.
  2. `AI_VERIFYING`: AI extracts University Name, QS World Ranking, and Unconditional status.
  3. `FOREIGN_UNIV_CHECK` *(Custom Stage)*: Special verification step validating foreign university acceptance letter with Indian Embassy / Mission abroad.
  4. `UNDER_VERIFICATION` -> `SCRUTINY_PENDING` -> `SELECTION_POOL`.
  5. `SANCTIONED`: Annual tuition fees & living allowance sanction order issued.

---

## 4. Dynamic Rule Engine JSON Schema

Scheme eligibility rules are stored as nested JSON trees in MongoDB `scheme_rules`, allowing complex Boolean evaluations without code deployment.

```json
{
  "_id": "ObjectId('65a001122334455667788990')",
  "schemeId": "ObjectId('65a000000000000000000001')",
  "ruleTree": {
    "logicalOperator": "AND",
    "conditions": [
      {
        "field": "personalDetails.category",
        "operator": "EQUALS",
        "value": "ST"
      },
      {
        "field": "personalDetails.annualFamilyIncome",
        "operator": "LESS_THAN_OR_EQUAL",
        "value": 600000
      },
      {
        "logicalOperator": "OR",
        "conditions": [
          {
            "field": "academicDetails.degreeProgram",
            "operator": "EQUALS",
            "value": "Ph.D"
          },
          {
            "field": "academicDetails.degreeProgram",
            "operator": "EQUALS",
            "value": "M.Phil"
          }
        ]
      },
      {
        "field": "academicDetails.marksPercentage",
        "operator": "GREATER_THAN_OR_EQUAL",
        "value": 55.0
      }
    ]
  }
}
```

---

## 5. Automated Deficiency Management Loop

When an official or AI flags a discrepancy, the system enters the structured **Deficiency Management Loop**, eliminating unorganized manual communications.

```
       OFFICIAL / AI DETECTS ISSUE
                    |
                    v
    [ Create Deficiency Record ] 
    - Flagged Field: "annualFamilyIncome"
    - Reason: "Income Certificate issued prior to April 2025"
    - Action Required: "Upload latest FY 2025-26 certificate"
                    |
                    v
  [ Application State -> DEFICIENT ]
                    |
                    v
  [ Notification Engine Sends Alert ]
  - SMS: "Deficiency flagged on APP10231. Log in to resolve."
  - Email with direct link to Deficiency Hub
                    |
                    v
    [ Student Logs into Portal ]
    - Views flagged items & official comments
    - Uploads replacement file: Income_2025_26.pdf
                    |
                    v
  [ Application State -> APPLICANT_UPDATED ]
                    |
                    v
  [ AI Re-scans Document & Notifies Official ]
                    |
                    v
  [ Official Reviews & Resolves Deficiency -> State: UNDER_VERIFICATION ]
```
