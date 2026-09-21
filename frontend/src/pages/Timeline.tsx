import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { analysisService } from "@/services/analysisService"
import { documentService } from "@/services/documentService"
import type { TimelineEvent, LegalDocument as DocType } from "@/types"

export function Timeline() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTimeline = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      const [timelineData, docsData] = await Promise.all([
        analysisService.getTimeline(id),
        documentService.list(id)
      ])
      
      // Sort events by date
      const sortedEvents = timelineData.sort((a, b) => {
        const dateA = new Date(a.date || a.eventDate || 0).getTime()
        const dateB = new Date(b.date || b.eventDate || 0).getTime()
        return dateA - dateB
      })
      
      setTimelineEvents(sortedEvents)
    } catch (err: any) {
      setError(err.message || "Failed to load timeline")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (caseId) {
      loadTimeline(caseId)
    }
  }, [caseId, loadTimeline])

  const handleGenerateTimeline = async () => {
    if (!caseId) return
    try {
      setIsGenerating(true)
      await analysisService.generateTimeline(caseId)
      await loadTimeline(caseId)
    } catch (err: any) {
      setError(err.message || "Failed to generate timeline")
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return <div className="p-space-xl text-center">Loading timeline data...</div>
  }

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-space-lg pt-space-md pb-space-xl">
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
            <span className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1" onClick={() => navigate("/")}>
              <span className="material-symbols-outlined text-[16px]">folder</span>
              Cases
            </span>
            <span className="text-outline">/</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Case {caseId?.slice(0,8)}</span>
            <span className="text-outline">/</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold">
              <span className="font-citation-code text-citation-code text-primary">05</span>
              <span>Timeline Reconstruction</span>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
            <div className="max-w-3xl">
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Your Case Timeline</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs leading-relaxed">
                Chronological reconstruction of events extracted directly from document metadata and clause dates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm self-start xl:self-auto shrink-0">
              <Button onClick={handleGenerateTimeline} disabled={isGenerating} variant="secondary" className="gap-2 h-9 shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">sync</span>
                <span>{isGenerating ? "Generating..." : "Generate Timeline"}</span>
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mb-space-md p-space-md bg-error-container text-error rounded-xl border border-error/20">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <div className="relative pl-6 sm:pl-10 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-6 before:w-0.5 before:bg-surface-container-highest">
              
              {timelineEvents.length === 0 ? (
                 <div className="p-space-xl text-center text-on-surface-variant border border-dashed rounded-xl border-outline-variant ml-4">
                  No timeline events found. Try generating the timeline.
                 </div>
              ) : (
                timelineEvents.map((event, idx) => (
                  <div key={idx} className="group relative mb-space-2xl transition-all duration-300">
                    <div className="absolute -left-6 sm:-left-10 top-1 w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-primary transition-transform group-hover:scale-110 group-hover:bg-primary-fixed">
                      <span className="material-symbols-outlined text-[18px]">event</span>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow p-space-lg flex flex-col gap-space-md ml-4">
                      <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs">
                        <div className="flex items-center gap-space-sm flex-wrap">
                          <span className="font-citation-code text-citation-code font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-space-xs">
                        <div className="flex items-start justify-between gap-space-md">
                          <h3 className="font-headline-md text-headline-md text-on-surface">{event.description}</h3>
                        </div>
                      </div>
                      <div className="rounded-lg bg-surface-container-low p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                        <div className="flex items-center gap-space-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-primary text-[18px]">attachment</span>
                          <span className="font-citation-code text-citation-code text-on-surface font-semibold">Source Docs: {event.relatedDocumentIds.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-lg sticky top-20">
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-lg">
              <div className="flex flex-col gap-space-sm pt-space-xs">
                <Button onClick={() => navigate(`/case/${caseId}/chat`)} className="w-full h-11 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline-md text-[15px] font-semibold transition-all shadow-md flex items-center justify-center gap-2 group">
                  <span>Proceed to Chat</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Button>
                <p className="text-center font-label-sm text-label-sm text-outline">
                  Next Step: Interrogate your case data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
