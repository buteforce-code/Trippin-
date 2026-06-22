/** Editor-only "＋ Add destination" affordance, matching the brand button style. */
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

interface AddDestinationButtonProps {
  onClick: () => void
  /** `solid` = filled brand CTA (empty state); `ghost` = dashed inline add. */
  variant?: 'solid' | 'ghost'
}

export function AddDestinationButton({ onClick, variant = 'ghost' }: AddDestinationButtonProps) {
  if (variant === 'solid') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`pressable ${focus.ringOnDark}`}
        style={{
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Baloo 2',sans-serif",
          fontWeight: 800,
          fontSize: 15,
          padding: '13px 22px',
          borderRadius: 16,
          color: '#fff',
          background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
          boxShadow: '0 12px 24px var(--shadow)',
        }}
      >
        ＋ Add destination
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`pressable ${focus.ring}`}
      style={{
        width: '100%',
        cursor: 'pointer',
        fontFamily: "'Baloo 2',sans-serif",
        fontWeight: 800,
        fontSize: 14,
        padding: '14px 16px',
        borderRadius: 18,
        color: 'var(--primary-d)',
        background: '#fff',
        border: '1.5px dashed var(--primary)',
        marginBottom: 12,
      }}
    >
      <span style={{ color: 'var(--primary)' }}>＋</span> Add destination
      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED_TEXT, marginTop: 2 }}>
        Plot the next stop on your route
      </span>
    </button>
  )
}
