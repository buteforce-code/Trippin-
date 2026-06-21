interface HeroBalanceProps {
  remainingStr: string
  collectedStr: string
  spentStr: string
  tripName: string
}

export function HeroBalance({ remainingStr, collectedStr, spentStr, tripName }: HeroBalanceProps) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xl)',
        padding: '22px 22px 30px',
        background: 'linear-gradient(140deg,var(--primary) 0%,var(--primary-d) 100%)',
        color: '#fff',
        boxShadow: '0 20px 40px var(--shadow)',
      }}
    >
      {/* sun + rays */}
      <div style={{ position: 'absolute', top: -40, right: -26, width: 140, height: 140 }} aria-hidden="true">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-conic-gradient(from 0deg, rgba(255,231,150,.55) 0deg 7deg, transparent 7deg 22deg)',
            borderRadius: '50%',
            WebkitMask: 'radial-gradient(transparent 32%,#000 33%)',
            mask: 'radial-gradient(transparent 32%,#000 33%)',
            animation: 'kspin 26s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 34,
            right: 34,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--sun)',
            boxShadow: '0 0 28px rgba(255,206,58,.55)',
            animation: 'kfloat 5s ease-in-out infinite',
          }}
        />
      </div>
      {/* drifting clouds */}
      <div style={{ position: 'absolute', top: 30, left: 34, width: 46, height: 14, borderRadius: 10, background: 'rgba(255,255,255,.32)', animation: 'kdrift 9s ease-in-out infinite' }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: 74, left: 128, width: 34, height: 11, borderRadius: 8, background: 'rgba(255,255,255,.2)', animation: 'kdrift2 12s ease-in-out infinite' }} aria-hidden="true" />
      {/* shimmer sweep */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '46%', background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.22),transparent)', animation: 'kshine 5.5s ease-in-out infinite' }} aria-hidden="true" />
      {/* wave */}
      <div style={{ position: 'absolute', left: -12, right: -12, bottom: -2, height: 26, opacity: 0.32 }} aria-hidden="true">
        <svg viewBox="0 0 460 30" preserveAspectRatio="none" style={{ width: '110%', height: '100%', animation: 'kwave 6s ease-in-out infinite' }}>
          <path d="M0 16 Q57 2 115 16 T230 16 T345 16 T460 16 V30 H0 Z" fill="#fff" />
        </svg>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, letterSpacing: '.2px' }}>Pool balance</div>
        <div style={{ fontSize: 43, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1.1, marginTop: 2 }}>{remainingStr}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(255,255,255,.18)', padding: '5px 11px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {tripName} · Day 4 of 7
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 10, marginTop: 18 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,.16)', borderRadius: 'var(--radius-md)', padding: '11px 13px', backdropFilter: 'blur(2px)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>↑ Collected</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>{collectedStr}</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,.16)', borderRadius: 'var(--radius-md)', padding: '11px 13px', backdropFilter: 'blur(2px)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>↓ Spent</div>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>{spentStr}</div>
        </div>
      </div>
    </div>
  )
}
