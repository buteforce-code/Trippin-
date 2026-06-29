import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '../../providers/ThemeProvider'
import { useUI } from '../../providers/UIProvider'
import { useTrip } from '../../providers/TripProvider'
import { useTripRealtime } from '../../hooks/useTripRealtime'
import { BottomNav } from './BottomNav'
import { AddExpenseSheet } from '../sheets/AddExpenseSheet'
import { ActivityLogSheet } from '../sheets/ActivityLogSheet'
import { RecordPaymentSheet } from '../sheets/RecordPaymentSheet'
import { EditExpenseSheet } from '../sheets/EditExpenseSheet'
import styles from './MobileFrame.module.css'

export function MobileFrame() {
  const { theme } = useTheme()
  const { addSheetOpen, logSheetOpen, recordTarget, editTarget } = useUI()
  const { canEditMoney } = useTrip()
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

        {/* Money-editing sheets are gated to route_head + assistant; the log is read-only for all. */}
        {addSheetOpen && canEditMoney && <AddExpenseSheet />}
        {logSheetOpen && <ActivityLogSheet />}
        {recordTarget && canEditMoney && <RecordPaymentSheet target={recordTarget} />}
        {editTarget && canEditMoney && <EditExpenseSheet expense={editTarget} />}

        <BottomNav />
      </div>
    </div>
  )
}
