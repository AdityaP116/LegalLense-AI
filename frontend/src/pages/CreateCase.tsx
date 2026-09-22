import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { caseService } from "@/services/caseService"
import { documentService } from "@/services/documentService"
import { analysisService } from "@/services/analysisService"

export function CreateCase() {
  const navigate = useNavigate()
  
  const [title, setTitle] = useState("New Case")
  const [selectedCategory, setSelectedCategory] = useState("employment")
  const [narrative, setNarrative] = useState("")
  const [goals, setGoals] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { id: "employment", icon: "badge", title: "Employment" },
    { id: "housing", icon: "home_work", title: "Rental / Housing" },
    { id: "business", icon: "handshake", title: "Business Contract" },
    { id: "other", icon: "more_horiz", title: "Other" },
  ]

  const MAX_SIZE_MB = 50;
  const ALLOWED_EXTS = ['.pdf', '.docx'];

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTS.includes(ext!)) {
      return `"${file.name}" is not supported. Please upload PDF or DOCX files only.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setError(null);
    const newFiles = 'dataTransfer' in e ? Array.from(e.dataTransfer.files) : Array.from((e.target as HTMLInputElement).files || []);
    
    const validFiles: File[] = [];
    for (const f of newFiles) {
      const err = validateFile(f);
      if (err) {
        setError(err);
        return;
      }
      validFiles.push(f);
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateCase = async () => {
    if (!title.trim()) {
      setError("Please provide a case title.");
      return;
    }
    if (narrative.trim().length < 10) {
      setError("Please describe your situation in more detail (at least 10 characters).");
      return;
    }
    if (files.length === 0) {
      setError("Please upload at least one document.");
      return;
    }
    
    try {
      setIsCreating(true)
      setError(null)
      
      // 1. Create Case
      const newCase = await caseService.create({
        title,
        category: selectedCategory,
        situation: narrative,
        goals: goals
      })

      // 2. Upload Documents
      for (const file of files) {
        await documentService.upload(newCase.id, file)
      }

      // 3. Trigger Analysis
      await analysisService.triggerAnalysis(newCase.id)

      // 4. Navigate to Case Workspace
      navigate(`/case/${newCase.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to create case")
      setIsCreating(false)
    }
  }

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    )
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-space-xl gap-space-xl">
      <div className="flex items-center gap-2 mb-space-md">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 px-0 hover:bg-transparent">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-col gap-space-xs">
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Create New Case</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Provide context and upload documents to begin analysis.
        </p>
      </div>

      {error && (
        <div className="p-space-md bg-error-container text-error rounded-xl border border-error/20">
          {error}
        </div>
      )}

      {/* Case Details */}
      <section className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Case Details</h2>
        
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-on-surface font-semibold">Case Title</label>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
            placeholder="e.g. Employment Dispute"
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className="font-label-md text-on-surface font-semibold">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-colors border ${
                  selectedCategory === cat.id 
                  ? 'bg-primary-container/20 border-primary text-primary' 
                  : 'bg-surface-container-low border-transparent hover:border-border text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                <span className="font-label-sm text-center font-medium">{cat.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className="font-label-md text-on-surface font-semibold">Describe your situation</label>
          <textarea 
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            className="p-3 bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[100px] text-on-surface"
            placeholder="Detail key parties, relevant dates, and what happened..."
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className="font-label-md text-on-surface font-semibold">What do you want to understand?</label>
          <div className="flex flex-col gap-2">
            {['Important obligations', 'Important dates', 'Conflicting information', 'Prepare questions'].map(goal => (
              <label key={goal} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={goals.includes(goal)}
                  onChange={() => toggleGoal(goal)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                />
                <span className="text-on-surface group-hover:text-primary transition-colors">{goal}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-headline-md text-headline-md text-on-surface">Documents</h2>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-citation-code text-xs">
            {files.length} uploaded
          </span>
        </div>

        <div className="grid gap-3">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-border">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">description</span>
                <span className="text-on-surface text-sm font-medium">{file.name}</span>
              </div>
              <button onClick={() => removeFile(idx)} className="text-on-surface-variant hover:text-error transition-colors p-1">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={handleFileChange}
          className="mt-2 rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container/50 transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer text-on-surface-variant hover:text-primary group"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden" 
          />
          <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">cloud_upload</span>
          <span className="font-medium">Upload Documents (PDF, DOCX)</span>
        </div>
      </section>

      <div className="flex justify-end pt-4 pb-8">
        <Button 
          onClick={handleCreateCase} 
          disabled={isCreating} 
          className="h-12 px-8 gap-2 w-full sm:w-auto"
        >
          {isCreating ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              Creating & Analyzing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              Create Case & Analyze
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
