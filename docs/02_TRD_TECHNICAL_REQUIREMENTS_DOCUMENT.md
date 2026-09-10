# AI-SAKSHAM: Technical Requirements Document (TRD)

**Document Status**: Approved / Architecture Baseline  
**Version**: 1.0.0  
**Target Architecture**: Tiered Microservices / MERN Stack + AI Vision Engine  

---

## 1. System Architecture & Component Diagram

AI-SAKSHAM uses a decoupled, event-aware MERN architecture augmented by an AI/OCR Document Intelligence Service and a Rules & Workflow Engine.

```
                                  +-----------------------+
                                  | React Client (Vite)   |
                                  | - Applicant Portal    |
                                  | - Official Queue UI   |
                                  | - Admin Dashboard UI  |
                                  +-----------------------+
                                              |
                                              v  HTTPS / REST / WebSocket
                                  +-----------------------+
                                  | API Gateway / Express |
                                  | - Rate Limiter (Redis)|
                                  | - JWT Auth & RBAC     |
                                  | - Input Validator     |
                                  +-----------------------+
                                              |
           +----------------------------------+----------------------------------+
           |                                  |                                  |
           v                                  v                                  v
+-----------------------+          +-----------------------+          +-----------------------+
|  Application Service  |          |    Workflow Engine    |          |   Eligibility Engine  |
| - App Lifecycle       |          | - FSM State Transitions|         | - Scheme Rule Matrix  |
| - Profile & Vault     |          | - Action Auditing     |          | - Dynamic Criteria Eval|
+-----------------------+          +-----------------------+          +-----------------------+
           |                                  |                                  |
           +----------------------------------+----------------------------------+
                                              |
                                              v
+-------------------------------------------------------------------------------------------------+
|                                         STORAGE LAYER                                           |
|   +------------------------------------+              +------------------------------------+    |
|   |         MongoDB Replica Set        |              |        clodinary / Local Vault Store      |    |
|   | (Users, Schemes, Apps, Audit Logs) |              |   (Encrypted PDFs, Transcripts, Docs) |    |
|   +------------------------------------+              +------------------------------------+    |
+-------------------------------------------------------------------------------------------------+
                                              ^
                                              | Event Queue (Redis Pub/Sub or BullMQ)
                                              v
                                  +-----------------------+
                                  |  AI Vision Service    |
                                  | - Multi-Format OCR    |
                                  | - Field Extraction    |
                                  | - Inconsistency Check |
                                  | - Confidence Scorer   |
                                  +-----------------------+
```

---

## 2. Database Schema Specifications (MongoDB)

All schemas are strict Mongoose schemas with indexing optimization for high-throughput queries.

### 2.1 Collection: `users`
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique, indexed)",
  "mobile": "String (required, indexed)",
  "passwordHash": "String (required)",
  "role": "String (enum: ['APPLICANT', 'VERIFIER', 'SCRUTINY_OFFICER', 'SELECTION_OFFICER', 'MINISTRY_ADMIN', 'SUPER_ADMIN'])",
  "assignedSchemes": ["ObjectId(ref: schemes)"],
  "isEmailVerified": "Boolean (default: false)",
  "isMobileVerified": "Boolean (default: false)",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.2 Collection: `schemes`
```json
{
  "_id": "ObjectId",
  "code": "String (unique, indexed, e.g. 'NFST_2026')",
  "name": "String (e.g. 'National Fellowship for Higher Education of ST Students')",
  "sponsoringMinistry": "String (e.g. 'Ministry of Tribal Affairs')",
  "description": "String",
  "academicYear": "String (e.g. '2026-2027')",
  "applicationStartDate": "ISODate",
  "applicationEndDate": "ISODate",
  "isActive": "Boolean (default: true)",
  "workflowConfigId": "ObjectId(ref: workflow_configs)",
  "eligibilityRuleId": "ObjectId(ref: scheme_rules)",
  "selectionCriteriaId": "ObjectId(ref: selection_rules)",
  "requiredDocuments": [
    {
      "documentType": "String (e.g. 'INCOME_CERTIFICATE')",
      "label": "String (e.g. 'Family Income Certificate')",
      "isMandatory": "Boolean",
      "allowedExtensions": ["pdf", "jpg", "png"],
      "maxSizeMB": "Number (default: 5)"
    }
  ],
  "createdAt": "ISODate"
}
```

