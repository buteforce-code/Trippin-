/**
 * Storage-agnostic data access. Screens depend only on this interface, so the
 * MockTripRepository can be swapped for a SupabaseTripRepository with zero
 * component changes.
 *
 * Every per-trip read/write takes an explicit `tripId` — the app is multi-trip,
 * and the current trip is supplied by TripProvider.
 */
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
} from './types'

export interface TripRepository {
  // ── Multi-trip / membership ──────────────────────────────────────────────
  /** Trips the signed-in user is a member of (with that user's role). */
  listMyTrips(): Promise<TripListItem[]>

  /** Create a trip; caller becomes route_head. Returns the new trip id. */
  createTrip(input: CreateTripInput): Promise<string>

  /** Join a trip via an invite token. Returns the joined trip id. */
  joinTrip(input: JoinTripInput): Promise<string>

  /** Resolve an invite token (preview before joining). null = token unknown. */
  getInviteInfo(token: string): Promise<InviteInfo | null>

  // ── Per-trip reads ───────────────────────────────────────────────────────
  /** Full state for one trip (members, expenses, log, stops, media). */
  getSnapshot(tripId: string): Promise<TripSnapshot>

  /** Detailed member roster for a trip (roles, onboarding fields). */
  listMembers(tripId: string): Promise<MemberDetail[]>

  /** Announcements for a trip, pinned first then newest. */
  listAnnouncements(tripId: string): Promise<Announcement[]>

  /** Invites for a trip (route_head only in production). */
  listInvites(tripId: string): Promise<TripInvite[]>

  // ── Per-trip writes ──────────────────────────────────────────────────────
  /** Append an expense + its activity-log entry. */
  addExpense(tripId: string, input: NewExpenseInput): Promise<void>

  /**
   * Record a contribution for a member. `amount` omitted = settle the full
   * remaining balance (prototype behavior); a value = a partial split payment.
   * Bumps split count and prepends a payment log entry.
   */
  recordPayment(tripId: string, memberIndex: number, amount?: number): Promise<void>

  /** Upload original media (untouched) + a generated thumbnail to the shared bucket. */
  uploadMedia(tripId: string, input: UploadMediaInput): Promise<void>

  /** Post an announcement (route_head + assistant in production). */
  postAnnouncement(tripId: string, input: PostAnnouncementInput): Promise<void>

  /** Create an invite token (route_head only in production). */
  createInvite(tripId: string, input: CreateInviteInput): Promise<TripInvite>

  /** Change a member's role (route_head only in production). */
  setMemberRole(memberId: string, role: MemberRole): Promise<void>

  /** Update the caller's own member onboarding fields for a trip. */
  updateMyOnboarding(input: OnboardingInput): Promise<void>

  // ── Media URLs ───────────────────────────────────────────────────────────
  /** Signed URL for a tile's thumbnail (null when no stored thumb). */
  getThumbUrl(item: MediaItem): Promise<string | null>

  /** Signed URL for downloading the untouched original (null when none). */
  getOriginalUrl(item: MediaItem): Promise<string | null>
}
