/** Domain types shared across the app and both repository implementations. */

export type CategoryKey = 'stay' | 'food' | 'travel' | 'activities' | 'misc'
export type LogKind = 'expense' | 'edit' | 'payment'
export type StopState = 'done' | 'current' | 'up'
export type ThemeName = 'lagoon' | 'sunset' | 'palm'
export type Device = 'iPhone' | 'Android'
export type QualityLabel = '4K' | 'HQ'

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
  originalPath: string | null
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
