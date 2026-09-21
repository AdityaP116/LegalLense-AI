# LegalLens — Architecture

## 1. Architecture Goal

LegalLens connects a user's situation with multiple uploaded documents and turns extracted evidence into:

- structured document information
- cross-document comparisons
- conflicts
- missing references
- timeline events
- evidence-backed Q&A
- preparation questions
- a preparation brief

The architecture is designed around source traceability.

> Every important AI-generated statement should be explainable by showing where the information came from.

---

## 2. High-Level Architecture

```text
                         USER
                           │
                           ▼
                ┌─────────────────────┐
                │   React + Vite UI   │
                │     Tailwind CSS    │
                └──────────┬──────────┘
                           │
                    Firebase Auth
                           │
                           ▼
                ┌─────────────────────┐
                │      FastAPI        │
                │    API Layer        │
                └──────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │ Case       │   │ Document   │   │ AI         │
   │ Service    │   │ Service    │   │ Service    │
   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
         │                │                │
         ▼                ▼                ▼
   PostgreSQL       File Storage       LLM + RAG
                         │                │
                         ▼                │
                  PDF/DOCX/OCR           │
                         │                │
                         ▼                │
                 Document Chunks ─────────┘
                         │
                         ▼
                 Structured Evidence
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
        Comparison    Timeline    Questions
             │           │           │
             └───────────┼───────────┘
                         ▼
                 Evidence Validator
                         │
                  ┌──────┴──────┐
                  ▼             ▼
                Q&A          Brief
```

---

## 3. Frontend Architecture

### Stack

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React or the Stitch icon system

### Responsibilities

The frontend handles:

- authentication state
- case creation
- document upload UI
- processing status
- analysis presentation
- evidence navigation
- Q&A
- timeline
- questions
- preparation brief
- responsive presentation

The frontend should not contain:

- LLM API secrets
- privileged storage credentials
- authorization decisions that are only enforced client-side
- unsupported legal conclusions

---

## 4. Routing

```text
/
/dashboard

/case/new

/case/:caseId
/case/:caseId/documents
/case/:caseId/analysis
/case/:caseId/evidence
/case/:caseId/timeline
/case/:caseId/questions
/case/:caseId/brief
/case/:caseId/handoff
```

Use `caseId` route parameters.

Do not hardcode a single case.

---

## 5. Backend Architecture

FastAPI provides the API boundary.

Recommended service responsibilities:

```text
Case Service
  ├── create case
  ├── get case
  ├── update situation/goals
  └── authorize case ownership

Document Service
  ├── validate upload
  ├── store file
  ├── extract text
  ├── create chunks
  └── expose processing status

Analysis Service
  ├── extract structured facts
  ├── identify clauses
  ├── identify obligations
  ├── identify dates/entities
  └── detect references

Evidence Service
  ├── retrieve evidence
  ├── resolve source metadata
  └── expose source text/page/clause

Timeline Service
  ├── collect dated events
  └── sort events

Question Service
  ├── generate questions
  ├── add/edit/delete
  └── mark discussed

Brief Service
  ├── collect structured case information
  └── generate preparation brief
```

---

## 6. Authentication and Authorization Boundary

Use Firebase Auth for authentication.

```text
User
 ↓
Firebase Auth
 ↓
Firebase ID Token
 ↓
React sends token to FastAPI
 ↓
FastAPI verifies token
 ↓
FastAPI resolves application user
 ↓
Every case/document query is authorized
```

Authentication answers:

> Who is this user?

Authorization answers:

> Is this user allowed to access this case/document?

Both must be enforced server-side.

---

## 7. Data Architecture

### User

```text
id
name
email
created_at
```

### Case

```text
id
user_id
title
category
situation
goals
status
created_at
updated_at
```

### Document

```text
id
case_id
filename
document_type
storage_url
page_count
processing_status
created_at
```

### Clause

```text
id
document_id
clause_number
title
text
page
clause_type
```

### Evidence

```text
id
document_id
clause_id
page
text
evidence_type
```

### Conflict

```text
id
case_id
topic
description
severity_label
status
```

Do not treat `severity_label` as a legal-risk score. It can describe UI-level review priority if such a field is retained.

### ConflictEvidence

```text
id
conflict_id
evidence_id
```

### TimelineEvent

```text
id
case_id
event_date
title
description
document_id
page
```

### Question

```text
id
case_id
question
category
status
```

### Brief

```text
id
case_id
content
created_at
```

### DocumentChunk

Recommended implementation addition:

```text
id
document_id
page
chunk_index
text
section
embedding
metadata
created_at
```

This is the unit used for retrieval while preserving document/page context.

### AnalysisJob

Recommended implementation addition:

```text
id
case_id
status
progress
current_step
error
created_at
completed_at
```

This makes long-running document analysis visible and recoverable.

---

## 8. Document Processing Architecture

```text
Upload
  ↓
Validate File
  ↓
Store Original
  ↓
Extract Text
  ├── PDF → PyMuPDF
  └── DOCX → python-docx
  ↓
OCR if required
  ↓
Page Segmentation
  ↓
Section Detection
  ↓
Chunking
  ↓
Embedding
  ↓
Vector Storage
  ↓
Structured Extraction
  ├── Clauses
  ├── Obligations
  ├── Dates
  ├── Amounts
  ├── Entities
  └── References
  ↓
Evidence Store
```

### Source preservation

Every important fact must retain:

```text
document_id
page
section/clause
source text
```

Do not create a derived fact that cannot be traced to evidence.

---

## 9. Retrieval Architecture

Use hybrid retrieval instead of relying on vector similarity alone.

