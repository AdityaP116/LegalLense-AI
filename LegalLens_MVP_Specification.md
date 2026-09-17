# LegalLens MVP --- Product & Engineering Specification

## 1. Product Definition

**Product:** LegalLens\
**Category:** AI Legal Information & Document Navigation\
**Tagline:** Turn legal documents into a clear, evidence-backed brief.

### Core promise

LegalLens helps a person understand their own legal documents by
combining:

-   their situation/context
-   multiple uploaded legal documents
-   extracted clauses, obligations, entities and dates
-   cross-document comparisons
-   conflicts and missing references
-   a traceable timeline
-   evidence-backed questions and answers
-   a personal legal preparation brief

LegalLens provides information and preparation assistance. It does
**not** replace a qualified legal professional or make legal decisions
for the user.

### Core product loop

``` text
Situation
   ↓
Documents
   ↓
Understand
   ↓
Connect
   ↓
Verify
   ↓
Find Conflicts & Missing Information
   ↓
Build Timeline
   ↓
Prepare Questions
   ↓
Generate Legal Preparation Brief
   ↓
Professional Handoff
```

------------------------------------------------------------------------

# 2. MVP Goal

The MVP must prove one clear idea:

> A user can describe a legal situation, upload multiple related
> documents, understand what those documents contain, discover
> conflicting or missing information, trace important statements back to
> evidence, and leave with a structured preparation brief.

The MVP is **not** intended to be a universal legal research engine.

## Primary demo scenario

Use **Employment Dispute** as the first end-to-end scenario.

Example:

> "My company asked me to resign after 8 months and I want to understand
> what my documents say about notice period and termination."

Documents:

-   Offer Letter.pdf
-   Employment Agreement.pdf
-   HR Policy.pdf
-   Termination Notice.pdf

Example conflict:

-   Offer Letter → Notice Period → 30 days → Page 2 → Clause 5
-   Employment Agreement → Notice Period → 90 days → Page 7 → Clause 12

Example missing reference:

-   Employment Agreement references an Employee Handbook
-   Employee Handbook is not present in the workspace

------------------------------------------------------------------------

# 3. MVP Scope

## P0 --- Must Have

### A. Case/Situation Intake

User can:

-   create a new case
-   select a category
-   describe their situation
-   select what they want to understand

Categories:

-   Employment
-   Rental / Housing
-   Business Contract
-   Consumer Issue
-   Finance
-   Insurance
-   Other

Goals:

-   Understand my obligations
-   Find important dates
-   Compare documents
-   Find conflicting information
-   Prepare questions for a professional

------------------------------------------------------------------------

### B. Multi-Document Workspace

User can:

-   upload multiple files
-   see uploaded documents
-   remove documents
-   see processing status
-   open a document
-   start analysis

MVP-supported formats:

-   PDF
-   DOCX
-   image/scanned document if OCR is available

Target:

**2--5 documents per case for the hackathon MVP.**

------------------------------------------------------------------------

### C. Document Understanding

Extract:

-   important clauses
-   obligations
-   dates
-   amounts
-   parties/entities
-   referenced documents
-   important events

Every extracted item should retain source metadata.

Example:

``` json
{
  "claim": "Notice period is 90 days",
  "document": "Employment Agreement.pdf",
  "page": 7,
  "section": "Clause 12",
  "evidence": "..."
}
```

------------------------------------------------------------------------

### D. Cross-Document Conflict Detection

Compare important structured information across documents.

Priority comparison fields:

-   notice period
-   dates
-   amounts
-   termination conditions
-   obligations
-   names/entities
-   referenced policies
-   defined terms

Output:

``` text
CONFLICT FOUND

Offer Letter
30 days
Page 2 · Clause 5

Employment Agreement
90 days
Page 7 · Clause 12
```

Do not decide which document is legally controlling.

------------------------------------------------------------------------

### E. Missing Information Detection

Detect references to documents/information that are not available.

Example:

``` text
Employment Agreement:
“As per the Employee Handbook...”

Workspace:
Employee Handbook not found

Result:
Missing Reference
```

The UI should clearly say:

> This referenced document was not found in the uploaded workspace.

------------------------------------------------------------------------

### F. Evidence-Backed Q&A

User can ask questions about the uploaded workspace.

Example:

**Question**

> What is my notice period?

**Answer**

> Two different notice periods appear in your uploaded documents.

**Evidence**

Offer Letter\
Page 2 · Clause 5\
30 days

Employment Agreement\
Page 7 · Clause 12\
90 days

