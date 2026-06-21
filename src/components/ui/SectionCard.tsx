import type { CSSProperties, ReactNode } from 'react'

interface SectionCardProps {
  children: ReactNode
  style?: CSSProperties
}

/** White rounded card with the standard pastel shadow used across screens. */
export function SectionCard({ children, style }: SectionCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: '17px 18px',
        boxShadow: 'var(--card-shadow)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
