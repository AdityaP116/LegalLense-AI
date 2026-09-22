import { api } from "@/lib/api"
import type { Question } from "@/types"

export const questionService = {
  list: (caseId: string) => 
    api.get<Question[]>(`/api/cases/${caseId}/questions`),

  create: (caseId: string, data: { question: string; category?: string; rationale?: string }) => 
    api.post<Question>(`/api/cases/${caseId}/questions`, data),

  update: (caseId: string, questionId: string, data: Partial<Question>) => 
    api.patch<Question>(`/api/questions/${questionId}?case_id=${caseId}`, data),

  delete: (caseId: string, questionId: string) => 
    api.delete<void>(`/api/questions/${questionId}?case_id=${caseId}`),

  generate: (caseId: string) => 
    api.post<Question[]>(`/api/cases/${caseId}/questions/generate`),
}
