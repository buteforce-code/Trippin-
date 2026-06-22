import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateTrip } from '../hooks/queries'
import { useTrip } from '../providers/TripProvider'
import { card, errorText, heading, input, label, primaryBtn, screenWrap, subtle } from '../components/onboarding/formStyles'
import focus from '../components/ui/focus.module.css'

type Status = 'idle' | 'busy' | 'error'

/**
 * First-run / "new trip" screen. Name + per-head ₹ + your display name →
 * useCreateTrip → switch to it → navigate home. Caller becomes route_head.
 */
export function CreateTripScreen() {
  const navigate = useNavigate()
  const createTrip = useCreateTrip()
  const { setCurrentTripId, trips } = useTrip()
  const [name, setName] = useState('')
  const [perHead, setPerHead] = useState('')
  const [nickname, setNickname] = useState('')
  const [fullName, setFullName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const tripName = name.trim()
    if (!tripName) return
    setStatus('busy')
    setError(null)
    try {
      const perHeadNum = parseInt(perHead.replace(/[^\d]/g, ''), 10)
      const newTripId = await createTrip.mutateAsync({
        name: tripName,
        perHead: Number.isFinite(perHeadNum) && perHeadNum > 0 ? perHeadNum : undefined,
        fullName: fullName.trim() || undefined,
        nickname: nickname.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setCurrentTripId(newTripId)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the trip. Try again.")
      setStatus('error')
    }
  }

  const hasTrips = trips.length > 0

  return (
    <div className="app-bg" data-theme="lagoon" style={{ alignItems: 'center' }}>
      <div style={screenWrap}>
        <div style={{ marginBottom: 18 }}>
          <div style={heading}>Start a trip 🌴</div>
          <div style={subtle}>You'll be the Route Head — invite your crew, track the pool, and keep the gallery.</div>
        </div>

        <form onSubmit={onSubmit} style={card}>
          <label htmlFor="trip-name" style={label}>Trip name</label>
          <input
            id="trip-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Goa '26"
            required
            className={focus.ring}
            style={input}
          />

          <div style={{ marginTop: 16 }}>
            <label htmlFor="trip-perhead" style={label}>Per-head contribution (₹)</label>
            <input
              id="trip-perhead"
              inputMode="numeric"
              value={perHead}
              onChange={(e) => setPerHead(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="5000"
              className={focus.ring}
              style={input}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label htmlFor="trip-nickname" style={label}>Your nickname (shown to the crew)</label>
            <input
              id="trip-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Arjun"
              className={focus.ring}
              style={input}
            />
          </div>

          {/* TODO(agent): full name is optional here; deeper onboarding lives on /onboarding. */}
          <div style={{ marginTop: 16 }}>
            <label htmlFor="trip-fullname" style={label}>Full name (optional)</label>
            <input
              id="trip-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Arjun Nair"
              className={focus.ring}
              style={input}
            />
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="trip-startdate" style={label}>Start Date (optional)</label>
              <input
                id="trip-startdate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={focus.ring}
                style={input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="trip-enddate" style={label}>End Date (optional)</label>
              <input
                id="trip-enddate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={focus.ring}
                style={input}
              />
            </div>
          </div>

          <div role="status" aria-live="polite">
            {error && <div style={errorText}>{error}</div>}
          </div>

          <button
            type="submit"
            disabled={status === 'busy' || !name.trim()}
            className={`pressable ${focus.ringOnDark}`}
            style={{ ...primaryBtn, opacity: status === 'busy' || !name.trim() ? 0.6 : 1 }}
          >
            {status === 'busy' ? 'Creating…' : 'Create trip'}
          </button>
        </form>

        <div style={{ ...subtle, textAlign: 'center', marginTop: 16 }}>
          Have an invite? <Link to="/join" style={{ color: 'var(--primary-d)', fontWeight: 800 }}>Join a trip</Link>
          {hasTrips && (
            <>
              {' · '}
              <Link to="/trips" style={{ color: 'var(--primary-d)', fontWeight: 800 }}>Your trips</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
