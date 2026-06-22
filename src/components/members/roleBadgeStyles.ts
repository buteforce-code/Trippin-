/**
 * Role badge presentation shared by the roster and trip switcher. On-brand
 * pastel chips: teal for the Route Head (matches `--primary-d`), warm amber for
 * Assistants, neutral teal-grey for plain Members.
 */
import type { MemberRole } from '../../data/types'

export interface RoleBadgeStyle {
  label: string
  bg: string
  color: string
}

export const ROLE_BADGE: Record<MemberRole, RoleBadgeStyle> = {
  route_head: { label: 'Route Head', bg: '#D7F5F1', color: '#0BA5A5' },
  assistant: { label: 'Assistant', bg: '#FFF1CC', color: '#B8860B' },
  member: { label: 'Member', bg: '#eef4f2', color: '#46726e' },
}

/** Ascending privilege order. Index lets us compute promote/demote targets. */
export const ROLE_ORDER: MemberRole[] = ['member', 'assistant', 'route_head']