The system must prefer uploaded evidence over unsupported generation.

If evidence is unavailable:

> I couldn't find this information in the uploaded documents.

------------------------------------------------------------------------

### G. Timeline

Extract dated events and order them chronologically.

Example:

``` text
12 Jan 2026
Offer Letter Issued

20 Jan 2026
Employment Started

15 Aug 2026
Performance Review

28 Aug 2026
Resignation Requested

30 Aug 2026
Termination Notice Received
```

Each event should retain its source.

------------------------------------------------------------------------

### H. Questions to Prepare

Generate questions based on:

-   conflicts
-   missing information
-   unclear clauses
-   important dates
-   user's stated goal

Example:

-   Which notice period is referenced in the latest employment
    agreement?
-   What document governs if two uploaded documents contain different
    information?
-   Is the referenced HR policy available?
-   Which dates should I confirm with a legal professional?

User can:

-   add question
-   edit question
-   delete question
-   mark discussed
-   export

------------------------------------------------------------------------

### I. Personal Legal Preparation Brief

Generate:

1.  Situation
2.  Documents Reviewed
3.  Key Facts Found
4.  Important Obligations
5.  Important Dates
6.  Areas to Review
7.  Conflicting Information
8.  Missing Information
9.  Questions for a Legal Professional
10. Evidence Sources

Disclaimer:

> This brief is for informational and preparation purposes only. It does
> not constitute legal advice or replace a qualified legal professional.

------------------------------------------------------------------------

# 4. MVP Screens

## Screen 1 --- Dashboard

Purpose:

Give the user a clear starting point and show active cases.

Components:

-   sidebar
-   header
-   Start New Case
-   Upload Documents
-   active case cards
-   recent activity
-   how LegalLens works

Navigation:

``` text
Dashboard
My Cases
Documents
Analysis
Timeline
Questions
Briefs
Settings
```

------------------------------------------------------------------------

## Screen 2 --- Situation Intake

Title:

**What are you trying to understand?**

Components:

-   category selector
-   situation textarea
-   goal selector
-   Continue button

The user's situation becomes the context for downstream analysis.

------------------------------------------------------------------------

## Screen 3 --- Document Workspace

Title:

**Build your legal workspace**

Components:

-   drag/drop upload area
-   document list
-   processing indicators
-   file metadata
-   remove action
-   Analyze Documents button

------------------------------------------------------------------------

## Screen 4 --- Analysis Dashboard

Header:

**Employment Dispute**

Context:

**Your situation + 4 connected documents**

Stats:

-   Documents
-   Key Clauses
-   Obligations
-   Important Dates
-   Conflicts
-   Missing References

Sections:

### Areas to Review

Example:

-   Notice Period
-   Termination Conditions
-   Leave & Benefits

### Conflicts Found

Show side-by-side evidence.

### Missing Information

Show referenced but unavailable documents.

------------------------------------------------------------------------

## Screen 5 --- Evidence Viewer

Use a split-screen layout.

### Left

Document viewer:

-   document name
-   page number
-   page navigation
-   zoom if supported
-   highlighted evidence

### Right

AI explanation:

-   answer
-   evidence cards
-   source document
-   page
-   clause
-   View Source
-   Open Page
-   Ask Follow-up

------------------------------------------------------------------------

## Screen 6 --- Timeline

Show:

-   chronological events
-   source document
-   page
-   event filters

------------------------------------------------------------------------

## Screen 7 --- Questions

Show:

-   generated questions
-   categories
-   add/edit/delete
-   discussed state
-   export

------------------------------------------------------------------------

## Screen 8 --- Personal Legal Brief

Report-style interface.

Sections:

-   Situation
-   Documents Reviewed
-   Key Facts
-   Obligations
-   Important Dates
-   Areas to Review
-   Missing Information
-   Questions
-   Evidence Sources

Actions:

-   Download
-   Share
-   Continue Reviewing

------------------------------------------------------------------------

## Screen 9 --- Professional Handoff

Show a compact final summary.

Sections:

-   situation
-   key facts
-   documents
-   dates
-   conflicts
-   missing information
-   questions

Actions:

-   Export Preparation Brief
-   Copy Summary

------------------------------------------------------------------------

# 5. Recommended Technology

## Frontend

-   React
-   Vite
-   Tailwind CSS
-   React Router
-   Lucide React or the icon system used by the Stitch design

## Backend

-   Python
-   FastAPI

## Database

-   PostgreSQL
-   pgvector

## Authentication

