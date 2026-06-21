/**
 * Storage-agnostic data access. Screens depend only on this interface, so the
 * Phase 1 MockTripRepository can be swapped for a SupabaseTripRepository in
 * Phase 2 with zero component changes.
 */
import type { MediaItem, NewExpenseInput, TripSnapshot, UploadMediaInput } from './types'

export interface TripRepository {
  /** Full current trip state (members, expenses, log, stops, media). */
  getSnapshot(): Promise<TripSnapshot>

  /** Append an expense + its activity-log entry. */
  addExpense(input: NewExpenseInput): Promise<void>

  /**
   * Record a contribution for a member. `amount` omitted = settle the full
   * remaining balance (prototype behavior); a value = a partial split payment.
   * Bumps split count and prepends a payment log entry.
   */
  recordPayment(memberIndex: number, amount?: number): Promise<void>

  /** Upload original media (untouched) + a generated thumbnail to the shared bucket. */
  uploadMedia(input: UploadMediaInput): Promise<void>

  /** Signed URL for a tile's thumbnail (null when no stored thumb). */
  getThumbUrl(item: MediaItem): Promise<string | null>

  /** Signed URL for downloading the untouched original (null when none). */
  getOriginalUrl(item: MediaItem): Promise<string | null>
}
