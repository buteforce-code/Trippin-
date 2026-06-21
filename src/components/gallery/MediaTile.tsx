import type { MediaItem } from '../../data/types'
import { useThumbUrl } from '../../hooks/queries'
import { tripRepository } from '../../data'
import focus from '../ui/focus.module.css'

interface MediaTileProps {
  item: MediaItem
}

const OVERLAY = 'radial-gradient(120% 80% at 70% 10%, rgba(255,255,255,.35), transparent 60%)'

export function MediaTile({ item }: MediaTileProps) {
  const deviceBg = item.device === 'iPhone' ? 'rgba(20,20,30,.55)' : 'rgba(60,150,90,.7)'
  const { data: thumbUrl } = useThumbUrl(item)

  const handleDownload = async () => {
    const url = await tripRepository.getOriginalUrl(item)
    if (url) window.open(url, '_blank', 'noopener')
  }

  return (
    <div
      style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: item.ratio, background: `linear-gradient(150deg, ${item.c1}, ${item.c2})`, boxShadow: '0 6px 16px rgba(11,77,74,.1)' }}
    >
      {thumbUrl ? (
        <img src={thumbUrl} alt={item.place} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: OVERLAY }} aria-hidden="true" />
      )}

      <div style={{ position: 'absolute', top: 9, left: 9, display: 'flex', gap: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 10, background: 'rgba(0,0,0,.42)', color: '#fff', backdropFilter: 'blur(4px)' }}>{item.quality}</span>
        <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 10, background: deviceBg, color: '#fff' }}>{item.device}</span>
      </div>

      {item.isVideo && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.2)', animation: 'kfloat 3.5s ease-in-out infinite' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--ink)" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '18px 11px 9px', background: 'linear-gradient(transparent,rgba(0,0,0,.5))', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: "'Baloo 2',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{item.place}</span>
        <button
          type="button"
          onClick={handleDownload}
          aria-label={`Download original from ${item.place}`}
          className={focus.ringOnDark}
          style={{ width: 27, height: 27, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flex: 'none' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 4v12M7 11l5 5 5-5" />
            <path d="M5 20h14" />
          </svg>
        </button>
      </div>
    </div>
  )
}
