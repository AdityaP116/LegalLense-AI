import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { briefService } from "@/services/briefService"
import { questionService } from "@/services/questionService"
import type { Brief, Question } from "@/types"

export function Briefs() {
  const { caseId } = useParams<{ caseId: string }>()
  
  const [brief, setBrief] = useState<Brief | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const [briefData, questionsData] = await Promise.all([
        briefService.get(id).catch(() => null),
        questionService.list(id)
      ])
      
      setBrief(briefData)
      setQuestions(questionsData.filter(q => q.status === "open"))
    } catch (err: any) {
      setError(err.message || "Failed to load brief data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (caseId) {
      loadData(caseId)
    }
  }, [caseId, loadData])

  const handleGenerateBrief = async () => {
    if (!caseId) return
    try {
      setGenerating(true)
      setError(null)
      const generated = await briefService.generate(caseId)
      setBrief(generated)
    } catch (err: any) {
      setError(err.message || "Failed to generate brief")
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return <div className="p-space-xl text-center">Loading brief data...</div>
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg mb-space-2xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs font-citation-code text-citation-code text-primary font-semibold uppercase tracking-wider mb-space-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
            Evidentiary Brief Synthesis · Final Artifact
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-none">Your Legal Preparation Brief</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1.5 max-w-3xl">
            A comprehensive, citation-grounded summary ready for review by your attorney or legal adviser.
          </p>
        </div>
        
        <div className="flex items-center flex-wrap gap-space-xs shrink-0">
          <Button onClick={handleGenerateBrief} disabled={isGenerating} className="gap-2 shadow-md px-space-lg">
            <span className="material-symbols-outlined text-[18px]">sync</span>
            {isGenerating ? "Generating..." : (brief ? "Regenerate Brief" : "Generate Brief")}
          </Button>
          
          {brief && (
            <Button variant="secondary" className="gap-2 shadow-md px-space-lg" onClick={() => window.print()}>
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print Brief
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-space-md p-space-md bg-error-container text-error rounded-xl border border-error/20">
          {error}
        </div>
      )}

      {brief ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-2xl">
            <div className="glass-panel p-space-md rounded-xl shadow-lg border border-border hover:border-error/30 flex flex-col justify-between group transition-colors">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Active Conflicts</span>
                <span className="material-symbols-outlined text-error text-[18px]">warning</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-error">{conflicts.length}</span>
              </div>
            </div>

            <div className="glass-panel p-space-md rounded-xl shadow-lg border border-border hover:border-tertiary/30 flex flex-col justify-between group transition-colors">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Counsel Prompts</span>
                <span className="material-symbols-outlined text-tertiary-container text-[18px]">psychology_alt</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-on-surface">{questions.length}</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto glass-panel rounded-xl shadow-2xl overflow-hidden transition-shadow duration-300 mb-space-2xl border border-border">
            <div className="bg-gradient-to-r from-surface-container-low to-surface-container p-space-xl md:p-space-2xl border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-center gap-space-xs text-primary font-citation-code text-citation-code uppercase tracking-wider font-bold">
                    <span className="material-symbols-outlined text-[16px]">balance</span>
                    LegalLens Evidentiary Brief Synthesis
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">LEGAL PREPARATION BRIEF · CASE {caseId?.slice(0, 8).toUpperCase()}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-error inline-block animate-ping"></span>
                    Privileged & Confidential
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-lg pt-space-md">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Generation Date</span>
                  <span className="font-body-md text-body-md font-semibold text-on-surface">{new Date(brief.generatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Verification Engine</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                    <span className="font-body-md text-body-md font-semibold text-secondary">LegalLens Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-space-xl md:p-space-2xl flex flex-col gap-space-2xl">
              <section className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-citation-code text-citation-code font-bold text-primary">§ 01</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Situation Summary & Procedural Posture</h3>
                  </div>
                </div>
                <div className="bg-surface p-space-lg rounded-xl text-on-surface leading-relaxed whitespace-pre-wrap font-body-lg">
                  {brief.summary}
                </div>
              </section>

              <section className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-citation-code text-citation-code font-bold text-error">§ 02</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Critical Evidentiary Conflicts & Discrepancies</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-space-lg">
                  {conflicts.length === 0 ? (
                    <div className="p-space-md text-on-surface-variant italic">No conflicts detected.</div>
                  ) : (
                    conflicts.map((conflict, idx) => (
                      <div key={idx} className="p-space-lg rounded-xl bg-error-container text-on-error-container shadow-sm flex flex-col justify-between">
                        <div className="flex flex-col gap-space-xs">
                          <h4 className="font-headline-md text-headline-md font-bold text-on-error-container mt-1">{conflict.type}</h4>
                          <p className="font-body-sm text-body-sm leading-relaxed mt-1">
                            {conflict.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-citation-code text-citation-code font-bold text-primary">§ 03</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Counsel Consultation Guide</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {questions.length === 0 ? (
                    <div className="p-space-md text-on-surface-variant italic">No questions formulated.</div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={idx} className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-border">
                        <div>
                          <div className="flex items-center justify-between mb-space-xs">
                            <span className="font-citation-code text-citation-code font-bold text-primary">PROMPT {idx + 1}</span>
                          </div>
                          <h4 className="font-body-lg text-body-lg font-bold text-on-surface">{q.question}</h4>
                          {q.rationale && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                              <strong className="text-on-surface">Rationale:</strong> {q.rationale}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full max-w-3xl mx-auto p-space-2xl text-center glass-panel rounded-xl border border-dashed border-outline-variant flex flex-col items-center gap-space-md">
          <span className="material-symbols-outlined text-[48px] text-outline">description</span>
          <h2 className="font-headline-md text-on-surface">No Brief Generated Yet</h2>
          <p className="text-on-surface-variant font-body-md max-w-md">
            The legal preparation brief synthesizes all your evidence, conflicts, and questions into one document.
          </p>
          <Button onClick={handleGenerateBrief} disabled={isGenerating} className="gap-2 mt-2">
            <span className="material-symbols-outlined text-[18px]">sync</span>
            {isGenerating ? "Generating Brief..." : "Generate Brief Now"}
          </Button>
        </div>
      )}
    </div>
  )
}
