import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 900

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Ramps a progress value 0 -> 1 over 900ms with cubic ease-out, restarting when
 * `key` changes (the prototype re-runs this on every screen switch). Numeric
 * displays multiply by the returned `t` so figures animate up. With
 * reduced-motion the value jumps straight to 1.
 */
export function useCountUp(key: unknown = null): number {
  const [t, setT] = useState(prefersReducedMotion() ? 1 : 0)
  const raf = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Reduced motion: `t` already initialises to 1, so skip the animation entirely.
    if (prefersReducedMotion()) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION_MS)
      setT(1 - Math.pow(1 - p, 3))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current)
    }
  }, [key])

  return t
}
