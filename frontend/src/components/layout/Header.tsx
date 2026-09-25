import { Button } from "@/components/ui/button"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }
  
  const userName = user?.displayName || user?.email?.split('@')[0] || "User"
  const initials = getInitials(userName)
  
  // Dynamic breadcrumbs based on route
  const getBreadcrumbs = () => {
    const path = location.pathname
    if (path === "/") return <span className="text-on-surface font-semibold">Dashboard</span>
    if (path === "/settings") return <span className="text-on-surface font-semibold">Settings</span>
    if (path === "/cases/new") {
      return (
        <>
          <span className="hover:text-on-surface cursor-pointer" onClick={() => navigate("/")}>Cases</span>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-semibold">New Case</span>
        </>
      )
    }
    if (path.startsWith("/case/")) {
      return (
        <>
          <span className="hover:text-on-surface cursor-pointer" onClick={() => navigate("/")}>Cases</span>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-semibold">Workspace</span>
        </>
      )
    }
    return <span className="text-on-surface font-semibold">LegalLens</span>
  }

  return (
    <header className="fixed top-0 left-64 right-0 h-16 glass-panel border-b border-border/50 z-40 flex items-center justify-between px-gutter-lg">
      <div className="flex items-center gap-space-lg">
        <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
          {getBreadcrumbs()}
        </div>
        
        <div className="relative hidden xl:flex items-center group">
          <span className="material-symbols-outlined absolute left-2.5 text-[18px] text-outline group-focus-within:text-primary transition-colors pointer-events-none">search</span>
          <input 
            className="w-80 h-9 pl-9 pr-14 bg-surface/50 border border-border text-on-surface placeholder:text-outline rounded-lg text-body-sm font-body-sm focus:outline-none focus:bg-surface focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner" 
            placeholder="Search clauses, citations, facts..." 
            type="text" 
          />
          <div className="absolute right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface border border-border text-outline font-citation-code text-[10px]">
            ⌘K
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-space-md">
        <div className="hidden md:flex items-center gap-space-xs">
          <Button variant="secondary" size="sm" className="font-label-md text-label-md flex items-center gap-1.5" onClick={() => navigate("/")}>
            <span className="material-symbols-outlined text-[16px]">folder</span>
            All Cases
          </Button>
          <Button size="sm" className="font-label-md text-label-md flex items-center gap-1.5" onClick={() => navigate("/cases/new")}>
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Case
          </Button>
        </div>
        
        <button aria-label="Notifications" className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors relative" type="button">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="w-2 h-2 rounded-full bg-error absolute top-1.5 right-1.5"></span>
        </button>
        
        <div className="flex items-center gap-space-sm pl-space-xs cursor-pointer group" onClick={() => navigate("/settings")}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-bold shadow-[0_0_10px_rgba(var(--primary),0.3)] group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="font-label-md text-label-md text-on-surface leading-none">{userName}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant leading-none mt-0.5">Legal Ops</span>
          </div>
        </div>
      </div>
    </header>
  )
}
