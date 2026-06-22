/** TanStack Query hooks over the active TripRepository.
 *
 * Per-trip hooks are scoped to the current trip from TripProvider, so existing
 * screens keep calling `useTripSnapshot()` etc. with no arguments and stay
 * backward-compatible — they just resolve against `currentTripId`.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  Announcement,
  CreateInviteInput,
  CreateTripInput,
  InviteInfo,
  JoinTripInput,
  MediaItem,
  MemberDetail,
  MemberRole,
  NewExpenseInput,
  OnboardingInput,
  PostAnnouncementInput,
  TripInvite,
  TripListItem,
  TripSnapshot,
  UploadMediaInput,
} from '../data/types'
import { tripRepository } from '../data'
import { useTrip } from '../providers/TripProvider'
import { MY_TRIPS_KEY } from '../providers/tripKeys'

// ── Query key factories (exported so other agents can target/invalidate them) ──
export const tripKeys = {
  myTrips: MY_TRIPS_KEY,
  snapshot: (tripId: string | null) => ['trip', 'snapshot', tripId] as const,
  members: (tripId: string | null) => ['trip', 'members', tripId] as const,
  announcements: (tripId: string | null) => ['trip', 'announcements', tripId] as const,
  invites: (tripId: string | null) => ['trip', 'invites', tripId] as const,
  invite: (token: string) => ['invite', token] as const,
}

// ── Multi-trip / membership ────────────────────────────────────────────────

/** Trips the signed-in user belongs to. (Also surfaced via TripProvider.) */
export function useMyTrips() {
  return useQuery<TripListItem[]>({
    queryKey: tripKeys.myTrips,
    queryFn: () => tripRepository.listMyTrips(),
  })
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation<string, Error, CreateTripInput>({
    mutationFn: (input) => tripRepository.createTrip(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.myTrips }),
  })
}

export function useJoinTrip() {
  const qc = useQueryClient()
  return useMutation<string, Error, JoinTripInput>({
    mutationFn: (input) => tripRepository.joinTrip(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.myTrips }),
  })
}

/** Resolve an invite token for a preview (disabled until a token is present). */
export function useInviteInfo(token: string | undefined) {
  return useQuery<InviteInfo | null>({
    queryKey: tripKeys.invite(token ?? ''),
    queryFn: () => tripRepository.getInviteInfo(token as string),
    enabled: Boolean(token),
  })
}

// ── Current-trip snapshot + mutations (backward-compatible signatures) ──────

export function useTripSnapshot() {
  const { currentTripId } = useTrip()
  return useQuery<TripSnapshot>({
    queryKey: tripKeys.snapshot(currentTripId),
    queryFn: () => tripRepository.getSnapshot(currentTripId as string),
    enabled: Boolean(currentTripId),
  })
}

export function useAddExpense() {
  const qc = useQueryClient()
  const { currentTripId } = useTrip()
  return useMutation({
    mutationFn: (input: NewExpenseInput) =>
      tripRepository.addExpense(currentTripId as string, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.snapshot(currentTripId) }),
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  const { currentTripId } = useTrip()
  return useMutation({
    mutationFn: ({ memberIndex, amount }: { memberIndex: number; amount?: number }) =>
      tripRepository.recordPayment(currentTripId as string, memberIndex, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.snapshot(currentTripId) }),
  })
}

export function useUploadMedia() {
  const qc = useQueryClient()
  const { currentTripId } = useTrip()
  return useMutation({
    mutationFn: (input: UploadMediaInput) =>
      tripRepository.uploadMedia(currentTripId as string, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.snapshot(currentTripId) }),
  })
}

// ── Members / roles ─────────────────────────────────────────────────────────

export function useMembers(tripId: string | null) {
  return useQuery<MemberDetail[]>({
    queryKey: tripKeys.members(tripId),
    queryFn: () => tripRepository.listMembers(tripId as string),
    enabled: Boolean(tripId),
  })
}

export function useSetMemberRole(tripId: string | null) {
  const qc = useQueryClient()
  return useMutation<void, Error, { memberId: string; role: MemberRole }>({
    mutationFn: ({ memberId, role }) => tripRepository.setMemberRole(memberId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.members(tripId) })
      qc.invalidateQueries({ queryKey: tripKeys.myTrips })
    },
  })
}

/** Update the caller's own member onboarding fields (full name / nickname / note). */
export function useUpdateMyOnboarding() {
  const qc = useQueryClient()
  return useMutation<void, Error, OnboardingInput>({
    mutationFn: (input) => tripRepository.updateMyOnboarding(input),
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: tripKeys.members(input.tripId) })
      qc.invalidateQueries({ queryKey: tripKeys.myTrips })
      qc.invalidateQueries({ queryKey: tripKeys.snapshot(input.tripId) })
    },
  })
}

// ── Announcements ─────────────────────────────────────────────────────────

export function useAnnouncements(tripId: string | null) {
  return useQuery<Announcement[]>({
    queryKey: tripKeys.announcements(tripId),
    queryFn: () => tripRepository.listAnnouncements(tripId as string),
    enabled: Boolean(tripId),
  })
}

export function usePostAnnouncement(tripId: string | null) {
  const qc = useQueryClient()
  return useMutation<void, Error, PostAnnouncementInput>({
    mutationFn: (input) => tripRepository.postAnnouncement(tripId as string, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.announcements(tripId) }),
  })
}

// ── Invites ──────────────────────────────────────────────────────────────

export function useTripInvites(tripId: string | null) {
  return useQuery<TripInvite[]>({
    queryKey: tripKeys.invites(tripId),
    queryFn: () => tripRepository.listInvites(tripId as string),
    enabled: Boolean(tripId),
  })
}

export function useCreateInvite(tripId: string | null) {
  const qc = useQueryClient()
  return useMutation<TripInvite, Error, CreateInviteInput>({
    mutationFn: (input) => tripRepository.createInvite(tripId as string, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.invites(tripId) }),
  })
}

// ── Media URLs ─────────────────────────────────────────────────────────────

/** Resolves a signed thumbnail URL for a tile (null → tile shows its gradient). */
export function useThumbUrl(item: MediaItem) {
  return useQuery<string | null>({
    queryKey: ['media', 'thumb', item.id, item.thumbPath],
    queryFn: () => tripRepository.getThumbUrl(item),
    enabled: Boolean(item.thumbPath),
    staleTime: 50 * 60 * 1000, // signed URLs last 1h; refetch comfortably before expiry
  })
}
