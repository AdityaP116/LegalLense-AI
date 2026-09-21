# LegalLens — Build Plan

## 1. Purpose

LegalLens is an AI legal-information and document-navigation MVP.

**Tagline:** Turn legal documents into a clear, evidence-backed brief.

The MVP proves one focused workflow:

> Situation → Documents → Understand → Connect → Verify → Conflicts/Missing Information → Timeline → Questions → Preparation Brief

LegalLens provides information and preparation assistance. It does not replace a qualified legal professional or make legal decisions for the user.

---

## 2. MVP Strategy

### Primary demo scenario

Use **Employment Dispute** as the single end-to-end demo scenario.

Example case:

> "My company asked me to resign after 8 months and I want to understand what my documents say about notice period and termination."

Demo documents:

1. Offer Letter
2. Employment Agreement
3. HR Policy
4. Termination Notice

Demo findings:

- important clauses
- obligations
- dates
- a 30-day vs 90-day notice-period difference
- a referenced but unavailable Employee Handbook/policy
- evidence locations
- timeline
- preparation questions
- final preparation brief

### Important scope decision

Do not build specialized logic for every legal category during the MVP. The UI may support the categories defined in the product specification, but Employment should be the tested end-to-end scenario.

---

## 3. What the MVP Must Do

### P0 — Must Have

- Create a case
- Capture category, situation and goals
- Upload multiple PDF/DOCX documents
- Show document processing status
- Extract important clauses, obligations, dates, amounts, entities and references
- Preserve document/page/section/clause/source-text metadata
- Compare important structured facts across documents
- Detect differences without deciding which document legally controls
- Detect referenced documents that are not uploaded
- Ask evidence-backed questions about the workspace
- Show exact evidence sources
- Build a chronological timeline
- Generate/edit/delete/mark questions
- Generate a preparation brief
- Export or present the brief for professional handoff
- Provide loading, empty and error states

### P1 — Only if time permits

- OCR for scanned documents
- More advanced document viewer features
- Additional legal categories with scenario-specific extraction
- More advanced sharing workflows

### Explicitly out of scope

- Universal legal research
- Court-outcome prediction
- Case-win prediction
- Legal-risk scoring
- Automated lawsuit filing
- Autonomous legal decisions
- Lawyer replacement
- Large legal database
- Blockchain
- Mobile app
- Voice assistant
- Complex graph database unless a real requirement appears

---

## 4. Recommended MVP Screen Reduction

The original product specification describes nine screens. For implementation, combine them into five major user-facing areas while retaining the required routes where useful.

### 1. Dashboard

- Active cases
- Start New Case
- Recent activity
- How LegalLens works

### 2. New Case

Combine:

- Situation Intake
- Document Workspace

Flow:

```text
Create Case
  ↓
Select Category
  ↓
Describe Situation
  ↓
Select Goals
  ↓
Upload Documents
  ↓
Analyze
```

### 3. Case Analysis

Combine:

- Analysis Dashboard
- Conflicts
- Missing Information
- Timeline summary
- Areas to Review

### 4. Evidence & Q&A

Combine:

- Evidence Viewer
- Source references
- Evidence-backed Q&A

Use a split layout:

```text
Document / Evidence       AI Explanation
-------------------       ----------------
Page                       Answer
Highlighted text           Evidence cards
Clause                     Source document
                           Page / clause
```

### 5. Preparation Brief

Combine:

- Questions
- Personal Legal Brief
- Professional Handoff

Actions:

- Edit questions
- Mark discussed
- Generate brief
- Download/export
- Copy summary

This reduces navigation complexity while preserving the complete demo story.

---

## 5. Phase-by-Phase Build

## Phase 1 — Foundation

### Frontend

Set up:

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React or the Stitch icon system
- global layout
- sidebar
- header
- reusable UI components

### Routes

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

### Deliverable

Every route loads with the Stitch visual structure and no dead-end navigation.

---

## Phase 2 — Core Case Flow

Build:

- case creation
- situation intake
- category selection
- goal selection
- document upload UI
- document cards
- processing states
- case navigation

### Deliverable

A user can create a case and attach 2–5 documents.

---

## Phase 3 — Mock Analysis First

Before connecting the AI/backend, make the complete UI work with centralized mock data.

Mock entities:

```text
cases
documents
clauses
evidence
conflicts
timelineEvents
questions
brief
```

Mock services should look like future API services:

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

### Deliverable

The full demo can be performed without a backend.

---

## Phase 4 — Evidence Experience

Build:

- document viewer
- page navigation
- source references
- evidence highlighting
- evidence cards
- "View Source"
- "Open Page"
- Q&A interface

