import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useInviteInfo, useJoinTrip } from '../hooks/queries'
import { useTrip } from '../providers/TripProvider'
import { card, errorText, heading, input, label, primaryBtn, screenWrap, subtle } from '../components/onboarding/formStyles'
import { MUTED_TEXT } from '../components/ui/a11y'
import focus from '../components/ui/focus.module.css'

type Status = 'idle' | 'busy' | 'error'

const ROLE_LABEL: Record<string, string> = {
  route_head: 'Route Head',
  assistant: 'Assistant',
  member: 'Member',
}

/**
 * Join-via-invite screen. With a token in the URL (`/join/:token`) it previews
 * the trip via invite_info; otherwise it asks for a token. Name/nickname →
 * useJoinTrip → switch to the joined trip → home.
 */
export function JoinTripScreen() {
  const { token: routeToken } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const joinTrip = useJoinTrip()
  const { setCurrentTripId } = useTrip()

  const [manualToken, setManualToken] = useState('')
  const token = routeToken ?? (manualToken.trim() || undefined)
  const { data: invite, isLoading: inviteLoading } = useInviteInfo(token)

  const [nickname, setNickname] = useState('')
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setStatus('busy')
    setError(null)
    try {
      const joinedTripId = await joinTrip.mutateAsync({
        token,
        fullName: fullName.trim() || undefined,
        nickname: nickname.trim() || undefined,
      })
      setCurrentTripId(joinedTripId)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join this trip. The invite may have expired.")
      setStatus('error')
    }
  }

  const invalidToken = Boolean(token) && !inviteLoading && (invite == null || invite.valid === false)

  return (
    <div className="app-bg" data-theme="lagoon" style={{ alignItems: 'center' }}>
      <div style={screenWrap}>
        <div style={{ marginBottom: 18 }}>
          <div style={heading}>Join a trip ✈️</div>
          {invite && invite.valid ? (
            <div style={subtle}>
              You're joining <b style={{ color: 'var(--ink)' }}>{invite.tripName}</b> as{' '}
              <b style={{ color: 'var(--primary-d)' }}>{ROLE_LABEL[invite.inviteRole] ?? invite.inviteRole}</b>.
            </div>
          ) : (
            <div style={subtle}>Paste the invite code your Route Head shared with you.</div>
          )}
        </div>

        <form onSubmit={onSubmit} style={card}>
          {!routeToken && (
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="join-token" style={label}>Invite code</label>
              <input
                id="join-token"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste invite code"
                required
                className={focus.ring}
                style={input}
              />
              {invalidToken && <div style={errorText}>That invite code isn't valid or has expired.</div>}
              {inviteLoading && token && <div style={{ fontSize: 12, color: MUTED_TEXT, fontWeight: 600, marginTop: 8 }}>Checking invite…</div>}
            </div>
          )}

          <label htmlFor="join-nickname" style={label}>Your nickname (shown to the crew)</label>
          <input
            id="join-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Meera"
            className={focus.ring}
            style={input}
          />

          {/* TODO(agent): full name optional; prior-contribution note collected on /onboarding. */}
          <div style={{ marginTop: 16 }}>
            <label htmlFor="join-fullname" style={label}>Full name (optional)</label>
            <input
              id="join-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Meera Pillai"
              className={focus.ring}
              style={input}
            />
          </div>

          <div role="status" aria-live="polite">
            {error && <div style={errorText}>{error}</div>}
          </div>

          <button
            type="submit"
            disabled={status === 'busy' || !token || invalidToken}
            className={`pressable ${focus.ringOnDark}`}
            style={{ ...primaryBtn, opacity: status === 'busy' || !token || invalidToken ? 0.6 : 1 }}
          >
            {status === 'busy' ? 'Joining…' : 'Join trip'}
          </button>
        </form>

        <div style={{ ...subtle, textAlign: 'center', marginTop: 16 }}>
          No invite? <Link to="/create-trip" style={{ color: 'var(--primary-d)', fontWeight: 800 }}>Start your own trip</Link>
        </div>
      </div>
    </div>
  )
}
