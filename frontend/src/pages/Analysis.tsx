import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { analysisService } from "@/services/analysisService"
import { documentService } from "@/services/documentService"
import type { Conflict, Evidence, LegalDocument as DocType } from "@/types"

export function Analysis() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [documents, setDocuments] = useState<DocType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const [conflictsData, evidenceData, docsData] = await Promise.all([
        analysisService.getConflicts(id),
        analysisService.getEvidence(id),
        documentService.list(id)
      ])
      setConflicts(conflictsData)
      setEvidence(evidenceData)
      setDocuments(docsData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (caseId) {
      fetchData(caseId)
    }
  }, [caseId, fetchData])

  const getDocName = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    return doc ? doc.filename : "Unknown Document"
  }

  if (loading) {
    return <div className="p-space-xl text-center">Loading analysis data...</div>
  }

  return (
    <div className="flex flex-col w-full">
      {/* Case Context & Linear Step Stepper */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-2">
            <span className="font-citation-code text-citation-code px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold">CASE {caseId?.slice(0, 8)}</span>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Analysis Matrix</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Evidence & Conflicts</h1>
            <span className="font-body-sm text-body-sm text-on-surface-variant hidden md:inline">Ground truth cross-referencing</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg w-full items-start">
        {/* LEFT PANE: EXTRACTED EVIDENCE */}
        <div className="lg:col-span-6 flex flex-col gap-space-md min-w-0">
          <h2 className="font-headline-md text-on-surface mb-2">Extracted Evidence ({evidence.length})</h2>
          
          {evidence.length === 0 ? (
            <div className="p-space-xl text-center text-on-surface-variant border border-dashed rounded-xl border-outline-variant">
              No evidence extracted yet.
            </div>
          ) : (
            evidence.map((item, idx) => (
              <div key={idx} className="flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-md relative group">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                      <span className="font-label-md text-label-md font-semibold text-primary truncate">
                        {getDocName(item.documentId)}
                      </span>
                    </div>
                    <span className="font-citation-code text-[11px] text-primary px-1.5 py-0.5 rounded bg-primary-fixed font-bold">
                      Page {item.page} {item.section ? `· ${item.section}` : ''}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container-low shadow-inner my-1">
                    <p className="font-body-sm text-body-sm text-on-surface italic leading-snug">
                      "{item.text}"
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="font-label-sm text-label-sm text-secondary font-medium">Confidence: {((item.confidence || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANE: CONFLICTS */}
        <div className="lg:col-span-6 flex flex-col gap-space-md min-w-0">
          <h2 className="font-headline-md text-on-surface mb-2">Detected Conflicts ({conflicts.length})</h2>
          
          {conflicts.length === 0 ? (
            <div className="p-space-xl text-center text-on-surface-variant border border-dashed rounded-xl border-outline-variant">
              No conflicts detected.
            </div>
          ) : (
            conflicts.map((conflict, idx) => (
              <div key={idx} className="flex flex-col p-space-lg rounded-xl glass-panel shadow-lg gap-space-md group mb-space-md border border-error/20">
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{conflict.type || "Conflict"}</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-error font-label-sm text-label-sm font-semibold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-error inline-block animate-ping"></span>
                    <span>Conflict Detected</span>
                  </div>
                </div>
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mb-1">
                    {conflict.description}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {conflict.evidenceIds?.map((evId: string, evIdx: number) => {
                    const evData = evidence.find(e => e.id === evId)
                    return evData ? (
                      <div key={evIdx} className="flex flex-col justify-between p-4 rounded-xl bg-surface-container-low shadow-sm">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                              {getDocName(evData.documentId)}
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-surface-container-lowest shadow-xs my-1">
                            <p className="font-body-sm text-body-sm text-on-surface italic leading-snug">
                              "{evData.text}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            ))
          )}

          <div className="mt-space-2xl sticky bottom-4 z-30">
            <div className="rounded-xl bg-inverse-surface text-inverse-on-surface p-space-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end ml-auto">
                <Button onClick={() => navigate(`/case/${caseId}/timeline`)} className="h-10 px-6 gap-2 shadow-lg">
                  <span>Continue to Timeline</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
