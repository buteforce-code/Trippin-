import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAddExpense } from '../../hooks/queries'
import { useUI } from '../../providers/UIProvider'
import { CATS, CATEGORY_ORDER } from '../../lib/catalog'
import { isoDate } from '../../lib/time'
import type { CategoryKey } from '../../data/types'
import { SheetShell } from './SheetShell'
import { DateField } from './DateField'
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

export function AddExpenseSheet() {
  const { closeAddSheet } = useUI()
  const addExpense = useAddExpense()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState<CategoryKey>('food')
  const [spentOn, setSpentOn] = useState(isoDate())

  const handleSave = async () => {
    const parsed = parseInt(amount.replace(/[^\d]/g, ''), 10)
    if (!parsed) {
      closeAddSheet()
      return
    }
    await addExpense.mutateAsync({ amount: parsed, title, cat, spentOn })
    closeAddSheet()
    navigate('/money?tab=out')
  }

  return (
    <SheetShell onClose={closeAddSheet} ariaLabel="Add expense">
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", marginBottom: 4 }}>Add expense</div>
      <div style={{ fontSize: 12.5, color: MUTED_TEXT, fontWeight: 600, marginBottom: 16 }}>Logged against the trip pool by Route Head</div>

      <div style={{ background: 'var(--bg)', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
        <span style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--muted)' }}>₹</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          placeholder="0"
          aria-label="Amount in rupees"
          className={focus.ring}
          style={{ border: 'none', background: 'transparent', fontSize: 40, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)', width: 160, textAlign: 'center' }}
        />
      </div>

      <div style={LABEL_STYLE}>Category</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {CATEGORY_ORDER.map((k) => {
          const def = CATS[k]
          const active = cat === k
          return (
            <button
              key={k}
              type="button"
              onClick={() => setCat(k)}
              aria-pressed={active}
              className={`pressable ${focus.ring}`}
              style={{ border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: '9px 14px', borderRadius: 16, transition: 'all .18s', background: active ? def.color : def.tint, color: active ? '#fff' : 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {def.emoji} {def.label}
            </button>
          )
        })}
      </div>

      <div style={LABEL_STYLE}>What for?</div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Houseboat dinner"
        aria-label="What for?"
        className={focus.ring}
        style={{ width: '100%', border: '1.5px solid #e3efec', background: 'var(--bg)', borderRadius: 14, padding: '13px 15px', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 18, boxSizing: 'border-box' }}
      />

      <DateField value={spentOn} onChange={setSpentOn} />

      <button
        type="button"
        onClick={handleSave}
        disabled={addExpense.isPending}
        className={`pressable ${focus.ringOnDark}`}
        style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, padding: 16, borderRadius: 18, color: '#fff', background: 'linear-gradient(135deg,var(--primary),var(--primary-d))', boxShadow: '0 12px 24px var(--shadow)' }}
      >
        Add expense
      </button>
    </SheetShell>
  )
}
