import { NavLink, useParams, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { caseId } = useParams()
  const navigate = useNavigate()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 glass-panel z-50 flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand */}
        <div 
          className="h-16 px-space-md flex items-center gap-space-sm bg-transparent border-b border-border/50 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex flex-col">
            <span className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface leading-none tracking-tighter text-glow">LegalLens</span>
            <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase mt-0.5">Evidentiary Engine</span>
          </div>
        </div>

        {/* Global Nav */}
        <div className="px-space-md pt-space-sm pb-space-xs border-b border-border/50">
          <nav className="flex flex-col gap-1">
            <NavItem to="/" icon="grid_view" label="Dashboard" exact />
          </nav>
        </div>

        {/* Active Case Header */}
        {caseId && (
          <div className="px-space-md py-space-sm">
            <div className="p-space-sm rounded-lg glass flex flex-col gap-space-xs hover:border-primary/30 transition-colors group">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Active Case</span>
              <div className="flex items-center justify-between gap-space-xs cursor-pointer">
                <div className="flex items-center gap-space-xs overflow-hidden">
                  <span className="material-symbols-outlined text-primary text-[18px] group-hover:text-primary-fixed-dim transition-colors">folder_managed</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate group-hover:text-glow transition-all">Workspace</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Nav (Only shown if case is active) */}
        {caseId && (
          <>
            <div className="px-space-md pt-space-sm">
              <span className="px-space-xs font-label-sm text-label-sm text-outline uppercase tracking-wider block mb-space-xs">Workspace</span>
              <nav className="flex flex-col gap-1">
                <NavItem to={`/case/${caseId}/intake`} icon="info" label="Situation Intake" />
                <NavItem to={`/case/${caseId}/documents`} icon="description" label="Documents" />
                <NavItem to={`/case/${caseId}/analysis`} icon="rule" label="Analysis" />
                <NavItem to={`/case/${caseId}/timeline`} icon="schedule" label="Timeline" />
                <NavItem to={`/case/${caseId}/questions`} icon="help_outline" label="Questions & Chat" />
                <NavItem to={`/case/${caseId}/briefs`} icon="history_edu" label="Brief" />
              </nav>
            </div>
          </>
        )}
      </div>

      <div className="p-space-md">
        <div className="p-space-sm rounded-lg glass border-secondary/20 flex flex-col gap-space-xs relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-space-xs relative z-10">
            <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse-slow shadow-[0_0_8px_rgba(0,255,150,0.8)]"></span>
            <span className="font-label-sm text-label-sm text-secondary font-semibold">100% Citation Grounding</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant leading-snug relative z-10">Evidence verified against source OCR records.</p>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ to, icon, label, exact = false }: { to: string; icon: string; label: string; exact?: boolean }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-all duration-300 font-body-sm text-body-sm border border-transparent",
          isActive
            ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-primary/30 shadow-[0_0_15px_rgba(0,0,0,0.1)] font-semibold"
            : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-border"
        )
      }
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </NavLink>
  )
}
