/**
 * Seed data — reproduced verbatim from the prototype's initial `state`.
 * These numbers MUST hold: collected ₹30,000 / ₹40,000, pending ₹10,000,
 * spent ₹21,400, pool balance ₹8,600, per-head ₹2,675.
 */
import type { Expense, LogEntry, MediaItem, Member, Stop, TripSnapshot } from './types'

export const PER_HEAD_FEE = 5000
export const TRIP_NAME = "Kerala '26"

export const SEED_MEMBERS: Member[] = [
  { name: 'Arjun (you)', initials: 'A', color: '#12C2C2', paid: 5000, splits: 1, organizer: true },
  { name: 'Meera', initials: 'M', color: '#FF7A66', paid: 5000, splits: 1 },
  { name: 'Rohan', initials: 'R', color: '#2BB673', paid: 5000, splits: 2 },
  { name: 'Priya', initials: 'P', color: '#9B8CFF', paid: 5000, splits: 1 },
  { name: 'Kabir', initials: 'K', color: '#FFB02E', paid: 4000, splits: 2 },
  { name: 'Ananya', initials: 'An', color: '#FF5CA8', paid: 5000, splits: 3 },
  { name: 'Dev', initials: 'D', color: '#5AC8FA', paid: 1000, splits: 1 },
  { name: 'Nisha', initials: 'N', color: '#7C8DB5', paid: 0, splits: 0 },
]

// createdAt increases with the prototype's original id so newest-first sorting
// reproduces the prototype's order (Groceries → … → Houseboat).
export const SEED_EXPENSES: Expense[] = [
  { id: '1', title: 'Houseboat — Alleppey', cat: 'stay', payer: 'Arjun', date: 'Jun 18', amount: 8000, createdAt: '2026-06-18T09:01:00Z' },
  { id: '2', title: 'Munnar homestay (2 nights)', cat: 'stay', payer: 'Meera', date: 'Jun 16', amount: 4500, createdAt: '2026-06-18T09:02:00Z' },
  { id: '3', title: 'Cab Kochi → Munnar', cat: 'travel', payer: 'Arjun', date: 'Jun 16', amount: 3200, createdAt: '2026-06-18T09:03:00Z' },
  { id: '4', title: 'Kovalam shack lunch', cat: 'food', payer: 'Rohan', date: 'Jun 19', amount: 1700, createdAt: '2026-06-18T09:04:00Z' },
  { id: '5', title: 'Seafood dinner, Fort Kochi', cat: 'food', payer: 'Priya', date: 'Jun 15', amount: 1850, createdAt: '2026-06-18T09:05:00Z' },
  { id: '6', title: 'Tea museum entry', cat: 'activities', payer: 'Kabir', date: 'Jun 17', amount: 1200, createdAt: '2026-06-18T09:06:00Z' },
  { id: '7', title: 'Groceries & snacks', cat: 'food', payer: 'Meera', date: 'Jun 17', amount: 950, createdAt: '2026-06-18T09:07:00Z' },
]

export const SEED_LOG: LogEntry[] = [
  { who: 'Arjun', kind: 'payment', detail: "Recorded Ananya's split 3 · ₹2,000", time: '2 hrs ago' },
  { who: 'Arjun', kind: 'expense', detail: 'Added Houseboat — Alleppey · ₹8,000', time: '5 hrs ago' },
  { who: 'Arjun', kind: 'edit', detail: 'Edited Munnar homestay · ₹4,200 → ₹4,500', time: 'Yesterday' },
  { who: 'Arjun', kind: 'payment', detail: "Recorded Dev's 1st split · ₹1,000", time: 'Yesterday' },
  { who: 'Arjun', kind: 'expense', detail: 'Added Kovalam shack lunch · ₹1,700', time: '2 days ago' },
  { who: 'Arjun', kind: 'edit', detail: 'Marked Kabir partial · ₹4,000 of ₹5,000', time: '2 days ago' },
  { who: 'Arjun', kind: 'expense', detail: 'Added Cab Kochi → Munnar · ₹3,200', time: '3 days ago' },
]

