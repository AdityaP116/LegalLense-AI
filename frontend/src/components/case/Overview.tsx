import { useState, useEffect, useCallback } from 'react'
import { EvidencePanel } from './EvidencePanel'
import { analysisService } from '@/services/analysisService'
import { chatService } from '@/services/chatService'
import type { Conflict, Evidence, TimelineEvent, AnalysisJob } from '@/types'

type AnalysisStatus = 'idle' | 'running' | 'completed' | 'failed'

const STEPS = [
  'Loading documents...',
  'Extracting text...',
  'Finding important clauses...',
  'Identifying dates...',
  'Comparing documents...',
  'Checking references...',
  'Building analysis...',
  'Almost done...',
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    FOUND_DIRECTLY: 'bg-secondary-container text-on-secondary-container',
    DERIVED_FROM_DOCUMENTS: 'bg-tertiary-fixed text-on-tertiary-fixed',
    NOT_FOUND: 'bg-surface-container-high text-on-surface-variant',
    NEEDS_REVIEW: 'bg-error-container text-error',
  }
  const labels: Record<string, string> = {
    FOUND_DIRECTLY: 'Found directly',
    DERIVED_FROM_DOCUMENTS: 'Derived from documents',
    NOT_FOUND: 'Not found in workspace',
    NEEDS_REVIEW: 'Needs review',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-surface-container text-on-surface-variant'}`}>
      {labels[status] ?? status}
    </span>
  )
}

