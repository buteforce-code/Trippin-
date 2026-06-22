import { useAnnouncements } from '../hooks/queries'
import { useTrip } from '../providers/TripProvider'
import { AnnouncementCard } from '../components/announcements/AnnouncementCard'
import { AnnouncementComposer } from '../components/announcements/AnnouncementComposer'
import { MUTED_TEXT } from '../components/ui/a11y'

/** On-brand empty state shown when a trip has no announcements yet. */
function EmptyState({ canEditMoney }: { canEditMoney: boolean }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: '34px 22px',
        boxShadow: 'var(--card-shadow)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 40, lineHeight: 1 }} aria-hidden="true">
        📣
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", marginTop: 12 }}>
        No announcements yet
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: MUTED_TEXT, marginTop: 6, lineHeight: 1.5 }}>
        {canEditMoney
          ? 'Post the first update to keep everyone on the same page.'
          : 'Updates from your Route Head will show up here.'}
      </div>
    </div>
  )
}

/** Announcements feed: pinned first, then newest. Composer shown to editors. */
export function AnnouncementsScreen() {
  const { currentTripId, canEditMoney } = useTrip()
  const { data: announcements, isLoading } = useAnnouncements(currentTripId)

  const items = announcements ?? []

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", padding: '8px 2px 14px' }}>
        Announcements
      </div>

      {canEditMoney && <AnnouncementComposer tripId={currentTripId} />}

      {isLoading ? (
        <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, padding: '8px 2px' }}>
          Loading announcements…
        </div>
      ) : items.length === 0 ? (
        <EmptyState canEditMoney={canEditMoney} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  )
}
