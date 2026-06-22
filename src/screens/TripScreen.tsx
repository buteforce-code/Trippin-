import { useState } from 'react'
import { useTripSnapshot } from '../hooks/queries'
import { useLiveWeather } from '../hooks/useLiveWeather'
import { useTrip } from '../providers/TripProvider'
import { useItinerary } from '../hooks/useItinerary'
import type { StopDraft } from '../hooks/useItinerary'
import { RouteMap } from '../components/trip/RouteMap'
import { StopEditorSheet } from '../components/trip/StopEditorSheet'
import { AddDestinationButton } from '../components/trip/AddDestinationButton'
import { ItineraryEmptyState } from '../components/trip/ItineraryEmptyState'
import { MUTED_TEXT } from '../components/ui/a11y'
import focus from '../components/ui/focus.module.css'
import type { Stop, StopState } from '../data/types'

interface StopStyling {
  dot: string
  badge: string
  badgeBg: string
  badgeColor: string
  border: string
}

/** Which stop the editor is targeting: `'new'`, an array index, or closed (null). */
type EditorTarget = 'new' | number | null

function stopStyling(state: StopState): StopStyling {
  if (state === 'done') return { dot: '#2BB673', badge: 'Visited', badgeBg: '#D6F2E3', badgeColor: '#1f9b62', border: 'transparent' }
  if (state === 'current') return { dot: 'var(--accent)', badge: 'Now', badgeBg: 'var(--accent)', badgeColor: '#fff', border: 'var(--accent)' }
  return { dot: '#cdddd9', badge: 'Upcoming', badgeBg: '#eef4f2', badgeColor: '#7c948f', border: 'transparent' }
}

function timelineLineColor(state: StopState, isLast: boolean): string {
  if (isLast) return 'transparent'
  return state === 'done' ? '#9fdcbf' : '#dbe8e5'
}

