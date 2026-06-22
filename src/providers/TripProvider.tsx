import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tripRepository } from '../data'
import type { MemberRole, TripListItem } from '../data/types'
import { MY_TRIPS_KEY } from './tripKeys'

interface TripContextValue {
  /** Trips the signed-in user is a member of (empty until loaded / when none). */
  trips: TripListItem[]
  /** The active trip id, or null when the user belongs to no trips yet. */
  currentTripId: string | null
  /** The active trip (resolved from `trips`), or null. */
  currentTrip: TripListItem | null
  /** Switch the active trip; persisted to localStorage. */
  setCurrentTripId: (id: string) => void
  /** The signed-in user's role for the current trip (null until resolved). */
  myRole: MemberRole | null
  /** route_head or assistant — may edit money / itinerary / announcements. */
  canEditMoney: boolean
  /** route_head — manages members, roles, invites, trip settings. */
  isRouteHead: boolean
  isLoadingTrips: boolean
  /** Re-run the trips query (after create/join). */
  refetchTrips: () => void
}

const TripContext = createContext<TripContextValue | null>(null)
const STORAGE_KEY = 'trippin.currentTripId'

function readStoredTripId(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function TripProvider({ children }: { children: ReactNode }) {
  // User's explicit selection (null = "follow the default"). Derivation below
  // resolves the effective trip so we never need setState inside an effect.
  const [selectedTripId, setSelectedTripId] = useState<string | null>(readStoredTripId)

  const tripsQuery = useQuery<TripListItem[]>({
    queryKey: MY_TRIPS_KEY,
    queryFn: () => tripRepository.listMyTrips(),
  })

  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data])

  // Effective current trip: the user's selection if still valid, else the first
  // trip. Pure derivation — no effect-driven setState.
  const currentTripId = useMemo<string | null>(() => {
    if (selectedTripId && trips.some((t) => t.id === selectedTripId)) return selectedTripId
    return trips[0]?.id ?? null
  }, [selectedTripId, trips])

  // Persist the resolved id so it survives reloads.
  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    if (currentTripId) localStorage.setItem(STORAGE_KEY, currentTripId)
  }, [currentTripId])

  const currentTrip = useMemo(
    () => trips.find((t) => t.id === currentTripId) ?? null,
    [trips, currentTripId],
  )

  const myRole = currentTrip?.myRole ?? null

  const value = useMemo<TripContextValue>(
    () => ({
      trips,
      currentTripId,
      currentTrip,
      setCurrentTripId: setSelectedTripId,
      myRole,
      canEditMoney: myRole === 'route_head' || myRole === 'assistant',
      isRouteHead: myRole === 'route_head',
      isLoadingTrips: tripsQuery.isLoading,
      refetchTrips: () => { void tripsQuery.refetch() },
    }),
    [trips, currentTripId, currentTrip, myRole, tripsQuery],
  )

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used within TripProvider')
  return ctx
}
