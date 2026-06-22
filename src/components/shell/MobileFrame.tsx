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

export function MobileFrame() {
  const { theme } = useTheme()
  const { addSheetOpen, logSheetOpen, recordTarget } = useUI()
  useTripRealtime()

  return (
    <div className="app-bg">
      {/* paddingTop clears the device status bar / notch when installed as a PWA */}
      <div className={styles.frame} data-theme={theme} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className={styles.ambient} aria-hidden="true">
          <div className={`${styles.blob} ${styles.blobSun}`} />
          <div className={`${styles.blob} ${styles.blobPrimary}`} />
          <div className={`${styles.blob} ${styles.blobAccent}`} />
        </div>

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
