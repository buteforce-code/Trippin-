import { lazy, Suspense } from 'react'
import type { Stop } from '../../data/types'
import { StylizedRouteMap } from './StylizedRouteMap'

// Heavy Google Maps SDK is split into its own chunk, loaded only when a key is set.
const GoogleRouteMap = lazy(() =>
  import('./GoogleRouteMap').then((m) => ({ default: m.GoogleRouteMap })),
)

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

interface RouteMapProps {
  stops: Stop[]
}

/**
 * Renders the real Google map with custom stop pins when a Maps key is set,
 * otherwise the on-brand stylized illustrated route (also used as the load
 * fallback so the section never flashes empty).
 */
export function RouteMap({ stops }: RouteMapProps) {
  if (!MAPS_KEY) return <StylizedRouteMap />
  return (
    <Suspense fallback={<StylizedRouteMap />}>
      <GoogleRouteMap apiKey={MAPS_KEY} stops={stops} />
    </Suspense>
  )
}
