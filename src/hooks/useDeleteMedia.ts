import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { MediaItem } from '../data/types'
import { supabase } from '../lib/supabase'

const ORIGINALS_BUCKET = 'media-originals'
const THUMBS_BUCKET = 'media-thumbnails'

/**
 * Delete a gallery media item — both storage objects (original + thumbnail) and
 * the DB row — then refresh the trip snapshot so the gallery drops the tile.
 *
 * Storage paths are nullable for seed placeholders, so each `remove()` is guarded
 * and skipped when its path is absent. RLS already restricts deletes to the
 * Route Head (or the original uploader); this hook simply issues the calls.
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: MediaItem): Promise<void> => {
      if (item.originalPath) {
        const { error } = await supabase.storage.from(ORIGINALS_BUCKET).remove([item.originalPath])
        if (error) throw error
      }
      if (item.thumbPath) {
        const { error } = await supabase.storage.from(THUMBS_BUCKET).remove([item.thumbPath])
        if (error) throw error
      }

      const { error } = await supabase.from('media').delete().eq('id', item.id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trip', 'snapshot'] })
    },
  })
}
