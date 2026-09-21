import { cn } from "@/lib/utils"

export type PipelineStepStatus = "completed" | "active" | "pending" | "action-required" | "processing"

export interface PipelineStep {
  step: string
  title: string
  subtitle: string
  status: PipelineStepStatus
  badgeText: string
  badgeVariant: "default" | "success" | "warning" | "destructive" | "outline" | "secondary"
}

const defaultSteps: PipelineStep[] = [
  { step: "01", title: "Situation", subtitle: "Intake context set", status: "completed", badgeText: "100% COMPLETE", badgeVariant: "success" },
  { step: "02", title: "Documents", subtitle: "4 Records Parsed", status: "completed", badgeText: "PARSED (OCR)", badgeVariant: "success" },
  { step: "03", title: "Evidence", subtitle: "27 Clauses tagged", status: "completed", badgeText: "INDEXED", badgeVariant: "success" },
  { step: "04", title: "Conflicts & Gaps", subtitle: "2 Items Detected", status: "action-required", badgeText: "ACTION REQ.", badgeVariant: "warning" },
  { step: "05", title: "Timeline", subtitle: "6 Chrono events", status: "completed", badgeText: "MAPPED", badgeVariant: "secondary" },
  { step: "06", title: "Questions", subtitle: "4 Inquiries ready", status: "pending", badgeText: "COMPILED", badgeVariant: "secondary" },
  { step: "07", title: "Legal Brief", subtitle: "Final dossier pack", status: "pending", badgeText: "DRAFTING", badgeVariant: "secondary" },
]

export function PipelineTracker({ steps = defaultSteps }: { steps?: PipelineStep[] }) {
  return (
    <section className="mb-space-xl glass-panel rounded-xl p-space-lg lg:p-space-xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-space-md mb-space-lg gap-2 relative z-10">
        <div>
          <span className="font-citation-code text-citation-code uppercase text-outline tracking-wider font-semibold">Workflow Diagnostic</span>
          <h2 className="font-headline-md text-headline-md text-on-surface">The 7-Step Evidence Pipeline</h2>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>Validated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span>Active Step</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-surface-variant"></span>
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-space-sm relative">
        {steps.map((s, i) => (
          <PipelineNode key={i} data={s} />
        ))}
      </div>
    </section>
  )
}

function PipelineNode({ data }: { data: PipelineStep }) {
  const isCompleted = data.status === "completed"
  const isActive = data.status === "active"
  const isActionRequired = data.status === "action-required"
  
  return (
    <div className={cn(
      "p-space-md rounded-lg flex flex-col justify-between gap-3 relative overflow-hidden transition-all duration-300",
      isActionRequired ? "bg-gradient-to-br from-tertiary-container/30 to-surface-container border border-tertiary/20 shadow-[0_0_15px_rgba(255,165,0,0.1)] hover:-translate-y-1" : 
      isActive ? "bg-gradient-to-br from-primary-container/30 to-surface-container border border-primary/30 shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:-translate-y-1" : 
      isCompleted ? "glass hover:bg-surface-container-low border border-border" :
      "glass opacity-60 hover:opacity-100"
    )}>
      {(isActionRequired || isActive) && (
        <div className={cn("absolute top-0 left-0 right-0 h-1 shadow-[0_0_10px_currentColor]", isActionRequired ? "bg-tertiary text-tertiary" : "bg-primary text-primary")}></div>
      )}
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-citation-code text-citation-code font-bold",
          isActionRequired || isActive ? "text-primary" :
          isCompleted ? "text-secondary" : "text-outline"
        )}>{data.step}</span>
        
        {isCompleted && <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>}
        {isActionRequired && <span className="material-symbols-outlined text-tertiary text-[18px]">warning</span>}
        {!isCompleted && !isActionRequired && <span className="material-symbols-outlined text-outline text-[16px]">radio_button_unchecked</span>}
      </div>
      <div>
        <span className={cn("font-label-md text-label-md block", (isActionRequired || isActive) ? "font-semibold text-on-surface" : "text-on-surface")}>{data.title}</span>
        <span className={cn("font-label-sm text-label-sm", isActionRequired ? "text-tertiary-container font-medium" : "text-on-surface-variant")}>{data.subtitle}</span>
      </div>
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-citation-code text-[10px] w-fit",
        data.badgeVariant === "success" && "bg-secondary-fixed text-on-secondary-fixed font-semibold",
        data.badgeVariant === "warning" && "bg-tertiary-fixed text-on-tertiary-fixed font-bold",
        data.badgeVariant === "secondary" && "bg-surface-container text-on-surface-variant"
      )}>
        {data.badgeText}
      </span>
    </div>
  )
}
