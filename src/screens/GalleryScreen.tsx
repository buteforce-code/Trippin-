import { useRef, useState } from 'react'
import { useTripSnapshot, useUploadMedia } from '../hooks/queries'
import { useCountUp } from '../hooks/useCountUp'
import { MediaTile } from '../components/gallery/MediaTile'
import { FilterChips, type FilterChip } from '../components/ui/FilterChips'
import { MUTED_TEXT } from '../components/ui/a11y'
import focus from '../components/ui/focus.module.css'

const GALLERY_FILTERS: FilterChip[] = [
  { key: 'all', label: 'All' },
  { key: 'kochi', label: 'Kochi' },
  { key: 'munnar', label: 'Munnar' },
  { key: 'alleppey', label: 'Alleppey' },
]

export function GalleryScreen() {
  const { data } = useTripSnapshot()
  const uploadMedia = useUploadMedia()
  const t = useCountUp()
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!data) return null

  const visibleMedia = data.media.filter((m) => filter === 'all' || m.stop === filter)
  const mediaCount = Math.round(data.media.length * t)

  const onFiles = async (fileList: FileList | null) => {
    const files = fileList ? Array.from(fileList) : []
    if (!files.length) return
    setError(null)
    try {
      await uploadMedia.mutateAsync({ files, stopKey: filter === 'all' ? null : filter })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 2px 12px' }}>
        <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>Gallery</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: MUTED_TEXT }}>{mediaCount} items</div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMedia.isPending}
        className={`pressable ${focus.ringOnDark}`}
        style={{ width: '100%', textAlign: 'left', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 11, border: 'none', cursor: uploadMedia.isPending ? 'default' : 'pointer', background: 'linear-gradient(135deg,var(--primary),var(--primary-d))', borderRadius: 18, padding: '13px 16px', color: '#fff', boxShadow: '0 12px 26px var(--shadow)' }}
      >
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '46%', background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.22),transparent)', animation: 'kshine 4.5s ease-in-out infinite' }} aria-hidden="true" />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" style={{ position: 'relative', animation: uploadMedia.isPending ? 'kspin 1s linear infinite' : 'kfloat 3s ease-in-out infinite' }} aria-hidden="true">
          <path d="M12 16V4M8 8l4-4 4 4" />
          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>
            {uploadMedia.isPending ? 'Uploading originals…' : 'Upload to shared bucket'}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.92 }}>Originals kept — iPhone 4K &amp; Android HQ, no compression</div>
        </div>
      </button>
      <div role="status" aria-live="polite">
        {error && (
          <div style={{ fontSize: 11.5, color: '#d14328', fontWeight: 700, marginTop: 8 }}>{error}</div>
        )}
      </div>

      <FilterChips chips={GALLERY_FILTERS} active={filter} onSelect={setFilter} activeBg="var(--primary)" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {visibleMedia.map((m, i) => (
          <MediaTile key={i} item={m} />
        ))}
      </div>
    </div>
  )
}
