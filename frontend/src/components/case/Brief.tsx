import { useState, useEffect, useCallback } from 'react'
import { briefService } from '@/services/briefService'
import type { Brief as BriefType } from '@/types'

const DISCLAIMER = `This preparation brief is generated from the documents uploaded to your workspace.
It is intended to help you prepare for a conversation with a qualified legal professional.
It does not constitute legal advice and should not be relied upon as such.
LegalLens identifies information found in your documents — it does not determine legal rights, outcomes, or which document is legally controlling.
Please consult a qualified legal professional for advice specific to your situation.`

export function Brief({ caseId, caseData }: { caseId: string; caseData: any }) {
  const [brief, setBrief] = useState<BriefType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBrief = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await briefService.get(caseId)
      setBrief(data)
    } catch (err: any) {
      // 404 = no brief yet, that's fine
      if (!err.message?.includes('404') && !err.message?.toLowerCase().includes('not found')) {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    loadBrief()
  }, [loadBrief])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const generated = await briefService.generate(caseId)
      setBrief(generated)
    } catch (err: any) {
      setError(err.message ?? 'Failed to generate brief. Please ensure analysis is complete.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-on-surface-variant text-[32px] animate-pulse">article</span>
        <p className="text-on-surface-variant text-sm">Loading brief...</p>
      </div>
    )
  }

  if (!brief) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[32px]">description</span>
        </div>
        <div className="text-center max-w-md">
          <h3 className="font-headline-md text-on-surface font-semibold mb-2">No Brief Generated Yet</h3>
          <p className="text-on-surface-variant text-sm">
            Generate a preparation brief based on your case analysis. The brief will include key facts,
            important dates, conflicts, missing documents, and questions for a legal professional.
          </p>
        </div>
        {error && (
          <p className="p-3 bg-error-container text-error text-sm rounded-lg max-w-md">{error}</p>
        )}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          <span className={`material-symbols-outlined text-[18px] ${isGenerating ? 'animate-spin' : ''}`}>
            {isGenerating ? 'sync' : 'auto_awesome'}
          </span>
          {isGenerating ? 'Generating Brief...' : 'Generate Preparation Brief'}
        </button>
        {isGenerating && (
          <p className="text-xs text-on-surface-variant">
            AI is analyzing your documents and building the brief — this may take a moment.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto gap-space-lg pb-space-2xl">
      {/* Actions */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-headline-lg text-on-surface font-bold">Preparation Brief</h2>
          {brief.generatedAt && (
            <p className="text-xs text-on-surface-variant mt-0.5">
              Generated {new Date(brief.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:border-primary/50 hover:text-on-surface transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isGenerating ? 'animate-spin' : ''}`}>
              {isGenerating ? 'sync' : 'refresh'}
            </span>
            {isGenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print
          </button>
        </div>
      </div>

      {error && (
        <p className="p-3 bg-error-container text-error text-sm rounded-lg">{error}</p>
      )}

      {/* Brief Document */}
      <div className="bg-surface-container-lowest border border-border rounded-xl shadow-lg p-10 print:shadow-none print:border-none print:rounded-none flex flex-col gap-8 font-serif">
        {/* Header */}
        <div className="text-center border-b border-border pb-6">
          <h1 className="text-3xl font-bold text-on-surface mb-2">{caseData.title ?? 'Case Brief'}</h1>
          <p className="text-on-surface-variant font-sans uppercase tracking-widest text-sm">
            LegalLens Preparation Brief
          </p>
          {brief.generatedAt && (
            <p className="text-xs text-on-surface-variant font-sans mt-1">
              {new Date(brief.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-warning-container/30 border border-outline-variant/50 rounded-lg p-4 font-sans text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
          <span className="font-semibold block mb-1 text-on-surface">⚠ Important Notice</span>
          {brief.disclaimer ?? DISCLAIMER}
        </div>

        {/* Sections from AI */}
        {brief.sections && brief.sections.length > 0 ? (
          brief.sections.map((section: any, i: number) => (
            <section key={i}>
              <h3 className="text-xl font-bold text-on-surface mb-3 border-b border-outline-variant/30 pb-1">
                {i + 1}. {section.title}
              </h3>
              <div className="text-on-surface-variant leading-relaxed font-sans text-sm whitespace-pre-line">
                {section.content}
              </div>
              {section.sources && section.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {section.sources.map((src: any, j: number) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-surface-container rounded text-primary font-sans">
                      {src.documentId ?? src.page ?? 'Source'}
                      {src.page ? ` · Page ${src.page}` : ''}
                      {src.section ? ` · ${src.section}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </section>
          ))
        ) : (
          // Fallback if no AI sections
          <section>
            <h3 className="text-xl font-bold text-on-surface mb-3 border-b border-outline-variant/30 pb-1">1. Situation Summary</h3>
            <p className="text-on-surface-variant leading-relaxed font-sans text-sm">
              {caseData.situation ?? 'No situation provided.'}
            </p>
          </section>
        )}

        {/* Footer */}
        <div className="mt-4 pt-6 border-t border-border text-center text-outline font-sans text-xs">
          Generated via LegalLens AI · Answers grounded in uploaded source documents ·
          Not legal advice · Consult a qualified legal professional
        </div>
      </div>
    </div>
  )
}
