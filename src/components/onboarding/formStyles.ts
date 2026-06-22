/**
 * Shared inline styles for the trip onboarding/setup screens (Create, Join,
 * Onboarding, Trips). Keeps the brand language (Baloo 2 headings, pastel teal
 * surfaces, rounded cards) consistent without repeating literals per screen.
 */
import { MUTED_TEXT } from '../ui/a11y'

export const screenWrap = {
  width: 'min(100%, var(--frame-max))',
  minHeight: '100dvh',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 28px',
  color: 'var(--ink)',
  boxSizing: 'border-box',
} as const

export const card = {
  background: '#fff',
  borderRadius: 'var(--radius-lg)',
  padding: '22px 20px',
  boxShadow: 'var(--card-shadow)',
} as const

export const label = {
  fontSize: 12,
  fontWeight: 800,
  color: MUTED_TEXT,
  textTransform: 'uppercase',
  letterSpacing: '.4px',
} as const

export const input = {
  width: '100%',
  marginTop: 8,
  border: '1.5px solid #e3efec',
  background: 'var(--bg)',
  borderRadius: 14,
  padding: '13px 15px',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ink)',
  boxSizing: 'border-box',
} as const

export const primaryBtn = {
  width: '100%',
  marginTop: 16,
  border: 'none',
  cursor: 'pointer',
  fontFamily: "'Baloo 2',sans-serif",
  fontWeight: 800,
  fontSize: 16,
  padding: 15,
  borderRadius: 16,
  color: '#fff',
  background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
  boxShadow: '0 12px 24px var(--shadow)',
} as const

export const heading = {
  fontSize: 26,
  fontWeight: 800,
  fontFamily: "'Baloo 2',sans-serif",
  lineHeight: 1.1,
} as const

export const subtle = {
  fontSize: 13,
  fontWeight: 600,
  color: MUTED_TEXT,
  marginTop: 6,
  lineHeight: 1.4,
} as const

export const errorText = {
  fontSize: 12,
  color: '#d14328',
  fontWeight: 700,
  marginTop: 8,
} as const