### 2.3 Collection: `applications`
```json
{
  "_id": "ObjectId",
  "applicationNo": "String (unique, indexed, e.g. 'APP-NFST-2026-10231')",
  "applicantId": "ObjectId(ref: users, indexed)",
  "schemeId": "ObjectId(ref: schemes, indexed)",
  "currentStage": "String (indexed, e.g. 'DOCUMENT_SCRUTINY')",
  "status": "String (indexed, enum: ['DRAFT', 'SUBMITTED', 'UNDER_VERIFICATION', 'DEFICIENT', 'ELIGIBLE', 'INELIGIBLE', 'SELECTED', 'REJECTED', 'SANCTIONED'])",
  "personalDetails": {
    "fullName": "String",
    "dob": "ISODate",
    "gender": "String",
    "category": "String (e.g. 'ST')",
    "annualFamilyIncome": "Number"
  },
  "academicDetails": {
    "degreeProgram": "String (e.g. 'Ph.D')",
    "institutionName": "String",
    "marksPercentage": "Number",
    "researchTopic": "String"
  },
  "bankDetails": {
    "accountNumber": "String",
    "ifscCode": "String",
    "bankName": "String"
  },
  "aiConfidenceScore": "Number (0 to 100)",
  "aiRiskFlag": "String (enum: ['GREEN_SAFE', 'YELLOW_NEEDS_SCRUTINY', 'RED_HIGH_DISCREPANCY'])",
  "isDeficient": "Boolean (default: false)",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 2.4 Collection: `documents`
```json
{
  "_id": "ObjectId",
  "applicationId": "ObjectId(ref: applications, indexed)",
  "documentType": "String (indexed, e.g. 'INCOME_CERTIFICATE')",
  "originalFileName": "String",
  "fileUrl": "String (S3 or encrypted vault path)",
  "fileHash": "String (SHA-256 for tampering detection)",
  "status": "String (enum: ['PENDING_AI', 'PROCESSED', 'DEFICIENT', 'VERIFIED'])",
  "uploadedAt": "ISODate"
}
```

### 2.5 Collection: `document_extractions` (AI Extracted Data)
```json
{
  "_id": "ObjectId",
  "documentId": "ObjectId(ref: documents, indexed)",
  "applicationId": "ObjectId(ref: applications, indexed)",
  "extractedFields": {
    "name": "String",
    "certificateNo": "String",
    "incomeAmount": "Number",
    "issueDate": "ISODate",
    "issuingAuthority": "String"
  },
  "ocrRawText": "String",
  "fieldConfidenceScores": {
    "name": "Number",
    "certificateNo": "Number",
    "incomeAmount": "Number"
  },
  "inconsistenciesFound": [
    {
      "field": "String (e.g. 'annualFamilyIncome')",
      "declaredValue": "Mixed",
      "extractedValue": "Mixed",
      "severity": "String (enum: ['CRITICAL', 'WARNING', 'INFO'])",
      "message": "String"
    }
  ],
  "processedAt": "ISODate"
}
```

### 2.6 Collection: `deficiencies`
```json
{
  "_id": "ObjectId",
  "applicationId": "ObjectId(ref: applications, indexed)",
  "officialId": "ObjectId(ref: users)",
  "deficientDocuments": [
    {
      "documentId": "ObjectId(ref: documents)",
      "documentType": "String",
      "reason": "String (e.g. 'Income certificate expired or illegible')",
      "actionRequired": "String"
    }
  ],
  "status": "String (enum: ['OPEN', 'APPLICANT_RESPONDED', 'UNDER_REVIEW', 'RESOLVED'])",
  "issuedAt": "ISODate",
  "resolvedAt": "ISODate"
}
```

### 2.7 Collection: `audit_logs` (Immutable Action Log)
```json
{
  "_id": "ObjectId",
  "applicationId": "ObjectId(ref: applications, indexed)",
  "performedBy": "ObjectId(ref: users)",
  "action": "String (e.g. 'STAGE_TRANSITION', 'DEFICIENCY_RAISED', 'MERIT_OVERRIDE')",
  "previousState": "Object",
  "newState": "Object",
  "ipAddress": "String",
  "userAgent": "String",
  "timestamp": "ISODate"
}
```

---

## 3. Complete REST API Specifications

All endpoints require Header `Authorization: Bearer <JWT>`.

### 3.1 Authentication & Profile APIs

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new applicant user. |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & receive JWT + Refresh Token. |
| `GET` | `/api/v1/auth/me` | Authenticated | Get current authenticated user profile. |

### 3.2 Applicant APIs

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/schemes/active` | Applicant | List active scholarship schemes eligible for application. |
| `POST` | `/api/v1/applications` | Applicant | Draft new application for a scheme. |
| `GET` | `/api/v1/applications/my-applications` | Applicant | Get list of user's submitted & draft applications. |
| `GET` | `/api/v1/applications/:id` | Applicant / Official | Get application details (with strict IDOR check). |
| `POST` | `/api/v1/applications/:id/documents` | Applicant | Upload document for application. Triggers AI OCR asynchronously. |
| `POST` | `/api/v1/applications/:id/submit` | Applicant | Final submit application to verification workflow. |
| `POST` | `/api/v1/applications/:id/deficiency/resolve` | Applicant | Re-upload missing/corrected documents to resolve deficiency. |

