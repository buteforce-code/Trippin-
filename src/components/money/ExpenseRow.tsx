import type { Expense } from '../../data/types'
import { CATS } from '../../lib/catalog'
import { fmt } from '../../lib/money'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

interface ExpenseRowProps {
  expense: Expense
  /** When provided, the row becomes a button that opens the Edit Expense sheet. */
  onEdit?: () => void
}

export function ExpenseRow({ expense, onEdit }: ExpenseRowProps) {
  const cat = CATS[expense.cat]
  const meta = `${cat.label} · ${expense.payer} paid · ${expense.date}`

  const inner = (
    <>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: cat.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flex: 'none' }}>
        {cat.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expense.title}</div>
        <div style={{ fontSize: 11.5, color: MUTED_TEXT, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta}</div>
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", flex: 'none' }}>{fmt(expense.amount)}</div>
      {onEdit && <span aria-hidden="true" style={{ fontSize: 13, color: 'var(--muted)', flex: 'none' }}>✏️</span>}
    </>
  )

  const rowStyle = { display: 'flex', alignItems: 'center', gap: 13, background: '#fff', borderRadius: 'var(--radius-md)', padding: '13px 14px', boxShadow: '0 4px 12px rgba(11,77,74,.05)' } as const

  if (!onEdit) return <div style={rowStyle}>{inner}</div>

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label={`Edit ${expense.title}`}
      className={`pressable ${focus.ring}`}
      style={{ ...rowStyle, width: '100%', border: 'none', cursor: 'pointer' }}
    >
      {inner}
    </button>
  )
}
