import { useState } from 'react'
import { useRecordPayment } from '../../hooks/queries'
import { useUI, type RecordTarget } from '../../providers/UIProvider'
import { fmt } from '../../lib/money'
import { SheetShell } from './SheetShell'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

interface RecordPaymentSheetProps {
  target: RecordTarget
}

export function RecordPaymentSheet({ target }: RecordPaymentSheetProps) {
  const { closeRecordSheet } = useUI()
  const recordPayment = useRecordPayment()
  const [amount, setAmount] = useState(String(target.owed))

  const parsed = parseInt(amount.replace(/[^\d]/g, ''), 10) || 0
  const tooMuch = parsed > target.owed

  const handleSave = async () => {
    if (!parsed) return
    await recordPayment.mutateAsync({ memberIndex: target.memberIndex, amount: Math.min(parsed, target.owed) })
    closeRecordSheet()
  }

  return (
    <SheetShell onClose={closeRecordSheet} zIndex={42} ariaLabel={`Record ${target.name}'s payment`}>
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", marginBottom: 4 }}>
        Record {target.name}'s payment
      </div>
      <div style={{ fontSize: 12.5, color: MUTED_TEXT, fontWeight: 600, marginBottom: 16 }}>
        {fmt(target.owed)} still owed · logged against the pool
      </div>

      <div style={{ background: 'var(--bg)', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 30, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--muted)' }}>₹</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          aria-label="Payment amount in rupees"
          className={focus.ring}
          style={{ border: 'none', background: 'transparent', fontSize: 40, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)', width: 180, textAlign: 'center' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setAmount(String(target.owed))}
          className={`pressable ${focus.ring}`}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12.5, padding: '9px 12px', borderRadius: 14, background: 'var(--tint)', color: 'var(--primary-d)' }}
        >
          Full {fmt(target.owed)}
        </button>
        <button
          type="button"
          onClick={() => setAmount(String(Math.round(target.owed / 2)))}
          className={`pressable ${focus.ring}`}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12.5, padding: '9px 12px', borderRadius: 14, background: 'var(--tint)', color: 'var(--primary-d)' }}
        >
          Half {fmt(Math.round(target.owed / 2))}
        </button>
      </div>

      <div role="status" aria-live="polite">
        {tooMuch && (
          <div style={{ fontSize: 11.5, color: '#d14328', fontWeight: 700, marginBottom: 12 }}>
            That's more than owed — it'll be capped at {fmt(target.owed)}.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!parsed || recordPayment.isPending}
        className={`pressable ${focus.ringOnDark}`}
        style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, padding: 16, borderRadius: 18, color: '#fff', background: 'linear-gradient(135deg,var(--green),#1f9b62)', boxShadow: '0 12px 24px rgba(43,182,115,.4)', opacity: !parsed || recordPayment.isPending ? 0.6 : 1 }}
      >
        Record payment
      </button>
    </SheetShell>
  )
}
