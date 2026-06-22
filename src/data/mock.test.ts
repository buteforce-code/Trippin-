import { describe, expect, it } from 'vitest'
import { MockTripRepository } from './mock'

const SEED_TRIP_ID = 'seed-kerala'

describe('MockTripRepository — multi-trip', () => {
  it('seeds one trip (Kerala) the local user route-heads', async () => {
    const repo = new MockTripRepository()
    const trips = await repo.listMyTrips()
    expect(trips).toHaveLength(1)
    expect(trips[0].id).toBe(SEED_TRIP_ID)
    expect(trips[0].name).toBe("Kerala '26")
    expect(trips[0].myRole).toBe('route_head')
    expect(trips[0].myOnboardingComplete).toBe(true)
  })

  it('creates a new trip the caller route-heads and can fetch', async () => {
    const repo = new MockTripRepository()
    const id = await repo.createTrip({ name: "Goa '26", perHead: 4000, nickname: 'Sam' })

    const trips = await repo.listMyTrips()
    expect(trips.map((t) => t.name)).toContain("Goa '26")

    const created = trips.find((t) => t.id === id)
    expect(created?.myRole).toBe('route_head')

    const snapshot = await repo.getSnapshot(id)
    expect(snapshot.tripName).toBe("Goa '26")
    expect(snapshot.perHeadFee).toBe(4000)
    expect(snapshot.members[0].name).toContain('Sam')
  })

  it('scopes writes to the given trip only', async () => {
    const repo = new MockTripRepository()
    const otherId = await repo.createTrip({ name: 'Ladakh', nickname: 'Sam' })

    await repo.addExpense(SEED_TRIP_ID, { amount: 1234, title: 'Test', cat: 'food' })

    const seed = await repo.getSnapshot(SEED_TRIP_ID)
    const other = await repo.getSnapshot(otherId)
    expect(seed.expenses.some((e) => e.amount === 1234)).toBe(true)
    expect(other.expenses).toHaveLength(0)
  })

  it('records a payment against a member in the right trip', async () => {
    const repo = new MockTripRepository()
    const before = await repo.getSnapshot(SEED_TRIP_ID)
    // Member index 7 (Nisha) starts unpaid in the seed.
    const idx = before.members.findIndex((m) => m.paid === 0)
    expect(idx).toBeGreaterThanOrEqual(0)

    await repo.recordPayment(SEED_TRIP_ID, idx)
    const after = await repo.getSnapshot(SEED_TRIP_ID)
    expect(after.members[idx].paid).toBe(before.perHeadFee)
    expect(after.log[0].kind).toBe('payment')
  })

  it('updates the caller own onboarding fields and flips completion', async () => {
    const repo = new MockTripRepository()
    const id = await repo.createTrip({ name: 'Spiti' })

    await repo.updateMyOnboarding({ tripId: id, nickname: 'Kay', priorContributionNote: 'paid 500' })
    const members = await repo.listMembers(id)
    const me = members.find((m) => m.userId === 'local-user')
    expect(me?.nickname).toBe('Kay')
    expect(me?.priorContributionNote).toBe('paid 500')

    const trips = await repo.listMyTrips()
    expect(trips.find((t) => t.id === id)?.myOnboardingComplete).toBe(true)
  })

  it('creates an invite whose token resolves back to the trip', async () => {
    const repo = new MockTripRepository()
    const invite = await repo.createInvite(SEED_TRIP_ID, { role: 'assistant' })
    expect(invite.role).toBe('assistant')
    expect(invite.active).toBe(true)

    const info = await repo.getInviteInfo(invite.token)
    expect(info?.tripId).toBe(SEED_TRIP_ID)
    expect(info?.valid).toBe(true)

    const joinedId = await repo.joinTrip({ token: invite.token })
    expect(joinedId).toBe(SEED_TRIP_ID)
  })

  it('posts and lists announcements pinned-first', async () => {
    const repo = new MockTripRepository()
    await repo.postAnnouncement(SEED_TRIP_ID, { body: 'Plain note' })
    await repo.postAnnouncement(SEED_TRIP_ID, { body: 'Important', pinned: true })

    const list = await repo.listAnnouncements(SEED_TRIP_ID)
    expect(list[0].pinned).toBe(true)
    expect(list.some((a) => a.body === 'Plain note')).toBe(true)
  })
})
