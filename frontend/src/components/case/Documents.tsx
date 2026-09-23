import { useState, useEffect, useRef, useCallback } from 'react'
import { documentService } from '@/services/documentService'
import { analysisService } from '@/services/analysisService'
import { DocumentViewer } from './DocumentViewer'
import type { LegalDocument } from '@/types'

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_EXTS = ['.pdf', '.docx']
const MAX_SIZE_MB = 50

function statusLabel(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    uploaded: { label: 'Uploaded', cls: 'bg-surface-container text-on-surface-variant' },
    processing: { label: 'Processing...', cls: 'bg-tertiary-fixed text-on-tertiary-fixed' },
    completed: { label: 'Processed', cls: 'bg-secondary-container text-on-secondary-container' },
    failed: { label: 'Failed', cls: 'bg-error-container text-error' },
  }
  return map[status] ?? { label: status, cls: 'bg-surface-container text-on-surface-variant' }
}

export function Documents({ caseId }: { caseId: string }) {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewerDoc, setViewerDoc] = useState<LegalDocument | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await documentService.list(caseId)
      setDocuments(docs)
    } catch (err: any) {
      setError(err.message ?? 'Failed to load documents.')
    } finally {
      setIsLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    loadDocuments()
    // Poll while any doc is processing
    const timer = setInterval(async () => {
      const docs = await documentService.list(caseId).catch(() => [] as LegalDocument[])
      setDocuments(docs)
      const anyProcessing = docs.some(d => d.processingStatus === 'processing' || d.processingStatus === 'uploaded')
      if (!anyProcessing) clearInterval(timer)
    }, 4000)
    return () => clearInterval(timer)
  }, [caseId, loadDocuments])

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" is not supported. Please upload PDF or DOCX files only.`
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" is too large. Maximum file size is ${MAX_SIZE_MB}MB.`
    }
    return null
  }

  const handleUpload = async (files: File[]) => {
    setError(null)
    const validFiles: File[] = []
    for (const f of files) {
      const err = validateFile(f)
      if (err) { setError(err); return }
      validFiles.push(f)
    }
    if (!validFiles.length) return

    setIsUploading(true)
    try {
      for (const file of validFiles) {
        setUploadProgress(`Uploading ${file.name}...`)
        await documentService.upload(caseId, file)
      }
      setUploadProgress('Upload complete. Processing started.')
      await loadDocuments()
      setTimeout(() => setUploadProgress(null), 3000)
    } catch (err: any) {
      setError(err.message ?? 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(Array.from(e.target.files))
      e.target.value = ''
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    await handleUpload(files)
  }

  const handleDelete = async (doc: LegalDocument) => {
    if (!confirm(`Delete "${doc.filename}"? This cannot be undone.`)) return
    try {
      await documentService.delete(doc.id)
      await loadDocuments()
    } catch (err: any) {
      setError(err.message ?? 'Delete failed.')
    }
  }

  const handleTriggerAnalysis = async () => {
    try {
      await analysisService.triggerAnalysis(caseId)
      alert('Analysis started! Check the Overview tab for progress.')
    } catch (err: any) {
      setError(err.message ?? 'Failed to start analysis.')
    }
  }

  if (isLoading) {
    return <div className="text-center p-10 text-on-surface-variant">Loading documents...</div>
  }

  const hasCompleted = documents.some(d => d.processingStatus === 'completed')

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-on-surface">Uploaded Documents</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Supported: PDF, DOCX · Max {MAX_SIZE_MB}MB per file</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant rounded-full text-sm font-semibold">
            {documents.length} {documents.length === 1 ? 'File' : 'Files'}
          </span>
          {hasCompleted && (
            <button
              onClick={handleTriggerAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">play_circle</span>
              Run Analysis
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-error-container text-error rounded-xl border border-error/20 text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
          <div>
            <span className="font-semibold block">Upload failed</span>
            {error}
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress && (
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
          {uploadProgress}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group ${
          dragOver
            ? 'border-primary bg-primary/10 text-primary'
            : isUploading
            ? 'border-outline-variant/30 cursor-not-allowed opacity-60'
            : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container/50 text-on-surface-variant hover:text-primary'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <span className={`material-symbols-outlined text-[36px] group-hover:scale-110 transition-transform ${dragOver ? 'scale-110' : ''}`}>
          cloud_upload
        </span>
        <div className="text-center">
          <p className="font-medium text-sm">
            {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs mt-0.5 opacity-70">PDF or DOCX · Up to {MAX_SIZE_MB}MB each</p>
        </div>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="p-10 text-center text-on-surface-variant text-sm">
          No documents uploaded yet. Upload your first document above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {documents.map(doc => {
            const st = statusLabel(doc.processingStatus)
            const processing = doc.processingStatus === 'processing' || doc.processingStatus === 'uploaded'
            return (
              <div key={doc.id} className="glass-panel p-space-md rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">
                      {doc.mimeType?.includes('pdf') ? 'picture_as_pdf' : 'description'}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-on-surface truncate" title={doc.filename}>{doc.filename}</span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-on-surface-variant">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                      </span>
                      {doc.pageCount && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-outline-variant" />
                          <span className="text-xs text-on-surface-variant">{doc.pageCount} pages</span>
                        </>
                      )}
                      {doc.fileSize && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-outline-variant" />
                          <span className="text-xs text-on-surface-variant">
                            {(doc.fileSize / 1024 / 1024).toFixed(1)}MB
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${st.cls}`}>
                        {processing && <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>}
                        {st.label}
                      </span>
                    </div>
                    {doc.processingError && (
                      <p className="text-xs text-error mt-1">{doc.processingError}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {doc.processingStatus === 'completed' && (
                      <button
                        onClick={() => setViewerDoc(doc)}
                        className="text-primary text-xs font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-primary/10"
                        title="View document"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc)}
                      className="text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 p-1"
                      title="Delete document"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Document Viewer slide-over */}
      {viewerDoc && (
        <DocumentViewer
          document={viewerDoc}
          onClose={() => setViewerDoc(null)}
        />
      )}
    </div>
  )
}
