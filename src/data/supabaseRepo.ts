/**
 * Supabase-backed TripRepository. Reads the trip snapshot from the database
 * (money math stays server-authoritative via aggregated balances) and writes
 * expenses / contributions plus their activity-log entries.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import type {
  CategoryKey,
  MediaItem,
  Member,
  NewExpenseInput,
  StopState,
  TripSnapshot,
  UploadMediaInput,
} from './types'
import type { TripRepository } from './repository'
import { CATS } from '../lib/catalog'
import { formatRelativeTime, shortDateLabel } from '../lib/time'
import {
  classifyQuality,
  detectDevice,
  fileExtension,
  generateThumbnail,
  placeFromStopKey,
  readDimensions,
} from '../lib/media'
import { resumableUpload } from '../lib/resumableUpload'

const ORIGINALS_BUCKET = 'media-originals'
const THUMBS_BUCKET = 'media-thumbnails'

type DB = Database
type MemberRow = DB['public']['Tables']['members']['Row']

interface WriteContext {
  tripId: string
  userId: string | null
  actorName: string
  perHeadFee: number
  /** member rows in display order, with their current paid total. */
  members: { id: string; name: string; paid: number }[]
}

function mapStopState(state: DB['public']['Enums']['stop_state']): StopState {
  return state === 'upcoming' ? 'up' : state
}

export class SupabaseTripRepository implements TripRepository {
  private ctx: WriteContext | null = null
  private readonly client: SupabaseClient<DB>

  constructor(client: SupabaseClient<DB>) {
    this.client = client
  }

