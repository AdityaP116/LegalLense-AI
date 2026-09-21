import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { caseService } from "@/services/caseService"

export function SituationIntake() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  
  const [selectedCategory, setSelectedCategory] = useState("employment")
  const [narrative, setNarrative] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadCase = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      const data = await caseService.get(id)
      if (data.category) setSelectedCategory(data.category)
      if (data.situation) setNarrative(data.situation)
    } catch (error) {
      console.error("Failed to load case", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (caseId) {
      loadCase(caseId)
    }
  }, [caseId, loadCase])

  const handleContinue = async () => {
    if (!caseId) return
    try {
      setIsSaving(true)
      await caseService.update(caseId, {
        category: selectedCategory,
        situation: narrative,
      })
      navigate(`/case/${caseId}/documents`)
    } catch (error) {
      console.error("Failed to update case", error)
      setIsSaving(false)
    }
  }

  const categories = [
    { id: "employment", icon: "badge", title: "Employment", desc: "Terminations, notice periods, severance, non-competes, offer letters", priority: true },
    { id: "housing", icon: "home_work", title: "Rental / Housing", desc: "Lease agreements, security deposits, eviction notices, repairs" },
    { id: "business", icon: "handshake", title: "Business Contract", desc: "Vendor NDAs, service agreements, intellectual property, payment terms" },
    { id: "consumer", icon: "shopping_cart_checkout", title: "Consumer Issue", desc: "Warranties, service cancellations, unfair charges, debt claims" },
    { id: "finance", icon: "account_balance", title: "Finance", desc: "Loan covenants, personal guarantees, promissory notes, investments" },
    { id: "insurance", icon: "health_and_safety", title: "Insurance", desc: "Policy exclusions, denial letters, claims dispute, liability" },
  ]

  if (isLoading) {
    return <div className="p-space-xl text-center">Loading case data...</div>
  }

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full pb-16">
        <div className="absolute -top-6 right-0 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-80 -left-20 w-80 h-80 bg-secondary-fixed/25 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs pb-space-lg">
          <div className="flex items-center gap-space-sm font-label-md text-label-md text-on-surface-variant">
            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/")}>Cases</span>
            <span className="text-outline">/</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Case {caseId?.slice(0,8)}</span>
            <span className="text-outline">/</span>
            <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-citation-code text-citation-code font-semibold">Step 01</span>
            <span className="text-on-surface font-semibold">Situation Intake</span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-1 font-citation-code text-citation-code text-outline">
              <span>Target Workflow:</span>
              <span className="text-on-surface font-bold">01/07</span>
            </div>
          </div>
        </div>

        <div className="mb-space-xl">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">psychology_alt</span>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">Evidentiary Grounding Vector</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">What are you trying to understand?</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
            LegalLens combines your situation narrative with uploaded evidence to surface conflicts, statutory deadlines, and enforceable rights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          <div className="lg:col-span-8 flex flex-col gap-space-xl">
            {/* SEC 1.1 Category */}
            <section className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="font-citation-code text-citation-code px-1.5 py-0.5 bg-surface-container text-primary font-bold rounded">SEC 1.1</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Select Legal Category</h2>
                </div>
                <span className="font-label-sm text-label-sm text-outline">Determines OCR rule engines</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                {categories.map((cat) => (
                  <div 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`relative p-space-md rounded-lg shadow-sm cursor-pointer transition-all flex flex-col justify-between group ${selectedCategory === cat.id ? 'bg-surface-container-low shadow-md' : 'bg-surface-container-lowest hover:bg-surface-container-low'}`}
                  >
                    <div className="flex items-start justify-between gap-space-xs">
                      <div className={`w-9 h-9 rounded flex items-center justify-center ${selectedCategory === cat.id ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                      </div>
                      <span className={`material-symbols-outlined text-[20px] transition-opacity ${selectedCategory === cat.id ? 'text-primary opacity-100 font-bold' : 'text-outline-variant opacity-0'}`}>check_circle</span>
                    </div>
                    <div className="mt-space-sm">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-headline-md text-[15px] font-bold text-on-surface">{cat.title}</span>
                        {cat.priority && <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-primary font-citation-code text-[10px]">High Priority</span>}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">{cat.desc}</p>
                    </div>
                  </div>
                ))}
                
                <div 
                  onClick={() => setSelectedCategory("other")}
                  className={`md:col-span-2 relative p-space-md rounded-lg shadow-sm cursor-pointer transition-all flex items-center justify-between group ${selectedCategory === 'other' ? 'bg-surface-container-low shadow-md' : 'bg-surface-container-lowest hover:bg-surface-container-low'}`}
                >
                  <div className="flex items-center gap-space-md">
                    <div className={`w-9 h-9 rounded flex items-center justify-center ${selectedCategory === 'other' ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant'}`}>
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </div>
                    <div>
                      <span className="font-headline-md text-[15px] font-bold text-on-surface">Other</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">Custom legal situations and uncategorized agreements</p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-[20px] transition-opacity ${selectedCategory === 'other' ? 'text-primary opacity-100 font-bold' : 'text-outline-variant opacity-0'}`}>check_circle</span>
                </div>
              </div>
            </section>

            {/* SEC 1.2 Narrative */}
            <section className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-citation-code text-citation-code px-1.5 py-0.5 bg-surface-container text-primary font-bold rounded">SEC 1.2</span>
                    <label className="font-headline-md text-headline-md text-on-surface" htmlFor="situationNarrative">Briefly describe your situation in plain English</label>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tell us what happened, when it happened, and what you need clarity on. We use this to guide clause extraction.
                </p>
              </div>
              <div className="relative flex flex-col bg-surface-container-low rounded-lg p-space-md focus-within:bg-surface-container-lowest transition-colors shadow-inner">
                <textarea 
                  id="situationNarrative" 
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  className="w-full bg-transparent resize-none text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none leading-relaxed" 
                  placeholder="Detail key parties, relevant dates, verbal statements, and the specific answers you require from your documentation..." 
                  rows={5} 
                />
                <div className="flex items-center justify-between pt-space-sm mt-space-xs text-outline font-citation-code text-citation-code">
                  <span className="text-on-surface font-semibold">{narrative.length} / 2000 chars</span>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <div className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[22px]">verified_user</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Evidence & Privacy Guarantee</h3>
              </div>
              <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span className="font-label-md text-label-md text-secondary font-bold">Local Processing & Zero Model Training</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Your documents are cited line-by-line and never used to train public LLMs. Evidentiary hashing anchors each claim straight to original PDF vectors.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-30 -mx-gutter-lg px-gutter-lg py-space-md bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.04)] mt-space-2xl">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-end gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-label-sm text-label-sm text-outline">Next: Step 2</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">Upload Evidence & Contracts</span>
              </div>
              <Button onClick={handleContinue} disabled={isSaving} className="h-10 px-space-xl gap-2 shadow-md">
                <span>{isSaving ? "Saving..." : "Continue to Documents"}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
