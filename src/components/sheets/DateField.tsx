import { isoDate, isoDaysAgo } from '../../lib/time'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

const LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 800,
  color: MUTED_TEXT,
  marginBottom: 9,
  textTransform: 'uppercase',
  letterSpacing: '.4px',
} as const

interface DateFieldProps {
  /** Selected day, YYYY-MM-DD. */
  value: string
  onChange: (iso: string) => void
}

/** "When?" day picker used by the Add / Edit expense sheets — native date input
 *  plus Today / Yesterday quick chips. Capped at today (no future spending). */
const CHIP_STYLE = {
  border: 'none',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 12.5,
  padding: '9px 14px',
  borderRadius: 14,
} as const

export function DateField({ value, onChange }: DateFieldProps) {
  const today = isoDate()
  const yesterday = isoDaysAgo(1)
  const quickDays: { label: string; day: string }[] = [
    { label: 'Today', day: today },
    { label: 'Yesterday', day: yesterday },
  ]

  return (
    <>
      <div style={LABEL_STYLE}>When?</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {quickDays.map(({ label, day }) => {
          const active = value === day
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(day)}
              aria-pressed={active}
              className={`pressable ${focus.ring}`}
              style={{ ...CHIP_STYLE, background: active ? 'var(--primary)' : 'var(--tint)', color: active ? '#fff' : 'var(--primary-d)' }}
            >
              {label}
            </button>
          )
        })}
        <input
          type="date"
          value={value}
          max={today}
          onChange={(e) => onChange(e.target.value || today)}
          aria-label="Date the money was spent"
          className={focus.ring}
          style={{
            flex: 1,
            minWidth: 120,
            border: '1.5px solid #e3efec',
            background: 'var(--bg)',
            borderRadius: 14,
            padding: '11px 13px',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </>
  )
}
