import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

/**
 * Live updates: when money, log, or media rows change in Postgres, invalidate the
 * trip query so every signed-in device re-renders. No-op without Supabase (mock mode).
 */
export function useTripRealtime() {
  const qc = useQueryClient()

  useEffect(() => {
    const client = supabase
    if (!client) return
    // Prefix match: invalidates every trip-scoped snapshot regardless of trip id.
    const invalidate = () => qc.invalidateQueries({ queryKey: ['trip', 'snapshot'] })

    const channel = client
      .channel('trip-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, invalidate)
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [qc])
}
