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
  | 'posting' // uploading the captured frame
  | 'posted' // brief "Posted!" confirmation
  | 'denied' // permission refused — offer native fallback
  | 'unsupported' // getUserMedia missing — offer native fallback

const JPEG_QUALITY = 0.92
const POSTED_HOLD_MS = 1100

/**
 * Full-screen in-app camera ("Instants"). Fills the mobile frame, shows a live
 * back-camera preview, and posts a still straight into the shared gallery.
 *
 * Falls back to the OS camera via a hidden `<input capture>` when getUserMedia
 * is unavailable or the user denies permission, so phones still work. All
 * MediaStream tracks are stopped on unmount/close so the camera light never
 * leaks.
 */
export function CameraCapture({ onClose, stopKey }: CameraCaptureProps) {
  const uploadMedia = useUploadMedia()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fallbackInputRef = useRef<HTMLInputElement>(null)
  const [facing, setFacing] = useState<FacingMode>('environment')
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

  // (Re)acquire the stream whenever the facing mode changes while live.
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

  const handleClose = useCallback(() => {
    stopStream()
    onClose()
  }, [onClose, stopStream])

  const flipCamera = useCallback(() => {
    setStatus('starting')
    setFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [])

  /** Wrap a blob as a File and push it into the shared gallery bucket. */
  const postFile = useCallback(
    async (file: File) => {
      setStatus('posting')
      try {
        await uploadMedia.mutateAsync({ files: [file], stopKey })
        setStatus('posted')
      } catch {
        // Re-arm so the user can retry; the stream is still live.
        setStatus('live')
      }
    },
    [stopKey, uploadMedia],
  )

  // After a successful post, hold the confirmation briefly, then close.
  useEffect(() => {
    if (status !== 'posted') return
    const id = window.setTimeout(handleClose, POSTED_HOLD_MS)
    return () => window.clearTimeout(id)
  }, [status, handleClose])

  /** Draw the current video frame to a canvas and export a JPEG File. */
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
        void postFile(file)
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
  }, [facing, status, postFile])

  /** Native OS-camera fallback (denied / unsupported paths). */
  const onFallbackFile = (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (file) void postFile(file)
  }

  const isLive = status === 'live'
  const isPosting = status === 'posting'
  const showFallback = status === 'denied' || status === 'unsupported'
  const isFront = facing === 'user'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="In-app camera"
      style={{
        // Pin to the centered mobile frame column (max 430px) so the camera
        // fills the frame and stays put regardless of gallery scroll position.
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(100%, var(--frame-max))',
        zIndex: 60,
        background: '#0a1413',
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
        onChange={(e) => onFallbackFile(e.target.files)}
      />

      {/* Live preview (or solid backdrop while denied/unsupported). */}
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
          background: '#0a1413',
          opacity: showFallback ? 0 : 1,
        }}
      />

      {/* Top bar: brand label + close. */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'linear-gradient(rgba(0,0,0,.5),transparent)',
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
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(0,0,0,.42)',
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

      <div style={{ flex: 1 }} />

      {/* Denied / unsupported message + native fallback CTA. */}
      {showFallback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'relative',
            zIndex: 2,
            margin: '0 22px 8px',
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
            disabled={isPosting}
            className={`pressable ${focus.ring}`}
            style={{
              marginTop: 12,
              width: '100%',
              border: 'none',
              cursor: isPosting ? 'default' : 'pointer',
              background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
              borderRadius: 14,
              padding: '12px 16px',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: "'Baloo 2',sans-serif",
            }}
          >
            {isPosting ? 'Posting…' : 'Open phone camera'}
          </button>
        </div>
      )}

      {/* Bottom control bar: flip + shutter. */}
      {!showFallback && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 36,
            padding: '20px 22px 30px',
            background: 'linear-gradient(transparent,rgba(0,0,0,.55))',
          }}
        >
          {/* Spacer to keep the shutter centred opposite the flip button. */}
          <div style={{ width: 50, height: 50, flex: 'none' }} aria-hidden="true" />

          <button
            type="button"
            onClick={shoot}
            disabled={!isLive}
            aria-label="Take photo"
            className={`pressable ${focus.ringOnDark}`}
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              border: '5px solid rgba(255,255,255,.92)',
              cursor: isLive ? 'pointer' : 'default',
              background: 'transparent',
              padding: 4,
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: isPosting
                  ? 'var(--accent)'
                  : 'linear-gradient(135deg,#fff,#e9f3f1)',
                display: 'block',
                animation: isPosting ? 'kspin 1s linear infinite' : 'none',
              }}
            />
          </button>

          <button
            type="button"
            onClick={flipCamera}
            disabled={!isLive}
            aria-label="Flip camera"
            className={`pressable ${focus.ringOnDark}`}
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: 'none',
              cursor: isLive ? 'pointer' : 'default',
              background: 'rgba(0,0,0,.42)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flex: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7h12a4 4 0 0 1 4 4M3 7l3-3M3 7l3 3" />
              <path d="M21 17H9a4 4 0 0 1-4-4M21 17l-3 3M21 17l-3-3" />
            </svg>
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
