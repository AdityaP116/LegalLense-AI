import { api } from "@/lib/api"
import type { ChatResponse } from "@/types"

export const chatService = {
  ask: (caseId: string, question: string) => 
    api.post<ChatResponse>(`/api/cases/${caseId}/chat`, { question }),
}
