import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { SectionCard } from '../ui/SectionCard'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'
import type { Member } from '../../data/types'

interface ContributionsCardProps {
  members: Member[]
  fullyPaid: number
  partialCount: number
  pendingCount: number
  pendingStr: string
  /** progress fill width 0..100 (already multiplied by count-up t). */
  progressWidthPct: number
  perHeadFee: number
}

function memberOpacity(paid: number, perHeadFee: number): number {
  if (paid >= perHeadFee) return 1
  return paid > 0 ? 0.78 : 0.4
}

export function ContributionsCard({
  members,
  fullyPaid,
  partialCount,
  pendingCount,
  pendingStr,
  progressWidthPct,
  perHeadFee,
}: ContributionsCardProps) {
  const navigate = useNavigate()

  return (
    <SectionCard style={{ marginTop: 14, padding: '17px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>Contributions</div>
        <button
          type="button"
          onClick={() => navigate('/money')}
          className={`pressable ${focus.ring}`}
          style={{ border: 'none', background: 'var(--tint)', color: 'var(--primary-d)', fontWeight: 700, fontSize: 12, padding: '6px 12px', borderRadius: 20, cursor: 'pointer' }}
        >
          View all
        </button>
      </div>
      <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, marginTop: 10 }}>
        {fullyPaid} fully paid · {partialCount} partial · {pendingCount} pending
      </div>
      <div style={{ position: 'relative', height: 11, background: 'var(--bg)', borderRadius: 8, marginTop: 9, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
            width: `${progressWidthPct}%`,
            borderRadius: 8,
            background: 'linear-gradient(90deg,var(--primary),var(--green))',
          }}
        >
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 36, background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent)', animation: 'kshine 2.6s ease-in-out infinite' }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
        {members.map((m, i) => (
          <Avatar key={i} initials={m.initials} color={m.color} opacity={memberOpacity(m.paid, perHeadFee)} stacked />
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{pendingStr} pending</div>
      </div>
    </SectionCard>
  )
}
