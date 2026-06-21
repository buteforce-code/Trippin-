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
