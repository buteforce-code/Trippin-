import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTripSnapshot } from '../hooks/queries'
import { useUI } from '../providers/UIProvider'
import { useTrip } from '../providers/TripProvider'
import { useCountUp } from '../hooks/useCountUp'
import { computeDailyBreakdown, computeMoneySummary, expenseDayISO, fmt } from '../lib/money'
import { MemberRow } from '../components/money/MemberRow'
import { ExpenseRow } from '../components/money/ExpenseRow'
import { DayBarChart } from '../components/money/DayBarChart'
import { FilterChips, type FilterChip } from '../components/ui/FilterChips'
import { MUTED_TEXT } from '../components/ui/a11y'
import focus from '../components/ui/focus.module.css'
import type { CategoryKey } from '../data/types'

type MoneyTab = 'in' | 'out'

const EXPENSE_FILTERS: FilterChip[] = [
  { key: 'all', label: 'All' },
  { key: 'stay', label: 'Stay' },
  { key: 'food', label: 'Food' },
  { key: 'travel', label: 'Travel' },
  { key: 'activities', label: 'Activities' },
]

export function MoneyScreen() {
  const { data } = useTripSnapshot()
  const { openRecordSheet, openEditSheet } = useUI()
  const { canEditMoney, myRole } = useTrip()
  const t = useCountUp()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: MoneyTab = searchParams.get('tab') === 'out' ? 'out' : 'in'
  const setTab = (next: MoneyTab) => setSearchParams(next === 'out' ? { tab: 'out' } : {}, { replace: true })
  const [filter, setFilter] = useState('all')
  const [dayFilter, setDayFilter] = useState<string | null>(null)

  const title = <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", padding: '8px 2px 14px' }}>Money</div>
  if (!data) return <div>{title}</div>

  const summary = computeMoneySummary(data.members, data.expenses, data.perHeadFee)
  const av = (n: number) => n * t
  const days = computeDailyBreakdown(data.expenses)
  const sortedExpenses = [...data.expenses].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const visibleExpenses = sortedExpenses.filter(
    (e) =>
      (filter === 'all' || e.cat === (filter as CategoryKey)) &&
      (dayFilter == null || expenseDayISO(e) === dayFilter),
  )

  return (
    <div>
      {title}

      <div style={{ display: 'flex', background: '#fff', padding: 5, borderRadius: 18, boxShadow: 'var(--card-shadow)' }}>
        <button
          type="button"
          onClick={() => setTab('in')}
          aria-pressed={tab === 'in'}
          className={`pressable ${focus.ring}`}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 14, transition: 'all .2s', background: tab === 'in' ? 'var(--primary)' : 'transparent', color: tab === 'in' ? '#fff' : MUTED_TEXT }}
        >
          Money In
        </button>
        <button
          type="button"
          onClick={() => setTab('out')}
          aria-pressed={tab === 'out'}
          className={`pressable ${focus.ring}`}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13.5, padding: 11, borderRadius: 14, transition: 'all .2s', background: tab === 'out' ? 'var(--accent)' : 'transparent', color: tab === 'out' ? '#fff' : MUTED_TEXT }}
        >
          Expenses
        </button>
      </div>

      {tab === 'in' ? (
        <div>
          <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(140deg,var(--green),#1f9b62)', borderRadius: 'var(--radius-lg)', padding: 18, marginTop: 14, color: '#fff', boxShadow: '0 14px 30px rgba(43,182,115,.34)' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '46%', background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.18),transparent)', animation: 'kshine 5s ease-in-out infinite' }} aria-hidden="true" />
            <div style={{ position: 'absolute', top: -30, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} aria-hidden="true" />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.9 }}>Collected so far</div>
              <div style={{ fontSize: 34, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1.1 }}>{fmt(av(summary.collected))}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.9, marginTop: 2 }}>of {fmt(summary.expected)} expected · {fmt(data.perHeadFee)} / head</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
            <SummaryTile value={summary.fullyPaid} label="Fully paid" color="#1f9b62" />
            <SummaryTile value={summary.partialCount} label="In splits" color="#C68A0F" />
            <SummaryTile value={summary.pendingCount} label="Pending" color="#e0573f" />
          </div>

          <LeftoverCard
            remaining={av(summary.remaining)}
            spent={summary.spent}
            collected={summary.collected}
            settlePerHead={summary.settlePerHead}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12, background: 'var(--tint)', borderRadius: 14, padding: '11px 13px' }}>
            <span style={{ fontSize: 16 }}>{canEditMoney ? '⚡' : '👀'}</span>
            <div style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.35, color: 'var(--ink)' }}>
              {myRole === 'route_head' ? (
                <>You're the <b>Route Head</b> — record split payments, add extra &amp; edit the pool anytime. Every change is logged.</>
              ) : myRole === 'assistant' ? (
                <>You're an <b>Assistant</b> — you can record payments, add extra &amp; edit expenses. Every change is logged.</>
              ) : (
                <>You have a <b>read-only</b> view of the pool. Only the Route Head &amp; assistants can record payments.</>
              )}
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", margin: '18px 2px 10px' }}>{data.members.length} travellers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {data.members.map((m, i) => (
              <MemberRow
                key={i}
                member={m}
                perHeadFee={data.perHeadFee}
                canRecord={canEditMoney}
                onRecord={() =>
                  openRecordSheet({
                    memberIndex: i,
                    name: m.name.replace(' (you)', ''),
                    owed: Math.max(0, data.perHeadFee - m.paid),
                  })
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(140deg,var(--accent),#f0573f)', borderRadius: 'var(--radius-lg)', padding: 18, marginTop: 14, color: '#fff', boxShadow: '0 14px 30px rgba(255,122,102,.34)' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '46%', background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.2),transparent)', animation: 'kshine 5s ease-in-out infinite' }} aria-hidden="true" />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.92 }}>Total spent · {data.expenses.length} entries</div>
              <div style={{ fontSize: 34, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1.1 }}>{fmt(av(summary.spent))}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.92, marginTop: 2 }}>{fmt(av(summary.remaining))} left in pool</div>
            </div>
          </div>

          <DayBarChart days={days} activeDate={dayFilter} onSelect={setDayFilter} t={t} />

          <FilterChips chips={EXPENSE_FILTERS} active={filter} onSelect={setFilter} activeBg="var(--ink)" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibleExpenses.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                onEdit={canEditMoney ? () => openEditSheet(e) : undefined}
              />
            ))}
            {visibleExpenses.length === 0 && (
              <div style={{ textAlign: 'center', color: MUTED_TEXT, fontSize: 12.5, fontWeight: 600, padding: '22px 0' }}>
                No expenses{dayFilter ? ' on this day' : ''} yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryTile({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 15, padding: '11px 8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(11,77,74,.05)' }}>
      <div style={{ fontSize: 19, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color }}>{value}</div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED_TEXT }}>{label}</div>
    </div>
  )
}

