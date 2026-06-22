import { useState } from 'react'
import { Avatar } from '../ui/Avatar'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'
import type { MemberDetail, MemberRole } from '../../data/types'
import { RoleBadge } from './RoleBadge'
import { ROLE_ORDER } from './roleBadgeStyles'

interface MemberRosterRowProps {
  member: MemberDetail
  /** Marks the signed-in user's own row (no self role controls). */
  isSelf: boolean
  /** Whether the viewer may change roles (Route Head only). */
  canManage: boolean
  /** Blocks demoting the final Route Head off the trip. */
  isLastRouteHead: boolean
  /** Disable controls while a role change is in flight. */
  busy: boolean
  onSetRole: (memberId: string, role: MemberRole) => void
  /** Whether the viewer may remove members (Route Head only). */
  canRemove: boolean
  /** Disable removal while a remove is in flight. */
  removing: boolean
  onRemove: (memberId: string) => void
}

interface RoleAction {
  label: string
  role: MemberRole
  /** Promote actions use the filled accent; demote uses a quiet outline. */
  variant: 'up' | 'down'
}

/** Build the promote/demote buttons available for a member's current role. */
function roleActions(role: MemberRole, isLastRouteHead: boolean): RoleAction[] {
  const idx = ROLE_ORDER.indexOf(role)
  const actions: RoleAction[] = []

  const higher = ROLE_ORDER[idx + 1]
  if (higher) actions.push({ label: `Make ${LABEL[higher]}`, role: higher, variant: 'up' })

  const lower = ROLE_ORDER[idx - 1]
  // Never let the UI demote the last route head — the trip needs an owner.
  if (lower && !(role === 'route_head' && isLastRouteHead)) {
    actions.push({ label: `Make ${LABEL[lower]}`, role: lower, variant: 'down' })
  }

  return actions
}

const LABEL: Record<MemberRole, string> = {
  route_head: 'Route Head',
  assistant: 'Assistant',
  member: 'Member',
}

export function MemberRosterRow({
  member,
  isSelf,
  canManage,
  isLastRouteHead,
  busy,
  onSetRole,
  canRemove,
  removing,
  onRemove,
}: MemberRosterRowProps) {
  const displayName = member.nickname || member.name
  const actions = canManage && !isSelf ? roleActions(member.role, isLastRouteHead) : []
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  // Never offer removal for self or for the trip's sole Route Head — a trip must
  // always keep an owner, and self-removal would orphan the caller's view.
  const showRemove = canRemove && !isSelf && !(member.role === 'route_head' && isLastRouteHead)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        boxShadow: '0 4px 12px rgba(11,77,74,.05)',
      }}
    >
      <Avatar initials={member.initials} color={member.color} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {displayName}
          </span>
          {isSelf && <span style={{ fontSize: 11, color: 'var(--primary-d)', fontWeight: 800, flex: 'none' }}>You</span>}
        </div>
        {member.fullName && member.fullName !== displayName && (
          <div style={{ fontSize: 11.5, color: MUTED_TEXT, fontWeight: 600, marginTop: 3 }}>{member.fullName}</div>
        )}
        {actions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {actions.map((a) => (
              <button
                key={a.role}
                type="button"
                disabled={busy}
                onClick={() => onSetRole(member.id, a.role)}
                className={`pressable ${focus.ring}`}
                style={{
                  cursor: busy ? 'default' : 'pointer',
                  fontWeight: 800,
                  fontSize: 10.5,
                  padding: '5px 10px',
                  borderRadius: 12,
                  whiteSpace: 'nowrap',
                  opacity: busy ? 0.55 : 1,
                  ...(a.variant === 'up'
                    ? { border: 'none', background: 'var(--accent)', color: '#fff' }
                    : { border: '1.5px solid #e3efec', background: 'var(--bg)', color: MUTED_TEXT }),
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
        {showRemove && confirmingRemove && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: MUTED_TEXT }}>Remove {displayName}?</span>
            <button
              type="button"
              disabled={removing}
              onClick={() => onRemove(member.id)}
              className={`pressable ${focus.ring}`}
              style={{
                cursor: removing ? 'default' : 'pointer',
                fontWeight: 800,
                fontSize: 10.5,
                padding: '5px 10px',
                borderRadius: 12,
                border: 'none',
                background: '#e5484d',
                color: '#fff',
                opacity: removing ? 0.55 : 1,
              }}
            >
              {removing ? 'Removing…' : 'Yes, remove'}
            </button>
            <button
              type="button"
              disabled={removing}
              onClick={() => setConfirmingRemove(false)}
              className={`pressable ${focus.ring}`}
              style={{
                cursor: removing ? 'default' : 'pointer',
                fontWeight: 800,
                fontSize: 10.5,
                padding: '5px 10px',
                borderRadius: 12,
                border: '1.5px solid #e3efec',
                background: 'var(--bg)',
                color: MUTED_TEXT,
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      {showRemove && !confirmingRemove ? (
        <button
          type="button"
          disabled={removing}
          onClick={() => setConfirmingRemove(true)}
          className={`pressable ${focus.ring}`}
          aria-label={`Remove ${displayName}`}
          style={{
            flex: 'none',
            width: 34,
            height: 34,
            borderRadius: 12,
            border: '1.5px solid #f3d4d5',
            background: '#fff',
            color: '#e5484d',
            cursor: removing ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            opacity: removing ? 0.55 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      ) : (
        <RoleBadge role={member.role} />
      )}
    </div>
  )
}
