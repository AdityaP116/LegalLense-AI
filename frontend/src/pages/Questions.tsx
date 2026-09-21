import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { questionService } from "@/services/questionService"
import { chatService } from "@/services/chatService"
import type { Question } from "@/types"

export function Questions() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [customQuestion, setCustomQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Quick chat answer testing
  const [chatAnswer, setChatAnswer] = useState<string | null>(null)
  const [isChatting, setIsChatting] = useState(false)

  const loadQuestions = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const data = await questionService.list(id)
      setQuestions(data)
    } catch (err: any) {
      setError(err.message || "Failed to load questions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (caseId) {
      loadQuestions(caseId)
    }
  }, [caseId, loadQuestions])

  const handleGenerateQuestions = async () => {
    if (!caseId) return
    try {
      setIsGenerating(true)
      await questionService.generate(caseId)
      await loadQuestions(caseId)
    } catch (err: any) {
      setError(err.message || "Failed to generate questions")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!caseId || !customQuestion.trim()) return
    try {
      setIsSubmitting(true)
      await questionService.create(caseId, customQuestion)
      setCustomQuestion("")
      await loadQuestions(caseId)
    } catch (err: any) {
      setError(err.message || "Failed to add question")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    if (!caseId) return
    try {
      await questionService.delete(caseId, questionId)
      await loadQuestions(caseId)
    } catch (err: any) {
      setError(err.message || "Failed to delete question")
    }
  }

  const handleTestChat = async (q: string) => {
    if (!caseId) return
    try {
      setIsChatting(true)
      const res = await chatService.ask(caseId, q)
      setChatAnswer(res.answer)
    } catch (err: any) {
      setError(err.message || "Failed to get answer")
    } finally {
      setIsChatting(false)
    }
  }

  if (loading) {
    return <div className="p-space-xl text-center">Loading questions...</div>
  }

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto space-y-space-xl">
        <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
          <div className="flex items-center gap-space-xs font-label-md text-label-md">
            <span className="text-outline">Step 06 of 07</span>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">quiz</span>
              Inquiry Formulation
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-citation-code text-citation-code flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              {questions.length} Inquiries
            </span>
          </div>
        </div>

        <div className="relative bg-surface-container-lowest rounded-xl p-space-xl shadow-sm overflow-hidden">
          <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-xl">
            <div className="max-w-3xl space-y-space-xs">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                Pre-Counsel Alignment Matrix
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-tight">
                Questions to Prepare
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Turn unclear points and evidentiary conflicts into focused, actionable questions for your next conversation with a legal professional.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-space-sm shrink-0">
              <Button onClick={handleGenerateQuestions} disabled={isGenerating} variant="secondary" className="gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">sync</span>
                {isGenerating ? "Generating..." : "Generate AI Questions"}
              </Button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-space-md bg-error-container text-error rounded-xl border border-error/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-xl items-start">
          <div className="xl:col-span-8 space-y-space-2xl">
            <section className="space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Your Saved Questions
                  </h2>
                </div>
              </div>
              
              <div className="space-y-space-md">
                {questions.length === 0 ? (
                  <div className="p-space-xl text-center text-on-surface-variant border border-dashed rounded-xl border-outline-variant">
                    No questions saved yet.
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <article key={q.id} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-shadow space-y-space-md">
                      <div className="flex items-start justify-between gap-space-md">
                        <div className="flex items-start gap-space-sm">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-citation-code text-citation-code font-semibold">Q{idx+1}</span>
                          <h3 className="font-headline-md text-[17px] text-on-surface font-semibold leading-snug">
                            {q.question}
                          </h3>
                        </div>
                      </div>
                      
                      {q.rationale && (
                        <div className="bg-surface-container-low rounded-lg p-space-md space-y-space-xs">
                          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block">Rationale</span>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            {q.rationale}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
                        <div className="flex flex-wrap items-center gap-space-xs">
                          <Button variant="secondary" size="sm" onClick={() => handleTestChat(q.question)} disabled={isChatting}>
                            {isChatting ? "Testing..." : "Test with AI"}
                          </Button>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          <button onClick={() => handleDelete(q.id)} className="h-8 w-8 rounded-lg hover:bg-error-container/50 text-outline hover:text-error transition-colors flex items-center justify-center" type="button">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
                
                {chatAnswer && (
                  <div className="mt-4 p-4 rounded-xl bg-primary-container text-on-primary-container relative">
                    <button onClick={() => setChatAnswer(null)} className="absolute top-2 right-2 text-on-primary-container hover:text-primary">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined">psychology</span>
                      AI Response Test:
                    </h4>
                    <p className="font-body-md whitespace-pre-wrap">{chatAnswer}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="xl:col-span-4 space-y-space-lg">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Inquiry Assistant
                </h3>
              </div>
              <div className="space-y-space-sm">
                <label className="font-label-sm text-label-sm text-on-surface-variant block" htmlFor="custom-inquiry">Add your own inquiry or test scenario</label>
                <div className="relative">
                  <textarea 
                    className="w-full bg-surface-container-low rounded-lg p-space-sm font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary resize-none" 
                    id="custom-inquiry" 
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="e.g. Can equity vesting be clawed back if the non-disparagement clause is modified?" 
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-citation-code text-citation-code text-outline">Markdown supported</span>
                  <button onClick={handleAddQuestion} disabled={isSubmitting || !customQuestion.trim()} className="h-8 px-space-md rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors flex items-center gap-1 disabled:opacity-50" type="button">
                    <span className="material-symbols-outlined text-[14px]">save</span>
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-20 w-full bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-space-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Questions Ready for Packaging</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{questions.length} validated questions mapped into the case brief</span>
            </div>
          </div>
          <Button onClick={() => navigate(`/case/${caseId}/briefs`)} className="w-full sm:w-auto h-10 px-space-xl gap-2 shadow-md">
            <span>Continue to Briefs</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
