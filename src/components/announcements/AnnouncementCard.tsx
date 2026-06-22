import type { Announcement } from '../../data/types'
import { formatRelativeTime } from '../../lib/time'
import { MUTED_TEXT } from '../ui/a11y'

interface AnnouncementCardProps {
  announcement: Announcement
}

/** Initials for the small author avatar (first letters of the first two words). */
function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const second = parts.length > 1 ? parts[1][0] ?? '' : ''
  return (first + second).toUpperCase()
}

/** A single announcement in the feed. Pinned items get a tinted surface + 📌 marker. */
export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const { authorName, body, pinned, createdAt } = announcement

  return (
    <article
      style={{
        background: pinned ? 'var(--tint)' : '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: 'var(--card-shadow)',
        border: pinned ? '1.5px solid var(--primary)' : '1.5px solid transparent',
      }}
    >
      {pinned && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '.4px',
            textTransform: 'uppercase',
            color: 'var(--primary-d)',
            background: '#fff',
            padding: '4px 9px',
            borderRadius: 20,
            marginBottom: 11,
          }}
        >
          <span aria-hidden="true">📌</span> Pinned
        </div>
      )}

      <p
        style={{
          margin: 0,
          fontSize: 14.5,
          fontWeight: 600,
          lineHeight: 1.5,
          color: 'var(--ink)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {body}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 13 }}>
        <div
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            flex: 'none',
            background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 800,
            fontFamily: "'Baloo 2',sans-serif",
          }}
        >
          {authorInitials(authorName)}
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink)' }}>{authorName}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: MUTED_TEXT }} aria-hidden="true">
          ·
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: MUTED_TEXT }}>
          {formatRelativeTime(createdAt)}
        </span>
      </div>
    </article>
  )
}
