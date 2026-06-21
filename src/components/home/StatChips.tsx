import { MUTED_TEXT } from '../ui/a11y'

interface StatChipsProps {
  perHeadStr: string
  pendingStr: string
}

export function StatChips({ perHeadStr, pendingStr }: StatChipsProps) {
  return (
    <div style={{ display: 'flex', gap: 11, marginTop: 14 }}>
      <div style={{ flex: 1, background: '#fff', borderRadius: 'var(--radius-lg)', padding: '14px 13px', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-d)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 3v18M19 12l-7-9-7 9" />
          </svg>
        </div>
        <div style={{ fontSize: 11, color: MUTED_TEXT, fontWeight: 600 }}>Per head spent</div>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>{perHeadStr}</div>
      </div>
      <div style={{ flex: 1, background: '#fff', borderRadius: 'var(--radius-lg)', padding: '14px 13px', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: '#FFEFD6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8990C" strokeWidth="2.4" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <div style={{ fontSize: 11, color: MUTED_TEXT, fontWeight: 600 }}>To collect</div>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>{pendingStr}</div>
      </div>
    </div>
  )
}
