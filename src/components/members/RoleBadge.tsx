import type { MemberRole } from '../../data/types'
import { ROLE_BADGE } from './roleBadgeStyles'

interface RoleBadgeProps {
  role: MemberRole
}

/** Small pill showing a member's role (Route Head / Assistant / Member). */
export function RoleBadge({ role }: RoleBadgeProps) {
  const badge = ROLE_BADGE[role]
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 800,
        padding: '5px 10px',
        borderRadius: 20,
        background: badge.bg,
        color: badge.color,
        whiteSpace: 'nowrap',
        flex: 'none',
      }}
    >
      {badge.label}
    </span>
  )
}
