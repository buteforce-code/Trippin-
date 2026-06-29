import type { DaySlice } from '../../lib/money'
import { short } from '../../lib/money'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

interface DayBarChartProps {
  days: DaySlice[]
  /** Currently selected day (YYYY-MM-DD), or null for "all days". */
  activeDate: string | null
  /** Toggle a day filter; passing the active day again clears it. */
  onSelect: (dateISO: string | null) => void
  /** Count-up progress 0..1 so bars grow in with the rest of the screen. */
  t?: number
}

const TRACK_HEIGHT = 96

/** Horizontal calendar of daily spend — one bar per day, tap to filter the list
 *  to that day. Bars scale to the busiest day. */
export function DayBarChart({ days, activeDate, onSelect, t = 1 }: DayBarChartProps) {
  if (days.length === 0) return null

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '14px 6px 10px', marginTop: 14, boxShadow: '0 4px 12px rgba(11,77,74,.05)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 10px', marginBottom: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>Spending by day</div>
        {activeDate && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`pressable ${focus.ring}`}
            style={{ border: 'none', background: 'var(--tint)', color: 'var(--primary-d)', cursor: 'pointer', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 10 }}
          >
            Show all
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label="Daily spending"
        style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 10px 4px', WebkitOverflowScrolling: 'touch' }}
      >
        {days.map((d) => {
          const active = activeDate === d.dateISO
          const dim = activeDate != null && !active
          const barH = Math.max(4, Math.round(d.heightPct * TRACK_HEIGHT * t))
          return (
            <button
              key={d.dateISO}
              type="button"
              onClick={() => onSelect(active ? null : d.dateISO)}
              aria-pressed={active}
              aria-label={`${d.label}, ${d.amountStr} across ${d.count} ${d.count === 1 ? 'expense' : 'expenses'}`}
              className={`pressable ${focus.ring}`}
              style={{ flex: 'none', width: 46, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: dim ? 0.45 : 1, transition: 'opacity .2s' }}
            >
              <div style={{ fontSize: 9.5, fontWeight: 800, color: active ? 'var(--accent)' : MUTED_TEXT, whiteSpace: 'nowrap' }}>{short(d.amount)}</div>
              <div style={{ height: TRACK_HEIGHT, width: 22, display: 'flex', alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: '100%',
                    height: barH,
                    borderRadius: 7,
                    background: active ? 'linear-gradient(180deg,var(--accent),#f0573f)' : 'linear-gradient(180deg,#ffd0c6,#ff9d8a)',
                    transition: 'height .5s cubic-bezier(.2,.9,.3,1)',
                  }}
                />
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: active ? 'var(--ink)' : MUTED_TEXT, lineHeight: 1.15, textAlign: 'center' }}>
                {d.label.replace(' ', ' ')}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: MUTED_TEXT }}>{d.weekday}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
