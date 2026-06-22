/**
 * In-memory TripRepository — mirrors the prototype's saveExpense /
 * recordPayment logic and now models multiple trips so the multi-trip UI can be
 * built without Supabase. State lives for the lifetime of the tab (resets on
 * reload), exactly like the prototype.
 *
 * In mock mode there is no auth, so the local "user" is always treated as the
 * route_head of every trip — every edit affordance stays usable for local dev.
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
import type { TripRepository } from './repository'
import { CATS } from '../lib/catalog'
import { classifyQuality, detectDevice, placeFromStopKey, readDimensions } from '../lib/media'
import { seedSnapshot } from './fixtures'

const SEED_TRIP_ID = 'seed-kerala'

interface MockTrip {
  id: string
  snapshot: TripSnapshot
  members: MemberDetail[]
  announcements: Announcement[]
  invites: TripInvite[]
  /** The local user's role for this trip (always route_head in mock mode). */
  myRole: MemberRole
  /** Whether the local user has finished onboarding for this trip. */
  onboardingComplete: boolean
}

function seedMembers(snapshot: TripSnapshot): MemberDetail[] {
  return snapshot.members.map((m, i) => ({
    id: `${SEED_TRIP_ID}-m${i}`,
    userId: i === 0 ? 'local-user' : null,
    name: m.name.replace(' (you)', ''),
    initials: m.initials,
    color: m.color,
    role: i === 0 ? 'route_head' : 'member',
    isOrganizer: Boolean(m.organizer),
    fullName: null,
    nickname: i === 0 ? m.name.replace(' (you)', '') : null,
    priorContributionNote: null,
    sortOrder: i,
    email: null,
  }))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export class MockTripRepository implements TripRepository {
  private trips = new Map<string, MockTrip>()

  constructor() {
    const snapshot = seedSnapshot()
    this.trips.set(SEED_TRIP_ID, {
      id: SEED_TRIP_ID,
      snapshot,
      members: seedMembers(snapshot),
      announcements: [
        {
          id: `${SEED_TRIP_ID}-a1`,
          authorName: 'Arjun',
          body: 'Houseboat check-in is 12pm sharp — be at the Alleppey jetty by 11:30. 🛶',
          pinned: true,
          createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
        },
      ],
      invites: [],
      myRole: 'route_head',
      onboardingComplete: true,
    })
  }

  private require(tripId: string): MockTrip {
    const trip = this.trips.get(tripId)
    if (!trip) throw new Error('Trip not found.')
    return trip
  }

  async listMyTrips(): Promise<TripListItem[]> {
    return [...this.trips.values()].map((t) => ({
      id: t.id,
      name: t.snapshot.tripName,
      perHeadAmount: t.snapshot.perHeadFee,
      myRole: t.myRole,
      myOnboardingComplete: t.onboardingComplete,
    }))
  }

  async createTrip({ name, perHead, nickname }: CreateTripInput): Promise<string> {
    const id = crypto.randomUUID()
    const fee = perHead ?? 5000
    const displayName = nickname?.trim() || 'You'
    const snapshot: TripSnapshot = {
      tripName: name,
      perHeadFee: fee,
      members: [{ name: `${displayName} (you)`, initials: displayName.slice(0, 1).toUpperCase(), color: '#12C2C2', paid: 0, splits: 0, organizer: true }],
      expenses: [],
      log: [],
      stops: [],
      media: [],
    }
    this.trips.set(id, {
      id,
      snapshot,
      members: [
        {
          id: `${id}-m0`,
          userId: 'local-user',
          name: displayName,
          initials: displayName.slice(0, 1).toUpperCase(),
          color: '#12C2C2',
          role: 'route_head',
          isOrganizer: true,
          fullName: null,
          nickname: nickname?.trim() || displayName,
          priorContributionNote: null,
          sortOrder: 0,
          email: null,
        },
      ],
      announcements: [],
      invites: [],
      myRole: 'route_head',
      onboardingComplete: true,
    })
    return id
  }

  async joinTrip({ token }: JoinTripInput): Promise<string> {
    // Mock: tokens map directly to a trip id if it exists; otherwise no-op error.
    const trip = this.trips.get(token)
    if (!trip) throw new Error('Invite not found.')
    return trip.id
  }

  async getInviteInfo(token: string): Promise<InviteInfo | null> {
    const trip = this.trips.get(token)
    if (!trip) return null
    return { tripId: trip.id, tripName: trip.snapshot.tripName, inviteRole: 'member', valid: true }
  }

  async getSnapshot(tripId: string): Promise<TripSnapshot> {
    const { snapshot } = this.require(tripId)
    return clone(snapshot)
  }

  async listMembers(tripId: string): Promise<MemberDetail[]> {
    return clone(this.require(tripId).members)
  }

  async listAnnouncements(tripId: string): Promise<Announcement[]> {
    const { announcements } = this.require(tripId)
    return clone(
      [...announcements].sort((a, b) =>
        a.pinned === b.pinned ? b.createdAt.localeCompare(a.createdAt) : a.pinned ? -1 : 1,
      ),
    )
  }

  async listInvites(tripId: string): Promise<TripInvite[]> {
    return clone(this.require(tripId).invites)
  }

  async addExpense(tripId: string, { amount, title, cat }: NewExpenseInput): Promise<void> {
    if (!amount) return
    const trip = this.require(tripId)
    const finalTitle = title || `${CATS[cat].label} expense`
    const expense = {
      id: crypto.randomUUID(),
      title: finalTitle,
      cat,
      payer: 'Arjun',
      date: 'Jun 19',
      amount,
      createdAt: new Date().toISOString(),
    }
    const entry = {
      who: 'Arjun',
      kind: 'expense' as const,
      detail: `Added ${finalTitle} · ₹${amount.toLocaleString('en-IN')}`,
      time: 'Just now',
    }
    trip.snapshot = {
      ...trip.snapshot,
      expenses: [...trip.snapshot.expenses, expense],
      log: [entry, ...trip.snapshot.log],
    }
  }

  async recordPayment(tripId: string, memberIndex: number, amount?: number): Promise<void> {
    const trip = this.require(tripId)
    const member = trip.snapshot.members[memberIndex]
    if (!member) return
    const owed = trip.snapshot.perHeadFee - member.paid
    if (owed <= 0) return

    const pay = amount == null ? owed : Math.min(amount, owed)
    const members = trip.snapshot.members.map((m, i) =>
      i === memberIndex ? { ...m, paid: m.paid + pay, splits: (m.splits || 0) + 1 } : m,
    )
    const name = member.name.replace(' (you)', '')
    const entry = {
      who: 'Arjun',
      kind: 'payment' as const,
      detail: `Recorded ${name}'s payment · ₹${pay.toLocaleString('en-IN')}`,
      time: 'Just now',
    }
    trip.snapshot = { ...trip.snapshot, members, log: [entry, ...trip.snapshot.log] }
  }

  async uploadMedia(tripId: string, { files, stopKey }: UploadMediaInput): Promise<void> {
    const trip = this.require(tripId)
    const newItems: MediaItem[] = []
    for (const file of files) {
      const isVideo = file.type.startsWith('video/')
      let dims = { width: 0, height: 0, isVideo }
      try {
        dims = await readDimensions(file)
      } catch {
        // ignore — fall back to defaults
      }
      // In mock mode we preview straight from a local object URL (no real storage).
      const objectUrl = URL.createObjectURL(file)
      newItems.push({
        id: crypto.randomUUID(),
        place: placeFromStopKey(stopKey),
        stop: stopKey ?? '',
        quality: classifyQuality(dims.width, dims.height),
        device: detectDevice(),
        isVideo,
        ratio: dims.width && dims.height ? `${dims.width}/${dims.height}` : '1/1',
        c1: '#7ed0a8',
        c2: '#2e9e6e',
        thumbPath: isVideo ? null : objectUrl,
        originalPath: objectUrl,
      })
    }
    trip.snapshot = { ...trip.snapshot, media: [...newItems, ...trip.snapshot.media] }
  }

  async postAnnouncement(tripId: string, { body, pinned }: PostAnnouncementInput): Promise<void> {
    const trip = this.require(tripId)
    trip.announcements = [
      {
        id: crypto.randomUUID(),
        authorName: 'Arjun',
        body,
        pinned: Boolean(pinned),
        createdAt: new Date().toISOString(),
      },
      ...trip.announcements,
    ]
  }

  async createInvite(tripId: string, { role, maxUses, expiresAt }: CreateInviteInput): Promise<TripInvite> {
    const trip = this.require(tripId)
    // Mock tokens are the trip id so joinTrip can resolve them locally.
    const invite: TripInvite = {
      id: crypto.randomUUID(),
      token: tripId,
      role: role ?? 'member',
      expiresAt: expiresAt ?? null,
      maxUses: maxUses ?? null,
      uses: 0,
      active: true,
    }
    trip.invites = [invite, ...trip.invites]
    return invite
  }

  async setMemberRole(memberId: string, role: MemberRole): Promise<void> {
    for (const trip of this.trips.values()) {
      const member = trip.members.find((m) => m.id === memberId)
      if (member) {
        trip.members = trip.members.map((m) => (m.id === memberId ? { ...m, role } : m))
        return
      }
    }
  }

  async updateMyOnboarding({ tripId, fullName, nickname, priorContributionNote }: OnboardingInput): Promise<void> {
    const trip = this.require(tripId)
    trip.members = trip.members.map((m) =>
      m.userId === 'local-user'
        ? {
            ...m,
            fullName: fullName !== undefined ? fullName : m.fullName,
            nickname: nickname !== undefined ? nickname : m.nickname,
            priorContributionNote:
              priorContributionNote !== undefined ? priorContributionNote : m.priorContributionNote,
          }
        : m,
    )
    if (nickname && nickname.trim()) trip.onboardingComplete = true
  }

  async getThumbUrl(item: MediaItem): Promise<string | null> {
    return item.thumbPath
  }

  async getOriginalUrl(item: MediaItem): Promise<string | null> {
    return item.originalPath
  }
}
