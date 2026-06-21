/**
 * In-memory TripRepository for Phase 1 — mirrors the prototype's saveExpense /
 * recordPayment logic. State lives for the lifetime of the tab (resets on reload),
 * exactly like the prototype.
 */
import type { MediaItem, NewExpenseInput, TripSnapshot, UploadMediaInput } from './types'
import type { TripRepository } from './repository'
import { CATS } from '../lib/catalog'
import { classifyQuality, detectDevice, placeFromStopKey, readDimensions } from '../lib/media'
import { seedSnapshot } from './fixtures'

export class MockTripRepository implements TripRepository {
  private snapshot: TripSnapshot = seedSnapshot()

  async getSnapshot(): Promise<TripSnapshot> {
    // Return a shallow clone so consumers can't mutate our store directly.
    return {
      ...this.snapshot,
      members: this.snapshot.members.map((m) => ({ ...m })),
      expenses: this.snapshot.expenses.map((e) => ({ ...e })),
      log: this.snapshot.log.map((l) => ({ ...l })),
      stops: this.snapshot.stops.map((s) => ({ ...s })),
      media: this.snapshot.media.map((m) => ({ ...m })),
    }
  }

  async addExpense({ amount, title, cat }: NewExpenseInput): Promise<void> {
    if (!amount) return
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
    this.snapshot = {
      ...this.snapshot,
      expenses: [...this.snapshot.expenses, expense],
      log: [entry, ...this.snapshot.log],
    }
  }

  async recordPayment(memberIndex: number, amount?: number): Promise<void> {
    const member = this.snapshot.members[memberIndex]
    if (!member) return
    const owed = this.snapshot.perHeadFee - member.paid
    if (owed <= 0) return

    const pay = amount == null ? owed : Math.min(amount, owed)
    const members = this.snapshot.members.map((m, i) =>
      i === memberIndex ? { ...m, paid: m.paid + pay, splits: (m.splits || 0) + 1 } : m,
    )
    const name = member.name.replace(' (you)', '')
    const entry = {
      who: 'Arjun',
      kind: 'payment' as const,
      detail: `Recorded ${name}'s payment · ₹${pay.toLocaleString('en-IN')}`,
      time: 'Just now',
    }
    this.snapshot = { ...this.snapshot, members, log: [entry, ...this.snapshot.log] }
  }

  async uploadMedia({ files, stopKey }: UploadMediaInput): Promise<void> {
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
    this.snapshot = { ...this.snapshot, media: [...newItems, ...this.snapshot.media] }
  }

  async getThumbUrl(item: MediaItem): Promise<string | null> {
    return item.thumbPath
  }

  async getOriginalUrl(item: MediaItem): Promise<string | null> {
    return item.originalPath
  }
}
