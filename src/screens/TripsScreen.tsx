import { useNavigate } from 'react-router-dom'
import { useTrip } from '../providers/TripProvider'
import { fmt } from '../lib/money'
import { MUTED_TEXT } from '../components/ui/a11y'
import focus from '../components/ui/focus.module.css'
import type { MemberRole } from '../data/types'

const ROLE_BADGE: Record<MemberRole, { label: string; bg: string; color: string }> = {
  route_head: { label: 'Route Head', bg: '#D7F5F1', color: '#0BA5A5' },
  assistant: { label: 'Assistant', bg: '#FFF1CC', color: '#B8860B' },
  member: { label: 'Member', bg: '#eef4f2', color: '#7c948f' },
}

const SECTION_TITLE = { fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" } as const

/**
 * Trip switcher. Lists every trip the user belongs to, marks the active one,
 * and lets them switch or start a new trip.
 */
export function TripsScreen() {
  const navigate = useNavigate()
  const { trips, currentTripId, setCurrentTripId, isLoadingTrips } = useTrip()

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

      {/* TODO(agent): add member roster, role management, and invite-link creation
          here for the Route Head (useMembers / useSetMemberRole / useCreateInvite). */}
    </div>
  )
}