interface LeftoverCardProps {
  /** Already count-up-animated remaining-in-pool value. */
  remaining: number
  spent: number
  collected: number
  /** remaining / members — back per head (+) or short per head (−). */
  settlePerHead: number
}

/** "Leftover in the pool" — what's unspent + the settle-up split per head.
 *  Surfaces the trip's extra / leftover money in one glance. */
function LeftoverCard({ remaining, spent, collected, settlePerHead }: LeftoverCardProps) {
  const short = settlePerHead < 0
  const settleAbs = Math.abs(Math.round(settlePerHead))
  return (
    <div style={{ marginTop: 12, background: '#fff', borderRadius: 'var(--radius-lg)', padding: '14px 16px', boxShadow: '0 4px 12px rgba(11,77,74,.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flex: 'none' }} aria-hidden="true">
        {short ? '⚠️' : '🪙'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED_TEXT }}>Leftover in the pool</div>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1.1, color: short ? '#e0573f' : 'var(--ink)' }}>{fmt(remaining)}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: MUTED_TEXT, marginTop: 2 }}>{fmt(spent)} spent of {fmt(collected)} collected</div>
      </div>
      <div style={{ textAlign: 'right', flex: 'none' }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: short ? '#e0573f' : 'var(--green)' }}>{fmt(settleAbs)}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED_TEXT, lineHeight: 1.2 }}>{short ? 'more / head' : 'back / head'}</div>
      </div>
    </div>
  )
}