-   Firebase Auth

## File Storage

-   Firebase Storage or S3-compatible storage

## Document Processing

-   PyMuPDF
-   python-docx
-   OCR/Tesseract for scanned documents

## AI

-   LLM API
-   embedding model
-   RAG pipeline

## Deployment

-   Google Cloud Run

## Version Control

-   GitHub

------------------------------------------------------------------------

# 6. Architecture

``` text
                         USER
                           ↓
                 ┌──────────────────┐
                 │   React + Vite   │
                 │  Tailwind UI     │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │  FastAPI Backend │
                 └────────┬─────────┘
                          ↓
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
   Document Service   Case Service    AI Service
          ↓               ↓                ↓
   PDF/DOCX/OCR       PostgreSQL      LLM + RAG
          ↓               ↓                ↓
          └───────────────┼────────────────┘
                          ↓
                Structured Evidence
                          ↓
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
      Retrieval       Comparison        Timeline
          ↓               ↓                ↓
          └───────────────┼────────────────┘
                          ↓
                  Evidence Validator
                          ↓
               ┌──────────┴──────────┐
               ↓                     ↓
          Q&A Response        Preparation Brief
```

------------------------------------------------------------------------

# 7. Data Model

Use a relational structure.

## User

``` text
id
name
email
created_at
```

## Case

``` text
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

## Document

``` text
id
case_id
filename
document_type
storage_url
page_count
processing_status
created_at
```

## Clause

``` text
id
document_id
clause_number
title
text
page
clause_type
```

## Evidence

``` text
id
document_id
clause_id
page
text
evidence_type
```

## Conflict

``` text
id
case_id
topic
description
severity_label
status
```

## ConflictEvidence

``` text
id
conflict_id
evidence_id
```

## TimelineEvent

``` text
id
case_id
event_date
title
description
document_id
page
```

## Question

``` text
id
case_id
question
category
status
```

## Brief

``` text
id
case_id
content
created_at
```

------------------------------------------------------------------------

# 8. Document Processing Pipeline

``` text
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

Important rule:

**Never lose the source location of extracted information.**

Every important extracted fact must be traceable to:

``` text
Document
→ Page
→ Section/Clause
→ Source Text
```

------------------------------------------------------------------------

# 9. RAG Design

Use retrieval before generation.

``` text
User Question
      ↓
Query Understanding
      ↓
Vector + Metadata Retrieval
      ↓
Relevant Evidence
      ↓
Cross-Document Check
      ↓
LLM
      ↓
Evidence Validation
      ↓
Answer + Sources
```

The LLM should receive:

-   user situation
-   relevant document chunks
-   source metadata
-   relevant conflicts
-   relevant timeline events

Do not send the entire workspace unnecessarily.

------------------------------------------------------------------------

# 10. Evidence Status System

Every important statement should have one of these statuses:

### FOUND DIRECTLY

The statement exists directly in the document.

### DERIVED FROM DOCUMENTS

The statement is derived by combining evidence from multiple documents.

### NOT FOUND

The information was not found in the uploaded workspace.

### NEEDS REVIEW

The uploaded documents contain conflicting or ambiguous information.

Avoid numerical confidence or legal-risk scores in the MVP.

------------------------------------------------------------------------

# 11. Conflict Detection Logic

The MVP does not need a complicated legal reasoning engine.

Use a structured comparison pipeline:

``` text
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

Example:

``` json
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

The system should report:

> Information differs across the uploaded documents.

It should not automatically determine which term legally controls.

------------------------------------------------------------------------

# 12. Missing Reference Detection

Detect phrases such as:

-   "as per..."
-   "according to..."
-   "subject to..."
-   "as mentioned in..."
-   "under the policy..."
-   "see Appendix..."
-   "refer to Schedule..."

Then search the uploaded workspace for the referenced item.

Output:

``` text
Reference detected
       ↓
Search workspace
       ↓
Found / Not Found
```

If not found:

``` text
MISSING INFORMATION

Employee Handbook
Referenced in Employment Agreement
Not present in uploaded workspace
```

------------------------------------------------------------------------

# 13. Timeline Extraction

Extract:

-   date
-   event
-   document
-   page
-   description

Normalize dates where possible.

Then sort chronologically.

Do not invent dates.

If a date is unclear, display it as uncertain or ask the user for
clarification.

------------------------------------------------------------------------

# 14. Brief Generation

Brief generation should be grounded in structured case data.

``` text
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
Preparation Brief
```

The brief should not introduce unsupported facts.

