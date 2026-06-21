/** TanStack Query hooks over the active TripRepository. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MediaItem, NewExpenseInput, TripSnapshot, UploadMediaInput } from '../data/types'
import { tripRepository } from '../data'

const TRIP_KEY = ['trip', 'snapshot'] as const

export function useTripSnapshot() {
  return useQuery<TripSnapshot>({
    queryKey: TRIP_KEY,
    queryFn: () => tripRepository.getSnapshot(),
  })
}

export function useAddExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewExpenseInput) => tripRepository.addExpense(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRIP_KEY }),
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ memberIndex, amount }: { memberIndex: number; amount?: number }) =>
      tripRepository.recordPayment(memberIndex, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRIP_KEY }),
  })
}

export function useUploadMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UploadMediaInput) => tripRepository.uploadMedia(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: TRIP_KEY }),
  })
}

/** Resolves a signed thumbnail URL for a tile (null → tile shows its gradient). */
export function useThumbUrl(item: MediaItem) {
  return useQuery<string | null>({
    queryKey: ['media', 'thumb', item.id, item.thumbPath],
    queryFn: () => tripRepository.getThumbUrl(item),
    enabled: Boolean(item.thumbPath),
    staleTime: 50 * 60 * 1000, // signed URLs last 1h; refetch comfortably before expiry
  })
}
