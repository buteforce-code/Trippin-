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
}: MemberRosterRowProps) {
  const displayName = member.nickname || member.name
  const actions = canManage && !isSelf ? roleActions(member.role, isLastRouteHead) : []

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
      </div>
      <RoleBadge role={member.role} />
    </div>
  )
}
