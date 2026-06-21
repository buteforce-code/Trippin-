import type { LogEntry } from '../../data/types'
import { LOGKIND } from '../../lib/catalog'
import { MUTED_TEXT } from './a11y'

interface LogRowProps {
  entry: LogEntry
  /** Home "recent activity" uses the compact sizing; the log sheet uses full. */
  compact?: boolean
}

export function LogRow({ entry, compact = false }: LogRowProps) {
  const kind = LOGKIND[entry.kind]
  const iconSize = compact ? 34 : 38
  const iconRadius = compact ? 11 : 12
  const iconFont = compact ? 15 : 17

  return (
    <div style={{ display: 'flex', alignItems: compact ? 'center' : 'flex-start', gap: compact ? 11 : 12 }}>
      <div style={{ width: iconSize, height: iconSize, borderRadius: iconRadius, background: kind.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: iconFont, flex: 'none' }}>
        {kind.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 12.7 : 13.5, fontWeight: 700, lineHeight: compact ? 1.3 : 1.35 }}>{entry.detail}</div>
        <div style={{ fontSize: compact ? 11 : 11.5, color: MUTED_TEXT, fontWeight: 600, marginTop: compact ? 0 : 1 }}>
          {entry.who} · {entry.time}
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, padding: compact ? '4px 8px' : '4px 9px', borderRadius: compact ? 10 : 11, background: kind.tint, color: kind.color, flex: 'none' }}>
        {kind.tag}
      </span>
    </div>
  )
}
