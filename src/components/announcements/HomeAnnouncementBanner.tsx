import { useNavigate } from 'react-router-dom'
import { useAnnouncements } from '../../hooks/queries'
import { useTrip } from '../../providers/TripProvider'
import { formatRelativeTime } from '../../lib/time'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

/**
 * Tappable home banner surfacing the latest pinned (or latest) announcement.
 * - With announcements: shows it; tapping opens the feed.
 * - Empty + can edit: subtle prompt to post the first one.
 * - Empty + read-only member: renders nothing.
 */
export function HomeAnnouncementBanner() {
  const navigate = useNavigate()
  const { currentTripId, canEditMoney } = useTrip()
  const { data: announcements } = useAnnouncements(currentTripId)

  // Hook contract: pinned items come first, then newest — so [0] is the headline.
  const latest = announcements?.[0]
  const goToFeed = () => navigate('/announcements')

  if (!latest) {
    if (!canEditMoney) return null
    return (
      <button
        type="button"
        onClick={goToFeed}
        aria-label="No announcements yet. Post the first one."
        className={`pressable ${focus.ring}`}
        style={{
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          marginBottom: 14,
          border: '1.5px dashed #c8e2dc',
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: '12px 15px',
          cursor: 'pointer',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 18 }}>
          📣
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
            No announcements yet
          </span>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: MUTED_TEXT, marginTop: 1 }}>
            Tap to post the first update
          </span>
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MUTED_TEXT} strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={goToFeed}
      aria-label={`Announcement from ${latest.authorName}. Open announcements.`}
      className={`pressable ${focus.ring}`}
      style={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
        border: 'none',
        background: 'var(--tint)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 15px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(11,77,74,.05)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          flex: 'none',
          width: 36,
          height: 36,
          borderRadius: 12,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        📣
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.4px', textTransform: 'uppercase', color: 'var(--primary-d)' }}>
            {latest.pinned ? '📌 Pinned' : 'Announcement'}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: MUTED_TEXT }}>· {formatRelativeTime(latest.createdAt)}</span>
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 13.5,
            fontWeight: 700,
            color: 'var(--ink)',
            marginTop: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {latest.body}
        </span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-d)" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" style={{ flex: 'none' }}>
        <path d="m9 5 7 7-7 7" />
      </svg>
    </button>
  )
}
