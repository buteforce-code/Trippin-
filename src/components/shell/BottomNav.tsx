import { useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useUI } from '../../providers/UIProvider'
import { useTrip } from '../../providers/TripProvider'
import styles from './BottomNav.module.css'

const ACTIVE = 'var(--primary-d)'
const INACTIVE = '#9fb6b2'
const DOT_ACTIVE = 'var(--accent)'

interface TabDef {
  path: string
  label: string
  icon: ReactNode
}

const HomeIcon = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
)
const MoneyIcon = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="13" rx="3" />
    <path d="M3 10h18M16.5 14.5h.5" />
  </svg>
)
const TripIcon = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
    <path d="M9 3v15M15 6v15" />
  </svg>
)
const GalleryIcon = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8.5" cy="9.5" r="1.8" />
    <path d="m4 18 5-5 4 3 3-3 4 4" />
  </svg>
)

const LEFT_TABS: TabDef[] = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/money', label: 'Money', icon: MoneyIcon },
]
const RIGHT_TABS: TabDef[] = [
  { path: '/trip', label: 'Trip', icon: TripIcon },
  { path: '/gallery', label: 'Gallery', icon: GalleryIcon },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { openAddSheet } = useUI()
  const { canEditMoney } = useTrip()

  const renderTab = ({ path, label, icon }: TabDef) => {
    const active = pathname === path
    return (
      <button
        key={path}
        type="button"
        onClick={() => navigate(path)}
        className={styles.tab}
        style={{ color: active ? ACTIVE : INACTIVE }}
        aria-current={active ? 'page' : undefined}
      >
        {icon}
        <span>{label}</span>
        <span className={styles.dot} style={{ background: active ? DOT_ACTIVE : 'transparent' }} />
      </button>
    )
  }

  return (
    <nav className={styles.nav} aria-label="Primary">
      {LEFT_TABS.map(renderTab)}
      <div className={styles.centerSlot}>
        {/* Add expense is an edit affordance — route_head + assistant only.
            Members keep the layout (spacer) but see read-only money. */}
        {canEditMoney && (
          <button type="button" onClick={openAddSheet} className={styles.addBtn} aria-label="Add expense">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </div>
      {RIGHT_TABS.map(renderTab)}
    </nav>
  )
}
