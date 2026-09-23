import { useState, useEffect } from 'react'
import { documentService } from '@/services/documentService'
import type { LegalDocument, Evidence } from '@/types'

interface DocumentViewerProps {
  document: LegalDocument
  highlightEvidence?: Evidence | null
  onClose: () => void
}

export function DocumentViewer({ document, highlightEvidence, onClose }: DocumentViewerProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isPdf = document.mimeType?.includes('pdf') || document.filename?.toLowerCase().endsWith('.pdf')
  const page = highlightEvidence?.page ?? 1

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    documentService.getDownloadUrl(document.id)
      .then(res => {
        if (!cancelled) {
          setDownloadUrl(res.url)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Could not load document URL.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [document.id])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-3xl shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-surface-container border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">
              {isPdf ? 'picture_as_pdf' : 'description'}
            </span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-on-surface text-sm truncate" title={document.filename}>
              {document.filename}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono uppercase">
                {isPdf ? 'PDF' : 'DOCX'}
              </span>
              {document.pageCount && (
                <span className="text-xs text-on-surface-variant">{document.pageCount} pages</span>
              )}
              {document.fileSize && (
                <span className="text-xs text-on-surface-variant">
                  {(document.fileSize / 1024 / 1024).toFixed(1)} MB
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={document.filename}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
                title="Download file"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
              title="Close viewer (Esc)"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Evidence highlight strip */}
        {highlightEvidence && (
          <div className="px-5 py-3 bg-primary/5 border-b border-primary/20 shrink-0">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">
                format_quote
              </span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Evidence Highlight
                  {highlightEvidence.page && (
                    <span className="ml-2 font-normal text-primary/70">Page {highlightEvidence.page}</span>
                  )}
                  {highlightEvidence.section && (
                    <span className="ml-2 font-normal text-primary/70">· {highlightEvidence.section}</span>
                  )}
                </span>
                <p className="text-sm text-on-surface italic leading-relaxed line-clamp-3">
                  "{highlightEvidence.text}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document body */}
        <div className="flex-1 overflow-hidden bg-[#1a1a2e]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-on-surface-variant">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-primary text-[24px] animate-spin" style={{ animationDuration: '1.5s' }}>
                  sync
                </span>
              </div>
              <p className="text-sm">Loading document…</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
              <span className="material-symbols-outlined text-error text-[48px]">error</span>
              <div>
                <p className="font-semibold text-error mb-1">Could not load document</p>
                <p className="text-sm text-on-surface-variant">{error}</p>
                <p className="text-xs text-on-surface-variant mt-3">
                  This may be because the signed URL has expired, or the file was deleted.<br/>
                  Try closing and reopening the viewer.
                </p>
              </div>
            </div>
          ) : isPdf && downloadUrl ? (
            /* PDF: native browser iframe rendering */
            <iframe
              src={`${downloadUrl}#page=${page}&toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              title={document.filename}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : downloadUrl ? (
            /* DOCX / other: show extracted evidence chunks */
            <DocxFallback document={document} highlightEvidence={highlightEvidence} downloadUrl={downloadUrl} />
          ) : null}
        </div>
      </div>
    </>
  )
}

/** DOCX fallback — shows extracted evidence chunks with the highlighted text prominent */
function DocxFallback({
  document,
  highlightEvidence,
  downloadUrl,
}: {
  document: LegalDocument
  highlightEvidence?: Evidence | null
  downloadUrl: string
}) {
  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col gap-6">
      {/* Info banner */}
      <div className="rounded-xl p-4 bg-surface-container-low border border-border flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">info</span>
        <div className="text-sm text-on-surface-variant leading-relaxed">
          <span className="font-semibold text-on-surface block mb-1">DOCX Preview</span>
          Word documents cannot be rendered inline. Download the file to view it in its original format.
          Extracted evidence from this document is shown below.
        </div>
      </div>

      {/* Download CTA */}
      <a
        href={downloadUrl}
        download={document.filename}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-outline-variant/40 hover:border-primary/50 hover:bg-primary/5 transition-all text-on-surface-variant hover:text-primary group"
      >
        <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">download</span>
        <div className="text-left">
          <span className="block font-semibold text-sm">{document.filename}</span>
          <span className="block text-xs opacity-70">Click to download and open in Word</span>
        </div>
      </a>

      {/* Highlighted evidence */}
      {highlightEvidence && (
        <div className="rounded-xl p-4 bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[18px]">format_quote</span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Referenced Passage
              {highlightEvidence.page && <span className="ml-2 font-normal">· Page {highlightEvidence.page}</span>}
              {highlightEvidence.section && <span className="ml-2 font-normal">· {highlightEvidence.section}</span>}
            </span>
          </div>
          <p className="text-on-surface text-sm leading-relaxed italic">"{highlightEvidence.text}"</p>
        </div>
      )}
    </div>
  )
}
