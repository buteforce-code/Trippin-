import { useState } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

/**
 * Signed-in identity + Sign out control, shown at the bottom of the Trips hub.
 * After sign-out the auth session goes null and AuthGate swaps in LoginScreen,
 * so there's nothing to navigate here.
 */
export function AccountPanel() {
  const { session, signOut } = useAuth()
  const [busy, setBusy] = useState(false)

  const email = session?.user?.email ?? null
  const initial = (email ?? '·').trim().charAt(0).toUpperCase() || '·'

  const onSignOut = async () => {
    setBusy(true)
    try {
      await signOut()
    } finally {
      // If sign-out fails we re-enable the button; on success this unmounts.
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        boxShadow: '0 4px 12px rgba(11,77,74,.05)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          flex: 'none',
          borderRadius: '50%',
          background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 16,
          fontFamily: "'Baloo 2',sans-serif",
        }}
      >
        {initial}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)' }}>
          Signed in
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: MUTED_TEXT,
            marginTop: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email ?? 'Google account'}
        </div>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        disabled={busy}
        className={`pressable ${focus.ring}`}
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          border: '1.5px solid #f0d3cb',
          cursor: busy ? 'default' : 'pointer',
          background: '#fff5f2',
          borderRadius: 14,
          padding: '10px 14px',
          color: '#c0432a',
          fontSize: 13,
          fontWeight: 800,
          fontFamily: "'Baloo 2',sans-serif",
          opacity: busy ? 0.6 : 1,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
