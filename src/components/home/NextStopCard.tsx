import { useNavigate } from 'react-router-dom'
import focus from '../ui/focus.module.css'
import type { Stop } from '../../data/types'

interface NextStopCardProps {
  current: Stop | undefined
}

export function NextStopCard({ current }: NextStopCardProps) {
  const navigate = useNavigate()
  if (!current) return null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Currently at ${current.name} Backwaters. Open the trip route.`}
      onClick={() => navigate('/trip')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate('/trip')
        }
      }}
      className={`pressable ${focus.ringOnDark}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        marginTop: 14,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        background: 'linear-gradient(135deg,var(--sun),#FFB627)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        boxShadow: '0 12px 26px rgba(255,180,40,.34)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%', background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent)', animation: 'kshine 4.5s ease-in-out infinite' }} aria-hidden="true" />
      <div style={{ position: 'relative', width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9a6a00" strokeWidth="2.2" style={{ animation: 'kbob 3s ease-in-out infinite' }}>
          <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9a6a00' }}>
          CURRENTLY AT · {current.icon} {current.temp}
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: '#5e4200' }}>
          {current.name} Backwaters
        </div>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5e4200" strokeWidth="2.6" strokeLinecap="round" style={{ position: 'relative' }}>
        <path d="m9 5 7 7-7 7" />
      </svg>
    </div>
  )
}
