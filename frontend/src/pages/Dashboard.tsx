import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { caseService } from "@/services/caseService"
import { useAuth } from "@/contexts/AuthContext"
import type { Case } from "@/types"

export function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true)
      const data = await caseService.list()
      setCases(data)
    } catch (err: any) {
      setError(err.message || "Failed to load cases")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  const handleCreateCase = async () => {
    try {
      setIsCreating(true)
      const newCase = await caseService.create({
        title: "New Case",
        category: "General",
        situation: "",
        goals: []
      })
      navigate(`/case/${newCase.id}/intake`)
    } catch (err: any) {
      setError(err.message || "Failed to create case")
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-xl glass-panel shadow-lg mb-space-xl p-space-xl lg:p-space-2xl group border border-primary/20 hover:border-primary/40 transition-colors">
        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none group-hover:bg-primary/30 transition-all duration-700"></div>
        <div className="absolute right-1/4 -bottom-20 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none group-hover:bg-secondary/20 transition-all duration-700"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-space-xl">
          <div className="max-w-3xl flex flex-col gap-space-sm">
            <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-citation-code text-citation-code tracking-tight w-fit shadow-[0_0_10px_rgba(var(--primary),0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow shadow-[0_0_5px_currentColor]"></span>
              EVIDENTIARY VERIFICATION ENGINE ACTIVE
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-tight">
              Welcome, <span className="text-primary text-glow">{user?.displayName || "User"}</span>.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Turn complex contracts and workplace notices into a clear, evidence-backed brief for legal discussion with verifiable optical source grounding.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-space-md shrink-0">
            <Button variant="secondary" className="gap-2 px-space-xl h-10" onClick={logout}>
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </Button>
            <Button className="gap-2 px-space-xl h-10" onClick={handleCreateCase} disabled={isCreating}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              {isCreating ? "Starting..." : "Start New Case"}
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-space-xl p-space-md bg-error-container text-error rounded-xl border border-error/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Left Column: Active Cases */}
        <div className="lg:col-span-8 flex flex-col gap-space-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Active Cases</h2>
              {!loading && (
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-citation-code text-citation-code font-semibold">
                  {cases.length} Total
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="text-on-surface-variant hover:text-on-surface p-1.5 rounded bg-surface-container-low transition-colors" onClick={fetchCases}>
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-space-xl text-center text-on-surface-variant">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div 
              onClick={handleCreateCase}
              className="rounded-xl border-2 border-dashed border-outline-variant/30 glass hover:bg-surface-container/50 hover:border-primary/50 transition-all duration-300 p-space-xl flex flex-col sm:flex-row items-center justify-between gap-space-lg text-center sm:text-left cursor-pointer group hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] hover:-translate-y-1"
            >
              <div className="flex items-center gap-space-lg">
                <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:text-glow transition-all duration-300">
                  <span className="material-symbols-outlined text-[26px]">post_add</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">No active cases</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">Click here to start your first case and upload documents.</p>
                </div>
              </div>
            </div>
          ) : (
            cases.map((c) => (
              <div 
                key={c.id}
                onClick={() => navigate(`/case/${c.id}`)}
                className="glass rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(var(--primary),0.15)] transition-all duration-300 p-space-lg lg:p-space-xl flex flex-col gap-space-md border border-border hover:border-primary/30 group cursor-pointer hover:-translate-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="p-2 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed">
                      <span className="material-symbols-outlined text-[20px]">badge</span>
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline-md text-headline-md text-on-surface">{c.title || "Untitled Case"}</h3>
                        <span className="font-citation-code text-citation-code text-outline font-normal">#{c.id.slice(0, 8)}</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Category: {c.category} · Created {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-2">
                  <div className="flex items-center justify-between text-outline font-citation-code text-[11px]">
                    <span className="uppercase tracking-wider font-semibold">Situation Summary</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed line-clamp-2">
                    {c.situation || "No situation described yet."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-space-sm pt-space-xs">
                  <Button size="sm" className="gap-1.5 px-space-lg">
                    Open Workspace
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-space-xl">
          <div className="glass-panel border-secondary/20 rounded-xl p-space-lg shadow-lg flex flex-col gap-space-md relative overflow-hidden group hover:border-secondary/50 transition-colors">
            <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-secondary/20 transition-colors duration-500"></div>
            <div className="flex items-center justify-between relative z-10">
              <span className="font-citation-code text-citation-code uppercase text-outline font-semibold">Evidentiary Health</span>
              <span className="material-symbols-outlined text-secondary text-[18px] group-hover:scale-110 transition-transform">verified_user</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl text-secondary font-bold text-glow">100%</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">Citations</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Zero unsupported premises detected.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
