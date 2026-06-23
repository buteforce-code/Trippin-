import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MediaItem, MediaViewSource } from '../../data/types'
import { tripRepository } from '../../data'
import focus from '../ui/focus.module.css'

interface MediaViewerProps {
  item: MediaItem
  /** Thumbnail URL used as the video poster so it's clearly a playable video. */
  poster?: string | null
  onClose: () => void
}

/**
 * Full-screen inline viewer. Plays/shows the original where it lives — no
 * download. Supabase images/videos use a signed URL; large Drive videos embed
 * Drive's streaming player (iframe), Drive images use the lh3 content host.
 * Portaled to <body> so it sits above the app shell + bottom nav.
 */
export function MediaViewer({ item, poster, onClose }: MediaViewerProps) {
  const [src, setSrc] = useState<MediaViewSource | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    let alive = true
    // status starts as 'loading'; the viewer mounts fresh per item.
    tripRepository
      .getViewSource(item)
      .then((s) => {
        if (!alive) return
        if (s) {
          setSrc(s)
          setStatus('ready')
        } else {
          setStatus('error')
        }
      })
      .catch(() => {
        if (alive) setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [item])

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        width: 'min(100%, var(--frame-max))',
        zIndex: 1100,
        background: 'rgba(0,0,0,.94)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '54px 10px',
        animation: 'kfade .2s ease',
      }}
    >
      {/* Close */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Close viewer"
        className={`pressable ${focus.ringOnDark}`}
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          right: 14,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'rgba(255,255,255,.16)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          backdropFilter: 'blur(6px)',
          zIndex: 2,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      {status === 'loading' && (
        <span
          aria-label="Loading"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,.3)',
            borderTopColor: '#fff',
            display: 'inline-block',
            animation: 'kspin 1s linear infinite',
          }}
        />
      )}

      {status === 'error' && (
        <div style={{ color: '#fff', textAlign: 'center', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, padding: 24 }}>
          Couldn&apos;t load this media. Try again in a moment.
        </div>
      )}

      {status === 'ready' && src && (
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {src.kind === 'image' && (
            <img src={src.url} alt={item.uploaderName ?? 'Photo'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10 }} />
          )}
          {src.kind === 'video' && !videoFailed && (
            <video
              src={src.url}
              poster={poster ?? undefined}
              controls
              playsInline
              preload="metadata"
              onError={() => setVideoFailed(true)}
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', borderRadius: 10, background: '#000' }}
            />
          )}
          {src.kind === 'video' && videoFailed && (
            <div style={{ color: '#fff', textAlign: 'center', fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, padding: 24 }}>
              <div>This video couldn&apos;t play here.</div>
              <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 12, color: '#fff', background: 'var(--primary)', borderRadius: 12, padding: '10px 16px', fontSize: 13, textDecoration: 'none' }}>
                Open video
              </a>
            </div>
          )}
          {src.kind === 'iframe' && (
            <iframe
              src={src.url}
              title="Video"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 10, background: '#000' }}
            />
          )}
        </div>
      )}
    </div>,
    document.body,
  )
}
