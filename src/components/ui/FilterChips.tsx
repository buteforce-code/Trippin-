import { MUTED_TEXT } from './a11y'
import focus from './focus.module.css'

export interface FilterChip {
  key: string
  label: string
}

interface FilterChipsProps {
  chips: FilterChip[]
  active: string
  onSelect: (key: string) => void
  activeBg: string
  activeColor?: string
}

/** Horizontal scrolling pill filters — used by Expenses and Gallery. */
export function FilterChips({ chips, active, onSelect, activeBg, activeColor = '#fff' }: FilterChipsProps) {
  return (
    <div style={{ display: 'flex', gap: 8, margin: '16px 0 12px', overflowX: 'auto', paddingBottom: 2 }}>
      {chips.map((c) => {
        const isActive = active === c.key
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onSelect(c.key)}
            aria-pressed={isActive}
            className={`pressable ${focus.ring}`}
            style={{
              flex: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12.5,
              padding: '8px 15px',
              borderRadius: 20,
              transition: 'all .2s',
              background: isActive ? activeBg : '#fff',
              color: isActive ? activeColor : MUTED_TEXT,
            }}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
