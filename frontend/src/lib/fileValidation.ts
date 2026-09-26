export const ALLOWED_EXTS = ['.pdf', '.docx']
export const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
export const MAX_SIZE_MB = 50

export const validateFile = (file: File): string | null => {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" is not supported. Please upload PDF or DOCX files only.`
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `"${file.name}" is too large. Maximum file size is ${MAX_SIZE_MB}MB.`
  }
  return null
}
