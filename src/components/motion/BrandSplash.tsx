import { APP_NAME } from '../../lib/brand'

/**
 * Branded loading splash shown while auth resolves. A rising sun with rotating
 * rays, drifting clouds, a gentle wave band, and the "Trippin'" wordmark with a
 * soft fade/rise entrance. Pure CSS keyframes (ksunrise/kspin/kglow/kdrift/
 * kdrift2/kwave/kwordmark) so reduced-motion neutralizes it automatically.
 */
export function BrandSplash() {
  return (
    <div
      className="app-bg"
      data-theme="lagoon"
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        role="status"
        aria-label={`Loading ${APP_NAME}`}
        style={{
          position: 'relative',
          width: 'min(100%, var(--frame-max))',
          minHeight: '100dvh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 26,
          color: 'var(--ink)',
        }}
      >
        {/* Drifting clouds (ambient, behind the sun). */}
        <Cloud style={{ top: '16%', left: '8%', width: 88, animation: 'kdrift 9s ease-in-out infinite' }} />
        <Cloud style={{ top: '26%', right: '10%', width: 62, opacity: 0.85, animation: 'kdrift2 11s ease-in-out infinite' }} />

        {/* Rising sun with rotating rays + breathing glow. */}
        <div
          style={{
            position: 'relative',
            width: 132,
            height: 132,
            animation: 'ksunrise 900ms cubic-bezier(.16,1,.3,1) both',
          }}
        >
          {/* Soft glow halo. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -28,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--sun), transparent 66%)',
              animation: 'kglow 3.4s ease-in-out infinite',
            }}
          />
          {/* Rotating rays. */}
          <svg
            width="132"
            height="132"
            viewBox="0 0 132 132"
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, animation: 'kspin 16s linear infinite' }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={i}
                x="64"
                y="6"
                width="4"
                height="16"
                rx="2"
                fill="var(--sun)"
                transform={`rotate(${i * 30} 66 66)`}
              />
            ))}
          </svg>
          {/* Sun disc. */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 26,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 34%, #fff0b8, var(--sun))',
              boxShadow: '0 8px 22px rgba(255,206,58,.45)',
            }}
          />
        </div>

        {/* Wordmark — soft fade/rise entrance. */}
        <div
          style={{
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 800,
            fontSize: 34,
            color: 'var(--primary-d)',
            letterSpacing: '-0.01em',
            animation: 'kwordmark 720ms cubic-bezier(.16,1,.3,1) 220ms both',
          }}
        >
          {APP_NAME} 🌴
        </div>

        {/* Gentle wave band along the bottom. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 480 60"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '128%',
            height: 64,
            animation: 'kwave 6s ease-in-out infinite',
          }}
        >
          <path
            d="M0 32 C 60 12, 120 52, 180 32 C 240 12, 300 52, 360 32 C 420 12, 480 52, 540 32 L540 60 L0 60 Z"
            fill="var(--primary)"
            opacity="0.22"
          />
          <path
            d="M0 40 C 60 22, 120 58, 180 40 C 240 22, 300 58, 360 40 C 420 22, 480 58, 540 40 L540 60 L0 60 Z"
            fill="var(--primary)"
            opacity="0.32"
          />
        </svg>
      </div>
    </div>
  )
}

/** A small rounded cloud puff, positioned/animated by the caller. */
function Cloud({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 32" aria-hidden="true" style={{ position: 'absolute', height: 'auto', ...style }}>
      <g fill="#ffffff" opacity="0.92">
        <circle cx="20" cy="20" r="11" />
        <circle cx="34" cy="15" r="13" />
        <circle cx="48" cy="21" r="10" />
        <rect x="18" y="20" width="32" height="11" rx="5.5" />
      </g>
    </svg>
  )
}
