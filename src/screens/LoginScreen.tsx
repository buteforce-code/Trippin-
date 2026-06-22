import { useState, type FormEvent } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { APP_NAME, APP_TAGLINE, APP_VENDOR } from '../lib/brand'
import { MUTED_TEXT } from '../components/ui/a11y'
import focus from '../components/ui/focus.module.css'

type Step = 'email' | 'code'
type Status = 'idle' | 'busy' | 'error'

const inputStyle = {
  width: '100%',
  marginTop: 8,
  border: '1.5px solid #e3efec',
  background: 'var(--bg)',
  borderRadius: 14,
  padding: '13px 15px',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ink)',
  boxSizing: 'border-box',
} as const

const labelStyle = {
  fontSize: 12,
  fontWeight: 800,
  color: MUTED_TEXT,
  textTransform: 'uppercase',
  letterSpacing: '.4px',
} as const

const primaryBtn = {
  width: '100%',
  marginTop: 16,
  border: 'none',
  cursor: 'pointer',
  fontFamily: "'Baloo 2',sans-serif",
  fontWeight: 800,
  fontSize: 16,
  padding: 15,
  borderRadius: 16,
  color: '#fff',
  background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
  boxShadow: '0 12px 24px var(--shadow)',
} as const

export function LoginScreen() {
  const { signInWithGoogle, sendCode, verifyCode } = useAuth()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  const onGoogle = async () => {
    setGoogleBusy(true)
    setError(null)
    const { error: err } = await signInWithGoogle()
    // On success the browser redirects to Google; on failure we stay put.
    if (err) {
      setError(err)
      setGoogleBusy(false)
    }
  }

  const onSendCode = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('busy')
    setError(null)
    const { error: err } = await sendCode(trimmed)
    if (err) {
      setError(err)
      setStatus('error')
    } else {
      setStatus('idle')
      setStep('code')
    }
  }

  const onVerify = async (e: FormEvent) => {
    e.preventDefault()
    const clean = code.replace(/\D/g, '')
    if (clean.length < 6) return
    setStatus('busy')
    setError(null)
    const { error: err } = await verifyCode(email.trim(), clean)
    if (err) {
      setError(err)
      setStatus('error')
    }
    // On success the AuthProvider's onAuthStateChange flips the gate automatically.
  }

  const resend = async () => {
    setStatus('busy')
    setError(null)
    const { error: err } = await sendCode(email.trim())
    setStatus(err ? 'error' : 'idle')
    if (err) setError(err)
  }

  return (
    <div className="app-bg" data-theme="lagoon" style={{ alignItems: 'center' }}>
      <div style={{ width: 'min(100%, var(--frame-max))', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px', color: 'var(--ink)' }}>
        {/* Brand hero */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-xl)', padding: '30px 26px', background: 'linear-gradient(140deg,var(--primary),var(--primary-d))', color: '#fff', boxShadow: '0 20px 40px var(--shadow)', marginBottom: 26 }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '46%', background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.22),transparent)', animation: 'kshine 5.5s ease-in-out infinite' }} aria-hidden="true" />
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>Namaste 🌴</div>
          <div style={{ fontSize: 38, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1.05, marginTop: 4 }}>{APP_NAME}</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, opacity: 0.92, marginTop: 6 }}>{APP_TAGLINE}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, opacity: 0.92 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.3px' }}>by</span>
            <img src="/buteforce-wordmark-white.png" alt={APP_VENDOR} style={{ height: 13, width: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* Primary: Continue with Google */}
        <button
          type="button"
          onClick={onGoogle}
          disabled={googleBusy}
          className={`pressable ${focus.ring}`}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 11,
            border: '1.5px solid #e3efec',
            background: '#fff',
            cursor: googleBusy ? 'default' : 'pointer',
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 800,
            fontSize: 16,
            padding: 15,
            borderRadius: 16,
            color: 'var(--ink)',
            boxShadow: 'var(--card-shadow)',
            opacity: googleBusy ? 0.7 : 1,
          }}
        >
          <GoogleMark />
          {googleBusy ? 'Connecting…' : 'Continue with Google'}
        </button>

        {error && !showEmail && step === 'email' && (
          <div role="status" aria-live="polite">
            <div style={{ fontSize: 12, color: '#d14328', fontWeight: 700, marginTop: 10, textAlign: 'center' }}>{error}</div>
          </div>
        )}

        {/* Secondary: email-code sign-in, tucked under a divider. */}
        {!showEmail && step === 'email' ? (
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setShowEmail(true); setError(null) }}
              className={`pressable ${focus.ring}`}
              style={{ border: 'none', background: 'none', color: 'var(--primary-d)', fontWeight: 800, fontSize: 13, cursor: 'pointer', padding: 6 }}
            >
              Use email instead
            </button>
          </div>
        ) : step === 'email' ? (
          <form onSubmit={onSendCode} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '22px 20px', boxShadow: 'var(--card-shadow)', marginTop: 18 }}>
            <label htmlFor="login-email" style={labelStyle}>Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              aria-invalid={status === 'error' || undefined}
              className={focus.ring}
              style={inputStyle}
            />
            <div role="status" aria-live="polite">
              {error && <div style={{ fontSize: 12, color: '#d14328', fontWeight: 700, marginTop: 8 }}>{error}</div>}
            </div>
            <button type="submit" disabled={status === 'busy'} className={`pressable ${focus.ringOnDark}`} style={{ ...primaryBtn, opacity: status === 'busy' ? 0.7 : 1 }}>
              {status === 'busy' ? 'Sending…' : 'Email me a code'}
            </button>
            <div style={{ fontSize: 11.5, color: MUTED_TEXT, fontWeight: 600, marginTop: 12, textAlign: 'center', lineHeight: 1.4 }}>
              No password — we'll email you a 6-digit sign-in code.
            </div>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => { setShowEmail(false); setError(null) }}
                className={`pressable ${focus.ring}`}
                style={{ border: 'none', background: 'none', color: 'var(--primary-d)', fontWeight: 700, fontSize: 12, cursor: 'pointer', padding: 4 }}
              >
                ← Back to Google
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onVerify} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '22px 20px', boxShadow: 'var(--card-shadow)' }}>
            <label htmlFor="login-code" style={labelStyle}>Enter code</label>
            <div style={{ fontSize: 12.5, color: MUTED_TEXT, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>
              We sent a 6-digit code to <b style={{ color: 'var(--ink)' }}>{email}</b>.
            </div>
            <input
              id="login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              maxLength={6}
              required
              aria-invalid={status === 'error' || undefined}
              className={focus.ring}
              style={{ ...inputStyle, textAlign: 'center', fontSize: 28, letterSpacing: '10px', fontFamily: "'Baloo 2',sans-serif" }}
            />
            <div role="status" aria-live="polite">
              {error && <div style={{ fontSize: 12, color: '#d14328', fontWeight: 700, marginTop: 8 }}>{error}</div>}
            </div>
            <button type="submit" disabled={status === 'busy' || code.length < 6} className={`pressable ${focus.ringOnDark}`} style={{ ...primaryBtn, opacity: status === 'busy' || code.length < 6 ? 0.6 : 1 }}>
              {status === 'busy' ? 'Verifying…' : 'Verify & sign in'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError(null) }} className={`pressable ${focus.ring}`} style={{ border: 'none', background: 'none', color: MUTED_TEXT, fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: 4 }}>
                ← Change email
              </button>
              <button type="button" onClick={resend} disabled={status === 'busy'} className={`pressable ${focus.ring}`} style={{ border: 'none', background: 'none', color: 'var(--primary-d)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: 4 }}>
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/** Google "G" logo mark (official four-colour), sized for the sign-in button. */
function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
