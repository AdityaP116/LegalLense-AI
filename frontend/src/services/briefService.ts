import { api } from "@/lib/api"
import type { Brief } from "@/types"

export const briefService = {
  get: (caseId: string) => 
    api.get<Brief>(`/api/cases/${caseId}/brief`),

  generate: (caseId: string) => 
    api.post<Brief>(`/api/cases/${caseId}/brief/generate`),
}
