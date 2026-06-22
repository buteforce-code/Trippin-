/**
 * Supabase-backed TripRepository. Reads per-trip snapshots from the database
 * (money math stays server-authoritative via aggregated balances) and writes
 * expenses / contributions / announcements plus their activity-log entries.
 *
 * The app is multi-trip: every read/write is scoped by an explicit `tripId`
 * supplied by TripProvider. A small per-trip write cache (display order, clean
 * names, current paid totals) is populated on each getSnapshot.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import type {
  Announcement,
  CategoryKey,
  CreateInviteInput,
  CreateTripInput,
  InviteInfo,
  JoinTripInput,
  MediaItem,
  Member,
  MemberDetail,
  MemberRole,
  NewExpenseInput,
  OnboardingInput,
  PostAnnouncementInput,
  StopState,
  TripInvite,
  TripListItem,
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

function mapMemberDetail(m: MemberRow): MemberDetail {
  return {
    id: m.id,
    userId: m.user_id,
    name: m.name,
    initials: m.initials,
    color: m.avatar_color,
    role: m.role,
    isOrganizer: m.is_organizer,
    fullName: m.full_name,
    nickname: m.nickname,
    priorContributionNote: m.prior_contribution_note,
    sortOrder: m.sort_order,
    email: m.email,
  }
}

export class SupabaseTripRepository implements TripRepository {
  /** Per-trip write context, keyed by tripId, refreshed on each getSnapshot. */
  private ctxByTrip = new Map<string, WriteContext>()
  private readonly client: SupabaseClient<DB>

  constructor(client: SupabaseClient<DB>) {
    this.client = client
  }

  private async currentUserId(): Promise<string | null> {
    const { data } = await this.client.auth.getUser()
    return data.user?.id ?? null
  }

  private ctx(tripId: string): WriteContext {
    const ctx = this.ctxByTrip.get(tripId)
    if (!ctx) throw new Error('Trip context missing — load the trip snapshot first.')
    return ctx
  }

  // ── Multi-trip / membership ──────────────────────────────────────────────

  async listMyTrips(): Promise<TripListItem[]> {
    const userId = await this.currentUserId()
    if (!userId) return []

    // Membership rows tell us which trips we belong to + our role + onboarding state.
    const { data: memberRows, error: memErr } = await this.client
      .from('members')
      .select('trip_id, role, nickname')
      .eq('user_id', userId)
    if (memErr) throw memErr

    const rows = memberRows ?? []
    if (rows.length === 0) return []

    const tripIds = rows.map((r) => r.trip_id)
    const { data: trips, error: tripErr } = await this.client
      .from('trips')
      .select('id, name, per_head_amount')
      .in('id', tripIds)
      .order('created_at', { ascending: true })
    if (tripErr) throw tripErr

    const memberByTrip = new Map(rows.map((r) => [r.trip_id, r]))
    return (trips ?? []).map((t) => {
      const m = memberByTrip.get(t.id)
      return {
        id: t.id,
        name: t.name,
        perHeadAmount: t.per_head_amount,
        myRole: (m?.role ?? 'member') as MemberRole,
        myOnboardingComplete: Boolean(m?.nickname && m.nickname.trim()),
      }
    })
  }

  async createTrip({ name, perHead, fullName, nickname, startDate, endDate }: CreateTripInput): Promise<string> {
    const { data, error } = await this.client.rpc('create_trip', {
      p_name: name,
      p_per_head: perHead,
      p_full_name: fullName,
      p_nickname: nickname,
    })
    if (error) throw error
    const tripId = data as string

    if (startDate || endDate) {
      const patch: any = {}
      if (startDate) patch.start_date = startDate
      if (endDate) patch.end_date = endDate
      await this.client.from('trips').update(patch).eq('id', tripId)
    }

    return tripId
  }

  async joinTrip({ token, fullName, nickname }: JoinTripInput): Promise<string> {
    const { data, error } = await this.client.rpc('join_trip', {
      p_token: token,
      p_full_name: fullName,
      p_nickname: nickname,
    })
    if (error) throw error
    return data as string
  }

  async getInviteInfo(token: string): Promise<InviteInfo | null> {
    const { data, error } = await this.client.rpc('invite_info', { p_token: token })
    if (error) throw error
    const row = (data ?? [])[0]
    if (!row) return null
    return {
      tripId: row.trip_id,
      tripName: row.trip_name,
      inviteRole: row.invite_role,
      valid: row.valid,
    }
  }

  // ── Per-trip reads ───────────────────────────────────────────────────────

  async getSnapshot(tripId: string): Promise<TripSnapshot> {
    const userId = await this.currentUserId()

    const { data: trip, error: tripErr } = await this.client
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .maybeSingle()
    if (tripErr) throw tripErr
    if (!trip) throw new Error('Trip not found, or you no longer have access to it.')

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
    this.ctxByTrip.set(trip.id, {
      tripId: trip.id,
      userId,
      actorName: youRow?.name ?? 'Route Head',
      perHeadFee: trip.per_head_amount,
      members: memberRows.map((m) => ({
        id: m.id,
        name: m.name,
        paid: balanceByMember.get(m.id)?.paid ?? 0,
      })),
    })

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

  async listMembers(tripId: string): Promise<MemberDetail[]> {
    const { data, error } = await this.client
      .from('members')
      .select('*')
      .eq('trip_id', tripId)
      .order('sort_order')
    if (error) throw error
    return (data ?? []).map(mapMemberDetail)
  }

  async listAnnouncements(tripId: string): Promise<Announcement[]> {
    const { data, error } = await this.client
      .from('announcements')
      .select('*')
      .eq('trip_id', tripId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((a) => ({
      id: a.id,
      authorName: a.author_name,
      body: a.body,
      pinned: a.pinned,
      createdAt: a.created_at,
    }))
  }

  async listInvites(tripId: string): Promise<TripInvite[]> {
    const { data, error } = await this.client
      .from('trip_invites')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((i) => ({
      id: i.id,
      token: i.token,
      role: i.role,
      expiresAt: i.expires_at,
      maxUses: i.max_uses,
      uses: i.uses,
      active: i.active,
    }))
  }

  // ── Per-trip writes ──────────────────────────────────────────────────────

  async addExpense(tripId: string, { amount, title, cat }: NewExpenseInput): Promise<void> {
    if (!amount) return
    const ctx = this.ctx(tripId)
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

    await this.log(ctx, 'expense', `Added ${finalTitle} · ₹${amount.toLocaleString('en-IN')}`)
  }

  async recordPayment(tripId: string, memberIndex: number, amount?: number): Promise<void> {
    const ctx = this.ctx(tripId)
    const member = ctx.members[memberIndex]
    if (!member) return
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

    await this.log(ctx, 'payment', `Recorded ${member.name}'s payment · ₹${pay.toLocaleString('en-IN')}`)
  }

  async uploadMedia(tripId: string, { files, stopKey }: UploadMediaInput): Promise<void> {
    const ctx = this.ctx(tripId)
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

  async postAnnouncement(tripId: string, { body, pinned }: PostAnnouncementInput): Promise<void> {
    const ctx = this.ctxByTrip.get(tripId)
    const userId = ctx?.userId ?? (await this.currentUserId())
    const { error } = await this.client.from('announcements').insert({
      trip_id: tripId,
      author_user_id: userId,
      author_name: ctx?.actorName ?? 'Route Head',
      body,
      pinned: Boolean(pinned),
    })
    if (error) throw error
  }

  async createInvite(tripId: string, { role, maxUses, expiresAt }: CreateInviteInput): Promise<TripInvite> {
    const userId = await this.currentUserId()
    const { data, error } = await this.client
      .from('trip_invites')
      .insert({
        trip_id: tripId,
        role: role ?? 'member',
        max_uses: maxUses ?? null,
        expires_at: expiresAt ?? null,
        created_by: userId,
      })
      .select('*')
      .single()
    if (error) throw error
    return {
      id: data.id,
      token: data.token,
      role: data.role,
      expiresAt: data.expires_at,
      maxUses: data.max_uses,
      uses: data.uses,
      active: data.active,
    }
  }

  async setMemberRole(memberId: string, role: MemberRole): Promise<void> {
    const { error } = await this.client.rpc('set_member_role', {
      p_member_id: memberId,
      p_role: role,
    })
    if (error) throw error
  }

  async updateMyOnboarding({ tripId, fullName, nickname, priorContributionNote }: OnboardingInput): Promise<void> {
    const userId = await this.currentUserId()
    if (!userId) throw new Error('You must be signed in to update your profile.')

    const patch: DB['public']['Tables']['members']['Update'] = {}
    if (fullName !== undefined) patch.full_name = fullName
    if (nickname !== undefined) patch.nickname = nickname
    if (priorContributionNote !== undefined) patch.prior_contribution_note = priorContributionNote

    const { error } = await this.client
      .from('members')
      .update(patch)
      .eq('trip_id', tripId)
      .eq('user_id', userId)
    if (error) throw error
  }

  // ── Media URLs ───────────────────────────────────────────────────────────

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

  private async log(ctx: WriteContext, kind: DB['public']['Enums']['log_kind'], detail: string): Promise<void> {
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
