/**
 * Live trip location: opt-in sharing of each member's phone position, plus a
 * poll of everyone's latest position for the map.
 *
 * Web reality: browsers suspend background tabs, so sharing only runs while the
 * app is open/foreground. It pushes a fresh fix every minute; the map polls
 * every ~25 s so markers stay close to live without a realtime channel.
 */
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'

export interface LivePosition {
  userId: string
  lat: number
  lng: number
  updatedAt: string
}

const POLL_MS = 25_000
const SHARE_MS = 60_000

/** Everyone's latest shared position for a trip (polled). */
export function useLiveLocations(tripId: string | null) {
  return useQuery<LivePosition[]>({
    queryKey: ['live-locations', tripId],
    enabled: Boolean(tripId) && isSupabaseConfigured,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!supabase || !tripId) return []
      const { data, error } = await supabase
        .from('live_locations')
        .select('user_id, lat, lng, updated_at')
        .eq('trip_id', tripId)
      if (error) throw error
      return (data ?? []).map((r) => ({
        userId: r.user_id,
        lat: r.lat,
        lng: r.lng,
        updatedAt: r.updated_at,
      }))
    },
  })
}

/**
 * While `enabled`, push the signed-in user's position to the trip every minute.
 * When disabled, remove their row so no stale marker lingers.
 */
export function useShareLocation(tripId: string | null, enabled: boolean) {
  const { session } = useAuth()
  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!supabase || !tripId || !userId) return

    // Sharing off → make sure we aren't leaving a ghost marker behind.
    if (!enabled) {
      void supabase.from('live_locations').delete().eq('trip_id', tripId).eq('user_id', userId)
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) return

    let cancelled = false
    const push = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled || !supabase) return
          void supabase.from('live_locations').upsert(
            {
              trip_id: tripId,
              user_id: userId,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy ?? null,
              heading: Number.isFinite(pos.coords.heading) ? pos.coords.heading : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'trip_id,user_id' },
          )
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
      )
    }

    push() // immediate first fix
    const id = window.setInterval(push, SHARE_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [enabled, tripId, userId])
}
