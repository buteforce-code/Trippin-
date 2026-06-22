import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'
import { useTrip } from '../providers/TripProvider'
import { APP_NAME } from '../lib/brand'

/**
 * First-run gate for trip-scoped routes. Runs after auth (AuthGate). Decides
 * where a signed-in user should land:
 *
 *  - no trips yet            → /create-trip (with a "have an invite?" link there)
 *  - current trip not onboarded (no nickname) → /onboarding
 *  - otherwise               → render the app
 *
 * In mock mode (no Supabase) the seeded trip is always present and onboarded,
 * so this is effectively a pass-through for local UI work.
 */
export function TripGate({ children }: { children: ReactNode }) {
  const { trips, currentTrip, isLoadingTrips } = useTrip()

  // Mock mode: never block local development on onboarding/empty states.
  if (!isSupabaseConfigured) return <>{children}</>

  if (isLoadingTrips) {
    return (
      <div className="app-bg" data-theme="lagoon" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--primary-d)' }}>{APP_NAME} 🌴</div>
      </div>
    )
  }

  if (trips.length === 0) return <Navigate to="/create-trip" replace />

  // currentTrip can momentarily be null while TripProvider settles the default.
  if (currentTrip && !currentTrip.myOnboardingComplete) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}
