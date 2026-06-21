/** Static lookup tables — ported verbatim from the prototype (CATS, LOGKIND, THEMES). */
import type { CategoryKey, LogKind, ThemeName } from '../data/types'

export interface CategoryDef {
  label: string
  color: string
  tint: string
  emoji: string
}

export const CATS: Record<CategoryKey, CategoryDef> = {
  stay: { label: 'Stay', color: '#12C2C2', tint: '#D7F5F1', emoji: '🛏️' },
  food: { label: 'Food', color: '#FF7A66', tint: '#FFE3DC', emoji: '🍤' },
  travel: { label: 'Travel', color: '#FFCE3A', tint: '#FFF1CC', emoji: '🚐' },
  activities: { label: 'Activities', color: '#2BB673', tint: '#D6F2E3', emoji: '🎟️' },
  misc: { label: 'Misc', color: '#9B8CFF', tint: '#E7E2FF', emoji: '🛍️' },
}

/** Display order used by the donut, category chips and filters. */
export const CATEGORY_ORDER: CategoryKey[] = ['stay', 'food', 'travel', 'activities', 'misc']

export interface LogKindDef {
  emoji: string
  tag: string
  tint: string
  color: string
}

export const LOGKIND: Record<LogKind, LogKindDef> = {
  expense: { emoji: '🧾', tag: 'Added', tint: '#D7F5F1', color: '#0BA5A5' },
  edit: { emoji: '✏️', tag: 'Edited', tint: '#FFF1CC', color: '#B8860B' },
  payment: { emoji: '💰', tag: 'Payment', tint: '#D6F2E3', color: '#1f9b62' },
}

export const THEME_NAMES: ThemeName[] = ['lagoon', 'sunset', 'palm']
