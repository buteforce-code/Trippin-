/** Client-side media helpers for uploads — no recompression of the original. */
import type { Device, QualityLabel } from '../data/types'

/** Best-effort device label from the uploading device's user agent. */
export function detectDevice(): Device {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod|Macintosh/i.test(ua) && /Mobile|iPhone|iPad/i.test(ua)) return 'iPhone'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iPhone'
  if (/Android/i.test(ua)) return 'Android'
  // Desktop fallback: treat Apple platforms as iPhone-family, else Android.
  return /Macintosh|Mac OS X/i.test(ua) ? 'iPhone' : 'Android'
}

/** "4K" when the longest edge is >= 3840px, else "HQ". */
export function classifyQuality(width: number, height: number): QualityLabel {
  return Math.max(width, height) >= 3840 ? '4K' : 'HQ'
}

export interface MediaDimensions {
  width: number
  height: number
  isVideo: boolean
}

export async function readDimensions(file: File): Promise<MediaDimensions> {
  const isVideo = file.type.startsWith('video/')
  const url = URL.createObjectURL(file)
  try {
    if (isVideo) {
      return await new Promise<MediaDimensions>((resolve, reject) => {
        const v = document.createElement('video')
        v.preload = 'metadata'
        v.onloadedmetadata = () => resolve({ width: v.videoWidth, height: v.videoHeight, isVideo: true })
        v.onerror = () => reject(new Error('Could not read video metadata'))
        v.src = url
      })
    }
    return await new Promise<MediaDimensions>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, isVideo: false })
      img.onerror = () => reject(new Error('Could not read image'))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

const THUMB_MAX = 600

/**
 * Generate a small JPEG thumbnail (the ORIGINAL is uploaded separately, untouched).
 * For video, captures the first frame. Returns null if generation isn't possible
 * (e.g. HEIC the browser can't decode) — the tile then falls back to its gradient.
 */
export async function generateThumbnail(file: File, dims: MediaDimensions): Promise<Blob | null> {
  const scale = Math.min(1, THUMB_MAX / Math.max(dims.width || THUMB_MAX, dims.height || THUMB_MAX))
  const w = Math.max(1, Math.round((dims.width || THUMB_MAX) * scale))
  const h = Math.max(1, Math.round((dims.height || THUMB_MAX) * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const url = URL.createObjectURL(file)

  try {
    if (dims.isVideo) {
      const frame = await captureVideoFrame(url)
      if (!frame) return null
      ctx.drawImage(frame, 0, 0, w, h)
    } else {
      const img = await loadImage(url)
      if (!img) return null
      ctx.drawImage(img, 0, 0, w, h)
    }
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8))
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function captureVideoFrame(url: string): Promise<HTMLVideoElement | null> {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.muted = true
    v.onloadeddata = () => {
      v.currentTime = Math.min(0.1, v.duration || 0.1)
    }
    v.onseeked = () => resolve(v)
    v.onerror = () => resolve(null)
    v.src = url
  })
}

export function fileExtension(file: File): string {
  const fromName = file.name.includes('.') ? file.name.split('.').pop() : ''
  return (fromName || file.type.split('/')[1] || 'bin').toLowerCase()
}

/** Display place from a stop filter key ("munnar" → "Munnar"), or "Trip". */
export function placeFromStopKey(stopKey: string | null): string {
  if (!stopKey) return 'Trip'
  return stopKey.charAt(0).toUpperCase() + stopKey.slice(1)
}
