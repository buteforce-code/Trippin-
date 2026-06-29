import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Expense } from '../data/types'

export interface RecordTarget {
  memberIndex: number
  /** clean member name (no "(you)" suffix), for the sheet heading + log. */
  name: string
  /** rupees still owed by this member (0 → "add extra" mode). */
  owed: number
}

interface UIContextValue {
  addSheetOpen: boolean
  logSheetOpen: boolean
  recordTarget: RecordTarget | null
  /** The expense being edited (Edit Expense sheet), or null. */
  editTarget: Expense | null
  openAddSheet: () => void
  closeAddSheet: () => void
  openLogSheet: () => void
  closeLogSheet: () => void
  openRecordSheet: (target: RecordTarget) => void
  closeRecordSheet: () => void
  openEditSheet: (expense: Expense) => void
  closeEditSheet: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [logSheetOpen, setLogSheetOpen] = useState(false)
  const [recordTarget, setRecordTarget] = useState<RecordTarget | null>(null)
  const [editTarget, setEditTarget] = useState<Expense | null>(null)

  const value = useMemo<UIContextValue>(
    () => ({
      addSheetOpen,
      logSheetOpen,
      recordTarget,
      editTarget,
      openAddSheet: () => setAddSheetOpen(true),
      closeAddSheet: () => setAddSheetOpen(false),
      openLogSheet: () => setLogSheetOpen(true),
      closeLogSheet: () => setLogSheetOpen(false),
      openRecordSheet: (target: RecordTarget) => setRecordTarget(target),
      closeRecordSheet: () => setRecordTarget(null),
      openEditSheet: (expense: Expense) => setEditTarget(expense),
      closeEditSheet: () => setEditTarget(null),
    }),
    [addSheetOpen, logSheetOpen, recordTarget, editTarget],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUI(): UIContextValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
