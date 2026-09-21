import { api } from "@/lib/api"
import type { LegalDocument } from "@/types"

export const documentService = {
  upload: (caseId: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.upload<LegalDocument>(`/api/cases/${caseId}/documents`, formData)
  },
  
  list: (caseId: string) => 
    api.get<LegalDocument[]>(`/api/cases/${caseId}/documents`),
    
  get: (documentId: string) => 
    api.get<LegalDocument>(`/api/documents/${documentId}`),
    
  delete: (documentId: string) => 
    api.delete<void>(`/api/documents/${documentId}`),
    
  reprocess: (documentId: string) => 
    api.post<void>(`/api/documents/${documentId}/process`),
}