  async getSnapshot(): Promise<TripSnapshot> {
    const { data: userData } = await this.client.auth.getUser()
    const userId = userData.user?.id ?? null

    const { data: trip, error: tripErr } = await this.client
      .from('trips')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (tripErr) throw tripErr
    if (!trip) throw new Error('No trip found for this account. Ask the Route Head to add you.')

    const [membersRes, balancesRes, expensesRes, stopsRes, mediaRes, logRes] = await Promise.all([
      this.client.from('members').select('*').eq('trip_id', trip.id).order('sort_order'),
      this.client.from('member_balances').select('*').eq('trip_id', trip.id),
      this.client.from('expenses').select('*').eq('trip_id', trip.id),
      this.client.from('stops').select('*').eq('trip_id', trip.id).order('order_index'),
      this.client.from('media').select('*').eq('trip_id', trip.id).order('created_at', { ascending: false }),
      this.client.from('activity_log').select('*').eq('trip_id', trip.id).order('created_at', { ascending: false }),
    ])
    for (const res of [membersRes, balancesRes, expensesRes, stopsRes, mediaRes, logRes]) {
      if (res.error) throw res.error
    }

    const balanceByMember = new Map<string, { paid: number; splits: number }>()
    for (const b of balancesRes.data ?? []) {
      if (b.member_id) balanceByMember.set(b.member_id, { paid: b.paid ?? 0, splits: b.splits ?? 0 })
    }

    const memberRows = (membersRes.data ?? []) as MemberRow[]
    const members: Member[] = memberRows.map((m) => {
      const bal = balanceByMember.get(m.id) ?? { paid: 0, splits: 0 }
      const isYou = userId != null && m.user_id === userId
      return {
        name: isYou ? `${m.name} (you)` : m.name,
        initials: m.initials,
        color: m.avatar_color,
        paid: bal.paid,
        splits: bal.splits,
        organizer: m.is_organizer,
      }
    })

    // Cache everything writes need (display order, clean names, current paid).
    const youRow = memberRows.find((m) => userId != null && m.user_id === userId)
    this.ctx = {
      tripId: trip.id,
      userId,
      actorName: youRow?.name ?? 'Route Head',
      perHeadFee: trip.per_head_amount,
      members: memberRows.map((m) => ({
        id: m.id,
        name: m.name,
        paid: balanceByMember.get(m.id)?.paid ?? 0,
      })),
    }

    return {
      tripName: trip.name,
      perHeadFee: trip.per_head_amount,
      members,
      expenses: (expensesRes.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        cat: e.category as CategoryKey,
        payer: e.paid_by ?? '',
        date: e.date_label ?? '',
        amount: e.amount,
        createdAt: e.created_at,
      })),
      log: (logRes.data ?? []).map((l) => ({
        who: l.actor_name,
        kind: l.kind,
        detail: l.detail,
        time: formatRelativeTime(l.created_at),
      })),
      stops: (stopsRes.data ?? []).map((s) => ({
        name: s.name,
        dates: s.date_label ?? '',
        note: s.note ?? '',
        state: mapStopState(s.state),
        icon: s.weather_icon ?? '',
        temp: s.temp ?? '',
        cond: s.condition ?? '',
        lat: s.lat,
        lng: s.lng,
      })),
      media: (mediaRes.data ?? []).map((m) => ({
        id: m.id,
        place: m.place,
        stop: m.stop_key ?? '',
        quality: m.quality_label,
        device: m.device,
        isVideo: m.is_video,
        ratio: m.ratio,
        c1: m.c1 ?? '#7ed0a8',
        c2: m.c2 ?? '#2e9e6e',
        thumbPath: m.storage_path_thumb,
        originalPath: m.storage_path_original,
      })),
    }
  }

  async addExpense({ amount, title, cat }: NewExpenseInput): Promise<void> {
    const ctx = this.ctx
    if (!ctx || !amount) return
    const finalTitle = title || `${CATS[cat].label} expense`

    const { error: expErr } = await this.client.from('expenses').insert({
      trip_id: ctx.tripId,
      title: finalTitle,
      category: cat,
      amount,
      paid_by: ctx.actorName,
      date_label: shortDateLabel(),
      spent_on: new Date().toISOString().slice(0, 10),
      created_by: ctx.userId,
    })
    if (expErr) throw expErr

    await this.log('expense', `Added ${finalTitle} · ₹${amount.toLocaleString('en-IN')}`)
  }

  async recordPayment(memberIndex: number, amount?: number): Promise<void> {
    const ctx = this.ctx
    const member = ctx?.members[memberIndex]
    if (!ctx || !member) return
    const owed = ctx.perHeadFee - member.paid
    if (owed <= 0) return
    const pay = amount == null ? owed : Math.min(amount, owed)

    const { error: contribErr } = await this.client.from('contributions').insert({
      trip_id: ctx.tripId,
      member_id: member.id,
      amount: pay,
      recorded_by: ctx.userId,
    })
    if (contribErr) throw contribErr

    await this.log('payment', `Recorded ${member.name}'s payment · ₹${pay.toLocaleString('en-IN')}`)
  }

  async uploadMedia({ files, stopKey }: UploadMediaInput): Promise<void> {
    const ctx = this.ctx
    if (!ctx) return
    const device = detectDevice()

    for (const file of files) {
      const dims = await readDimensions(file).catch(() => ({ width: 0, height: 0, isVideo: file.type.startsWith('video/') }))
      const mediaId = crypto.randomUUID()
      const originalPath = `${ctx.tripId}/${mediaId}/original.${fileExtension(file)}`
      const thumbPath = `${ctx.tripId}/${mediaId}/thumb.jpg`

      // 1) Original — untouched, resumable.
      await resumableUpload({
        bucket: ORIGINALS_BUCKET,
        objectName: originalPath,
        file,
        contentType: file.type || 'application/octet-stream',
      })

      // 2) Thumbnail — small, separate object. Skipped if the browser can't decode the source.
      let storedThumb: string | null = null
      const thumb = await generateThumbnail(file, dims).catch(() => null)
      if (thumb) {
        const { error: thumbErr } = await this.client.storage
          .from(THUMBS_BUCKET)
          .upload(thumbPath, thumb, { contentType: 'image/jpeg', upsert: true })
        if (!thumbErr) storedThumb = thumbPath
      }

      // 3) Metadata row.
      const { error: rowErr } = await this.client.from('media').insert({
        trip_id: ctx.tripId,
        stop_key: stopKey,
        place: placeFromStopKey(stopKey),
        uploader_user_id: ctx.userId,
        device,
        quality_label: classifyQuality(dims.width, dims.height),
        is_video: dims.isVideo,
        ratio: dims.width && dims.height ? `${dims.width}/${dims.height}` : '1/1',
        storage_path_original: originalPath,
        storage_path_thumb: storedThumb,
        width: dims.width || null,
        height: dims.height || null,
        bytes: file.size,
      })
      if (rowErr) throw rowErr
    }
  }

  async getThumbUrl(item: MediaItem): Promise<string | null> {
    if (!item.thumbPath) return null
    const { data } = await this.client.storage.from(THUMBS_BUCKET).createSignedUrl(item.thumbPath, 3600)
    return data?.signedUrl ?? null
  }

  async getOriginalUrl(item: MediaItem): Promise<string | null> {
    if (!item.originalPath) return null
    const { data } = await this.client.storage
      .from(ORIGINALS_BUCKET)
      .createSignedUrl(item.originalPath, 3600, { download: true })
    return data?.signedUrl ?? null
  }

  private async log(kind: DB['public']['Enums']['log_kind'], detail: string): Promise<void> {
    const ctx = this.ctx
    if (!ctx) return
    const { error } = await this.client.from('activity_log').insert({
      trip_id: ctx.tripId,
      actor_user_id: ctx.userId,
      actor_name: ctx.actorName,
      kind,
      detail,
    })
    if (error) throw error
  }
}
