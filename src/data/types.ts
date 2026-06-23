/** Domain types shared across the app and both repository implementations. */

export type CategoryKey = 'stay' | 'food' | 'travel' | 'activities' | 'misc'
export type LogKind = 'expense' | 'edit' | 'payment'
export type StopState = 'done' | 'current' | 'up'
export type ThemeName = 'lagoon' | 'sunset' | 'palm'
export type Device = 'iPhone' | 'Android'
export type QualityLabel = '4K' | 'HQ'

/** The current user's permission level inside a single trip. */
export type MemberRole = 'route_head' | 'assistant' | 'member'

/** A trip the signed-in user belongs to, plus that user's role in it. */
export interface TripListItem {
  id: string
  name: string
  perHeadAmount: number
  /** The signed-in user's role for this trip. */
  myRole: MemberRole
  /** Whether the signed-in user has finished onboarding (set a nickname) for this trip. */
  myOnboardingComplete: boolean
}

/** Detailed member row (multi-trip / roster / onboarding aware). */
export interface MemberDetail {
  id: string
  userId: string | null
  name: string
  initials: string
  color: string
  role: MemberRole
  isOrganizer: boolean
  fullName: string | null
  nickname: string | null
  priorContributionNote: string | null
  sortOrder: number
  email: string | null
}

export interface Announcement {
  id: string
  authorName: string
  body: string
  pinned: boolean
  createdAt: string
}

export interface TripInvite {
  id: string
  token: string
  role: MemberRole
  expiresAt: string | null
  maxUses: number | null
  uses: number
  active: boolean
}

/** Result of resolving an invite token (before joining). */
export interface InviteInfo {
  tripId: string
  tripName: string
  inviteRole: MemberRole
  valid: boolean
}

export interface CreateTripInput {
  name: string
  perHead?: number
  fullName?: string
  nickname?: string
  startDate?: string
  endDate?: string
}

export interface JoinTripInput {
  token: string
  fullName?: string
  nickname?: string
}

/** The fields a member may edit on their OWN member row. */
export interface OnboardingInput {
  tripId: string
  fullName?: string | null
  nickname?: string | null
  priorContributionNote?: string | null
}

export interface PostAnnouncementInput {
  body: string
  pinned?: boolean
}

export interface CreateInviteInput {
  role?: MemberRole
  maxUses?: number | null
  expiresAt?: string | null
}

export interface Member {
  name: string
  initials: string
  color: string
  /** Total paid into the pool (sum of contribution rows in production). */
  paid: number
  /** Number of split payments made. */
  splits: number
  organizer?: boolean
}

export interface Expense {
  id: string
  title: string
  cat: CategoryKey
  payer: string
  date: string
  amount: number
  /** ISO timestamp used to sort newest-first. */
  createdAt: string
}

export interface LogEntry {
  who: string
  kind: LogKind
  detail: string
  time: string
}

export interface Stop {
  name: string
  dates: string
  note: string
  state: StopState
  icon: string
  temp: string
  cond: string
  lat: number | null
  lng: number | null
}

export interface MediaItem {
  id: string
  place: string
  stop: string
  quality: QualityLabel
  device: Device
  isVideo: boolean
  ratio: string
  /** Gradient stops used as a thumbnail placeholder when no real thumb exists. */
  c1: string
  c2: string
  /** Storage object paths (null for seed placeholders). */
  thumbPath: string | null
  /** For supabase: the Storage object path. For drive: the Google Drive file id. */
  originalPath: string | null
  /** Where the original lives: Supabase Storage (<10MB) or Google Drive (>=10MB). */
  originalProvider: 'supabase' | 'drive'
  /** Display name of the member who uploaded this (null = unknown/seed). */
  uploaderName: string | null
  /** Reverse-geocoded place ("Kochi") used for auto location filters (null = none). */
  locationTag: string | null
}

export interface UploadMediaInput {
  files: File[]
  /** stop filter key the upload is tagged to (null = whole trip). */
  stopKey: string | null
}

export interface TripSnapshot {
  tripName: string
  perHeadFee: number
  members: Member[]
  expenses: Expense[]
  log: LogEntry[]
  stops: Stop[]
  media: MediaItem[]
}

export interface NewExpenseInput {
  amount: number
  title: string
  cat: CategoryKey
}
