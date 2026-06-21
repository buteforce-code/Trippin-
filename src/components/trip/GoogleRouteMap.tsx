/// <reference types="google.maps" />
import { useEffect } from 'react'
import { AdvancedMarker, APIProvider, Map, useMap } from '@vis.gl/react-google-maps'
import type { Stop } from '../../data/types'

type PlacedStop = Stop & { lat: number; lng: number }

interface GoogleRouteMapProps {
  apiKey: string
  stops: Stop[]
}

// A cloud-configured Map ID enables vector maps + AdvancedMarkers; DEMO_MAP_ID
// works out of the box for development. Override with VITE_GOOGLE_MAPS_MAP_ID.
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

function placed(stops: Stop[]): PlacedStop[] {
  return stops.filter((s): s is PlacedStop => s.lat != null && s.lng != null)
}

export function GoogleRouteMap({ apiKey, stops }: GoogleRouteMapProps) {
  const points = placed(stops)
  const center = points.length
    ? { lat: points[Math.floor(points.length / 2)].lat, lng: points[Math.floor(points.length / 2)].lng }
    : { lat: 9.4, lng: 76.7 }

  return (
    <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 14px 32px rgba(11,77,74,.14)' }}>
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={MAP_ID}
          defaultCenter={center}
          defaultZoom={8}
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: '100%', height: 300 }}
        >
          <FitAndRoute points={points} />
          {points.map((s, i) => (
            <AdvancedMarker key={i} position={{ lat: s.lat, lng: s.lng }} title={s.name}>
              <StopPin stop={s} />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  )
}

/** Fits all stops in view and draws a dashed route connecting them in order. */
function FitAndRoute({ points }: { points: PlacedStop[] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || points.length === 0) return
    const bounds = new google.maps.LatLngBounds()
    points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
    map.fitBounds(bounds, 56)

    const route = new google.maps.Polyline({
      path: points.map((p) => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeOpacity: 0,
      icons: [
        {
          icon: { path: 'M 0,-1 0,1', strokeColor: '#0B3D3A', strokeOpacity: 0.75, scale: 3 },
          offset: '0',
          repeat: '14px',
        },
      ],
      map,
    })
    return () => route.setMap(null)
  }, [map, points])

  return null
}

function StopPin({ stop }: { stop: PlacedStop }) {
  const isNow = stop.state === 'current'
  const dotColor = stop.state === 'done' ? '#2BB673' : isNow ? 'var(--accent, #FF7A66)' : '#8aa6a2'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-4px)' }}>
      <div
        style={{
          background: isNow ? 'var(--accent, #FF7A66)' : '#fff',
          color: isNow ? '#fff' : '#0B3D3A',
          fontFamily: "'Baloo 2',sans-serif",
          fontWeight: 800,
          fontSize: 11,
          padding: '3px 9px',
          borderRadius: 9,
          boxShadow: '0 3px 10px rgba(0,0,0,.25)',
          whiteSpace: 'nowrap',
        }}
      >
        {stop.name}
        {isNow ? ' · now' : ''}
      </div>
      <div
        style={{
          width: isNow ? 16 : 12,
          height: isNow ? 16 : 12,
          borderRadius: '50%',
          background: dotColor,
          border: '3px solid #fff',
          boxShadow: '0 2px 6px rgba(0,0,0,.3)',
          marginTop: 3,
        }}
      />
    </div>
  )
}
