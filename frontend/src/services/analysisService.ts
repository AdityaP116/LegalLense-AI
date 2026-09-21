import { api } from "@/lib/api"
import type { 
  AnalysisJob, 
  AnalysisResult, 
  Evidence, 
  Conflict, 
  TimelineEvent 
} from "@/types"

export const analysisService = {
  triggerAnalysis: (caseId: string) => 
    api.post<{ jobId: string }>(`/api/cases/${caseId}/analyze`),

  getStatus: (caseId: string) => 
    api.get<AnalysisJob | null>(`/api/cases/${caseId}/analysis/status`),

  getResult: (caseId: string) => 
    api.get<AnalysisResult>(`/api/cases/${caseId}/analysis`),

  getEvidence: (caseId: string) => 
    api.get<Evidence[]>(`/api/cases/${caseId}/evidence`),

  getConflicts: (caseId: string) => 
    api.get<Conflict[]>(`/api/cases/${caseId}/conflicts`),

  getTimeline: (caseId: string) => 
    api.get<TimelineEvent[]>(`/api/cases/${caseId}/timeline`),

  generateTimeline: (caseId: string) => 
    api.post<void>(`/api/cases/${caseId}/timeline/generate`),
}
