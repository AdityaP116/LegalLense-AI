import { api } from "@/lib/api"
import type { Case, CaseCreate } from "@/types"

export const caseService = {
  create: (data: CaseCreate) => api.post<Case>("/api/cases", data),
  list: () => api.get<Case[]>("/api/cases"),
  get: (caseId: string) => api.get<Case>(`/api/cases/${caseId}`),
  update: (caseId: string, data: Partial<CaseCreate & { status: string }>) =>
    api.patch<Case>(`/api/cases/${caseId}`, data),
  delete: (caseId: string) => api.delete<void>(`/api/cases/${caseId}`),
}