```text
User Question
      ↓
Query Understanding
      ↓
 ┌────┴─────────────┐
 │                  │
 ▼                  ▼
Keyword Search   Vector Search
 │                  │
 └────────┬─────────┘
          ▼
      Merge Results
          ↓
    Metadata Filter
          ↓
    Evidence Ranking
          ↓
 Cross-Document Check
          ↓
          LLM
          ↓
 Evidence Validation
          ↓
 Answer + Sources
```

Metadata can include:

- case
- document
- page
- section
- clause
- evidence type

The system should retrieve only the relevant workspace evidence needed for the question.

---

## 10. LLM Boundary

### LLM should handle

- clause classification
- plain-language explanation
- structured extraction where appropriate
- ambiguity handling
- evidence-grounded Q&A
- question generation
- preparation-brief drafting

### Deterministic code should handle

- file validation
- text extraction
- page count
- date sorting
- exact value comparison
- reference existence checks
- database operations
- access control

This reduces unnecessary hallucination risk.

---

## 11. Conflict Detection Architecture

```text
Documents
   ↓
Structured Fact Extraction
   ↓
Normalize Comparable Values
   ↓
Group by Topic
   ↓
Compare
   ↓
Attach Evidence
   ↓
Create Conflict Record
```

Priority topics:

- notice period
- dates
- amounts
- termination conditions
- obligations
- names/entities
- referenced policies
- defined terms

Output must remain neutral:

> Information differs across the uploaded documents.

The system does not determine which document legally controls.

---

## 12. Missing Reference Architecture

```text
Document Text
     ↓
Reference Detection
     ↓
Referenced Item
     ↓
Search Case Workspace
     ↓
 ┌───┴────┐
 ▼        ▼
Found   Not Found
```

References can be detected from phrases such as:

- as per
- according to
- subject to
- as mentioned in
- under the policy
- see Appendix
- refer to Schedule

A missing reference becomes an explicit review item.

---

## 13. Timeline Architecture

```text
Documents
   ↓
Date/Event Extraction
   ↓
Source Attachment
   ↓
Date Normalization
   ↓
Chronological Sort
   ↓
Timeline
```

Rules:

- do not invent dates
- preserve source page
- represent uncertain dates as uncertain
- ask for clarification when necessary

---

## 14. Evidence Validation

Before returning a generated answer:

```text
Generated Statement
       ↓
Check Supporting Evidence
       ↓
 ┌─────┼──────────────┐
 ▼     ▼              ▼
Found Derived      Missing
 │       │             │
 └───────┼─────────────┘
         ▼
 Evidence Status
         ↓
 Answer + Source
```

Statuses:

- FOUND DIRECTLY
- DERIVED FROM DOCUMENTS
- NOT FOUND
- NEEDS REVIEW

If supporting evidence is unavailable, the answer should not invent it.

---

## 15. Preparation Brief Architecture

```text
Case Context
     +
Key Evidence
     +
Conflicts
     +
Missing References
     +
Timeline
     +
Questions
     ↓
Brief Generator
     ↓
Evidence Validation
     ↓
Preparation Brief
```

The brief contains:

1. Situation
2. Documents Reviewed
3. Key Facts Found
4. Important Obligations
5. Important Dates
6. Areas to Review
7. Conflicting Information
8. Missing Information
9. Questions for a Legal Professional
10. Evidence Sources

The brief is informational and preparatory.

---

## 16. Storage Architecture

The product specification recommends:

- PostgreSQL
- pgvector
- Firebase Storage or S3-compatible storage

Use relational records for:

- users
- cases
- documents
- clauses
- evidence
- conflicts
- timeline events
- questions
- briefs

Use vector storage for:

- document chunks used in semantic retrieval

Use object storage for:

- original uploaded files

Keep object storage access controlled rather than exposing documents publicly.

---

## 17. API Shape

A concrete API can follow this pattern:

```text
POST   /cases
GET    /cases/:caseId
PATCH  /cases/:caseId

POST   /cases/:caseId/documents
GET    /cases/:caseId/documents
DELETE /documents/:documentId

POST   /cases/:caseId/analyze
GET    /cases/:caseId/analysis/status

GET    /cases/:caseId/analysis
GET    /cases/:caseId/conflicts
GET    /evidence/:evidenceId

GET    /cases/:caseId/timeline

GET    /cases/:caseId/questions
POST   /cases/:caseId/questions
PATCH  /questions/:questionId
DELETE /questions/:questionId

POST   /cases/:caseId/qa
POST   /cases/:caseId/brief
GET    /cases/:caseId/brief
```

Exact endpoint naming can be adapted to the existing backend conventions.

---

## 18. Mock-to-API Strategy

Frontend services should hide the data source.

```text
UI Component
     ↓
Service Function
     ↓
 ┌───┴────┐
 ▼        ▼
Mock     API
```

Example:

```text
getCase(caseId)
getDocuments(caseId)
getAnalysis(caseId)
getConflicts(caseId)
getEvidence(evidenceId)
getTimeline(caseId)
getQuestions(caseId)
generateBrief(caseId)
```

This allows the Stitch frontend to be developed before backend integration.

---

## 19. Deployment Architecture

Recommended deployment target from the product specification:

```text
GitHub
  ↓
Build
  ↓
Frontend
  ↓
Backend
  ↓
Google Cloud Run
```

The exact frontend hosting arrangement can remain separate from the FastAPI Cloud Run service if needed.

---

## 20. Architectural Principles

1. **Traceability first**
2. **Evidence before generation**
3. **Deterministic logic where possible**
4. **Neutral presentation of document differences**
5. **Server-side authorization**
6. **Minimal LLM context**
7. **Mock-first UI development**
8. **No unnecessary architecture complexity**
9. **Do not decide legal outcomes**
10. **Preserve source metadata throughout the pipeline**
