import { useState, type FormEvent } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { APP_NAME, APP_TAGLINE, APP_VENDOR } from '../lib/brand'
import { MUTED_TEXT } from '../components/ui/a11y'
import focus from '../components/ui/focus.module.css'

export function LoginScreen() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setError(null)
    const { error: err } = await signInWithEmail(email.trim())
    if (err) {
      setError(err)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="app-bg" data-theme="lagoon" style={{ alignItems: 'center' }}>
      <div
        style={{
          width: 'min(100%, var(--frame-max))',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 28px',
          color: 'var(--ink)',
        }}
      >
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

        {status === 'sent' ? (
          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '22px 20px', boxShadow: 'var(--card-shadow)', textAlign: 'center' }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>📬</div>
            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>Check your inbox</div>
            <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>
              We sent a magic sign-in link to <b style={{ color: 'var(--ink)' }}>{email}</b>. Open it on this device to continue.
            </div>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className={`pressable ${focus.ring}`}
              style={{ marginTop: 16, border: 'none', background: 'var(--tint)', color: 'var(--primary-d)', fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 20, cursor: 'pointer' }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '22px 20px', boxShadow: 'var(--card-shadow)' }}>
            <label htmlFor="login-email" style={{ fontSize: 12, fontWeight: 800, color: MUTED_TEXT, textTransform: 'uppercase', letterSpacing: '.4px' }}>
              Email
            </label>
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
              style={{ width: '100%', marginTop: 8, border: '1.5px solid #e3efec', background: 'var(--bg)', borderRadius: 14, padding: '13px 15px', fontSize: 15, fontWeight: 600, color: 'var(--ink)', boxSizing: 'border-box' }}
            />
            <div role="status" aria-live="polite">
              {error && <div style={{ fontSize: 12, color: '#d14328', fontWeight: 700, marginTop: 8 }}>{error}</div>}
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className={`pressable ${focus.ringOnDark}`}
              style={{ width: '100%', marginTop: 16, border: 'none', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, padding: 15, borderRadius: 16, color: '#fff', background: 'linear-gradient(135deg,var(--primary),var(--primary-d))', boxShadow: '0 12px 24px var(--shadow)', opacity: status === 'sending' ? 0.7 : 1 }}
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            <div style={{ fontSize: 11.5, color: MUTED_TEXT, fontWeight: 600, marginTop: 12, textAlign: 'center', lineHeight: 1.4 }}>
              No password needed — we'll email you a one-tap sign-in link.
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
