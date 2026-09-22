import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { caseService } from '@/services/caseService'
import { Overview } from '@/components/case/Overview'
import { Documents } from '@/components/case/Documents'
import { Questions } from '@/components/case/Questions'
import { Brief } from '@/components/case/Brief'

type Tab = 'overview' | 'documents' | 'questions' | 'brief'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'documents', label: 'Documents', icon: 'folder_open' },
  { id: 'questions', label: 'Q&A', icon: 'chat' },
  { id: 'brief', label: 'Preparation Brief', icon: 'article' },
]

export function CaseWorkspace() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Persist active tab in URL
  const tabFromUrl = searchParams.get('tab') as Tab | null
  const [activeTab, setActiveTab] = useState<Tab>(tabFromUrl ?? 'overview')
  const [caseData, setCaseData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (caseId) {
      caseService.get(caseId)
        .then(data => setCaseData(data))
        .catch(() => setError('Failed to load case. It may not exist or you may not have access.'))
        .finally(() => setIsLoading(false))
    }
  }, [caseId])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-on-surface-variant text-[36px] animate-pulse">folder_open</span>
        <p className="text-on-surface-variant text-sm">Loading case workspace...</p>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-error text-[36px]">error</span>
        <p className="text-error font-semibold">{error ?? 'Case not found.'}</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-surface-container rounded-lg text-sm text-on-surface hover:bg-surface-container-high">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Workspace Header */}
      <div className="bg-surface-container-lowest border-b border-border px-space-xl py-space-md flex flex-col gap-space-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
              <button
                onClick={() => navigate('/')}
                className="hover:text-on-surface transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                Dashboard
              </button>
              <span>/</span>
              <span className="text-on-surface">Case Workspace</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">{caseData.title}</h1>
              <span className="px-3 py-0.5 bg-surface-container text-on-surface-variant rounded-full text-xs font-medium">
                {caseData.category}
              </span>
            </div>
          </div>
          <div className="text-xs text-on-surface-variant text-right hidden md:block">
            <span className="font-citation-code">#{caseId?.slice(0, 8)}</span>
            <br />
            {caseData.createdAt && (
              <span>{new Date(caseData.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-2 -mb-[17px] overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 overflow-auto bg-slate-50 p-space-xl">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === 'overview' && <Overview caseId={caseId!} caseData={caseData} />}
          {activeTab === 'documents' && <Documents caseId={caseId!} />}
          {activeTab === 'questions' && <Questions caseId={caseId!} />}
          {activeTab === 'brief' && <Brief caseId={caseId!} caseData={caseData} />}
        </div>
      </div>
    </div>
  )
}
