/** Best-effort message from API JSON (Joi `errors`, `message`, `error`, etc.). */
export function formatApiErrorBody(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Request failed'
  const d = data as Record<string, unknown>
  if (typeof d.message === 'string' && d.message) return d.message
  if (typeof d.error === 'string' && d.error) return d.error
  if (Array.isArray(d.errors) && d.errors.length > 0) {
    return d.errors
      .map((e) => {
        if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string') {
          const msg = (e as { message: string }).message
          const field = (e as { field?: string }).field
          return field ? `${field}: ${msg}` : msg
        }
        return String(e)
      })
      .join('; ')
  }
  return 'Request failed'
}