### 3.3 Official Verification & Scrutiny APIs

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/official/queue` | Verifier / Scrutiny | Fetch prioritized verification queue filtered by stage and AI score. |
| `GET` | `/api/v1/official/applications/:id/ai-summary` | Verifier / Scrutiny | Get AI extractions, comparison matrix, and confidence breakdown. |
| `POST` | `/api/v1/official/applications/:id/verify` | Verifier | Mark document scrutiny as approved & advance state. |
| `POST` | `/api/v1/official/applications/:id/deficiency` | Verifier / Scrutiny | Flag deficiency and dispatch notification to applicant. |
| `POST` | `/api/v1/official/applications/:id/scrutinize` | Scrutiny Officer | Approve institutional eligibility scrutiny. |

### 3.4 Selection & Administration APIs

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/selection/generate-merit` | Selection Officer | Execute dynamic selection rule matrix and generate rank list. |
| `GET` | `/api/v1/selection/explain/:applicationId` | Selection Officer | Retrieve explicit score breakdown explanation. |
| `POST` | `/api/v1/admin/schemes` | Ministry Admin | Create or update configurable scheme rules and workflows. |
| `GET` | `/api/v1/analytics/dashboard` | Ministry Executive | Retrieve macro KPI metrics, SLA averages, and deficiency stats. |

---

## 4. AI Document Intelligence Pipeline Architecture

The AI Document Intelligence pipeline operates asynchronously to prevent blocking API request workers.

```
[ Upload PDF ] 
     |
     v
[ Event Queue (Redis) ] 
     |
     v
[ Worker: OCR & Text Extractor ] ---> (Extract raw text & spatial tokens)
     |
     v
[ Worker: Document Classifier ] ---> (Detect document type & validate mandatory uploads)
     |
     v
[ Worker: Entity Extractor ]   ---> (Extract Name, Income, DOB, Certificate No)
     |
     v
[ Worker: Cross-Verifier ]     ---> (Compare Extracted vs Application Form JSON)
     |
     v
[ Worker: Risk Scorer ]        ---> (Calculate Composite Score & Risk Flag: GREEN/YELLOW/RED)
     |
     v
[ DB: Save Extraction & Alert ]
```

### AI Risk & Confidence Formula
$$\text{Confidence Score} = (W_{doc} \cdot S_{doc}) + (W_{id} \cdot S_{id}) + (W_{inc} \cdot S_{inc}) + (W_{auth} \cdot S_{auth})$$

Where:
- $W_{doc} = 0.25$ (Document Completeness Score)
- $W_{id} = 0.35$ (Name & Aadhaar Identity Match Score)
- $W_{inc} = 0.25$ (Income & Qualification Value Match Score)
- $W_{auth} = 0.15$ (Issue Date & Seal Authenticity Score)

If $\text{Confidence Score} \ge 90\% \implies \text{GREEN\_SAFE}$  
If $70\% \le \text{Confidence Score} < 90\% \implies \text{YELLOW\_NEEDS\_SCRUTINY}$  
If $\text{Confidence Score} < 70\% \implies \text{RED\_HIGH\_DISCREPANCY}$

---

## 5. Security, RBAC & IDOR Prevention

### 5.1 Route-Level Middleware Pipeline
Every incoming API request passes through a strict security pipeline:

```js
// Middleware Chain
app.use('/api/v1/applications/:id', [
  authenticateJWT,          // 1. Validates JWT Signature & Token Expiry
  checkRole(['APPLICANT', 'VERIFIER', 'SCRUTINY_OFFICER']), // 2. RBAC Role check
  enforceResourceOwnership  // 3. IDOR Mitigation: Ensures applicant owns :id OR official is assigned to scheme
]);
```

### 5.2 IDOR Prevention Rule
```javascript
// Example Ownership Enforcer
async function enforceResourceOwnership(req, res, next) {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  
  if (req.user.role === 'APPLICANT') {
    if (application.applicantId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access Denied: You do not own this application' });
    }
  } else if (['VERIFIER', 'SCRUTINY_OFFICER'].includes(req.user.role)) {
    if (!req.user.assignedSchemes.includes(application.schemeId.toString())) {
      return res.status(403).json({ error: 'Access Denied: Scheme not assigned to official' });
    }
  }
  next();
}
```
