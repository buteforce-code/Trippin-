/**
 * Stylized illustrated route — ported verbatim from the prototype. Used as the
 * fallback when no Google Maps key is configured.
 */
export function StylizedRouteMap() {
  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 14px 32px rgba(11,77,74,.14)', background: 'linear-gradient(160deg,#bfeaf0,#9fd9e6)' }}>
      <div style={{ position: 'absolute', top: 22, left: 26, width: 42, height: 13, borderRadius: 9, background: 'rgba(255,255,255,.7)', animation: 'kdrift 10s ease-in-out infinite', zIndex: 2 }} aria-hidden="true" />
      <div style={{ position: 'absolute', top: 60, left: 70, width: 30, height: 10, borderRadius: 7, background: 'rgba(255,255,255,.55)', animation: 'kdrift2 13s ease-in-out infinite', zIndex: 2 }} aria-hidden="true" />
      <svg viewBox="0 0 360 320" style={{ width: '100%', display: 'block' }} role="img" aria-label="Illustrated Kerala route from Kochi to Varkala">
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#86d3a0" />
            <stop offset="1" stopColor="#4cb583" />
          </linearGradient>
        </defs>
        <path d="M150 -10 C 250 30, 250 80, 320 110 C 380 140, 330 230, 300 330 L 380 340 L 380 -20 Z" fill="url(#land)" />
        <path d="M150 -10 C 250 30, 250 80, 320 110 C 380 140, 330 230, 300 330" fill="none" stroke="#fff" strokeWidth="3" opacity=".4" />
        <g opacity=".45" stroke="#fff" strokeWidth="2" fill="none">
          <path d="M30 70 q 12 8 24 0" />
          <path d="M60 60 q 12 8 24 0" />
          <path d="M40 250 q 12 8 24 0" />
          <path d="M70 270 q 12 8 24 0" />
        </g>
        <path d="M235 60 L300 110 L215 150 L250 225 L205 270" fill="none" stroke="#0B3D3A" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" opacity=".75" style={{ animation: 'kmarch 1s linear infinite' }} />
        <g style={{ offsetPath: "path('M235 60 L300 110 L215 150 L250 225 L205 270')", animation: 'ksail 9s ease-in-out infinite alternate' }}>
          <circle r="9" fill="#fff" opacity=".9" />
          <text x="0" y="4" fontSize="11" textAnchor="middle">⛵</text>
        </g>
        <g fontFamily="'Baloo 2',sans-serif">
          <g>
            <circle cx="235" cy="60" r="9" fill="#fff" />
            <circle cx="235" cy="60" r="5" fill="#2BB673" />
            <rect x="247" y="51" width="58" height="18" rx="9" fill="#fff" />
            <text x="276" y="64" fontSize="11" fontWeight="800" fill="#0B3D3A" textAnchor="middle">Kochi</text>
          </g>
          <g>
            <circle cx="300" cy="110" r="9" fill="#fff" />
            <circle cx="300" cy="110" r="5" fill="#2BB673" />
            <rect x="232" y="101" width="62" height="18" rx="9" fill="#fff" />
            <text x="263" y="114" fontSize="11" fontWeight="800" fill="#0B3D3A" textAnchor="middle">Munnar</text>
          </g>
          <g>
            <circle cx="215" cy="150" r="14" fill="var(--accent)" opacity=".4" style={{ animation: 'kpulse 2s ease-out infinite' }} />
            <circle cx="215" cy="150" r="10" fill="#fff" />
            <circle cx="215" cy="150" r="6" fill="var(--accent)" />
            <rect x="100" y="141" width="106" height="18" rx="9" fill="var(--accent)" />
            <text x="153" y="154" fontSize="10.5" fontWeight="800" fill="#fff" textAnchor="middle">Alleppey · now</text>
          </g>
          <g opacity=".75">
            <circle cx="250" cy="225" r="9" fill="#fff" />
            <circle cx="250" cy="225" r="5" fill="#8aa6a2" />
            <rect x="262" y="216" width="66" height="18" rx="9" fill="#fff" />
            <text x="295" y="229" fontSize="11" fontWeight="800" fill="#0B3D3A" textAnchor="middle">Kovalam</text>
          </g>
          <g opacity=".75">
            <circle cx="205" cy="270" r="9" fill="#fff" />
            <circle cx="205" cy="270" r="5" fill="#8aa6a2" />
            <rect x="120" y="261" width="64" height="18" rx="9" fill="#fff" />
            <text x="152" y="274" fontSize="11" fontWeight="800" fill="#0B3D3A" textAnchor="middle">Varkala</text>
          </g>
        </g>
      </svg>
    </div>
  )
}
