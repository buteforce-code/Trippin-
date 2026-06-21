import { SectionCard } from '../ui/SectionCard'
import { LogRow } from '../ui/LogRow'
import { useUI } from '../../providers/UIProvider'
import focus from '../ui/focus.module.css'
import type { LogEntry } from '../../data/types'

interface RecentActivityProps {
  entries: LogEntry[]
}

export function RecentActivity({ entries }: RecentActivityProps) {
  const { openLogSheet } = useUI()

  return (
    <SectionCard style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>Recent activity</div>
        <button
          type="button"
          onClick={openLogSheet}
          className={`pressable ${focus.ring}`}
          style={{ border: 'none', background: 'var(--tint)', color: 'var(--primary-d)', fontWeight: 700, fontSize: 12, padding: '6px 12px', borderRadius: 20, cursor: 'pointer' }}
        >
          Full log
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {entries.map((entry, i) => (
          <LogRow key={i} entry={entry} compact />
        ))}
      </div>
    </SectionCard>
  )
}
