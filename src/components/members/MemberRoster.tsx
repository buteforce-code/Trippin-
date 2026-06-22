import { useMembers, useSetMemberRole } from '../../hooks/queries'
import { useTrip } from '../../providers/TripProvider'
import { useAuth } from '../../providers/AuthProvider'
import { MUTED_TEXT } from '../ui/a11y'
import type { MemberRole } from '../../data/types'
import { MemberRosterRow } from './MemberRosterRow'

interface MemberRosterProps {
  tripId: string
}

/**
 * Crew roster for the current trip. Read-only for members/assistants; the
 * Route Head additionally gets promote/demote controls per row (gated below).
 */
export function MemberRoster({ tripId }: MemberRosterProps) {
  const { isRouteHead } = useTrip()
  const { session } = useAuth()
  const myUserId = session?.user.id ?? null
  const { data: members, isLoading } = useMembers(tripId)
  const setRole = useSetMemberRole(tripId)

  if (isLoading) {
    return <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, padding: '8px 2px' }}>Loading crew…</div>
  }

  const roster = members ?? []
  // Guard: don't surface a demote action on the last Route Head — a trip must
  // always keep an owner.
  const routeHeadCount = roster.filter((m) => m.role === 'route_head').length

  const onSetRole = (memberId: string, role: MemberRole) => {
    setRole.mutate({ memberId, role })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {roster.length === 0 ? (
        <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, padding: '8px 2px' }}>No crew yet.</div>
      ) : (
        roster.map((m) => (
          <MemberRosterRow
            key={m.id}
            member={m}
            isSelf={myUserId != null && m.userId === myUserId}
            canManage={isRouteHead}
            isLastRouteHead={routeHeadCount <= 1}
            busy={setRole.isPending}
            onSetRole={onSetRole}
          />
        ))
      )}
    </div>
  )
}
