import { useState } from 'react'
import type { MediaItem } from '../../data/types'
import { useThumbUrl } from '../../hooks/queries'
import { useDeleteMedia } from '../../hooks/useDeleteMedia'
import { useTrip } from '../../providers/TripProvider'
import { tripRepository } from '../../data'
import { MediaViewer } from './MediaViewer'
import focus from '../ui/focus.module.css'

interface MediaTileProps {
  item: MediaItem
}

const OVERLAY = 'radial-gradient(120% 80% at 70% 10%, rgba(255,255,255,.35), transparent 60%)'

export function MediaTile({ item }: MediaTileProps) {
  const { isRouteHead } = useTrip()
  const deleteMedia = useDeleteMedia()
  const deviceBg = item.device === 'iPhone' ? 'rgba(20,20,30,.55)' : 'rgba(60,150,90,.7)'
  const { data: thumbUrl } = useThumbUrl(item)
  // A stored thumb whose signed URL fails to load (expired/blocked) falls back
  // to the gradient instead of rendering a broken image. Reset when the URL changes.
  const [imgFailed, setImgFailed] = useState(false)
  // Reset the failure flag when the signed URL changes — render-time (not in an
  // effect), which is React's recommended way to adjust state on prop change.
  const [seenUrl, setSeenUrl] = useState(thumbUrl)
  if (thumbUrl !== seenUrl) {
    setSeenUrl(thumbUrl)
    setImgFailed(false)
  }

  // Two-step delete: the trash button opens an inline confirm so a single tap
  // never destroys a shared photo.
  const [confirming, setConfirming] = useState(false)
  const isDeleting = deleteMedia.isPending

  // Tap the tile to play/view inline (not while a delete confirm is showing).
  const [viewerOpen, setViewerOpen] = useState(false)
  const openViewer = () => {
    if (!confirming && !isDeleting) setViewerOpen(true)
  }

  const showThumb = Boolean(thumbUrl) && !imgFailed
  // Tile byline: who added the photo (falls back to its place/"Trip" for old rows).
  const byline = item.uploaderName ?? item.place

  const handleDownload = async () => {
    const url = await tripRepository.getOriginalUrl(item)
    if (url) window.open(url, '_blank', 'noopener')
  }

  const handleDelete = () => {
    deleteMedia.mutate(item, {
      // Tile unmounts on success via snapshot refresh; on failure re-arm the
      // confirm so the Route Head can retry.
      onSettled: () => setConfirming(false),
    })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openViewer}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openViewer()
        }
      }}
      aria-label={`Open ${byline}'s ${item.isVideo ? 'video' : 'photo'}`}
      style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: item.ratio, background: `linear-gradient(150deg, ${item.c1}, ${item.c2})`, boxShadow: '0 6px 16px rgba(11,77,74,.1)', cursor: 'pointer' }}
    >
      {showThumb ? (
        <img
          src={thumbUrl as string}
          alt={item.place}
          loading="lazy"
          onError={() => setImgFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: OVERLAY }} aria-hidden="true" />
      )}

      <div style={{ position: 'absolute', top: 9, left: 9, display: 'flex', gap: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 10, background: 'rgba(0,0,0,.42)', color: '#fff', backdropFilter: 'blur(4px)' }}>{item.quality}</span>
        <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 10, background: deviceBg, color: '#fff' }}>{item.device}</span>
      </div>

      {/* Route-Head-only delete control (every tile). */}
      {isRouteHead && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setConfirming(true)
          }}
          aria-label={`Delete photo from ${item.place}`}
          className={`pressable ${focus.ringOnDark}`}
          style={{ position: 'absolute', top: 9, right: 9, width: 27, height: 27, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, backdropFilter: 'blur(4px)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
          </svg>
        </button>
      )}

      {item.isVideo && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.2)', animation: 'kfloat 3.5s ease-in-out infinite' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--ink)" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 11px 9px', background: 'linear-gradient(transparent,rgba(0,0,0,.5))', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#fff', fontFamily: "'Baloo 2',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {byline}
          </span>
          {item.locationTag && (
            <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }} aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              {item.locationTag}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            void handleDownload()
          }}
          aria-label={`Download original from ${item.place}`}
          className={focus.ringOnDark}
          style={{ width: 27, height: 27, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flex: 'none' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 4v12M7 11l5 5 5-5" />
            <path d="M5 20h14" />
          </svg>
        </button>
      </div>

      {/* Inline confirm sheet — covers the tile while deciding / deleting. */}
      {(confirming || isDeleting) && (
        <div
          role="alertdialog"
          aria-label={`Delete photo from ${item.place}?`}
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'absolute', inset: 0, zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 12, background: 'rgba(8,18,17,.78)', backdropFilter: 'blur(3px)', animation: 'kfade .15s ease' }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 800, color: '#fff', fontFamily: "'Baloo 2',sans-serif", textAlign: 'center', lineHeight: 1.25 }}>
            {isDeleting ? 'Deleting…' : 'Delete this photo?'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isDeleting}
              className={`pressable ${focus.ringOnDark}`}
              style={{ border: '2px solid rgba(255,255,255,.7)', cursor: isDeleting ? 'default' : 'pointer', background: 'transparent', borderRadius: 12, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", opacity: isDeleting ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`pressable ${focus.ringOnDark}`}
              style={{ border: 'none', cursor: isDeleting ? 'default' : 'pointer', background: '#d14328', borderRadius: 12, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {viewerOpen && <MediaViewer item={item} poster={thumbUrl} onClose={() => setViewerOpen(false)} />}
    </div>
  )
}
