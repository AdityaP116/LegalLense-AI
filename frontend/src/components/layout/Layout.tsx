import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Briefcase, FileText, BarChart2, CheckSquare, Search, GitMerge, FileArchive } from 'lucide-react';

const SIDEBAR_NAV = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart2 },
  { name: 'Intake', href: '/case/new', icon: Briefcase },
  { name: 'Documents', href: '/case/c1/documents', icon: FileArchive },
  { name: 'Analysis', href: '/case/c1/analysis', icon: GitMerge },
  { name: 'Evidence', href: '/case/c1/evidence', icon: Search },
  { name: 'Questions', href: '/case/c1/questions', icon: CheckSquare },
  { name: 'Brief', href: '/case/c1/brief', icon: FileText },
];

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-surface">
      {/* Sidebar - 240px fixed on desktop */}
      <aside className="w-[240px] flex-shrink-0 bg-surface-container-low border-r border-outline-variant/30 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-white"></div>
            </div>
            <span className="font-heading font-bold text-lg text-on-surface">LegalLens</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {SIDEBAR_NAV.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-primary-container/20 text-primary" 
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden h-14 border-b border-outline-variant/30 flex items-center px-4 bg-surface-container-low">
          <span className="font-heading font-bold text-lg text-on-surface">LegalLens</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