export const SEED_STOPS: Stop[] = [
  { name: 'Fort Kochi', dates: 'Jun 15 · 1 night', note: 'Chinese fishing nets, café-hopping & a seafood feast to kick things off.', state: 'done', icon: '☀️', temp: '31°', cond: 'Sunny', lat: 9.9658, lng: 76.2421 },
  { name: 'Munnar', dates: 'Jun 16–17 · 2 nights', note: 'Tea plantations, misty hills and the homestay with the killer view.', state: 'done', icon: '🌫️', temp: '21°', cond: 'Misty', lat: 10.0889, lng: 77.0595 },
  { name: 'Alleppey', dates: 'Jun 18 · 1 night', note: 'Overnight houseboat through the backwaters — current stop. 🛶', state: 'current', icon: '⛅', temp: '29°', cond: 'Humid', lat: 9.4981, lng: 76.3388 },
  { name: 'Kovalam', dates: 'Jun 19–20 · 2 nights', note: 'Beach shacks, surfing and lighthouse sunset planned.', state: 'up', icon: '☀️', temp: '30°', cond: 'Sunny', lat: 8.4004, lng: 76.9787 },
  { name: 'Varkala', dates: 'Jun 21 · 1 night', note: 'Cliff cafés and the last big sunset before heading home.', state: 'up', icon: '🌦️', temp: '28°', cond: 'Showers', lat: 8.7379, lng: 76.7163 },
]

export const SEED_MEDIA: MediaItem[] = [
  { id: 'm1', place: 'Munnar', stop: 'munnar', quality: '4K', device: 'iPhone', isVideo: false, ratio: '3/4', c1: '#7ed0a8', c2: '#2e9e6e', thumbPath: null, originalPath: null },
  { id: 'm2', place: 'Fort Kochi', stop: 'kochi', quality: 'HQ', device: 'Android', isVideo: true, ratio: '1/1', c1: '#ffb27a', c2: '#f0795a', thumbPath: null, originalPath: null },
  { id: 'm3', place: 'Alleppey', stop: 'alleppey', quality: '4K', device: 'iPhone', isVideo: false, ratio: '1/1', c1: '#7ad6e0', c2: '#2a93b8', thumbPath: null, originalPath: null },
  { id: 'm4', place: 'Munnar', stop: 'munnar', quality: '4K', device: 'iPhone', isVideo: true, ratio: '3/4', c1: '#9be0b0', c2: '#3a9e7e', thumbPath: null, originalPath: null },
  { id: 'm5', place: 'Alleppey', stop: 'alleppey', quality: 'HQ', device: 'Android', isVideo: false, ratio: '3/4', c1: '#ffd76a', c2: '#f0a83a', thumbPath: null, originalPath: null },
  { id: 'm6', place: 'Kochi', stop: 'kochi', quality: '4K', device: 'iPhone', isVideo: false, ratio: '1/1', c1: '#ff9eb8', c2: '#e85c86', thumbPath: null, originalPath: null },
  { id: 'm7', place: 'Munnar', stop: 'munnar', quality: '4K', device: 'iPhone', isVideo: false, ratio: '1/1', c1: '#86d3a0', c2: '#3a9e72', thumbPath: null, originalPath: null },
  { id: 'm8', place: 'Alleppey', stop: 'alleppey', quality: '4K', device: 'iPhone', isVideo: true, ratio: '3/4', c1: '#8ad0e8', c2: '#3a8ec0', thumbPath: null, originalPath: null },
]

export function seedSnapshot(): TripSnapshot {
  // Deep copies so mutations in the mock repo never touch the source-of-truth arrays.
  return {
    tripName: TRIP_NAME,
    perHeadFee: PER_HEAD_FEE,
    members: SEED_MEMBERS.map((m) => ({ ...m })),
    expenses: SEED_EXPENSES.map((e) => ({ ...e })),
    log: SEED_LOG.map((l) => ({ ...l })),
    stops: SEED_STOPS.map((s) => ({ ...s })),
    media: SEED_MEDIA.map((m) => ({ ...m })),
  }
}