Every important statement should expose:

```text
Source document
Page
Section/Clause
Source text
Evidence status
```

### Deliverable

A judge can ask a question and trace the answer back to the source.

---

## Phase 5 — Timeline and Questions

Build:

- chronological timeline
- source document/page on events
- timeline filters if supported by the UI
- generated questions
- add/edit/delete
- discussed status

Questions should originate from:

- conflicts
- missing references
- unclear clauses
- important dates
- user goals

---

## Phase 6 — Preparation Brief

Build a report containing:

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

The brief must be grounded in structured case data and must not introduce unsupported facts.

---

## Phase 7 — Backend Integration

### Backend

Use:

- Python
- FastAPI

### Authentication

Use Firebase Auth.

Flow:

```text
React
  ↓
Firebase Authentication
  ↓
Firebase ID Token
  ↓
FastAPI
  ↓
Verify Token
  ↓
Resolve User ID
  ↓
Authorize Case/Document Access
```

Do not build a second independent authentication system inside FastAPI if Firebase Auth is the selected authentication layer.

### Backend services

```text
Case Service
Document Service
Analysis Service
Evidence Service
Timeline Service
Question Service
Brief Service
```

### Deliverable

The mock service implementations can be replaced with real API calls without rewriting the UI.

---

## Phase 8 — Document Processing

Pipeline:

```text
Upload
  ↓
File Validation
  ↓
Text Extraction
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
Clause Extraction
  ↓
Entity/Date Extraction
  ↓
Reference Detection
  ↓
Evidence Store
```

### Recommended MVP priority

Start with:

- PDF
- DOCX

Add OCR after the normal text-extraction path is stable.

### Non-negotiable rule

Never lose source location.

Every important extracted fact must remain traceable to:

```text
Document → Page → Section/Clause → Source Text
```

---

## 6. AI Responsibilities

Do not use the LLM for tasks that can be deterministic.

### Prefer normal code for

- file validation
- page count
- text extraction
- page segmentation
- date sorting
- exact structured comparisons
- checking whether a referenced file exists
- database operations
- authorization

### Use the LLM for

- clause classification
- plain-language explanations
- extracting structured facts when useful
- ambiguity handling
- grounded Q&A
- question generation
- preparation-brief generation

The LLM should not decide which document is legally controlling.

---

## 7. Retrieval / RAG Plan

Use retrieval before generation.

Recommended flow:

```text
User Question
      ↓
Query Understanding
      ↓
Keyword Search + Vector Search
      ↓
Merge Results
      ↓
Metadata Filtering
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

Do not send the entire case workspace to the LLM for every question.

The LLM context should contain only relevant:

- situation context
- document chunks
- source metadata
- conflicts
- timeline events

---

## 8. Evidence Status

Use four statuses:

### FOUND DIRECTLY

The statement exists directly in uploaded evidence.

### DERIVED FROM DOCUMENTS

The statement is produced by combining multiple pieces of uploaded evidence.

### NOT FOUND

The requested information was not found in the uploaded workspace.

### NEEDS REVIEW

The documents contain conflicting or ambiguous information.

Do not use numerical legal-confidence or legal-risk scores in the MVP.

---

## 9. Conflict Detection

Use structured comparison:

```text
Extract Structured Facts
        ↓
Group by Topic
        ↓
Compare Values
        ↓
Check Source Metadata
        ↓
Detect Difference
        ↓
Generate Neutral Explanation
```

Priority fields:

- notice period
- dates
- amounts
- termination conditions
- obligations
- names/entities
- referenced policies
- defined terms

Example:

```json
{
  "topic": "notice_period",
  "sources": [
    {
      "document": "Offer Letter.pdf",
      "value": "30 days",
      "page": 2,
      "clause": "5"
    },
    {
      "document": "Employment Agreement.pdf",
      "value": "90 days",
      "page": 7,
      "clause": "12"
    }
  ],
  "status": "conflict"
}
```

UI wording:

> Information differs across the uploaded documents.

Do not automatically decide which term legally controls.

---

## 10. Missing Reference Detection

Detect references such as:

- "as per..."
- "according to..."
- "subject to..."
- "as mentioned in..."
- "under the policy..."
- "see Appendix..."
- "refer to Schedule..."

Then search the uploaded workspace.

```text
Reference Detected
       ↓
Search Workspace
       ↓
Found / Not Found
```

If unavailable:

```text
MISSING INFORMATION

