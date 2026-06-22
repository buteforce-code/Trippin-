/** Crew management mutations for the Route Head (kick / remove a member).
 *
 * Adding members is handled by the existing invite flow (`useCreateInvite` /
 * InvitePanel); role changes by `useSetMemberRole`. This hook owns the one
 * write the roster previously lacked: removing a member.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { tripKeys } from './queries'

/**
 * `remove_member` is a server-side RPC that re-checks route_head + protects the
 * last route_head. It is not in the generated `database.types.ts` Functions map,
 * so call it through an untyped view of the client (we still control the arg
 * shape). Keep this the only place that does so.
 */
const rpcClient = supabase as unknown as {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
}

async function removeMember(memberId: string): Promise<void> {
  const { error } = await rpcClient.rpc('remove_member', { p_member_id: memberId })
  if (error) throw new Error(error.message)
}

/**
 * Remove (kick) a member from a trip. On success, refreshes the trip's roster
 * and the user's trip list (the removed user may have been the caller, or the
 * member count drives summary views).
 */
export function useRemoveMember(tripId: string | null) {
  const qc = useQueryClient()
  return useMutation<void, Error, { memberId: string }>({
    mutationFn: ({ memberId }) => removeMember(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.members(tripId) })
      qc.invalidateQueries({ queryKey: tripKeys.myTrips })
    },
  })
}
