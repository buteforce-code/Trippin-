import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Stop, MemberDetail } from '../../data/types'
import type { LivePosition } from '../../hooks/useLiveLocation'

interface LiveTripMapProps {
  stops: Stop[]
  members: MemberDetail[]
  positions: LivePosition[]
  youUserId: string | null
}

// Kerala-ish default view until we have real points to fit.
const DEFAULT_CENTER: L.LatLngTuple = [10.0, 76.4]
const DEFAULT_ZOOM = 8
const TWEEN_MS = 1000

/** Smoothly glide a marker from its current spot to a new one over ~1s. */
function tween(marker: L.Marker, to: L.LatLngTuple, frames: Map<string, number>, key: string) {
  const from = marker.getLatLng()
  const existing = frames.get(key)
  if (existing) cancelAnimationFrame(existing)
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / TWEEN_MS)
    marker.setLatLng([from.lat + (to[0] - from.lat) * t, from.lng + (to[1] - from.lng) * t])
    if (t < 1) frames.set(key, requestAnimationFrame(step))
    else frames.delete(key)
  }
  frames.set(key, requestAnimationFrame(step))
}

function memberIcon(initials: string, color: string, isYou: boolean): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};color:#fff;
      display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;
      font-family:'Baloo 2',sans-serif;border:3px solid ${isYou ? '#fff' : 'rgba(255,255,255,.85)'};
      box-shadow:0 3px 10px rgba(0,0,0,.35)${isYou ? ',0 0 0 3px var(--accent)' : ''};">${initials}</div>`,
  })
}

function stopIcon(label: string, isCurrent: boolean): L.DivIcon {
  const bg = isCurrent ? 'var(--accent)' : 'var(--primary-d)'
  return L.divIcon({
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div title="${label}" style="width:14px;height:14px;border-radius:50%;background:${bg};
      border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>`,
  })
}

export function LiveTripMap({ stops, members, positions, youUserId }: LiveTripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const stopLayerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const framesRef = useRef<Map<string, number>>(new Map())
  const fittedCountRef = useRef(-1)

  // Init the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    stopLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Draw the route stops (pins + connecting line) when they change.
  useEffect(() => {
    const layer = stopLayerRef.current
    if (!layer) return
    layer.clearLayers()
    const coords: L.LatLngTuple[] = []
    for (const s of stops) {
      if (s.lat == null || s.lng == null) continue
      const pt: L.LatLngTuple = [s.lat, s.lng]
      coords.push(pt)
      L.marker(pt, { icon: stopIcon(s.name, s.state === 'current') })
        .bindTooltip(s.name, { direction: 'top', offset: [0, -8] })
        .addTo(layer)
    }
    if (coords.length > 1) {
      L.polyline(coords, { color: 'var(--primary)', weight: 3, opacity: 0.7, dashArray: '6 6' }).addTo(layer)
    }
    fittedCountRef.current = -1 // re-fit now that stops changed
  }, [stops])

  // Update member markers (with a glide animation) whenever positions change.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const memberByUser = new Map(members.map((m) => [m.userId, m]))
    const seen = new Set<string>()

    for (const p of positions) {
      seen.add(p.userId)
      const m = memberByUser.get(p.userId)
      const initials = m?.initials ?? '•'
      const color = m?.color ?? '#12C2C2'
      const isYou = p.userId === youUserId
      const existing = markersRef.current.get(p.userId)
      if (existing) {
        existing.setIcon(memberIcon(initials, color, isYou))
        tween(existing, [p.lat, p.lng], framesRef.current, p.userId)
      } else {
        const marker = L.marker([p.lat, p.lng], { icon: memberIcon(initials, color, isYou) })
          .bindTooltip(m?.name ?? 'Traveller', { direction: 'top', offset: [0, -14] })
          .addTo(map)
        markersRef.current.set(p.userId, marker)
      }
    }

    // Drop markers for anyone who stopped sharing.
    for (const [uid, marker] of markersRef.current) {
      if (!seen.has(uid)) {
        map.removeLayer(marker)
        markersRef.current.delete(uid)
      }
    }

    // Fit bounds to stops + members, but only when the point set changes (so we
    // don't fight the user panning, and don't re-fit on every glide).
    const pointCount = seen.size + stops.filter((s) => s.lat != null && s.lng != null).length
    if (pointCount > 0 && pointCount !== fittedCountRef.current) {
      const pts: L.LatLngTuple[] = [
        ...positions.map((p) => [p.lat, p.lng] as L.LatLngTuple),
        ...stops.filter((s) => s.lat != null && s.lng != null).map((s) => [s.lat as number, s.lng as number] as L.LatLngTuple),
      ]
      if (pts.length === 1) map.setView(pts[0], 14)
      else map.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: 15 })
      fittedCountRef.current = pointCount
    }
  }, [positions, members, stops, youUserId])

  return (
    <div
      ref={containerRef}
      style={{ height: 240, width: '100%', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 16px rgba(11,77,74,.12)' }}
    />
  )
}
