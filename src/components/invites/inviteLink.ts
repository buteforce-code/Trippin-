/**
 * Pure helpers for turning an invite token into a shareable link + message.
 * Kept side-effect free so the panel stays declarative and these are easy to
 * reason about.
 */
import { APP_NAME } from '../../lib/brand'
import type { TripInvite } from '../../data/types'

/** Full join URL the recipient taps: `${origin}/join/<token>`. */
export function inviteLink(token: string): string {
  return `${window.location.origin}/join/${token}`
}

/** Friendly invite copy. Trip name is woven in when we have it. */
export function inviteMessage(link: string, tripName?: string): string {
  const where = tripName ? `“${tripName}” on ${APP_NAME}` : `our trip on ${APP_NAME}`
  return `Join ${where} 🌴 — ${link}`
}

/** WhatsApp deep link with the message pre-filled (URL-encoded). */
export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/** Human-readable "3 / 10 used" or "3 used" when uses are unlimited. */
export function inviteUsesLabel(invite: TripInvite): string {
  if (invite.maxUses != null) return `${invite.uses} / ${invite.maxUses} used`
  return invite.uses === 1 ? '1 join' : `${invite.uses} joins`
}
