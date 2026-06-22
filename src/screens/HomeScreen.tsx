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
