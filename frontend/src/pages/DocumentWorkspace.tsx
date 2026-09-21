import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { documentService } from "@/services/documentService"
import { analysisService } from "@/services/analysisService"
import type { LegalDocument as DocType } from "@/types"

export function DocumentWorkspace() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [documents, setDocuments] = useState<DocType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      const docs = await documentService.list(id)
      setDocuments(docs)
    } catch (err: any) {
      setError(err.message || "Failed to load documents")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkAnalysisStatus = useCallback(async function pollStatus(id: string) {
    try {
      const status = await analysisService.getStatus(id)
      setAnalysisStatus(status)
      if (status && status.status === "processing") {
        setIsAnalyzing(true)
        setTimeout(() => pollStatus(id), 3000)
      } else if (status && status.status === "completed") {
        setIsAnalyzing(false)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    if (caseId) {
      loadDocuments(caseId)
      checkAnalysisStatus(caseId)
    }
  }, [caseId, loadDocuments, checkAnalysisStatus])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!caseId || !e.target.files || e.target.files.length === 0) return
    
    setIsUploading(true)
    setError(null)
    
    try {
      // Upload one by one or Promise.all. Doing sequential for simplicity.
      for (let i = 0; i < e.target.files.length; i++) {
        await documentService.upload(caseId, e.target.files[i])
      }
      await loadDocuments(caseId)
    } catch (err: any) {
      setError(err.message || "Failed to upload file(s)")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (docId: string) => {
    if (!caseId) return
    try {
      await documentService.delete(caseId, docId)
      await loadDocuments(caseId)
    } catch (err: any) {
      setError(err.message || "Failed to delete document")
    }
  }

  const handleAnalyze = async () => {
    if (!caseId || documents.length === 0) return
    try {
      setIsAnalyzing(true)
      await analysisService.triggerAnalysis(caseId)
      checkAnalysisStatus(caseId) // Start polling
    } catch (err: any) {
      setError(err.message || "Failed to start analysis")
      setIsAnalyzing(false)
    }
  }

  const handleNextStep = () => {
    if (!caseId) return
    navigate(`/case/${caseId}/analysis`)
  }

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none"></div>
        <div className="absolute top-80 -left-20 w-80 h-80 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col gap-space-xs pt-space-md pb-space-lg">
          <div className="flex items-center gap-space-xs">
            <span className="font-citation-code text-citation-code px-2 py-0.5 rounded bg-primary text-on-primary font-bold">STEP 02</span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">Evidentiary Ingestion Stage</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Build your legal workspace</h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-1">
                Upload all contracts, letters, policies, and emails related to your situation. LegalLens scans every page for citations, obligations, and evidentiary gaps.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-space-md p-space-md bg-error-container text-error rounded-xl border border-error/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter-lg items-start">
          <div className="xl:col-span-8 flex flex-col gap-gutter">
            <div className="group relative rounded-xl glass-panel border border-border p-space-xl text-center transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] hover:border-primary/40">
              <input 
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                type="file" 
                multiple 
                accept=".pdf,.docx"
                onChange={handleFileChange}
                disabled={isUploading || isAnalyzing}
              />
              <div className="flex flex-col items-center justify-center pointer-events-none py-space-sm">
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary transition-all duration-200">
                  <span className="material-symbols-outlined text-[28px]">
                    {isUploading ? "hourglass_empty" : "cloud_upload"}
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface mt-space-md mb-1">
                  {isUploading ? "Uploading documents..." : (
                    <>Drag & drop PDF, DOCX, or scanned documents here, or <span className="text-primary underline decoration-primary/40 underline-offset-4 font-semibold">browse files</span></>
                  )}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-lg mb-space-lg">
                  PDF, DOCX up to 50MB per file
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-md text-headline-md text-on-surface">Verified Record Corpus</span>
                <span className="font-citation-code text-citation-code px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-semibold">
                  {documents.length} items
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-md">
              {isLoading ? (
                <div className="p-space-xl text-center text-on-surface-variant">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="p-space-xl text-center text-on-surface-variant border border-dashed rounded-xl border-outline-variant">
                  No documents uploaded yet.
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="group relative rounded-xl glass-panel border border-border p-space-lg shadow-lg hover:shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:border-primary/30 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
                      <div className="flex items-start gap-space-md">
                        <div className="relative w-12 h-14 bg-surface-container rounded-lg flex flex-col items-center justify-center text-primary shadow-inner shrink-0 overflow-hidden">
                          <span className="material-symbols-outlined text-[26px]">description</span>
                          <span className="font-citation-code text-[9px] font-bold uppercase tracking-wider mt-0.5">{doc.filename.split('.').pop() || "FILE"}</span>
                          <div className="absolute bottom-0 inset-x-0 h-1 bg-secondary"></div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-headline-md text-headline-md text-on-surface hover:text-primary cursor-pointer transition-colors">{doc.filename}</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                              <span className={`w-1.5 h-1.5 rounded-full ${doc.status === 'processed' ? 'bg-secondary' : 'bg-tertiary animate-pulse'}`}></span>
                              {doc.status}
                            </span>
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 self-end md:self-start bg-surface-container-low p-1 rounded-lg z-20">
                        <button onClick={() => handleDelete(doc.id)} className="h-8 px-2 rounded hover:bg-error-container text-error transition-colors font-label-sm text-label-sm"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="xl:col-span-4 flex flex-col gap-space-lg">
            <div className="rounded-xl glass-panel border border-border p-space-lg shadow-lg">
              <div className="flex items-center justify-between pb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">troubleshoot</span>
                  <span className="font-headline-md text-headline-md text-on-surface">Analysis Engine</span>
                </div>
              </div>
              <div className="p-space-md bg-surface-container-low rounded-lg flex flex-col gap-space-md">
                {analysisStatus ? (
                  <div className="flex flex-col gap-2">
                    <span className="font-label-md font-semibold text-on-surface">Status: <span className="text-primary">{analysisStatus.status}</span></span>
                    {analysisStatus.status === "processing" && (
                      <span className="font-body-sm text-on-surface-variant animate-pulse">
                        Analyzing documents and extracting evidence...
                      </span>
                    )}
                    {analysisStatus.status === "completed" && (
                      <span className="font-body-sm text-secondary">
                        Analysis complete. Ready for review.
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="font-body-sm text-on-surface-variant">Ready to process {documents.length} documents.</span>
                )}
                
                <Button 
                  onClick={handleAnalyze} 
                  disabled={documents.length === 0 || isAnalyzing || isUploading}
                  className="w-full gap-2 shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                      Start Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-space-2xl sticky bottom-4 z-30">
          <div className="rounded-xl bg-inverse-surface text-inverse-on-surface p-space-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[20px]">folder_special</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md font-semibold text-surface-lowest">{documents.length} items total</span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
              <Button onClick={handleNextStep} disabled={!analysisStatus || analysisStatus.status !== "completed"} className="h-10 px-6 gap-2 shadow-lg">
                <span>View Analysis</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
