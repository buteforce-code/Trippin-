/** Relative time labels matching the prototype's style ("Just now", "2 hrs ago", "Yesterday", "3 days ago"). */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Just now'
  if (min < 60) return `${min} min ago`

  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`

  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

/** "Jun 19" — short en-IN day label used on expenses created in-app. */
export function shortDateLabel(d: Date = new Date()): string {
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

/** Local YYYY-MM-DD for a date (default today) — safe for <input type="date"> + DB date columns. */
export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Local YYYY-MM-DD for `days` ago (default yesterday). */
export function isoDaysAgo(days = 1, from: Date = new Date()): string {
  return isoDate(new Date(from.getTime() - days * 86_400_000))
}

/** Parse a YYYY-MM-DD string as a *local* date (no UTC midnight drift). null when malformed. */
export function parseISODate(iso: string): Date | null {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** "Jun 19" from a YYYY-MM-DD string (parsed locally). Empty string when malformed. */
export function shortLabelFromISO(iso: string): string {
  const d = parseISODate(iso)
  return d ? shortDateLabel(d) : ''
}