Each major factual section should retain source references.

------------------------------------------------------------------------

# 15. Frontend Architecture

Recommended:

``` text
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

If the Stitch-generated frontend has a different structure, preserve the
existing structure where it is clean and adapt this architecture rather
than rewriting unnecessarily.

------------------------------------------------------------------------

# 16. Routing

Recommended:

``` text
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

Use route parameters.

Do not hardcode a single case into the UI.

------------------------------------------------------------------------

# 17. Mock Data Strategy

Until APIs are ready, use centralized mock data.

Do not put fake data directly inside components.

Example:

``` text
mockData
├── cases
├── documents
├── clauses
├── evidence
├── conflicts
├── timelineEvents
├── questions
└── brief
```

Mock services should behave like future API services.

Example:

``` text
getCase(caseId)
getDocuments(caseId)
getAnalysis(caseId)
getConflicts(caseId)
getEvidence(evidenceId)
getTimeline(caseId)
getQuestions(caseId)
generateBrief(caseId)
```

Later replace the implementation without changing UI components.

------------------------------------------------------------------------

# 18. UI/UX Principles

The Stitch design is the visual source of truth.

Do not redesign it during implementation.

Preserve:

-   layout
-   spacing
-   typography
-   colors
-   icons
-   component shapes
-   cards
-   navigation
-   responsive behavior
-   visual hierarchy

The UI should communicate:

**Trust → Evidence → Clarity → Preparation**

Important UI language:

Use:

-   Found directly
-   Derived from documents
-   Not found
-   Needs review
-   Information differs across documents
-   View evidence
-   Source document
-   Page
-   Clause

Avoid:

-   Legal Risk Score 92/100
-   You will win
-   You should sue
-   You definitely have the legal right to...
-   AI lawyer

------------------------------------------------------------------------

# 19. Loading States

Implement realistic states:

``` text
Uploading documents...
Processing document...
Extracting clauses...
Identifying important dates...
Comparing documents...
Checking references...
Building timeline...
Preparing your brief...
```

Use skeletons/spinners according to the Stitch design.

------------------------------------------------------------------------

# 20. Error Handling

Handle:

-   unsupported file
-   file too large
-   upload failure
-   OCR failure
-   document parsing failure
-   empty document
-   no relevant evidence
-   AI service failure
-   incomplete analysis

Never silently fail.

Example:

> We couldn't extract reliable text from this document. Try uploading a
> clearer PDF or image.

------------------------------------------------------------------------

# 21. Security & Privacy

For the MVP:

-   authenticate users
-   associate documents with the correct case/user
-   validate uploads
-   restrict document access
-   do not expose storage URLs unnecessarily
-   avoid logging document contents
-   sanitize rendered document text
-   never place secrets in frontend code
-   use environment variables for API keys

Legal documents can contain sensitive information, so privacy must be
treated as a first-class requirement.

------------------------------------------------------------------------

# 22. What NOT to Build

Do not expand the MVP into:

-   universal legal research
-   court outcome prediction
-   case-win prediction
-   legal-risk scoring
-   automated lawsuit filing
-   autonomous legal decision-making
-   lawyer replacement
-   huge legal database
-   50 legal categories
-   blockchain
-   mobile app
-   voice assistant
-   complex graph database unless genuinely required

The MVP must remain focused.

------------------------------------------------------------------------

# 23. Implementation Phases

## Phase 1 --- Foundation

Build:

-   React/Vite
-   Tailwind
-   routing
-   global layout
-   Stitch design system
-   sidebar
-   header
-   reusable UI components

Deliverable:

All routes accessible with correct visual structure.

------------------------------------------------------------------------

## Phase 2 --- Core Case Flow

Build:

-   dashboard
-   situation intake
-   case creation
-   document workspace
-   upload UI
-   document cards

Deliverable:

User can create a case and add documents.

------------------------------------------------------------------------

## Phase 3 --- Analysis UI

Build:

-   analysis dashboard
-   areas to review
-   conflicts
-   missing information
-   statistics
-   evidence cards

Use mock analysis data first.

Deliverable:

The core LegalLens value proposition is visible.

------------------------------------------------------------------------

## Phase 4 --- Evidence Experience

Build:

-   document viewer
-   source references
-   page navigation
-   evidence highlighting
-   Q&A interface

Deliverable:

User can ask a question and trace the answer to evidence.

------------------------------------------------------------------------

## Phase 5 --- Timeline + Questions

Build:

