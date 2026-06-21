import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '../../providers/ThemeProvider'
import { useUI } from '../../providers/UIProvider'
import { useTripRealtime } from '../../hooks/useTripRealtime'
import { BottomNav } from './BottomNav'
import { AddExpenseSheet } from '../sheets/AddExpenseSheet'
import { ActivityLogSheet } from '../sheets/ActivityLogSheet'
import { RecordPaymentSheet } from '../sheets/RecordPaymentSheet'
import styles from './MobileFrame.module.css'

function StatusBar() {
  return (
    <div className={styles.statusBar}>
      <span>9:41</span>
      <div className={styles.statusIcons}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
          <rect x="0" y="6" width="3" height="5" rx="1" />
          <rect x="4.5" y="4" width="3" height="7" rx="1" />
          <rect x="9" y="2" width="3" height="9" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
          <path d="M8 2.6c2 0 3.8.8 5.1 2l1.3-1.4A9.2 9.2 0 0 0 8 .6 9.2 9.2 0 0 0 1.6 3.2L2.9 4.6A7.2 7.2 0 0 1 8 2.6Z" />
          <path d="M8 6.1c1 0 2 .4 2.7 1.1l1.3-1.4A6 6 0 0 0 8 4.1a6 6 0 0 0-4 1.7l1.3 1.4A3.8 3.8 0 0 1 8 6.1Z" />
          <circle cx="8" cy="10" r="1.6" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="21" height="10" rx="3" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
          <rect x="2.8" y="2.8" width="16" height="6.4" rx="1.6" fill="currentColor" />
          <rect x="23" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".5" />
        </svg>
      </div>
    </div>
  )
}

export function MobileFrame() {
  const { theme } = useTheme()
  const { addSheetOpen, logSheetOpen, recordTarget } = useUI()
  useTripRealtime()

  return (
    <div className="app-bg">
      <div className={styles.frame} data-theme={theme}>
        <div className={styles.ambient} aria-hidden="true">
          <div className={`${styles.blob} ${styles.blobSun}`} />
          <div className={`${styles.blob} ${styles.blobPrimary}`} />
          <div className={`${styles.blob} ${styles.blobAccent}`} />
        </div>

        <StatusBar />

        <div className={styles.scroll}>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>

        {addSheetOpen && <AddExpenseSheet />}
        {logSheetOpen && <ActivityLogSheet />}
        {recordTarget && <RecordPaymentSheet target={recordTarget} />}

        <BottomNav />
      </div>
    </div>
  )
}
