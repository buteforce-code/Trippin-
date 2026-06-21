import type { CSSProperties, ReactNode } from 'react'

interface SheetShellProps {
  onClose: () => void
  children: ReactNode
  /** Accessible name for the dialog — announced by screen readers on open. */
  ariaLabel: string
  maxHeight?: string
  /** Extra styles for the panel (e.g. display:flex for the scrolling log). */
  panelStyle?: CSSProperties
  zIndex?: number
}

/** Slide-up bottom sheet with a dimmed backdrop and a grab handle. */
export function SheetShell({ onClose, children, ariaLabel, maxHeight = '88%', panelStyle, zIndex = 40 }: SheetShellProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(8,50,48,.45)', animation: 'kfade .2s ease' }} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fff',
          borderRadius: '28px 28px 0 0',
          padding: '10px 22px 26px',
          animation: 'ksheet .34s cubic-bezier(.2,.9,.3,1)',
          maxHeight,
          overflowY: 'auto',
          ...panelStyle,
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: '#dfeae7', margin: '0 auto 14px', flex: 'none' }} />
        {children}
      </div>
    </div>
  )
}
