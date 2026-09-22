export function EvidencePanel({ evidence, onClose }: { evidence: any, onClose: () => void }) {
  if (!evidence) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-container-low">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary">policy</span>
            <h3 className="font-headline-sm font-semibold">Evidence Viewer</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-space-lg flex flex-col gap-space-lg">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Source Document</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">description</span>
              <span className="font-medium text-on-surface text-lg">{evidence.source}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 bg-surface-container-low p-3 rounded-lg border border-border">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider">Page</span>
              <span className="font-semibold text-on-surface">{evidence.page}</span>
            </div>
            <div className="flex flex-col gap-1 bg-surface-container-low p-3 rounded-lg border border-border">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider">Clause</span>
              <span className="font-semibold text-on-surface">{evidence.clause}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Source Text</span>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 font-serif text-on-surface leading-relaxed relative">
              <span className="absolute top-2 left-2 text-primary/20 material-symbols-outlined text-[32px]">format_quote</span>
              <p className="relative z-10 pl-6">{evidence.text}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider">Status</span>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary-container text-on-secondary-container rounded-lg w-fit">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="font-semibold text-sm">FOUND DIRECTLY</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-container-low flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-medium rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