Employee Handbook
Referenced in Employment Agreement
Not present in uploaded workspace
```

---

## 11. Timeline

Extract:

- date
- event
- document
- page
- description

Normalize dates where possible and sort chronologically.

Never invent dates.

If a date is unclear, mark it uncertain or ask for clarification.

---

## 12. Data Model Additions for a More Implementable MVP

The original specification includes User, Case, Document, Clause, Evidence, Conflict, ConflictEvidence, TimelineEvent, Question and Brief.

Add two implementation-oriented entities:

### DocumentChunk

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

Purpose:

- RAG retrieval
- source traceability
- efficient context selection

### AnalysisJob

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

Purpose:

- processing progress
- loading states
- retry/error handling
- preventing the UI from guessing analysis status

---

## 13. Frontend Structure

```text
src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── documents/
│   ├── evidence/
│   ├── conflicts/
│   ├── timeline/
│   ├── questions/
│   └── brief/
│
├── pages/
│   ├── Dashboard/
│   ├── SituationIntake/
│   ├── Documents/
│   ├── Analysis/
│   ├── Evidence/
│   ├── Timeline/
│   ├── Questions/
│   ├── Brief/
│   └── Handoff/
│
├── services/
│   ├── caseService.js
│   ├── documentService.js
│   ├── analysisService.js
│   ├── evidenceService.js
│   ├── timelineService.js
│   ├── questionService.js
│   └── briefService.js
│
├── data/
│   └── mockData.js
│
├── hooks/
├── utils/
├── types/
└── App.jsx
```

If the Stitch-generated project has a clean different structure, preserve it and adapt instead of rewriting unnecessarily.

---

## 14. UI/UX Rules

Stitch is the visual source of truth.

Preserve:

- layout
- spacing
- typography
- colors
- icons
- component shapes
- cards
- navigation
- responsive behavior
- visual hierarchy

The product should communicate:

**Trust → Evidence → Clarity → Preparation**

Prefer:

- Found directly
- Derived from documents
- Not found
- Needs review
- Information differs across documents
- View evidence
- Source document
- Page
- Clause

Avoid:

- Legal Risk Score
- You will win
- You should sue
- You definitely have the legal right to...
- AI lawyer

---

## 15. Loading and Error States

Loading states:

```text
Uploading documents...
Processing document...
Extracting clauses...
Identifying important dates...
Comparing documents...
Checking references...
Building timeline...
Preparing your brief...
```

Error states:

- unsupported file
- file too large
- upload failure
- OCR failure
- parsing failure
- empty document
- no relevant evidence
- AI failure
- incomplete analysis

Never silently fail.

---

## 16. Security Requirements

See `security.md` for the detailed security plan.

Minimum requirements:

- authenticate users
- authorize every case/document operation
- validate uploads
- restrict document access
- avoid unnecessary public storage URLs
- avoid logging document contents
- sanitize rendered document text
- keep secrets in environment variables
- isolate user/case data

---

## 17. Definition of Done

A feature is complete only when:

- UI matches Stitch
- route works
- loading state works
- empty state works
- error state works
- mock/API data works
- interaction works
- responsive behavior works
- no console errors
- reusable where appropriate
- source/evidence metadata is preserved

---

## 18. Demo Acceptance Test

A judge should be able to perform:

```text
Open LegalLens
      ↓
Start New Case
      ↓
Select Employment
      ↓
Describe Situation
      ↓
Upload 3–4 Documents
      ↓
Analyze
      ↓
See Extracted Information
      ↓
See Conflict
      ↓
Open Evidence
      ↓
See Exact Document/Page/Clause
      ↓
See Missing Reference
      ↓
Open Timeline
      ↓
Review Questions
      ↓
Generate Preparation Brief
      ↓
Export / Professional Handoff
```

There must be no dead-end screens.

---

## 19. MVP Success Metric

The MVP should demonstrate:

> Can a user go from "I don't understand these documents" to a structured, evidence-backed understanding of what to review and what questions to ask?

A practical demo target is:

- 1 case
- 3–4 documents
- at least 1 cross-document difference
- at least 1 missing reference
- evidence-backed Q&A
- timeline
- questions
- preparation brief

---

## 20. Engineering Priority

Build in this order:

```text
Working UI
  ↓
Mock End-to-End Flow
  ↓
Document Upload
  ↓
Text Extraction
  ↓
Structured Evidence
  ↓
Conflict / Missing Reference Logic
  ↓
Retrieval
  ↓
Grounded Q&A
  ↓
Timeline
  ↓
Questions
  ↓
Preparation Brief
  ↓
Validation
```

Core principle:

**Traceability > flashy AI**

**Evidence > unsupported generation**

**Clarity > complexity**

**Human preparation > autonomous legal decisions**
