import { Avatar } from '../ui/Avatar'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'
import type { Member } from '../../data/types'

interface MemberRowProps {
  member: Member
  perHeadFee: number
  onRecord: () => void
}

interface MemberView {
  sub: string
  status: string
  badgeBg: string
  badgeColor: string
  barW: string
  barColor: string
  opacity: number
  canRecord: boolean
}

function buildView(m: Member, fee: number): MemberView {
  const full = m.paid >= fee
  const partial = m.paid > 0 && m.paid < fee
  const splitTxt = `${m.splits} split${m.splits > 1 ? 's' : ''}`
  return {
    opacity: full ? 1 : partial ? 0.78 : 0.4,
    sub: full
      ? `Paid ₹5,000 · ${splitTxt}`
      : partial
        ? `₹${m.paid.toLocaleString('en-IN')} of ₹5,000 · ${splitTxt}`
        : 'Not paid yet',
    status: full ? 'Paid' : partial ? 'Partial' : 'Pending',
    badgeBg: full ? '#D6F2E3' : partial ? '#FFF1CC' : '#FFE3DC',
    badgeColor: full ? '#1f9b62' : partial ? '#B8860B' : '#e0573f',
    barW: Math.round(Math.min(m.paid / fee, 1) * 100) + '%',
    barColor: full ? 'var(--green)' : '#F2A93B',
    canRecord: !full,
  }
}

export function MemberRow({ member, perHeadFee, onRecord }: MemberRowProps) {
  const v = buildView(member, perHeadFee)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 'var(--radius-md)', padding: '12px 14px', boxShadow: '0 4px 12px rgba(11,77,74,.05)' }}>
      <Avatar initials={member.initials} color={member.color} size={38} opacity={v.opacity} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{member.name}</span>
          {member.organizer && <span style={{ fontSize: 11, color: '#F2A93B', flex: 'none' }}>★</span>}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED_TEXT, fontWeight: 600, margin: '3px 0 7px' }}>{v.sub}</div>
        <div style={{ height: 6, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: v.barW, background: v.barColor, borderRadius: 4, transition: 'width .4s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, flex: 'none' }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '5px 10px', borderRadius: 20, background: v.badgeBg, color: v.badgeColor, whiteSpace: 'nowrap' }}>{v.status}</span>
        {v.canRecord && (
          <button
            type="button"
            onClick={onRecord}
            aria-label={`Record payment for ${member.name}`}
            className={`pressable ${focus.ring}`}
            style={{ border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 10.5, padding: '5px 10px', borderRadius: 12, background: 'var(--accent)', color: '#fff', whiteSpace: 'nowrap' }}
          >
            + Record
          </button>
        )}
      </div>
    </div>
  )
}
