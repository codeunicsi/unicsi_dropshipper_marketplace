/**
 * Build a browser-loadable URL for files served from the API's `/uploads/` path.
 * Fixes broken previews when the DB has e.g. `https://localhost:8000/...` but the API runs on `http://`.
 */
export function uploadsImageDisplayUrl(stored: string): string {
  if (!stored) return ''
  if (stored.startsWith('data:image')) return stored

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'

  let origin: string
  try {
    origin = new URL(apiBase).origin
  } catch {
    origin = 'http://localhost:8000'
  }

  try {
    if (stored.startsWith('/')) {
      return `${origin}${stored}`
    }
    const parsed = new URL(stored)
    if (parsed.pathname.startsWith('/uploads/')) {
      return `${origin}${parsed.pathname}${parsed.search}`
    }
  } catch {
    /* ignore */
  }

  return stored
}
