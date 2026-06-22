import { useNavigate } from 'react-router-dom'
import type { ThemeName } from '../../data/types'
import { useTheme } from '../../providers/ThemeProvider'
import { useUI } from '../../providers/UIProvider'
import { useTrip } from '../../providers/TripProvider'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

const SWATCHES: { name: ThemeName; gradient: string }[] = [
  { name: 'lagoon', gradient: 'linear-gradient(135deg,#12C2C2,#FF7A66)' },
  { name: 'sunset', gradient: 'linear-gradient(135deg,#FF8A5B,#FF4D8D)' },
  { name: 'palm', gradient: 'linear-gradient(135deg,#16A571,#FFD23F)' },
]

const ROLE_LABEL: Record<string, string> = {
  route_head: 'Route Head',
  assistant: 'Assistant',
  member: 'Member',
}

interface HomeHeaderProps {
  /** The signed-in member's display name ("you" member) — defaults sensibly. */
  youName?: string
  youInitial?: string
}

export function HomeHeader({ youName = 'Traveller', youInitial = 'T' }: HomeHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { openLogSheet } = useUI()
  const { myRole, currentTrip } = useTrip()
  const navigate = useNavigate()

  const roleLabel = myRole ? ROLE_LABEL[myRole] : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 2px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {/* Avatar + name double as the trip switcher entry point. */}
        <button
          type="button"
          onClick={() => navigate('/trips')}
          aria-label="Switch trip"
          className={`pressable ${focus.ring}`}
          style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
              fontFamily: "'Baloo 2',sans-serif",
              boxShadow: '0 6px 14px var(--shadow)',
            }}
          >
            {youInitial}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, lineHeight: 1 }}>
              {currentTrip?.name ?? 'Namaste 🌴'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", lineHeight: 1 }}>{youName}</span>
              {roleLabel && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '.4px',
                    textTransform: 'uppercase',
                    color: 'var(--primary-d)',
                    background: 'var(--tint)',
                    padding: '3px 7px',
                    borderRadius: 9,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {roleLabel}
                </span>
              )}
            </div>
          </div>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <button
          type="button"
          onClick={openLogSheet}
          className={`pressable ${focus.ring}`}
          aria-label="Open activity log"
          style={{
            position: 'relative',
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
            color: 'var(--primary-d)',
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v5h5" />
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 7,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent)',
              border: '1.5px solid #fff',
            }}
          />
        </button>

        <div style={{ display: 'flex', gap: 6, background: '#fff', padding: 4, borderRadius: 30, boxShadow: '0 3px 12px rgba(11,77,74,.1)' }}>
          {SWATCHES.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setTheme(s.name)}
              aria-label={`${s.name} theme`}
              aria-pressed={theme === s.name}
              className={focus.ringShadow}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '2px solid #fff',
                background: s.gradient,
                cursor: 'pointer',
                padding: 0,
                transition: 'transform var(--dur-fast)',
                outline: `2px solid ${theme === s.name ? 'var(--ink)' : 'transparent'}`,
                outlineOffset: -1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