-   timeline
-   filters
-   questions
-   add/edit/delete
-   preparation workflow

------------------------------------------------------------------------

## Phase 6 --- Brief

Build:

-   brief generation UI
-   report view
-   export
-   professional handoff

------------------------------------------------------------------------

## Phase 7 --- Backend Integration

Connect:

-   authentication
-   document upload
-   document processing
-   extraction
-   embeddings
-   retrieval
-   conflict detection
-   timeline generation
-   Q&A
-   brief generation

------------------------------------------------------------------------

## Phase 8 --- Validation

Test:

-   complete user journey
-   multiple documents
-   conflicting clauses
-   missing references
-   no-evidence questions
-   loading states
-   error states
-   mobile responsiveness
-   browser console
-   API failures

------------------------------------------------------------------------

# 24. Demo Acceptance Criteria

The MVP is complete when a judge can perform this flow:

``` text
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

The entire flow should work without dead-end screens.

------------------------------------------------------------------------

# 25. Definition of Done

A feature is done only when:

-   UI matches Stitch design
-   route works
-   loading state works
-   empty state works
-   error state works
-   mock/API data works
-   interaction works
-   responsive behavior works
-   no console errors
-   component is reusable where appropriate
-   source/evidence metadata is preserved where applicable

------------------------------------------------------------------------

# 26. Hackathon Demo Story

Use a single compelling scenario.

### User

An employee who was asked to resign after 8 months.

### Documents

1.  Offer Letter
2.  Employment Agreement
3.  HR Policy
4.  Termination Notice

### Demo

The user describes the situation.

LegalLens processes the documents.

It identifies:

-   important clauses
-   notice periods
-   dates
-   obligations
-   a 30-day vs 90-day information conflict
-   a missing referenced policy

The user opens the evidence.

LegalLens shows the exact documents, pages and clauses.

The timeline reconstructs the important events.

The system generates questions for a professional.

Finally, LegalLens produces a Personal Legal Preparation Brief.

### Demo message

> "We don't tell people what legal decision to make. We help them
> understand what their documents say, identify what needs attention,
> and prepare for the right professional conversation."

------------------------------------------------------------------------

# 27. Product Differentiation

Do not position LegalLens as:

> "An AI chatbot for legal documents."

Position it as:

> **"A situation-aware legal information workspace that connects a
> person's situation with multiple documents, evidence, conflicts,
> missing information and a preparation brief."**

The key differentiation is:

``` text
Traditional Document AI
Document → Summary

Generic Legal Chatbot
Question → AI Answer

LegalLens
Situation
   ↓
Multiple Documents
   ↓
Structured Evidence
   ↓
Cross-Document Connections
   ↓
Conflicts + Missing Information
   ↓
Timeline
   ↓
Questions
   ↓
Preparation Brief
```

------------------------------------------------------------------------

# 28. Engineering Principle

Build the MVP around one rule:

> **Every important AI-generated statement should be explainable by
> showing where the information came from.**

The system should optimize for:

**Traceability \> flashy AI**

**Evidence \> unsupported generation**

**Clarity \> complexity**

**Human preparation \> autonomous legal decisions**

------------------------------------------------------------------------

# 29. Final MVP Architecture

``` text
                    ┌───────────────────┐
                    │       USER        │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │   LEGALLENS WEB   │
                    │ React + Tailwind  │
                    └─────────┬─────────┘
                              ↓
                    ┌───────────────────┐
                    │      FastAPI      │
                    └─────────┬─────────┘
                              ↓
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
        CASE ENGINE      DOCUMENT ENGINE    AI ENGINE
             ↓                ↓                ↓
        Case Context     PDF/DOCX/OCR      RAG + LLM
                              ↓                ↓
                         Extraction      Retrieval
                              ↓                ↓
                         Evidence Store ───────┘
                              ↓
                  ┌───────────┼───────────┐
                  ↓           ↓           ↓
             Comparison    Timeline    Questions
                  ↓           ↓           ↓
                  └───────────┼───────────┘
                              ↓
                    Evidence Validator
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
              Evidence Q&A       Preparation Brief
                    ↓                   ↓
                    └─────────┬─────────┘
                              ↓
                    PROFESSIONAL HANDOFF
```

------------------------------------------------------------------------

# 30. Success Metric for the MVP

The MVP should demonstrate one measurable outcome:

> **Can a user go from "I don't understand these documents" to a
> structured, evidence-backed understanding of what to review and what
> questions to ask?**

If yes, the MVP has successfully demonstrated the core LegalLens
concept.
