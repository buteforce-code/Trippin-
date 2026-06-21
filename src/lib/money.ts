/**
 * Money formatting and trip math — ported from the prototype's fmt/short and
 * the derived values in renderVals(). All currency is INR / en-IN.
 */
import type { CategoryKey, Expense, Member } from '../data/types'
import { CATS, CATEGORY_ORDER } from './catalog'

/** "₹30,000" — rounds and formats en-IN. */
export function fmt(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

/** Compact form used inside the donut: "₹21.4k", "₹8.6k", "₹950". */
export function short(n: number): string {
  return n >= 1000
    ? '₹' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
    : '₹' + Math.round(n)
}

export interface MoneySummary {
  collected: number
  expected: number
  pending: number
  spent: number
  remaining: number
  perHead: number
  /** collected / expected, clamped to [0, 1+] (raw ratio). */
  progressPct: number
  fullyPaid: number
  partialCount: number
  pendingCount: number
  totalMembers: number
}

export function computeMoneySummary(
  members: readonly Member[],
  expenses: readonly Expense[],
  perHeadFee: number,
): MoneySummary {
  const totalMembers = members.length
  const spent = expenses.reduce((a, e) => a + e.amount, 0)
  const collected = members.reduce((a, m) => a + m.paid, 0)
  const fullyPaid = members.filter((m) => m.paid >= perHeadFee).length
  const partialCount = members.filter((m) => m.paid > 0 && m.paid < perHeadFee).length
  const pendingCount = members.filter((m) => m.paid === 0).length
  const expected = totalMembers * perHeadFee
  const pending = expected - collected
  const remaining = collected - spent
  const perHead = totalMembers ? spent / totalMembers : 0
  const progressPct = expected ? collected / expected : 0

  return {
    collected,
    expected,
    pending,
    spent,
    remaining,
    perHead,
    progressPct,
    fullyPaid,
    partialCount,
    pendingCount,
    totalMembers,
  }
}

export interface CategorySlice {
  key: CategoryKey
  label: string
  color: string
  amount: number
  amountStr: string
  /** share of total spent, 0..1 */
  pct: number
  pctStr: string
}

export function computeCategoryBreakdown(expenses: readonly Expense[]): CategorySlice[] {
  const spent = expenses.reduce((a, e) => a + e.amount, 0)
  const sums = {} as Record<CategoryKey, number>
  for (const k of CATEGORY_ORDER) sums[k] = 0
  for (const e of expenses) sums[e.cat] = (sums[e.cat] ?? 0) + e.amount

  return CATEGORY_ORDER.filter((k) => sums[k] > 0).map((k) => ({
    key: k,
    label: CATS[k].label,
    color: CATS[k].color,
    amount: sums[k],
    amountStr: fmt(sums[k]),
    pct: spent ? sums[k] / spent : 0,
    pctStr: (spent ? Math.round((sums[k] / spent) * 100) : 0) + '%',
  }))
}

/**
 * Build the conic-gradient stop list for the spend donut.
 * `t` is the count-up progress (0..1) so the donut draws in.
 */
export function donutSegments(slices: readonly CategorySlice[], t: number): string {
  let acc = 0
  const segs = slices.map((c) => {
    const a = acc
    acc += c.pct * 360 * t
    return `${c.color} ${a}deg ${acc}deg`
  })
  segs.push(`transparent ${acc}deg 360deg`)
  return segs.join(',')
}