const SECTION_TITLE = { fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" } as const

export function TripScreen() {
  const { data } = useTripSnapshot()
  const { data: live } = useLiveWeather()
  const { canEditMoney } = useTrip()
  const { addStop, updateStop, removeStop } = useItinerary()

  const [editorTarget, setEditorTarget] = useState<EditorTarget>(null)
  const [saving, setSaving] = useState(false)
  const [removingIndex, setRemovingIndex] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const title = <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", padding: '8px 2px 14px' }}>Our route</div>
  if (!data) return <div>{title}</div>

  // Overlay live weather when available; otherwise keep the seeded static values.
  const stops: Stop[] = data.stops.map((s) => {
    const w = live?.get(s.name)
    return w && w.icon ? { ...s, icon: w.icon, temp: w.temp ?? s.temp, cond: w.cond ?? s.cond } : s
  })

  const hasStops = stops.length > 0
  const editingStop = typeof editorTarget === 'number' ? stops[editorTarget] ?? null : null

  const handleSubmit = async (draft: StopDraft) => {
    setSaving(true)
    setErrorMsg('')
    try {
      if (editorTarget === 'new') await addStop(draft)
      else if (typeof editorTarget === 'number') await updateStop(editorTarget, draft)
      setEditorTarget(null)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save the destination.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (index: number) => {
    setRemovingIndex(index)
    setErrorMsg('')
    try {
      await removeStop(index)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not remove the destination.')
    } finally {
      setRemovingIndex(null)
    }
  }

  return (
    <div>
      {title}
      <RouteMap stops={stops} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 2px 10px' }}>
        <div style={SECTION_TITLE}>Weather forecast</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED_TEXT }}>{stops.length} stops</div>
      </div>

      {hasStops ? (
        <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 2 }}>
          {stops.map((s, i) => {
            const isCurrent = s.state === 'current'
            return (
              <div
                key={i}
                style={{
                  flex: 'none',
                  width: 74,
                  background: isCurrent ? 'var(--tint)' : '#fff',
                  borderRadius: 16,
                  padding: '11px 8px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(11,77,74,.05)',
                  border: `1.5px solid ${isCurrent ? 'var(--primary)' : 'transparent'}`,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: isCurrent ? 'var(--primary-d)' : 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.name.replace('Fort ', '')}
                </div>
                <div style={{ fontSize: 22, margin: '4px 0', lineHeight: 1 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)' }}>{s.temp}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: MUTED_TEXT, whiteSpace: 'nowrap' }}>{s.cond}</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ fontSize: 12.5, color: MUTED_TEXT, fontWeight: 600, padding: '4px 2px' }}>
          Weather appears once you add destinations.
        </div>
      )}

      <div style={{ ...SECTION_TITLE, margin: '20px 2px 12px' }}>Itinerary</div>

      {errorMsg && (
        <div role="alert" style={{ fontSize: 12.5, fontWeight: 700, color: '#c0392b', margin: '0 2px 12px' }}>
          {errorMsg}
        </div>
      )}

      {hasStops ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stops.map((s, i) => (
              <ItineraryRow
                key={i}
                stop={s}
                isLast={i === stops.length - 1}
                canEdit={canEditMoney}
                removing={removingIndex === i}
                onEdit={() => setEditorTarget(i)}
                onRemove={() => handleRemove(i)}
              />
            ))}
          </div>
          {canEditMoney && <AddDestinationButton onClick={() => setEditorTarget('new')} variant="ghost" />}
        </>
      ) : (
        <ItineraryEmptyState canEdit={canEditMoney} onAdd={() => setEditorTarget('new')} />
      )}

      {editorTarget !== null && (
        <StopEditorSheet
          stop={editingStop}
          saving={saving}
          onClose={() => setEditorTarget(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

interface ItineraryRowProps {
  stop: Stop
  isLast: boolean
  canEdit: boolean
  removing: boolean
  onEdit: () => void
  onRemove: () => void
}

function ItineraryRow({ stop, isLast, canEdit, removing, onEdit, onRemove }: ItineraryRowProps) {
  const st = stopStyling(stop.state)
  const lineColor = timelineLineColor(stop.state, isLast)

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flex: 'none' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: st.dot, border: '3px solid #fff', boxShadow: `0 0 0 2px ${st.dot}`, marginTop: 4 }} />
        <div style={{ width: 3, flex: 1, background: lineColor, borderRadius: 2, minHeight: 34 }} />
      </div>
      <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: '14px 16px', marginBottom: 12, boxShadow: '0 4px 12px rgba(11,77,74,.05)', border: `1.5px solid ${st.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif" }}>{stop.name}</div>
          <div style={{ fontSize: 10.5, fontWeight: 800, padding: '4px 9px', borderRadius: 14, background: st.badgeBg, color: st.badgeColor }}>{st.badge}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 3 }}>
          <div style={{ fontSize: 12, color: MUTED_TEXT, fontWeight: 600 }}>{stop.dates}</div>
          {(stop.icon || stop.temp) && (
            <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED_TEXT }}>· {stop.icon} {stop.temp}</div>
          )}
        </div>
        {stop.note && <div style={{ fontSize: 12.5, marginTop: 7, lineHeight: 1.4 }}>{stop.note}</div>}

        {canEdit && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              type="button"
              onClick={onEdit}
              disabled={removing}
              className={`pressable ${focus.ring}`}
              style={{
                cursor: 'pointer',
                border: '1.5px solid #e3efec',
                background: 'var(--bg)',
                color: 'var(--primary-d)',
                fontWeight: 800,
                fontSize: 12.5,
                padding: '7px 14px',
                borderRadius: 12,
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              aria-label={`Remove ${stop.name}`}
              className={`pressable ${focus.ring}`}
              style={{
                cursor: 'pointer',
                border: '1.5px solid #f3dcd8',
                background: '#fdf1ef',
                color: '#c0392b',
                fontWeight: 800,
                fontSize: 12.5,
                padding: '7px 14px',
                borderRadius: 12,
                opacity: removing ? 0.6 : 1,
              }}
            >
              {removing ? 'Removing…' : 'Remove'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
