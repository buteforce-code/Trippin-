interface AvatarProps {
  initials: string
  color: string
  size?: number
  opacity?: number
  /** Negative margin for overlapping avatar stacks. */
  stacked?: boolean
}

/** Circular initials avatar with a white ring. */
export function Avatar({ initials, color, size = 30, opacity = 1, stacked = false }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: size <= 30 ? 11 : 13,
        fontWeight: 800,
        flex: 'none',
        opacity,
        border: '2.5px solid #fff',
        marginLeft: stacked ? -7 : 0,
      }}
    >
      {initials}
    </div>
  )
}
