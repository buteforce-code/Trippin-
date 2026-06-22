import { useNavigate } from 'react-router-dom'
import { useTrip } from '../providers/TripProvider'
import { fmt } from '../lib/money'
import { MUTED_TEXT } from '../components/ui/a11y'
import focus from '../components/ui/focus.module.css'
import { ROLE_BADGE } from '../components/members/roleBadgeStyles'
import { MemberRoster } from '../components/members/MemberRoster'
import { InvitePanel } from '../components/invites/InvitePanel'

const SECTION_TITLE = { fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" } as const

/**
 * Trips + people hub. Lists every trip (switcher), then for the active trip
 * shows the crew roster, Route-Head role controls, invite tools, and quick
 * access links to itinerary & announcements.
 */
export function TripsScreen() {
  const navigate = useNavigate()
  const { trips, currentTripId, currentTrip, setCurrentTripId, isRouteHead, isLoadingTrips } = useTrip()

  const onSwitch = (id: string) => {
    setCurrentTripId(id)
    navigate('/')
  }

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", padding: '8px 2px 14px' }}>Your trips</div>

      {isLoadingTrips ? (
        <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, padding: '8px 2px' }}>Loading your trips…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {trips.map((t) => {
            const active = t.id === currentTripId
            const badge = ROLE_BADGE[t.myRole]
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSwitch(t.id)}
                aria-current={active ? 'true' : undefined}
                className={`pressable ${focus.ring}`}
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#fff',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  boxShadow: '0 4px 12px rgba(11,77,74,.05)',
                  border: `1.5px solid ${active ? 'var(--primary)' : 'transparent'}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                    {active && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary-d)' }}>● Active</span>}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED_TEXT, fontWeight: 600, marginTop: 3 }}>{fmt(t.perHeadAmount)} / head</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 800, padding: '5px 10px', borderRadius: 20, background: badge.bg, color: badge.color, whiteSpace: 'nowrap', flex: 'none' }}>{badge.label}</span>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ ...SECTION_TITLE, margin: '22px 2px 10px' }}>Add a trip</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => navigate('/create-trip')}
          className={`pressable ${focus.ringOnDark}`}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 16, color: '#fff', background: 'linear-gradient(135deg,var(--primary),var(--primary-d))', boxShadow: '0 12px 24px var(--shadow)' }}
        >
          ＋ Create trip
        </button>
        <button
          type="button"
          onClick={() => navigate('/join')}
          className={`pressable ${focus.ring}`}
          style={{ flex: 1, border: '1.5px solid var(--primary)', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, padding: 14, borderRadius: 16, color: 'var(--primary-d)', background: 'var(--tint)' }}
        >
          Join a trip
        </button>
      </div>

      {/* Quick-access cards for itinerary & announcements */}
      <div style={{ ...SECTION_TITLE, margin: '26px 2px 10px' }}>Quick access</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => navigate('/trip')}
          className={`pressable ${focus.ring}`}
          style={{ flex: 1, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 4px 12px rgba(11,77,74,.05)' }}
        >
          <span style={{ fontSize: 22 }} aria-hidden="true">🗺️</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)' }}>Route & Itinerary</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_TEXT }}>Stops, weather, map</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate('/announcements')}
          className={`pressable ${focus.ring}`}
          style={{ flex: 1, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 4px 12px rgba(11,77,74,.05)' }}
        >
          <span style={{ fontSize: 22 }} aria-hidden="true">📣</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)' }}>Announcements</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_TEXT }}>Updates from Route Head</div>
          </div>
        </button>
      </div>

      {currentTripId && (
        <>
          <div style={{ ...SECTION_TITLE, margin: '26px 2px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Crew{currentTrip ? ` · ${currentTrip.name}` : ''}</span>
            {!isRouteHead && <span style={{ fontSize: 11, fontWeight: 700, color: MUTED_TEXT }}>View only</span>}
          </div>
          <MemberRoster tripId={currentTripId} />

          {isRouteHead && (
            <>
              <div style={{ ...SECTION_TITLE, margin: '26px 2px 10px' }}>Invite people</div>
              <InvitePanel tripId={currentTripId} tripName={currentTrip?.name} />
            </>
          )}
        </>
      )}
    </div>
  )
}
