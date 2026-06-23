/**
 * Resolves a human place name ("Kochi", "Munnar", …) for a media file so the
 * gallery can tag and auto-filter by location.
 *
 * Order of preference:
 *   1. The photo's own EXIF GPS (true capture location) — works for real photos.
 *   2. The device's current location — covers in-app Instants (canvas frames
 *      carry no EXIF) and EXIF-stripped images.
 * Reverse geocoding uses BigDataCloud's free, key-less, CORS-enabled endpoint.
 * Everything is best-effort: any failure returns null and the caller falls back.
 */
import exifr from 'exifr'

interface Coords {
  lat: number
  lng: number
}

// Ask the device for its position at most once per session (shared promise).
let devicePositionPromise: Promise<Coords | null> | null = null
// Cache reverse-geocode lookups by coarse coordinate so repeated uploads near
// the same spot don't re-hit the network.
const placeCache = new Map<string, string | null>()

async function exifCoords(file: File): Promise<Coords | null> {
  if (!file.type.startsWith('image/')) return null
  try {
    const gps = await exifr.gps(file)
    if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
      return { lat: gps.latitude, lng: gps.longitude }
    }
  } catch {
    // unreadable / no EXIF — fall through
  }
  return null
}

function deviceCoords(): Promise<Coords | null> {
  if (devicePositionPromise) return devicePositionPromise
  devicePositionPromise = new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  })
  return devicePositionPromise
}

async function reverseGeocode({ lat, lng }: Coords): Promise<string | null> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`
  const cached = placeCache.get(key)
  if (cached !== undefined) return cached
  try {
    const resp = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    )
    if (!resp.ok) throw new Error(String(resp.status))
    const data = await resp.json()
    const name: string | null =
      data.city || data.locality || data.principalSubdivision || data.countryName || null
    placeCache.set(key, name)
    return name
  } catch {
    placeCache.set(key, null)
    return null
  }
}

/** Best-effort place name for a file, or null if location can't be determined. */
export async function resolveLocationTag(file: File): Promise<string | null> {
  const coords = (await exifCoords(file)) ?? (await deviceCoords())
  if (!coords) return null
  return reverseGeocode(coords)
}
