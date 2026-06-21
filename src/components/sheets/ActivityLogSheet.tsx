import { useTripSnapshot } from '../../hooks/queries'
import { useUI } from '../../providers/UIProvider'
import { LogRow } from '../ui/LogRow'
import { SheetShell } from './SheetShell'
import { MUTED_TEXT } from '../ui/a11y'

export function ActivityLogSheet() {
  const { closeLogSheet } = useUI()
  const { data } = useTripSnapshot()
  const log = data?.log ?? []

  return (
    <SheetShell onClose={closeLogSheet} maxHeight="86%" panelStyle={{ display: 'flex', flexDirection: 'column' }} zIndex={41} ariaLabel="Activity log">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flex: 'none' }}>
        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", whiteSpace: 'nowrap' }}>Activity log</div>
        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--primary-d)', background: 'var(--tint)', padding: '3px 8px', borderRadius: 9, whiteSpace: 'nowrap' }}>Route Head</span>
      </div>
      <div style={{ fontSize: 12.5, color: MUTED_TEXT, fontWeight: 600, marginBottom: 16, flex: 'none' }}>
        Every add, edit &amp; split payment — full audit trail of the pool.
      </div>
      <div style={{ overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 6 }}>
        {log.map((entry, i) => (
          <LogRow key={i} entry={entry} />
        ))}
      </div>
    </SheetShell>
  )
}