export function Overview({ caseId, caseData }: { caseId: string; caseData: any }) {
  const [evidencePanelOpen, setEvidencePanelOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null)

  // Analysis state
  const [job, setJob] = useState<AnalysisJob | null>(null)
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle')
  const [stepIndex, setStepIndex] = useState(0)

  // Data state
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [analysisSummary, setAnalysisSummary] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)

  // Chat state
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string; status: string; sources: any[] }>>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  const openEvidence = (ev: any) => {
    setSelectedEvidence(ev)
    setEvidencePanelOpen(true)
  }

  // Poll job status
  const pollJob = useCallback(async () => {
    try {
      const latestJob = await analysisService.getStatus(caseId)
      setJob(latestJob)
      if (!latestJob) {
        setAnalysisStatus('idle')
        return 'idle'
      }
      const s = latestJob.status
      if (s === 'completed') {
        setAnalysisStatus('completed')
        return 'completed'
      }
      if (s === 'failed') {
        setAnalysisStatus('failed')
        return 'failed'
      }
      setAnalysisStatus('running')
      return 'running'
    } catch {
      return 'idle'
    }
  }, [caseId])

  const loadAnalysisData = useCallback(async () => {
    try {
      setDataLoading(true)
      const [conflictsData, evidenceData, timelineData, summary] = await Promise.allSettled([
        analysisService.getConflicts(caseId),
        analysisService.getEvidence(caseId),
        analysisService.getTimeline(caseId),
        analysisService.getResult(caseId),
      ])

      if (conflictsData.status === 'fulfilled') setConflicts(conflictsData.value ?? [])
      if (evidenceData.status === 'fulfilled') setEvidence(evidenceData.value ?? [])
      if (timelineData.status === 'fulfilled') setTimeline(timelineData.value ?? [])
      if (summary.status === 'fulfilled') setAnalysisSummary(summary.value)
    } finally {
      setDataLoading(false)
    }
  }, [caseId])

  // Initial load
  useEffect(() => {
    const init = async () => {
      const status = await pollJob()
      if (status === 'completed') {
        await loadAnalysisData()
      } else if (status === 'running') {
        setAnalysisStatus('running')
      } else {
        // No job yet — prompt to start analysis
        setDataLoading(false)
      }
    }
    init()
  }, [caseId, pollJob, loadAnalysisData])

  // Polling when running
  useEffect(() => {
    if (analysisStatus !== 'running') return

    // Step animation
    const stepTimer = setInterval(() => {
      setStepIndex(prev => (prev + 1) % STEPS.length)
    }, 1800)

    // Poll every 3 seconds
    const pollTimer = setInterval(async () => {
      const status = await pollJob()
      if (status === 'completed') {
        clearInterval(pollTimer)
        clearInterval(stepTimer)
        await loadAnalysisData()
      } else if (status === 'failed') {
        clearInterval(pollTimer)
        clearInterval(stepTimer)
      }
    }, 3000)

    return () => {
      clearInterval(pollTimer)
      clearInterval(stepTimer)
    }
  }, [analysisStatus, pollJob, loadAnalysisData])

  const handleStartAnalysis = async () => {
    try {
      setAnalysisStatus('running')
      setStepIndex(0)
      await analysisService.triggerAnalysis(caseId)
    } catch (_err: any) {
      setAnalysisStatus('failed')
    }
  }

  const handleAsk = async () => {
    if (!question.trim() || chatLoading) return
    const q = question.trim()
    setQuestion('')
    setChatLoading(true)
    setChatError(null)
    try {
      const result = await chatService.ask(caseId, q)
      setChatHistory(prev => [...prev, {
        q,
        a: result.answer,
        status: result.status,
        sources: result.sources ?? [],
      }])
    } catch (_err: any) {
      setChatError('AI analysis is temporarily unavailable. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  // ── Render states ─────────────────────────────────────────────────────────

  if (analysisStatus === 'running') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin" style={{ animationDuration: '2s' }}>psychology</span>
        </div>
        <div className="text-center flex flex-col gap-2">
          <h3 className="font-headline-md text-on-surface font-semibold">AI Analysis in Progress</h3>
          <p className="text-on-surface-variant text-sm">{STEPS[stepIndex]}</p>
          {job && (
            <div className="mt-2 w-64 mx-auto bg-surface-container-low rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${job.progress ?? 20}%` }}
              />
            </div>
          )}
        </div>
        <p className="text-xs text-on-surface-variant">Processing your uploaded documents with AI — this may take a moment.</p>
      </div>
    )
  }

  if (analysisStatus === 'idle' || (!job && !dataLoading)) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[32px]">analytics</span>
        </div>
        <div className="text-center">
          <h3 className="font-headline-md text-on-surface font-semibold mb-2">Analysis Not Started</h3>
          <p className="text-on-surface-variant text-sm max-w-md">
            Upload documents in the <strong>Documents</strong> tab, then start the AI analysis to extract clauses, detect conflicts, and identify missing references.
          </p>
        </div>
        <button
          onClick={handleStartAnalysis}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">play_circle</span>
          Start AI Analysis
        </button>
      </div>
    )
  }

  if (analysisStatus === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-error text-[48px]">error</span>
        <h3 className="font-headline-md text-error">Analysis Failed</h3>
        <p className="text-on-surface-variant text-sm">{job?.error ?? 'An error occurred during analysis.'}</p>
        <button onClick={handleStartAnalysis} className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium">
          Retry Analysis
        </button>
      </div>
    )
  }

  if (dataLoading) {
    return <div className="text-center p-10 text-on-surface-variant">Loading analysis results...</div>
  }

  const clauseEvidence = evidence.filter(e => e.evidenceType === 'clause')
  const dateEvidence = evidence.filter(e => e.evidenceType === 'date')

  return (
    <div className="flex flex-col gap-space-lg pb-space-2xl">
      {/* Analysis Summary Bar */}
      {analysisSummary && (
        <div className="glass-panel p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
            <span className="font-label-md text-primary font-semibold text-sm uppercase tracking-wide">AI Analysis Complete</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Documents analyzed', value: analysisSummary.documentsAnalyzed ?? 0, icon: 'description' },
              { label: 'Clauses identified', value: analysisSummary.clausesExtracted ?? 0, icon: 'article' },
              { label: 'Conflicts found', value: analysisSummary.conflictsFound ?? 0, icon: 'warning', highlight: (analysisSummary.conflictsFound ?? 0) > 0 },
              { label: 'Missing references', value: analysisSummary.missingReferences ?? 0, icon: 'find_in_page', highlight: (analysisSummary.missingReferences ?? 0) > 0 },
            ].map(({ label, value, icon, highlight }) => (
              <div key={label} className={`p-3 rounded-lg flex flex-col gap-1 ${highlight ? 'bg-error/10 border border-error/20' : 'bg-surface-container-low'}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[16px] ${highlight ? 'text-error' : 'text-on-surface-variant'}`}>{icon}</span>
                  <span className={`font-bold text-xl ${highlight ? 'text-error' : 'text-on-surface'}`}>{value}</span>
                </div>
                <span className="text-xs text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-space-lg">

          {/* Situation */}
          <section className="glass-panel p-space-lg rounded-xl shadow-sm border border-border">
            <h2 className="font-headline-md text-on-surface mb-3">Situation</h2>
            <p className="text-body-md text-on-surface-variant bg-surface-container-low p-4 rounded-lg leading-relaxed">
              {caseData.situation || 'No situation provided.'}
            </p>
          </section>

          {/* Conflicts */}
          <section className="glass-panel p-space-lg rounded-xl shadow-sm border border-error/30 bg-error/5">
            <div className="flex items-center gap-2 mb-4 text-error">
              <span className="material-symbols-outlined">warning</span>
              <h2 className="font-headline-md">Conflicting Information</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-error/10 text-error text-xs font-bold">{conflicts.length}</span>
            </div>

            {conflicts.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined block text-[32px] mb-2 text-secondary">check_circle</span>
                No conflicts detected across uploaded documents.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {conflicts.map((c: any, i: number) => (
                  <div key={c.id ?? i} className="bg-surface-container-lowest p-4 rounded-lg border border-border">
                    <span className="font-semibold text-on-surface block mb-3">{c.topic}</span>
                    <p className="text-sm text-on-surface-variant mb-3">{c.description}</p>
                    {c.evidence && c.evidence.length >= 2 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {c.evidence.slice(0, 2).map((ev: any, j: number) => (
                          <div key={j} className="p-3 bg-surface-container-low rounded flex flex-col gap-1">
                            <span className="text-xs font-semibold text-on-surface-variant">{ev.documentName ?? ev.documentId}</span>
                            <span className="text-on-surface text-sm italic">"{ev.text?.slice(0, 120)}{(ev.text?.length ?? 0) > 120 ? '...' : ''}"</span>
                            <span className="text-xs text-outline">
                              {ev.page ? `Page ${ev.page}` : ''}{ev.section ? ` · ${ev.section}` : ''}
                            </span>
                            <button onClick={() => openEvidence(ev)} className="text-primary text-xs font-medium hover:underline text-left mt-1">
                              View Source
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Evidence Clauses */}
          {clauseEvidence.length > 0 && (
            <section className="glass-panel p-space-lg rounded-xl shadow-sm border border-border">
              <h2 className="font-headline-md text-on-surface mb-3">Key Clauses Identified</h2>
              <div className="flex flex-col gap-3">
                {clauseEvidence.slice(0, 8).map((ev: any, i: number) => (
                  <div key={ev.id ?? i} className="flex items-start justify-between p-3 rounded-lg border border-border bg-surface-container-lowest gap-3">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{ev.topic ?? ev.section}</span>
                      <span className="text-on-surface text-sm">{ev.text}</span>
                      <span className="text-xs text-outline">{ev.documentName} · Page {ev.page}</span>
                    </div>
                    <button onClick={() => openEvidence(ev)} className="text-primary text-xs font-medium hover:underline shrink-0">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Q&A */}
          <section className="glass-panel p-space-lg rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
              <h2 className="font-headline-md text-on-surface">Ask about your documents</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAsk()}
                placeholder="e.g. What is the notice period? What are my obligations?"
                className="flex-1 p-3 bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface text-sm"
                disabled={chatLoading}
              />
              <button
                onClick={handleAsk}
                disabled={chatLoading || !question.trim()}
                className="px-5 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {chatLoading
                  ? <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  : <span className="material-symbols-outlined text-[18px]">send</span>
                }
              </button>
            </div>

            {chatError && (
              <div className="mb-4 p-3 bg-error-container text-error text-sm rounded-lg">{chatError}</div>
            )}

            {chatHistory.length === 0 && (
              <div className="text-center py-4 text-on-surface-variant text-sm">
                Ask a question about your documents — answers are grounded in the uploaded text.
              </div>
            )}

            <div className="flex flex-col gap-4">
              {chatHistory.map((item, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl border border-border overflow-hidden">
                  <div className="p-3 bg-surface-container border-b border-border">
                    <span className="font-medium text-on-surface text-sm">Q: {item.q}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-[16px]">auto_awesome</span>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Answer</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-on-surface text-sm leading-relaxed whitespace-pre-line">{item.a}</p>

                    {item.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Sources</p>
                        <div className="flex flex-col gap-2">
                          {item.sources.map((s: any, j: number) => (
                            <div
                              key={j}
                              className="p-2 bg-surface-container-low rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors"
                              onClick={() => openEvidence(s)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-primary">{s.filename}</span>
                                <span className="text-xs text-outline">
                                  {s.page ? `Page ${s.page}` : ''}{s.section ? ` · ${s.section}` : ''}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant italic">"{s.text?.slice(0, 150)}{(s.text?.length ?? 0) > 150 ? '...' : ''}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-space-lg">
          {/* Missing References */}
          <section className="glass-panel p-space-lg rounded-xl shadow-sm border border-border">
            <h2 className="font-headline-md text-on-surface mb-3">Missing Documents</h2>
            {analysisSummary?.missingReferences === 0 ? (
              <div className="text-center py-4 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined block text-[28px] mb-1 text-secondary">check_circle</span>
                All referenced documents found.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-surface-container-low rounded-lg border border-dashed border-outline-variant">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-error">find_in_page</span>
                    <span className="text-xs font-semibold text-error">
                      {analysisSummary?.missingReferences ?? 0} reference(s) not found in workspace
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Documents referenced in your uploaded files but not uploaded. Check the Questions tab for details.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Timeline */}
          <section className="glass-panel p-space-lg rounded-xl shadow-sm border border-border">
            <h2 className="font-headline-md text-on-surface mb-4">Important Dates</h2>
            {timeline.length === 0 && dateEvidence.length === 0 ? (
              <div className="text-center py-4 text-on-surface-variant text-sm">No dates extracted yet.</div>
            ) : (
              <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-border pl-2">
                {(timeline.length > 0 ? timeline : dateEvidence).slice(0, 8).map((t: any, i: number) => (
                  <div key={t.id ?? i} className="relative pl-6">
                    <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-lowest" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-primary mb-0.5">
                        {t.date
                          ? new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : t.extractedDate
                          ? new Date(t.extractedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Date unclear'}
                      </span>
                      <span className="font-medium text-on-surface text-sm">{t.title ?? t.text}</span>
                      <span className="text-xs text-on-surface-variant mt-0.5">
                        {t.documentName ?? ''}{t.page ? ` · Page ${t.page}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Re-analyze */}
          <button
            onClick={handleStartAnalysis}
            className="flex items-center justify-center gap-2 p-3 border border-outline-variant rounded-lg text-on-surface-variant hover:text-on-surface hover:border-primary/50 text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Re-run Analysis
          </button>
        </div>
      </div>

      {evidencePanelOpen && (
        <EvidencePanel
          evidence={selectedEvidence}
          onClose={() => setEvidencePanelOpen(false)}
        />
      )}
    </div>
  )
}
