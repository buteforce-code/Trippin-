import { useNavigate } from 'react-router-dom'
import { useTrip } from '../providers/TripProvider'
import { useTheme } from '../providers/ThemeProvider'
import { fmt } from '../lib/money'
import { APP_NAME, APP_VENDOR } from '../lib/brand'
import { MUTED_TEXT } from '../components/ui/a11y'
import { ROLE_BADGE } from '../components/members/roleBadgeStyles'
import { AccountPanel } from '../components/account/AccountPanel'
import focus from '../components/ui/focus.module.css'

/**
 * Post-login home. Lists every trip the signed-in user belongs to; tapping one
 * makes it the active trip and enters the per-trip dashboard (`/home`). Also
 * the place to create/join a trip and to sign out. Renders full-page (its own
 * background, no bottom nav) since it sits above the per-trip shell.
 */
export function MyTripsScreen() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { trips, currentTripId, setCurrentTripId, isLoadingTrips } = useTrip()

  const enterTrip = (id: string) => {
    setCurrentTripId(id)
    navigate('/home')
  }

  const hasTrips = trips.length > 0

  return (
    <div className="app-bg" data-theme={theme} style={{ alignItems: 'center' }}>
      <div
        style={{
          width: 'min(100%, var(--frame-max))',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 22px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 26px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
          color: 'var(--ink)',
        }}
      >
        {/* Greeting / brand header */}
        <header style={{ marginBottom: 20, animation: 'krise 560ms cubic-bezier(.16,1,.3,1) both' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: MUTED_TEXT }}>
            Namaste 🌴 · {APP_NAME} by {APP_VENDOR}
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1.1, marginTop: 6 }}>
            Your trips
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: MUTED_TEXT, marginTop: 4 }}>
            {hasTrips ? 'Pick a trip to jump back in.' : "You're not in any trips yet — start one or join with an invite."}
          </p>
        </header>

        {/* Trips list */}
        {isLoadingTrips ? (
          <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, padding: '8px 2px' }}>Loading your trips…</div>
        ) : hasTrips ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {trips.map((t) => {
              const active = t.id === currentTripId
              const badge = ROLE_BADGE[t.myRole]
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => enterTrip(t.id)}
                  className={`pressable ${focus.ring}`}
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    padding: '15px 16px',
                    boxShadow: '0 6px 16px rgba(11,77,74,.07)',
                    border: `1.5px solid ${active ? 'var(--primary)' : 'transparent'}`,
                  }}
                >
                  {/* Trip monogram */}
                  <div
                    aria-hidden="true"
                    style={{
                      width: 46,
                      height: 46,
                      flex: 'none',
                      borderRadius: 14,
                      background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 18,
                      fontFamily: "'Baloo 2',sans-serif",
                    }}
                  >
                    {t.name.trim().charAt(0).toUpperCase() || '🌴'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                      {active && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary-d)', flex: 'none' }}>● Active</span>}
                    </div>
                    <div style={{ fontSize: 12, color: MUTED_TEXT, fontWeight: 600, marginTop: 3 }}>{fmt(t.perHeadAmount)} / head</div>
                  </div>

                  <span style={{ fontSize: 10.5, fontWeight: 800, padding: '5px 10px', borderRadius: 20, background: badge.bg, color: badge.color, whiteSpace: 'nowrap', flex: 'none' }}>{badge.label}</span>

                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MUTED_TEXT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }} aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              )
            })}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              textAlign: 'center',
              background: '#fff',
              borderRadius: 'var(--radius-md)',
              padding: '28px 22px',
              boxShadow: '0 6px 16px rgba(11,77,74,.07)',
            }}
          >
            <span style={{ fontSize: 34 }} aria-hidden="true">🧳</span>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>No trips yet</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: MUTED_TEXT }}>Create your first trip, or join one with an invite link.</div>
          </div>
        )}

        {/* Create / Join */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
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

        {/* Push the account panel to the bottom of the viewport. */}
        <div style={{ flex: 1, minHeight: 24 }} />

        <AccountPanel />
      </div>
    </div>
  )
}
