import { useState } from 'react'
import { useCreateInvite, useTripInvites } from '../../hooks/queries'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'
import type { TripInvite } from '../../data/types'
import { RoleBadge } from '../members/RoleBadge'
import { inviteLink, inviteMessage, inviteUsesLabel, whatsappShareUrl } from './inviteLink'

interface InvitePanelProps {
  tripId: string
  /** Current trip name, woven into the share message when present. */
  tripName?: string
}

type CopyState = 'idle' | 'copied' | 'error'

const linkBox = {
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--ink)',
  background: 'var(--bg)',
  border: '1.5px solid #e3efec',
  borderRadius: 12,
  padding: '10px 12px',
  wordBreak: 'break-all' as const,
}

const actionBtn = {
  flex: 1,
  cursor: 'pointer',
  fontFamily: "'Baloo 2',sans-serif",
  fontWeight: 800,
  fontSize: 12.5,
  padding: '10px 8px',
  borderRadius: 14,
  textAlign: 'center' as const,
  whiteSpace: 'nowrap' as const,
}

/** Native share when the browser supports it (mobile PWAs do). */
function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/**
 * Route-Head-only invite tool: mints a `member` invite, surfaces the join link,
 * and offers WhatsApp / native share / copy. Existing invites list below with
 * their use counts.
 */
export function InvitePanel({ tripId, tripName }: InvitePanelProps) {
  const { data: invites } = useTripInvites(tripId)
  const createInvite = useCreateInvite(tripId)
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [error, setError] = useState<string | null>(null)

  const link = activeToken ? inviteLink(activeToken) : ''
  const message = activeToken ? inviteMessage(link, tripName) : ''

  const onCreate = async () => {
    setError(null)
    setCopyState('idle')
    try {
      const invite = await createInvite.mutateAsync({ role: 'member' })
      setActiveToken(invite.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create an invite. Try again.")
    }
  }

  const onCopy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('error')
    }
  }

  const onNativeShare = async () => {
    if (!canNativeShare()) return
    try {
      await navigator.share({ title: 'Join the trip', text: message, url: link })
    } catch {
      // User dismissed the share sheet — no action needed.
    }
  }

  const existing = invites ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        type="button"
        onClick={onCreate}
        disabled={createInvite.isPending}
        className={`pressable ${focus.ringOnDark}`}
        style={{
          border: 'none',
          cursor: createInvite.isPending ? 'default' : 'pointer',
          fontFamily: "'Baloo 2',sans-serif",
          fontWeight: 800,
          fontSize: 14,
          padding: 13,
          borderRadius: 16,
          color: '#fff',
          background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
          boxShadow: '0 12px 24px var(--shadow)',
          opacity: createInvite.isPending ? 0.65 : 1,
        }}
      >
        {createInvite.isPending ? 'Creating invite…' : activeToken ? 'New invite link' : '＋ Invite people'}
      </button>

      {error && <div style={{ fontSize: 12, color: '#d14328', fontWeight: 700 }}>{error}</div>}

      {activeToken && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={linkBox} aria-label="Invite link">{link}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href={whatsappShareUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              className={`pressable ${focus.ring}`}
              style={{ ...actionBtn, textDecoration: 'none', border: 'none', background: '#25D366', color: '#fff' }}
            >
              WhatsApp
            </a>
            {canNativeShare() && (
              <button
                type="button"
                onClick={onNativeShare}
                className={`pressable ${focus.ring}`}
                style={{ ...actionBtn, border: '1.5px solid var(--primary)', background: 'var(--tint)', color: 'var(--primary-d)' }}
              >
                Share
              </button>
            )}
            <button
              type="button"
              onClick={onCopy}
              className={`pressable ${focus.ring}`}
              style={{ ...actionBtn, border: '1.5px solid #e3efec', background: 'var(--bg)', color: 'var(--ink)' }}
            >
              {copyState === 'copied' ? 'Copied ✓' : copyState === 'error' ? 'Copy failed' : 'Copy link'}
            </button>
          </div>
        </div>
      )}

      {existing.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: MUTED_TEXT, textTransform: 'uppercase', letterSpacing: '.4px' }}>
            Active invites
          </div>
          {existing.map((invite: TripInvite) => (
            <div
              key={invite.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                boxShadow: '0 4px 12px rgba(11,77,74,.05)',
                opacity: invite.active ? 1 : 0.55,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {invite.token}
                </div>
                <div style={{ fontSize: 11, color: MUTED_TEXT, fontWeight: 600, marginTop: 2 }}>
                  {inviteUsesLabel(invite)}{!invite.active && ' · revoked'}
                </div>
              </div>
              <RoleBadge role={invite.role} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
