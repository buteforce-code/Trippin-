import { describe, expect, it } from 'vitest'
import {
  computeCategoryBreakdown,
  computeMoneySummary,
  donutSegments,
  fmt,
  short,
} from './money'
const PER_HEAD_FEE = 5000;
const SEED_MEMBERS: any[] = [
  { paid: 5000 }, { paid: 5000 }, { paid: 5000 }, { paid: 5000 }, { paid: 5000 },
  { paid: 2500 }, { paid: 2500 },
  { paid: 0 }
];
const SEED_EXPENSES: any[] = [
  { cat: 'stay', amount: 12500 },
  { cat: 'food', amount: 4500 },
  { cat: 'travel', amount: 3200 },
  { cat: 'activities', amount: 1200 }
];
describe('fmt', () => {
  it('formats whole rupees with en-IN grouping', () => {
    expect(fmt(30000)).toBe('₹30,000')
    expect(fmt(40000)).toBe('₹40,000')
    expect(fmt(8600)).toBe('₹8,600')
    expect(fmt(2675)).toBe('₹2,675')
  })

  it('rounds fractional input', () => {
    expect(fmt(2674.999)).toBe('₹2,675')
  })
})

describe('short', () => {
  it('compacts thousands and keeps sub-1000 exact', () => {
    expect(short(21400)).toBe('₹21.4k')
    expect(short(8600)).toBe('₹8.6k')
    expect(short(30000)).toBe('₹30k')
    expect(short(950)).toBe('₹950')
  })
})

describe('computeMoneySummary (seed data)', () => {
  const s = computeMoneySummary(SEED_MEMBERS, SEED_EXPENSES, PER_HEAD_FEE)

  it('matches the prototype headline numbers', () => {
    expect(s.collected).toBe(30000)
    expect(s.expected).toBe(40000)
    expect(s.pending).toBe(10000)
    expect(s.spent).toBe(21400)
    expect(s.remaining).toBe(8600)
    expect(s.perHead).toBe(2675)
  })

  it('counts paid / partial / pending members', () => {
    expect(s.fullyPaid).toBe(5)
    expect(s.partialCount).toBe(2)
    expect(s.pendingCount).toBe(1)
    expect(s.totalMembers).toBe(8)
  })

  it('progress ratio is collected / expected', () => {
    expect(s.progressPct).toBeCloseTo(0.75, 5)
  })
})

describe('computeCategoryBreakdown (seed data)', () => {
  const cats = computeCategoryBreakdown(SEED_EXPENSES)

  it('produces the four spending categories in order', () => {
    expect(cats.map((c) => c.key)).toEqual(['stay', 'food', 'travel', 'activities'])
  })

  it('matches the prototype percentages', () => {
    const byKey = Object.fromEntries(cats.map((c) => [c.key, c]))
    expect(byKey.stay.amount).toBe(12500)
    expect(byKey.stay.pctStr).toBe('58%')
    expect(byKey.food.amount).toBe(4500)
    expect(byKey.food.pctStr).toBe('21%')
    expect(byKey.travel.amount).toBe(3200)
    expect(byKey.travel.pctStr).toBe('15%')
    expect(byKey.activities.amount).toBe(1200)
    expect(byKey.activities.pctStr).toBe('6%')
  })
})

describe('donutSegments', () => {
  const cats = computeCategoryBreakdown(SEED_EXPENSES)

  it('collapses to zero-width arcs and a transparent ring at t=0', () => {
    const out = donutSegments(cats, 0)
    expect(out.endsWith('transparent 0deg 360deg')).toBe(true)
    // every coloured arc is zero-width (start === end) so nothing is drawn
    for (const seg of out.split(',').filter((s) => !s.startsWith('transparent'))) {
      const [, start, end] = seg.match(/^\S+ (\d+(?:\.\d+)?)deg (\d+(?:\.\d+)?)deg$/) ?? []
      expect(start).toBe(end)
    }
  })

  it('fills proportional arcs at t=1 and closes the ring', () => {
    const out = donutSegments(cats, 1)
    expect(out.startsWith('#12C2C2 0deg ')).toBe(true)
    expect(out.endsWith('360deg')).toBe(true)
  })
})
