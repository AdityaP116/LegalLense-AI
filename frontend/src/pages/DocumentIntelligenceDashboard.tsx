import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText,
  Search,
  Settings,
  ShieldAlert,
  BarChart2,
  AlertTriangle,
  SearchCode,
  FileSearch,
} from 'lucide-react'
import { documentService } from '@/services/documentService'
import { analysisService } from '@/services/analysisService'
import type { LegalDocument, AnalysisResult, Conflict } from '@/types'

export function DocumentIntelligenceDashboard() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!caseId) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [docsData, analysisData, conflictsData] = await Promise.all([
          documentService.list(caseId).catch(() => []),
          analysisService.getResult(caseId).catch(() => null),
          analysisService.getConflicts(caseId).catch(() => [])
        ])
        
        setDocuments(docsData)
        setAnalysisResult(analysisData)
        setConflicts(conflictsData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [caseId])

  const filteredDocs = documents.filter(d => d.filename.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-200 font-body-sm flex selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#151821] border-r border-slate-800/50 flex flex-col hidden md:flex shrink-0">
        <div 
          className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/50 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-tight">LegalLens</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Legal Intelligence Platform</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="flex flex-col gap-1.5">
            <SidebarItem icon={<FileText size={18} />} label="Documents" active />
            <SidebarItem icon={<SearchCode size={18} />} label="Contract Review" />
            <SidebarItem icon={<ShieldAlert size={18} />} label="Risk Analysis" />
            <SidebarItem icon={<FileSearch size={18} />} label="Clause Extraction" />
            <SidebarItem icon={<BarChart2 size={18} />} label="Reports" />
            
            <div className="mt-8 mb-2 px-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">System</span>
            </div>
            <SidebarItem icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0a0c10]">
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-800/30 bg-[#0F1117]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Document Intelligence</h1>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium tracking-wide">
              AI Processing Active
            </span>
          </div>
          
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151821] border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="DOCS ANALYZED"
                value={analysisResult ? analysisResult.documentsAnalyzed.toString() : "0"}
                trend="Total documents"
                trendColor="text-slate-400"
              />
              <StatCard
                title="RISKS FLAGGED"
                value={analysisResult ? analysisResult.conflictsFound.toString() : "0"}
                trend="Identified conflicts"
                trendColor="text-amber-400"
              />
              <StatCard
                title="CLAUSES EXTRACTED"
                value={analysisResult ? analysisResult.clausesExtracted.toString() : "0"}
                trend="Data points"
                trendColor="text-emerald-400"
              />
              <StatCard
                title="TIMELINE EVENTS"
                value={analysisResult ? analysisResult.timelineEvents.toString() : "0"}
                trend="Chronological items"
                trendColor="text-indigo-400"
              />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column: Recent Documents */}
              <div className="xl:col-span-2 rounded-xl bg-[#151821] border border-slate-800/50 p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Documents</h2>
                  <button onClick={() => navigate(`/case/${caseId}`)} className="text-xs text-indigo-400 hover:text-indigo-300">
                    Go to Workspace →
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {isLoading ? (
                    <div className="py-8 text-center text-slate-500 text-sm">Loading documents...</div>
                  ) : filteredDocs.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-sm">No documents found.</div>
                  ) : (
                    filteredDocs.map(doc => {
                      const isProcessing = doc.processingStatus === 'processing' || doc.processingStatus === 'uploaded'
                      const isFailed = doc.processingStatus === 'failed'
                      const type = doc.mimeType?.includes('pdf') ? 'PDF' : doc.filename.split('.').pop()?.toUpperCase() || 'DOC'
                      const meta = `${doc.pageCount ? doc.pageCount + ' pages · ' : ''}${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`
                      
                      let statusText = 'Reviewed'
                      let statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      
                      if (isProcessing) {
                        statusText = 'Processing'
                        statusColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      } else if (isFailed) {
                        statusText = 'Failed'
                        statusColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }

                      return (
                        <DocumentRow
                          key={doc.id}
                          type={type}
                          title={doc.filename}
                          meta={meta}
                          status={statusText}
                          statusColor={statusColor}
                        />
                      )
                    })
                  )}
                </div>
              </div>

              {/* Right Column: AI Insights */}
              <div className="rounded-xl bg-[#151821] border border-slate-800/50 p-6 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Insights</h2>
                
                <div className="flex flex-col gap-4">
                  {isLoading ? (
                    <div className="py-8 text-center text-slate-500 text-sm">Loading insights...</div>
                  ) : conflicts.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-sm">No risks or conflicts detected.</div>
                  ) : (
                    conflicts.map(conflict => (
                      <InsightCard
                        key={conflict.id}
                        icon={<AlertTriangle size={16} className="text-amber-400" />}
                        title={conflict.topic.toUpperCase()}
                        description={conflict.description}
                        score={conflict.status === 'needs_review' ? 70 : 95}
                        colorClass={conflict.status === 'needs_review' ? 'bg-amber-500' : 'bg-indigo-500'}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
      ${active 
        ? 'bg-[#1e2330] text-indigo-400 shadow-sm' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2330]/50'
      }`}
    >
      <span className={active ? "text-indigo-400" : "text-slate-500"}>{icon}</span>
      {label}
    </button>
  )
}

function StatCard({ title, value, trend, trendColor }: { title: string, value: string, trend: string, trendColor: string }) {
  return (
    <div className="bg-[#151821] rounded-xl border border-slate-800/50 p-5 flex flex-col gap-2 hover:border-slate-700 transition-colors shadow-sm">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
      </div>
    </div>
  )
}

function DocumentRow({ type, title, meta, status, statusColor }: { type: string, title: string, meta: string, status: string, statusColor: string }) {
  const isPdf = type === 'PDF'
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-[#0F1117]/50 border border-slate-800/30 hover:border-slate-700 hover:bg-[#151821] transition-all group">
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 px-2 py-1.5 rounded-md text-[10px] font-bold tracking-wider ${isPdf ? 'bg-indigo-500/20 text-indigo-400' : 'bg-sky-500/20 text-sky-400'}`}>
          {type}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{title}</span>
          <span className="text-xs text-slate-500 font-medium">{meta}</span>
        </div>
      </div>
      <div className={`px-2.5 py-1 rounded-full border text-xs font-medium ${statusColor}`}>
        {status}
      </div>
    </div>
  )
}

function InsightCard({ icon, title, description, score, colorClass }: { icon: React.ReactNode, title: string, description: string, score: number, colorClass: string }) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-[#0F1117]/50 border border-slate-800/30 hover:border-slate-700 transition-all">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold text-slate-200 tracking-wide">{title}</span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center justify-between gap-3 mt-1">
        <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} rounded-full relative`} style={{ width: `${score}%` }}>
             <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
        <span className="text-xs font-semibold text-indigo-400">{score}%</span>
      </div>
    </div>
  )
}
