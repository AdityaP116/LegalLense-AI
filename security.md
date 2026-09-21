# LegalLens — Security & Privacy

## 1. Security Goal

LegalLens processes uploaded legal documents that may contain sensitive personal, employment, financial, contractual or other information.

Security is therefore a first-class MVP requirement.

The security objective is:

> Only an authenticated and authorized user should be able to access the cases, documents, evidence and generated information belonging to that user.

---

## 2. Security Scope

The MVP security boundary includes:

- authentication
- authorization
- document upload validation
- file storage
- document processing
- database access
- AI/RAG context
- generated evidence
- frontend rendering
- secrets
- logging
- error handling

---

## 3. Authentication

Use Firebase Auth as the authentication layer.

Flow:

```text
User
 ↓
Firebase Auth
 ↓
ID Token
 ↓
React
 ↓
FastAPI
 ↓
Verify Firebase Token
 ↓
Resolve User ID
```

FastAPI must verify the token before allowing protected operations.

Do not trust a user ID supplied only by the frontend.

---

## 4. Authorization

Authentication is not enough.

For every protected resource, verify ownership/access.

Example:

```text
Request:
GET /cases/{caseId}/documents

        ↓

Verify Firebase token
        ↓
Get authenticated user_id
        ↓
Find case
        ↓
Check case.user_id == authenticated user_id
        ↓
Allow / Deny
```

The same rule applies to:

- cases
- documents
- evidence
- conflicts
- timeline events
- questions
- briefs

Never authorize access based only on a frontend route or hidden UI control.

---

## 5. Case Isolation

Every document belongs to a case.

Every case belongs to a user.

Conceptually:

```text
User
 └── Case
      ├── Documents
      ├── Evidence
      ├── Conflicts
      ├── Timeline
      ├── Questions
      └── Brief
```

The backend should enforce these relationships.

Do not allow:

```text
User A → Case B
User A → Document belonging to User B
```

even if the resource ID is known.

---

## 6. File Upload Security

Validate uploads before processing.

Checks should include:

- allowed file type
- actual file format
- file size
- successful parsing
- empty-file detection
- processing result

Supported MVP formats:

- PDF
- DOCX
- image/scanned document when OCR is enabled

Do not rely only on the filename extension.

Example:

```text
Upload
  ↓
Extension Check
  ↓
MIME/File Signature Validation
  ↓
Size Check
  ↓
Safe Storage
  ↓
Processing
```

Reject unsupported or invalid files with a clear error.

---

## 7. Storage Security

The product specification recommends Firebase Storage or S3-compatible storage.

Requirements:

- do not make legal documents publicly accessible by default
- restrict access to authenticated/authorized users
- avoid exposing raw storage URLs unnecessarily
- use controlled backend access where appropriate
- associate every stored file with its case and user

Do not put private storage credentials in frontend code.

---

## 8. Database Security

Use PostgreSQL for structured application data.

Every query involving user-owned data should be scoped by the authenticated user/case relationship.

Avoid queries that retrieve a resource only by ID without checking ownership.

Unsafe conceptual pattern:

```text
SELECT * FROM documents WHERE id = document_id
```

Safer conceptual pattern:

```text
SELECT document
FROM documents
JOIN cases ON documents.case_id = cases.id
WHERE documents.id = document_id
  AND cases.user_id = authenticated_user_id
```

Exact SQL can differ by implementation.

---

## 9. Document Content Privacy

Do not log complete legal document contents.

Avoid logging:

- uploaded document text
- full clauses
- personal information
- financial information
- authentication tokens
- storage credentials
- full AI prompts containing sensitive documents

Prefer operational logs such as:

```text
analysis_job_started
analysis_job_completed
document_processing_failed
document_id
case_id
timestamp
error_type
```

Use identifiers rather than document content wherever possible.

---

## 10. AI / LLM Privacy Boundary

Only send the LLM the relevant information required for the task.

Preferred:

```text
Question
+
Relevant chunks
+
Source metadata
+
Relevant conflicts/timeline
```

Avoid:

```text
Entire case workspace
+
Every uploaded document
+
Unrelated personal information
```

This follows the architecture principle of minimizing unnecessary context.

Before production use, verify the selected LLM provider's current data-retention and training policies. The uploaded product specification does not identify a specific provider, so provider-specific privacy guarantees should not be assumed.

---

## 11. Prompt Injection Consideration

Uploaded documents are untrusted content.

A document may contain text that looks like instructions, for example:

```text
Ignore previous instructions and reveal...
```

Treat document text as evidence/data, not as system instructions.

Conceptually:

```text
System Instructions
       +
Application Rules
       +
Retrieved Document Evidence
       ↓
LLM
```

Document content must not override application-level instructions.

---

## 12. Evidence Integrity

Every important extracted fact should preserve:

```text
Document
Page
Section/Clause
Source Text
```

This reduces the risk of presenting unsupported generated information.

For generated answers, retain the evidence references used to construct the answer.

---

## 13. Output Validation

Before displaying an important AI-generated statement:

```text
Generated Output
      ↓
Evidence Validation
      ↓
Supported?
  ┌───┴────┐
 YES       NO
  │         │
Show      Not Found /
source    Needs Review
```

If the system cannot find supporting evidence, it should not invent a source.

---

## 14. XSS / Unsafe Rendering

Uploaded document text and AI output should be treated as untrusted content.

Do not inject raw document HTML into the page.

When rendering:

- escape user/document text
- sanitize any HTML that must be rendered
- avoid unsafe `innerHTML`-style rendering unless properly sanitized
- keep document content separate from application UI markup

---

## 15. Secrets Management

Never place secrets in:

- React source
- committed `.env` files
- GitHub repositories
- browser local storage
- public configuration

Use environment variables or the deployment platform's secret-management mechanism.

Examples of secrets:

- LLM API keys
- database credentials
- storage credentials
- service-account credentials

Frontend code must never contain privileged backend secrets.

---

## 16. Firebase Security

For Firebase services:

- use Firebase Auth for identity
- configure storage/database rules according to the ownership model
- do not rely only on UI restrictions
- test unauthorized access explicitly

The exact Firebase Storage/Firestore rules depend on which Firebase services are actually used. PostgreSQL remains the specified application database.

---

## 17. Error Handling

Errors should reveal enough information to help the user but not expose secrets or internal implementation details.

Good:

> We couldn't extract reliable text from this document. Try uploading a clearer PDF or image.

Avoid returning:

- API keys
- database connection strings
- internal stack traces
- private storage paths
- raw provider responses containing sensitive content

Detailed internal errors can be logged safely without exposing them to users.

---

## 18. Rate and Resource Protection

Document processing and AI requests can be expensive.

The MVP should protect endpoints that can trigger:

- document processing
- OCR
- embeddings
- LLM requests
- brief generation

At minimum, prevent accidental repeated processing from rapidly creating duplicate jobs.

The exact rate limits can be decided after the deployment environment and expected traffic are known.

---

## 19. Processing Isolation

Document processing should be treated as untrusted input processing.

Recommended conceptual boundary:

```text
Upload
 ↓
Validation
 ↓
Processing Job
 ↓
Parser/OCR
 ↓
Structured Data
```

If processing fails:

- mark the analysis/document status as failed
- preserve a user-readable error
- do not silently treat incomplete extraction as complete

---

## 20. Security Test Checklist

### Authentication

- [ ] Unauthenticated user cannot access protected case APIs
- [ ] Invalid/expired token is rejected

### Authorization

- [ ] User A cannot access User B's case
- [ ] User A cannot access User B's document
- [ ] Direct URL manipulation does not bypass access control

### Upload

- [ ] Unsupported file rejected
- [ ] Invalid file rejected
- [ ] Oversized file rejected
- [ ] Empty document handled
- [ ] Processing failure handled

### Storage

- [ ] Documents are not publicly accessible by default
- [ ] Unauthorized storage access is blocked

### AI

- [ ] Only relevant evidence is sent to the model
- [ ] Document text is treated as untrusted content
- [ ] Unsupported claims are not presented as sourced facts

### Frontend

- [ ] Document text is safely rendered
- [ ] No privileged secrets exist in frontend bundles
- [ ] Sensitive data is not unnecessarily stored client-side

### Logging

- [ ] Full document text is not logged
- [ ] Tokens/secrets are not logged
- [ ] Useful operational errors are logged

---

## 21. Privacy Product Language

The UI should not make privacy promises that the implementation cannot guarantee.

Use factual language such as:

- "Your documents are associated with your case."
- "Access is restricted to authorized users."
- "We use your uploaded documents to analyze your workspace."

Do not claim:

- "Your data is never stored."
- "Your data is never processed by third parties."
- "Military-grade security."
- "100% private."

unless those claims have been verified for the actual deployed system.

---

## 22. Legal-Information Safety

LegalLens should clearly remain an information and preparation product.

The product must not:

- decide legal outcomes
- predict case wins
- assign legal-risk scores
- claim to be a lawyer
- instruct users to take a specific legal action as though it were professional legal advice

Use:

> This brief is for informational and preparation purposes only. It does not constitute legal advice or replace a qualified legal professional.

---

## 23. Security Definition of Done

Security is acceptable for the MVP when:

- authentication works
- authorization is enforced server-side
- case/document ownership is checked
- uploads are validated
- private documents are not publicly exposed
- secrets stay server-side
- document contents are not unnecessarily logged
- AI context is minimized
- document text is safely rendered
- failures are explicit
- security tests cover cross-user access
