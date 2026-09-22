import { useState, useEffect, useCallback } from 'react'
import { chatService } from '@/services/chatService'
import { questionService } from '@/services/questionService'
import { EvidencePanel } from './EvidencePanel'
import type { Question } from '@/types'

type QAItem = {
  id?: string
  q: string
  a: string
  status: string
  sources: any[]
  discussed: boolean
  saved: boolean
}

export function Questions({ caseId }: { caseId: string }) {
  const [qaList, setQaList] = useState<QAItem[]>([])
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([])
  const [query, setQuery] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [evidencePanelOpen, setEvidencePanelOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null)

  const loadSavedQuestions = useCallback(async () => {
    try {
      const qs = await questionService.list(caseId)
      setSavedQuestions(qs)
    } catch {
      // silent fail
    } finally {
      setLoadingQuestions(false)
    }
  }, [caseId])

  useEffect(() => {
    loadSavedQuestions()
  }, [loadSavedQuestions])

  const handleAsk = async () => {
    if (!query.trim() || isAsking) return
    const q = query.trim()
    setQuery('')
    setIsAsking(true)
    setError(null)

    try {
      const result = await chatService.ask(caseId, q)
      const newItem: QAItem = {
        q,
        a: result.answer,
        status: result.status,
        sources: result.sources ?? [],
        discussed: false,
        saved: false,
      }
      setQaList(prev => [...prev, newItem])
    } catch (_err: any) {
      setError('AI analysis is temporarily unavailable. Please try again.')
    } finally {
      setIsAsking(false)
    }
  }

  const handleGenerateQuestions = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const generated = await questionService.generate(caseId)
      setSavedQuestions(generated)
    } catch (_err: any) {
      setError('Failed to generate questions. Please ensure analysis is complete first.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveQuestion = async (item: QAItem, index: number) => {
    setIsSaving(index)
    try {
      await questionService.create(caseId, { question: item.q })
      setQaList(prev => prev.map((qa, i) => i === index ? { ...qa, saved: true } : qa))
      await loadSavedQuestions()
    } catch {
      // silent
    } finally {
      setIsSaving(null)
    }
  }

  const handleToggleDiscussed = async (q: Question) => {
    try {
      const newStatus = q.status === 'discussed' ? 'open' : 'discussed'
      await questionService.update(caseId, q.id!, { status: newStatus })
      await loadSavedQuestions()
    } catch { /* silent */ }
  }

  const handleDeleteSaved = async (q: Question) => {
    try {
      await questionService.delete(caseId, q.id!)
      await loadSavedQuestions()
    } catch { /* silent */ }
  }

  const statusBadge = (status: string) => {
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

  return (
    <div className="flex flex-col max-w-4xl mx-auto gap-space-lg pb-space-2xl">

      {/* Ask Input */}
      <div className="glass-panel p-space-lg border border-border rounded-xl shadow-sm bg-surface-container-lowest">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
          <h2 className="font-headline-md text-on-surface">Ask about your documents</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-3">
          Questions are answered using only the text found in your uploaded documents. Sources are always shown.
        </p>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAsk()}
            placeholder="e.g. What is the notice period? What are my obligations if I resign?"
            className="flex-1 p-3 bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface text-sm"
            disabled={isAsking}
          />
          <button
            onClick={handleAsk}
            disabled={isAsking || !query.trim()}
            className="px-6 bg-primary hover:bg-primary/90 text-on-primary rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isAsking
              ? <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              : <span className="material-symbols-outlined text-[18px]">send</span>
            }
            {isAsking ? 'Analyzing...' : 'Ask'}
          </button>
        </div>
        {error && (
          <p className="mt-3 p-3 bg-error-container text-error text-sm rounded-lg">{error}</p>
        )}
      </div>

      {/* Q&A History */}
      {qaList.length > 0 && (
        <div className="flex flex-col gap-space-md">
          <h3 className="font-headline-sm text-on-surface">AI Answers</h3>
          {qaList.map((qa, i) => (
            <div key={i} className="glass-panel rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-3 bg-surface-container border-b border-border flex items-center justify-between gap-4">
                <span className="font-medium text-on-surface text-sm">Q: {qa.q}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {!qa.saved && (
                    <button
                      onClick={() => handleSaveQuestion(qa, i)}
                      disabled={isSaving === i}
                      className="text-xs px-3 py-1 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                    >
                      {isSaving === i ? 'Saving...' : 'Save Question'}
                    </button>
                  )}
                  {qa.saved && (
                    <span className="text-xs text-secondary font-medium">✓ Saved</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-[16px]">psychology</span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Answer</span>
                  {statusBadge(qa.status)}
                </div>
                <p className="text-on-surface text-sm leading-relaxed whitespace-pre-line">{qa.a}</p>

                {qa.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                      Evidence Sources ({qa.sources.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {qa.sources.map((s: any, j: number) => (
                        <div
                          key={j}
                          className="p-2 bg-surface-container-low rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => { setSelectedEvidence(s); setEvidencePanelOpen(true) }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-primary">{s.filename}</span>
                            <span className="text-xs text-outline">
                              {s.page ? `Page ${s.page}` : ''}{s.section ? ` · ${s.section}` : ''}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant italic">
                            "{s.text?.slice(0, 200)}{(s.text?.length ?? 0) > 200 ? '...' : ''}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {qa.status === 'NOT_FOUND' && (
                  <div className="mt-3 p-3 bg-surface-container rounded-lg border border-dashed border-outline-variant text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] align-middle mr-1">info</span>
                    This information was not found in the uploaded documents.
                    Consider uploading additional documents that may contain this information.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Saved Questions */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-on-surface">Preparation Questions</h3>
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:border-primary/50 transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isGenerating ? 'animate-spin' : ''}`}>
              {isGenerating ? 'sync' : 'auto_awesome'}
            </span>
            {isGenerating ? 'Generating...' : 'AI Generate Questions'}
          </button>
        </div>

        {loadingQuestions ? (
          <div className="text-center p-6 text-on-surface-variant text-sm">Loading questions...</div>
        ) : savedQuestions.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant/40 rounded-xl p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined block text-[32px] mb-2">help_outline</span>
            <p className="text-sm font-medium mb-1">No questions saved yet</p>
            <p className="text-xs">
              Ask a question above and save it, or use <strong>AI Generate Questions</strong> to automatically
              create questions based on conflicts and missing documents found in your case.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {savedQuestions.map((q: Question) => (
              <div
                key={q.id}
                className={`glass-panel p-space-md border rounded-xl shadow-sm transition-all ${
                  q.status === 'discussed'
                    ? 'border-outline-variant/30 opacity-60'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-on-surface text-sm">{q.question}</p>
                    {q.category && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                        {q.category}
                      </span>
                    )}
                    {q.rationale && (
                      <p className="text-xs text-on-surface-variant mt-2">{q.rationale}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleDiscussed(q)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                        q.status === 'discussed'
                          ? 'bg-secondary-container text-on-secondary-container border-transparent'
                          : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {q.status === 'discussed' ? '✓ Discussed' : 'Mark Discussed'}
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(q)}
                      className="p-1 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
