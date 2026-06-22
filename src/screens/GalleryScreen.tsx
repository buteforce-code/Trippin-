import { useRef, useState } from 'react'
import { useTripSnapshot, useUploadMedia } from '../hooks/queries'
import { useCountUp } from '../hooks/useCountUp'
import { MediaTile } from '../components/gallery/MediaTile'
import { CameraCapture } from '../components/gallery/CameraCapture'
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
  const [cameraOpen, setCameraOpen] = useState(false)
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
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          aria-label="Capture an Instant with the camera"
          className={`pressable ${focus.ring}`}
          style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3 / 4', border: 'none', cursor: 'pointer', borderRadius: 18, padding: 0, color: '#fff', background: 'linear-gradient(150deg,var(--primary),var(--accent))', boxShadow: '0 10px 22px var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 }}
        >
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '46%', background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.22),transparent)', animation: 'kshine 4.5s ease-in-out infinite' }} aria-hidden="true" />
          <div style={{ position: 'relative', width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(0,0,0,.18)', animation: 'kfloat 3s ease-in-out infinite' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary-d)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h5l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
              <circle cx="12" cy="12.5" r="3.2" />
            </svg>
          </div>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>Capture</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.92 }}>Snap an Instant</div>
          </div>
        </button>

        {visibleMedia.map((m) => (
          <MediaTile key={m.id} item={m} />
        ))}
      </div>

      {cameraOpen && (
        <CameraCapture onClose={() => setCameraOpen(false)} stopKey={filter === 'all' ? null : filter} />
      )}
    </div>
  )
}
