import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUpdateMyOnboarding } from '../hooks/queries'
import { useTrip } from '../providers/TripProvider'
import { card, errorText, heading, input, label, primaryBtn, screenWrap, subtle } from '../components/onboarding/formStyles'
import focus from '../components/ui/focus.module.css'

type Status = 'idle' | 'busy' | 'error'

/**
 * First-time onboarding for the current trip. Collects the member's own
 * full name + nickname + an optional "already contributed" note, then writes
 * them to their own member row (the only fields a member may self-edit).
 */
export function OnboardingScreen() {
  const navigate = useNavigate()
  const { currentTrip, currentTripId, refetchTrips } = useTrip()
  const updateOnboarding = useUpdateMyOnboarding()

  const [fullName, setFullName] = useState('')
  const [nickname, setNickname] = useState('')
  const [priorNote, setPriorNote] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!currentTripId || !nickname.trim()) return
    setStatus('busy')
    setError(null)
    try {
      await updateOnboarding.mutateAsync({
        tripId: currentTripId,
        fullName: fullName.trim() || null,
        nickname: nickname.trim(),
        priorContributionNote: priorNote.trim() || null,
      })
      refetchTrips()
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your details. Try again.")
      setStatus('error')
    }
  }

  return (
    <div className="app-bg" data-theme="lagoon" style={{ alignItems: 'center' }}>
      <div style={screenWrap}>
        <div style={{ marginBottom: 18 }}>
          <div style={heading}>Welcome aboard 👋</div>
          <div style={subtle}>
            Quick intro for <b style={{ color: 'var(--ink)' }}>{currentTrip?.name ?? 'your trip'}</b> — tell the crew who you are.
          </div>
        </div>

        <form onSubmit={onSubmit} style={card}>
          <label htmlFor="ob-nickname" style={label}>Nickname (shown to the crew)</label>
          <input
            id="ob-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Rohan"
            required
            className={focus.ring}
            style={input}
          />

          <div style={{ marginTop: 16 }}>
            <label htmlFor="ob-fullname" style={label}>Full name (optional)</label>
            <input
              id="ob-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rohan Menon"
              className={focus.ring}
              style={input}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label htmlFor="ob-prior" style={label}>Already contributed? (optional note)</label>
            <input
              id="ob-prior"
              value={priorNote}
              onChange={(e) => setPriorNote(e.target.value)}
              placeholder="e.g. Paid ₹2,000 to Arjun in cash"
              className={focus.ring}
              style={input}
            />
            <div style={{ ...subtle, marginTop: 6 }}>
              The Route Head will reconcile this against the pool.
            </div>
          </div>

          <div role="status" aria-live="polite">
            {error && <div style={errorText}>{error}</div>}
          </div>

          <button
            type="submit"
            disabled={status === 'busy' || !nickname.trim()}
            className={`pressable ${focus.ringOnDark}`}
            style={{ ...primaryBtn, opacity: status === 'busy' || !nickname.trim() ? 0.6 : 1 }}
          >
            {status === 'busy' ? 'Saving…' : 'Enter the trip'}
          </button>
        </form>

        {/* TODO(agent): add avatar colour / initials picker and richer prior-contribution
            capture (amount + payee) once the reconciliation flow exists. */}
      </div>
    </div>
  )
}
