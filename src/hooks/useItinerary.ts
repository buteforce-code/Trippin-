/**
 * Itinerary write hook — Route Head + Assistant add / edit / remove stops.
 *
 * Stops are written straight to the `stops` table (RLS already gates this to
 * editors). The shared trip snapshot orders stops by `order_index`, so the
 * `index` passed to `updateStop` / `removeStop` is resolved against a fresh
 * `order_index`-ordered id list — keeping it in lockstep with what the screen
 * renders. After every write we invalidate the snapshot query so the map,
 * weather strip and itinerary all refresh.
 */
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useTrip } from '../providers/TripProvider'

/** DB-level stop state (note the snapshot maps `'upcoming'` → `'up'`). */
export type StopDbState = 'done' | 'current' | 'upcoming'

/** The editable fields of a stop, as written to the `stops` table. */
export interface StopDraft {
  name: string
  dateLabel: string
  nights: number | null
  note: string
  state: StopDbState
  lat: number | null
  lng: number | null
  weatherIcon: string | null
  temp: string | null
  condition: string | null
}

const SNAPSHOT_KEY = ['trip', 'snapshot'] as const

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Could not save the itinerary change.'
}

export interface UseItinerary {
  addStop: (draft: StopDraft) => Promise<void>
  updateStop: (index: number, draft: StopDraft) => Promise<void>
  removeStop: (index: number) => Promise<void>
}

export function useItinerary(): UseItinerary {
  const queryClient = useQueryClient()
  const { currentTripId } = useTrip()

  const requireTrip = useCallback((): string => {
    if (!currentTripId) throw new Error('No active trip — open a trip first.')
    return currentTripId
  }, [currentTripId])

  // Re-fetch stop ids in the same order the snapshot renders (order_index asc),
  // so a screen array index resolves to the right DB row.
  const orderedStopIds = useCallback(async (tripId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('stops')
      .select('id')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: true })
    if (error) throw new Error(getErrorMessage(error))
    return (data ?? []).map((r) => r.id)
  }, [])

  const resolveStopId = useCallback(
    async (tripId: string, index: number): Promise<string> => {
      const ids = await orderedStopIds(tripId)
      const id = ids[index]
      if (!id) throw new Error('That destination no longer exists — refreshing.')
      return id
    },
    [orderedStopIds],
  )

  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: SNAPSHOT_KEY })
  }, [queryClient])

  const addStop = useCallback(
    async (draft: StopDraft): Promise<void> => {
      const tripId = requireTrip()

      // Next order_index = current max + 1 (0 when there are no stops yet).
      const { data: maxRow, error: maxErr } = await supabase
        .from('stops')
        .select('order_index')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (maxErr) throw new Error(getErrorMessage(maxErr))
      const nextIndex = maxRow ? maxRow.order_index + 1 : 0

      const { error } = await supabase.from('stops').insert({
        trip_id: tripId,
        name: draft.name,
        order_index: nextIndex,
        date_label: draft.dateLabel || null,
        nights: draft.nights,
        note: draft.note || null,
        state: draft.state,
        lat: draft.lat,
        lng: draft.lng,
        weather_icon: draft.weatherIcon,
        temp: draft.temp,
        condition: draft.condition,
      })
      if (error) throw new Error(getErrorMessage(error))
      await invalidate()
    },
    [requireTrip, invalidate],
  )

  const updateStop = useCallback(
    async (index: number, draft: StopDraft): Promise<void> => {
      const tripId = requireTrip()
      const id = await resolveStopId(tripId, index)

      const { error } = await supabase
        .from('stops')
        .update({
          name: draft.name,
          date_label: draft.dateLabel || null,
          nights: draft.nights,
          note: draft.note || null,
          state: draft.state,
          lat: draft.lat,
          lng: draft.lng,
          weather_icon: draft.weatherIcon,
          temp: draft.temp,
          condition: draft.condition,
        })
        .eq('id', id)
        .eq('trip_id', tripId)
      if (error) throw new Error(getErrorMessage(error))
      await invalidate()
    },
    [requireTrip, resolveStopId, invalidate],
  )

  const removeStop = useCallback(
    async (index: number): Promise<void> => {
      const tripId = requireTrip()
      const id = await resolveStopId(tripId, index)

      const { error } = await supabase.from('stops').delete().eq('id', id).eq('trip_id', tripId)
      if (error) throw new Error(getErrorMessage(error))
      await invalidate()
    },
    [requireTrip, resolveStopId, invalidate],
  )

  return { addStop, updateStop, removeStop }
}
