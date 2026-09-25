/**
 * Typed API client.
 *
 * Automatically attaches the Firebase Auth ID token to every request.
 * Falls back to unauthenticated requests when no user is signed in
 * (for testing / mock mode).
 */
import { auth } from "@/lib/firebase"

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser
  if (!user) return { "Content-Type": "application/json" }
  const token = await user.getIdToken()
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const headers = await getAuthHeaders()
  if (isFormData) {
    // Let browser set Content-Type with boundary for multipart
    delete headers["Content-Type"]
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    console.error(`API Error (${res.status}) on ${method} ${path}: ${JSON.stringify(err)}`)
    throw new Error(err.detail ?? "API error")
  }

  const json = await res.json()
  // Unwrap {data: ..., message: ...} envelope
  return ("data" in json ? json.data : json) as T
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(path: string, formData: FormData) =>
    request<T>("POST", path, formData, true),
}
