const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

function apiOriginAndHost(): { origin: string; host: string } {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'
  try {
    const u = new URL(apiBase)
    return { origin: u.origin, host: u.hostname.toLowerCase() }
  } catch {
    return { origin: 'http://localhost:8000', host: 'localhost' }
  }
}

/**
 * Build a browser-loadable URL for files served from the API's `/uploads/` path.
 * - Relative `/uploads/...` → current API origin from env.
 * - Absolute URLs under `/uploads/` are only re-pointed to the API when the stored
 *   host is loopback or matches the API host (fixes wrong port/protocol in dev).
 * - S3/CDN URLs that happen to use `/uploads/...` paths are left unchanged.
 */
export function uploadsImageDisplayUrl(stored: string): string {
  const raw = stored.trim()
  if (!raw) return ''
  if (raw.startsWith('data:image')) return raw

  const { origin, host: apiHost } = apiOriginAndHost()

  // Path-only (some APIs persist "/uploads/...")
  if (raw.startsWith('/')) {
    return `${origin}${raw}`
  }

  // "uploads/images/foo.png" without leading slash
  if (/^uploads\//i.test(raw)) {
    return `${origin}/${raw}`
  }

  try {
    const parsed = new URL(raw)
    const path = parsed.pathname
    if (!path.startsWith('/uploads/')) return raw

    const h = parsed.hostname.toLowerCase()
    const pointsAtOurApi =
      LOOPBACK_HOSTS.has(h) || (apiHost.length > 0 && h === apiHost)

    if (pointsAtOurApi) {
      return `${origin}${path}${parsed.search}`
    }
    return raw
  } catch {
    return raw
  }
}
