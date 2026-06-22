import { useNavigate } from 'react-router-dom'
import { useTripSnapshot } from '../hooks/queries'
import { useCountUp } from '../hooks/useCountUp'
import { computeCategoryBreakdown, computeMoneySummary, donutSegments, fmt, short } from '../lib/money'
import { HomeHeader } from '../components/home/HomeHeader'
import { HeroBalance } from '../components/home/HeroBalance'
import { StatChips } from '../components/home/StatChips'
import { ContributionsCard } from '../components/home/ContributionsCard'
import { SpendDonut } from '../components/home/SpendDonut'
import { RecentActivity } from '../components/home/RecentActivity'
import { NextStopCard } from '../components/home/NextStopCard'
import { HomeAnnouncementBanner } from '../components/announcements/HomeAnnouncementBanner'
import focus from '../components/ui/focus.module.css'

const HEADER_ICON_BTN = {
  width: 38,
  height: 38,
  borderRadius: '50%',
  border: 'none',
  background: '#fff',
  boxShadow: '0 3px 12px rgba(11,77,74,.1)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  lineHeight: 1,
  padding: 0,
} as const

/** Small round 📣 entry-point button mirroring the header's log/clock icon button. */
function AnnouncementsIconButton() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/announcements')}
      className={`pressable ${focus.ring}`}
      aria-label="Open announcements"
      style={HEADER_ICON_BTN}
    >
      <span aria-hidden="true">📣</span>
    </button>
  )
}

/** Crew/people entry-point — relocated here when the bottom nav reclaimed the Trip tab. */
function CrewIconButton() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/trips')}
      className={`pressable ${focus.ring}`}
      aria-label="Open crew & trips"
      style={HEADER_ICON_BTN}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--primary-d)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85" />
      </svg>
    </button>
  )
}

export function HomeScreen() {
  const { data } = useTripSnapshot()
  const t = useCountUp()

  if (!data) return <HomeHeader />

  const summary = computeMoneySummary(data.members, data.expenses, data.perHeadFee)
  const categories = computeCategoryBreakdown(data.expenses)
  const av = (n: number) => n * t

  // The signed-in member is tagged with a "(you)" suffix in the snapshot.
  const youMember = data.members.find((m) => m.name.includes('(you)'))
  const youName = youMember ? youMember.name.replace(' (you)', '') : undefined
  const youInitial = youMember?.initials

  return (
    <div>
      <HomeHeader youName={youName} youInitial={youInitial} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 10 }}>
        <CrewIconButton />
        <AnnouncementsIconButton />
      </div>
      <HomeAnnouncementBanner />
      <HeroBalance
        remainingStr={fmt(av(summary.remaining))}
        collectedStr={fmt(av(summary.collected))}
        spentStr={fmt(av(summary.spent))}
        tripName={data.tripName}
      />
      <StatChips perHeadStr={fmt(av(summary.perHead))} pendingStr={fmt(av(summary.pending))} />
      <ContributionsCard
        members={data.members}
        fullyPaid={summary.fullyPaid}
        partialCount={summary.partialCount}
        pendingCount={summary.pendingCount}
        pendingStr={fmt(summary.pending)}
        progressWidthPct={summary.progressPct * 100 * t}
        perHeadFee={data.perHeadFee}
      />
      <SpendDonut categories={categories} donutGradient={donutSegments(categories, t)} spentShort={short(av(summary.spent))} />
      <RecentActivity entries={data.log.slice(0, 3)} />
      <NextStopCard current={data.stops.find((s) => s.state === 'current')} />
    </div>
  )
}
