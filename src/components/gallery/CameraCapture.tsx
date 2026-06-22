import { useCallback, useEffect, useRef, useState } from 'react'
import { useUploadMedia } from '../../hooks/queries'
import focus from '../ui/focus.module.css'

interface CameraCaptureProps {
  /** Close the camera (parent unmounts this component). */
  onClose: () => void
  /** Active gallery stop filter — null tags the shot to the whole trip. */
  stopKey: string | null
}

type FacingMode = 'environment' | 'user'

/** Status drives the on-screen messaging + which UI we render. */
type Status =
  | 'starting' // requesting the live stream
  | 'live' // preview running, ready to shoot
  | 'review' // a frame was captured — preview it before posting
  | 'posting' // uploading the captured frame
  | 'posted' // brief "Posted!" confirmation
  | 'denied' // permission refused — offer native fallback
  | 'unsupported' // getUserMedia missing — offer native fallback

const JPEG_QUALITY = 0.92
const POSTED_HOLD_MS = 1100
/** Shutter sits above the home indicator; never let the safe-area collapse it fully. */
const SHUTTER_BOTTOM = 'calc(env(safe-area-inset-bottom, 0px) + 28px)'
const TOP_INSET = 'calc(env(safe-area-inset-top, 0px) + 14px)'

/** A captured still plus its object URL, kept together so we can revoke cleanly. */
interface Shot {
  file: File
  url: string
}

/**
 * Full-screen in-app camera ("Instants"). Renders as a fixed overlay above the
 * bottom nav, shows a live preview filling the screen, and posts a still
 * straight into the shared gallery — with a Retake / Post review step in between
 * so nothing is uploaded by accident.
 *
 * Falls back to the OS camera via a hidden `<input capture>` when getUserMedia
 * is unavailable or the user denies permission, so phones still work. All
 * MediaStream tracks are stopped on unmount/close so the camera light never
 * leaks, and the captured object URL is revoked to avoid leaking blob memory.
 */
