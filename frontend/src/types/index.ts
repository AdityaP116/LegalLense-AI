// Shared TypeScript types matching the backend Pydantic schemas

// ── Cases ──────────────────────────────────────────────────────────────────
export interface Case {
  id: string
  userId: string
  title: string
  category: string
  situation: string
  goals: string[]
  status: "active" | "archived" | "completed"
  createdAt: string
  updatedAt: string
}

export interface CaseCreate {
  title: string
  category: string
  situation: string
  goals?: string[]
}

// ── Documents ──────────────────────────────────────────────────────────────
export type ProcessingStatus = "uploaded" | "processing" | "completed" | "failed"

export interface LegalDocument {
  id: string
  caseId: string
  filename: string
  documentType: string
  storagePath: string
  mimeType: string
  fileSize: number
  pageCount: number | null
  processingStatus: ProcessingStatus
  processingError: string | null
  createdAt: string
  updatedAt: string
}

// ── Analysis ───────────────────────────────────────────────────────────────
export type JobStatus = "pending" | "processing" | "completed" | "failed"

export interface AnalysisJob {
  id: string
  caseId: string
  status: JobStatus
  progress: number
  currentStep: string
  error: string | null
  createdAt: string
  completedAt: string | null
}

export interface AnalysisResult {
  caseId: string
  documentsAnalyzed: number
  clausesExtracted: number
  conflictsFound: number
  missingReferences: number
  timelineEvents: number
  latestJobId: string | null
}

// ── Evidence ───────────────────────────────────────────────────────────────
export type EvidenceStatus =
  | "FOUND_DIRECTLY"
  | "DERIVED_FROM_DOCUMENTS"
  | "NOT_FOUND"
  | "NEEDS_REVIEW"

export interface Evidence {
  id: string
  caseId: string
  documentId: string
  documentName?: string
  page?: number
  section?: string
  text: string
  evidenceType: string
  status: EvidenceStatus
  topic?: string
  confidence?: number
  createdAt: string
}

// ── Conflicts ──────────────────────────────────────────────────────────────
export interface ConflictEvidence {
  documentId: string
  documentName?: string
  page?: number
  section?: string
  text: string
}

export interface Conflict {
  id: string
  caseId: string
  topic: string
  description: string
  status: "needs_review" | "reviewed" | "resolved"
  evidence: ConflictEvidence[]
  type?: string
  evidenceIds?: string[]
  createdAt: string
}

// ── Timeline ───────────────────────────────────────────────────────────────
export interface TimelineEvent {
  id: string
  caseId: string
  eventDate: string | null
  date?: string
  title: string
  description: string
  documentId?: string
  documentName?: string
  relatedDocumentIds?: string[]
  page?: number
  status: "confirmed" | "derived" | "needs_review"
  createdAt: string
}

// ── Questions ──────────────────────────────────────────────────────────────
export interface QuestionSource {
  documentId: string
  documentName?: string
  page?: number
  section?: string
  text: string
}

export interface Question {
  id: string
  caseId: string
  question: string
  category?: string
  rationale?: string
  status: "open" | "discussed" | "resolved"
  sources: QuestionSource[]
  origin: "generated" | "user_added"
  createdAt: string
  updatedAt: string
}

// ── Chat ───────────────────────────────────────────────────────────────────
export interface ChatSource {
  documentId: string
  filename: string
  page?: number
  section?: string
  text: string
}

export interface ChatResponse {
  answer: string
  status: EvidenceStatus
  sources: ChatSource[]
}

// ── Brief ──────────────────────────────────────────────────────────────────
export interface BriefSection {
  title: string
  content: string
  sources: Record<string, unknown>[]
}

export interface Brief {
  id: string
  caseId: string
  sections: BriefSection[]
  summary?: string
  disclaimer: string
  generatedAt: string
}
