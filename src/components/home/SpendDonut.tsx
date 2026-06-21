import { SectionCard } from '../ui/SectionCard'
import { MUTED_TEXT } from '../ui/a11y'
import type { CategorySlice } from '../../lib/money'

interface SpendDonutProps {
  categories: CategorySlice[]
  /** conic-gradient stop list, already scaled by count-up t. */
  donutGradient: string
  spentShort: string
}

const DONUT_MASK = 'radial-gradient(transparent 52%, #000 53%)'

export function SpendDonut({ categories, donutGradient, spentShort }: SpendDonutProps) {
  return (
    <SectionCard style={{ marginTop: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", marginBottom: 14 }}>Where it's going</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ position: 'relative', flex: 'none', width: 108, height: 108 }}>
          <div style={{ position: 'absolute', inset: 0, width: 108, height: 108, borderRadius: '50%', background: '#eaf4f1', WebkitMask: DONUT_MASK, mask: DONUT_MASK }} />
          <div style={{ position: 'absolute', inset: 0, width: 108, height: 108, borderRadius: '50%', background: `conic-gradient(${donutGradient})`, WebkitMask: DONUT_MASK, mask: DONUT_MASK }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 9, color: MUTED_TEXT, fontWeight: 700 }}>SPENT</div>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>{spentShort}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {categories.map((c) => (
            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 11, height: 11, borderRadius: 4, background: c.color, flex: 'none' }} />
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", flex: 'none' }}>{c.amountStr}</span>
              <span style={{ fontSize: 11, color: MUTED_TEXT, fontWeight: 700, width: 34, textAlign: 'right', flex: 'none' }}>{c.pctStr}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}