export function CameraCapture({ onClose, stopKey }: CameraCaptureProps) {
  const uploadMedia = useUploadMedia()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fallbackInputRef = useRef<HTMLInputElement>(null)
  const [facing, setFacing] = useState<FacingMode>('environment')
  const [shot, setShot] = useState<Shot | null>(null)
  const supportsGetUserMedia =
    typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
  const [status, setStatus] = useState<Status>(supportsGetUserMedia ? 'starting' : 'unsupported')

  /** Stop every track so the OS camera indicator turns off immediately. */
  const stopStream = useCallback(() => {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  // (Re)acquire the stream whenever the facing mode changes while live. We skip
  // re-acquiring while reviewing/posting so flipping is a no-op there.
  useEffect(() => {
    // `status` already initialises to 'unsupported' when getUserMedia is absent.
    if (!supportsGetUserMedia) return

    let cancelled = false

    const start = async () => {
      stopStream()
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          // iOS Safari needs an explicit play() after assigning srcObject.
          await video.play().catch(() => {})
        }
        setStatus('live')
      } catch {
        if (!cancelled) setStatus('denied')
      }
    }

    void start()

    return () => {
      cancelled = true
    }
  }, [facing, supportsGetUserMedia, stopStream])

  // Hard stop on unmount — covers close, navigation, and tab teardown.
  useEffect(() => stopStream, [stopStream])

  // Revoke the captured object URL when it changes or on unmount.
  useEffect(() => {
    if (!shot) return
    return () => URL.revokeObjectURL(shot.url)
  }, [shot])

  const handleClose = useCallback(() => {
    stopStream()
    onClose()
  }, [onClose, stopStream])

  const flipCamera = useCallback(() => {
    setStatus('starting')
    setFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [])

  /** Draw the current video frame to a canvas, hold it for review. */
  const shoot = useCallback(() => {
    const video = videoRef.current
    if (!video || status !== 'live') return
    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Mirror front-camera frames so the saved photo matches the preview.
    if (facing === 'user') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, width, height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `instant-${Date.now()}.jpg`, { type: 'image/jpeg' })
        setShot({ file, url: URL.createObjectURL(file) })
        setStatus('review')
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
  }, [facing, status])

  /** Discard the captured frame and return to the live preview. */
  const retake = useCallback(() => {
    setShot(null)
    setStatus('live')
  }, [])

  /** Push the reviewed shot into the shared gallery bucket, then close. */
  const post = useCallback(async () => {
    if (!shot) return
    setStatus('posting')
    try {
      await uploadMedia.mutateAsync({ files: [shot.file], stopKey })
      setStatus('posted')
    } catch {
      // Re-arm review so the user can retry or retake.
      setStatus('review')
    }
  }, [shot, stopKey, uploadMedia])

  // After a successful post, hold the confirmation briefly, then close.
  useEffect(() => {
    if (status !== 'posted') return
    const id = window.setTimeout(handleClose, POSTED_HOLD_MS)
    return () => window.clearTimeout(id)
  }, [status, handleClose])

  /** Native OS-camera fallback (denied / unsupported paths). */
  const onFallbackFile = useCallback(
    async (fileList: FileList | null) => {
      const file = fileList?.[0]
      if (!file) return
      setStatus('posting')
      try {
        await uploadMedia.mutateAsync({ files: [file], stopKey })
        setStatus('posted')
      } catch {
        setStatus('denied')
      }
    },
    [stopKey, uploadMedia],
  )

  const isLive = status === 'live'
  const isReview = status === 'review'
  const isPosting = status === 'posting'
  const isStarting = status === 'starting'
  const showFallback = status === 'denied' || status === 'unsupported'
  const isFront = facing === 'user'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="In-app camera"
      style={{
        // Full-screen overlay above the bottom nav. Pinned to the centered
        // mobile-frame column so it fills the 430px frame and ignores gallery scroll.
        position: 'fixed',
        inset: 0,
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        width: 'min(100%, var(--frame-max))',
        zIndex: 1000,
        background: '#000',
        animation: 'kfade .2s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Hidden OS-camera fallback — opens the phone's native camera. */}
      <input
        ref={fallbackInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => void onFallbackFile(e.target.files)}
      />

      {/* Live preview — kept mounted so the stream survives review/posting. */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          // Mirror the front-camera preview like a selfie cam.
          transform: isFront ? 'scaleX(-1)' : 'none',
          background: '#000',
          // Hidden under the review still and the fallback backdrop.
          opacity: showFallback || isReview ? 0 : 1,
        }}
      />

      {/* Captured still under review (sits over the paused video). */}
      {shot && (isReview || isPosting || status === 'posted') && (
        <img
          src={shot.url}
          alt="Captured photo preview"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: '#000',
          }}
        />
      )}

      {/* Top bar: brand label + close. Respects the safe-area top inset. */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: TOP_INSET,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 14,
          background: 'linear-gradient(rgba(0,0,0,.55),transparent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden="true" style={{ fontSize: 18 }}>📸</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: "'Baloo 2',sans-serif" }}>
            Instants
          </span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close camera"
          className={`pressable ${focus.ringOnDark}`}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(0,0,0,.45)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            backdropFilter: 'blur(4px)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Starting overlay — keeps the screen from looking frozen while the
          camera permission prompt resolves and the stream warms up. */}
      {isStarting && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            color: '#fff',
            pointerEvents: 'none',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,.3)',
              borderTopColor: '#fff',
              display: 'inline-block',
              animation: 'kspin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: 13.5, fontWeight: 700, fontFamily: "'Baloo 2',sans-serif", opacity: 0.92 }}>
            Starting camera…
          </span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Denied / unsupported message + native fallback CTA. */}
      {showFallback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'relative',
            zIndex: 2,
            margin: '0 22px',
            marginBottom: SHUTTER_BOTTOM,
            padding: '16px 18px',
            borderRadius: 18,
            background: 'rgba(255,255,255,.96)',
            textAlign: 'center',
            boxShadow: '0 12px 26px rgba(0,0,0,.35)',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)' }}>
            {status === 'denied' ? 'Camera access blocked' : 'Live camera not available'}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', opacity: 0.7, marginTop: 4 }}>
            No worries — tap below to use your phone&apos;s camera instead.
          </div>
          <button
            type="button"
            onClick={() => fallbackInputRef.current?.click()}
            className={`pressable ${focus.ring}`}
            style={{
              marginTop: 12,
              width: '100%',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
              borderRadius: 14,
              padding: '12px 16px',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "'Baloo 2',sans-serif",
            }}
          >
            Open phone camera
          </button>
        </div>
      )}

      {/* LIVE controls: a balanced three-zone bar (spacer · shutter · flip)
          so the big shutter stays optically centred. Generous hit targets,
          lifted clear of the home indicator via the safe-area inset. */}
      {isLive && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 26,
            paddingBottom: SHUTTER_BOTTOM,
            background: 'linear-gradient(transparent,rgba(0,0,0,.6))',
          }}
        >
          {/* Left zone — empty, balances the flip button on the right. */}
          <div aria-hidden="true" />

          {/* Centre — large shutter. */}
          <button
            type="button"
            onClick={shoot}
            aria-label="Take photo"
            className={`pressable ${focus.ringOnDark}`}
            style={{
              justifySelf: 'center',
              width: 82,
              height: 82,
              borderRadius: '50%',
              // White outer ring with a clear gap to the inner shutter disc.
              border: '4px solid rgba(255,255,255,.95)',
              cursor: 'pointer',
              background: 'transparent',
              padding: 6,
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(0,0,0,.4)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#fff,#e9f3f1)',
                display: 'block',
              }}
            />
          </button>

          {/* Right zone — flip camera, right-aligned and thumb-reachable. */}
          <button
            type="button"
            onClick={flipCamera}
            aria-label="Flip camera"
            className={`pressable ${focus.ringOnDark}`}
            style={{
              justifySelf: 'end',
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: 'rgba(255,255,255,.16)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flex: 'none',
              backdropFilter: 'blur(6px)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7h12a4 4 0 0 1 4 4M3 7l3-3M3 7l3 3" />
              <path d="M21 17H9a4 4 0 0 1-4-4M21 17l-3 3M21 17l-3-3" />
            </svg>
          </button>
        </div>
      )}

      {/* REVIEW controls: Retake + Post, shown over the captured still. */}
      {(isReview || isPosting) && shot && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingLeft: 22,
            paddingRight: 22,
            paddingTop: 22,
            paddingBottom: SHUTTER_BOTTOM,
            background: 'linear-gradient(transparent,rgba(0,0,0,.6))',
          }}
        >
          <button
            type="button"
            onClick={retake}
            disabled={isPosting}
            aria-label="Retake photo"
            className={`pressable ${focus.ringOnDark}`}
            style={{
              flex: 1,
              border: '2px solid rgba(255,255,255,.85)',
              cursor: isPosting ? 'default' : 'pointer',
              background: 'rgba(0,0,0,.35)',
              borderRadius: 16,
              padding: '14px 16px',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "'Baloo 2',sans-serif",
              backdropFilter: 'blur(4px)',
              opacity: isPosting ? 0.55 : 1,
            }}
          >
            Retake
          </button>
          <button
            type="button"
            onClick={() => void post()}
            disabled={isPosting}
            aria-label="Post photo to the gallery"
            className={`pressable ${focus.ring}`}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 'none',
              cursor: isPosting ? 'default' : 'pointer',
              background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
              borderRadius: 16,
              padding: '14px 16px',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "'Baloo 2',sans-serif",
              boxShadow: '0 10px 22px var(--shadow)',
            }}
          >
            {isPosting && (
              <span
                aria-hidden="true"
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,.45)',
                  borderTopColor: '#fff',
                  display: 'inline-block',
                  animation: 'kspin 1s linear infinite',
                }}
              />
            )}
            {isPosting ? 'Posting…' : 'Post'}
          </button>
        </div>
      )}

      {/* "Posted!" confirmation toast. */}
      {status === 'posted' && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            pointerEvents: 'none',
            animation: 'kfade .2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '13px 20px',
              borderRadius: 999,
              background: 'rgba(255,255,255,.96)',
              boxShadow: '0 14px 30px rgba(0,0,0,.4)',
              animation: 'kfloat 3s ease-in-out infinite',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)' }}>
              Posted!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
