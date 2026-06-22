import { useEffect, useMemo, useState } from 'react'

/**
 * Reusable, self-contained celebration overlay. Renders a tropical confetti
 * burst plus a soft sunburst flash, then auto-cleans once it has played.
 *
 * Pure CSS keyframes (`kconfetti` / `kburst`) drive the motion, so the
 * `prefers-reduced-motion` block in keyframes.css neutralizes it automatically.
 *
 * Usage:
 *   <Celebration run={justSaved} />            // fires when `run` flips true
 *   <Celebration run={done} durationMs={1800} />
 */
interface CelebrationProps {
  /** When true, plays the burst once. Flip false→true to replay. */
  run?: boolean
  /** Total lifetime before the overlay removes itself. Default 2000ms. */
  durationMs?: number
  /** Number of confetti pieces. Default 36. */
  pieces?: number
}

interface ConfettiPiece {
  left: number
  delay: number
  duration: number
  size: number
  color: string
  rounded: boolean
}

const DEFAULT_DURATION_MS = 2000
const DEFAULT_PIECES = 36

// Themed palette — reads the live CSS vars so it matches whichever theme is active.
const PIECE_COLORS = [
  'var(--primary)',
  'var(--primary-d)',
  'var(--accent)',
  'var(--sun)',
  'var(--tint)',
]

function buildPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.round((i / count) * 100 + (Math.random() * 8 - 4)),
    delay: Math.round(Math.random() * 350),
    duration: 1200 + Math.round(Math.random() * 900),
    size: 7 + Math.round(Math.random() * 7),
    color: PIECE_COLORS[i % PIECE_COLORS.length],
    rounded: i % 3 === 0,
  }))
}

export function Celebration({
  run = false,
  durationMs = DEFAULT_DURATION_MS,
  pieces = DEFAULT_PIECES,
}: CelebrationProps) {
  const [active, setActive] = useState(false)
  // Bump on each run to remount pieces (restarts the CSS animations cleanly).
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!run) return
    setActive(true)
    setCycle((c) => c + 1)
    const timer = window.setTimeout(() => setActive(false), durationMs)
    return () => window.clearTimeout(timer)
  }, [run, durationMs])

  const confetti = useMemo(() => buildPieces(pieces), [pieces, cycle])

  if (!active) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {/* Soft sunburst flash from the centre. */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          width: 220,
          height: 220,
          marginLeft: -110,
          marginTop: -110,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--sun), transparent 68%)',
          animation: 'kburst 900ms ease-out forwards',
        }}
      />
      {confetti.map((p, i) => (
        <span
          key={`${cycle}-${i}`}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.rounded ? p.size : p.size * 0.5,
            background: p.color,
            borderRadius: p.rounded ? '50%' : 2,
            animation: `kconfetti ${p.duration}ms cubic-bezier(.2,.6,.3,1) ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  )
}
