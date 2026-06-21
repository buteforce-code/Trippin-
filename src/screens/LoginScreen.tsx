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
  const { sendCode, verifyCode } = useAuth()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

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

        {step === 'email' ? (
          <form onSubmit={onSendCode} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '22px 20px', boxShadow: 'var(--card-shadow)' }}>
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
