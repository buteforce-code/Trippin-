/**
 * Add / edit a single itinerary stop. Reuses the brand bottom-sheet
 * (`SheetShell`) and feeds a `StopDraft` back to `useItinerary`.
 *
 * The snapshot `Stop` carries the UI-level state (`'up'`); this editor works in
 * DB-level state (`'upcoming'`) so its draft can be written straight through.
 */
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { SheetShell } from '../sheets/SheetShell'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'
import type { Stop } from '../../data/types'
import type { StopDbState, StopDraft } from '../../hooks/useItinerary'

const LABEL_STYLE: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: MUTED_TEXT,
  marginBottom: 9,
  textTransform: 'uppercase',
  letterSpacing: '.4px',
}

const INPUT_STYLE: CSSProperties = {
  width: '100%',
  border: '1.5px solid #e3efec',
  background: 'var(--bg)',
  borderRadius: 14,
  padding: '13px 15px',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--ink)',
  boxSizing: 'border-box',
}

const STATE_OPTIONS: { value: StopDbState; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'current', label: 'Now' },
  { value: 'done', label: 'Visited' },
]

interface StopEditorSheetProps {
  /** Existing stop (edit mode) or null (add mode). */
  stop: Stop | null
  saving: boolean
  onClose: () => void
  onSubmit: (draft: StopDraft) => void
}

/** UI-level state (`'up'`) → DB-level state (`'upcoming'`). */
function toDbState(state: Stop['state']): StopDbState {
  return state === 'up' ? 'upcoming' : state
}

function parseNumberOrNull(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

export function StopEditorSheet({ stop, saving, onClose, onSubmit }: StopEditorSheetProps) {
  const isEdit = stop !== null
  const [name, setName] = useState(stop?.name ?? '')
  const [dateLabel, setDateLabel] = useState(stop?.dates ?? '')
  const [nights, setNights] = useState('')
  const [note, setNote] = useState(stop?.note ?? '')
  const [state, setState] = useState<StopDbState>(stop ? toDbState(stop.state) : 'upcoming')
  const [icon, setIcon] = useState(stop?.icon ?? '')
  const [temp, setTemp] = useState(stop?.temp ?? '')
  const [cond, setCond] = useState(stop?.cond ?? '')
  const [lat, setLat] = useState(stop?.lat != null ? String(stop.lat) : '')
  const [lng, setLng] = useState(stop?.lng != null ? String(stop.lng) : '')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Give the destination a name.')
      return
    }
    onSubmit({
      name: trimmedName,
      dateLabel: dateLabel.trim(),
      nights: parseNumberOrNull(nights),
      note: note.trim(),
      state,
      lat: parseNumberOrNull(lat),
      lng: parseNumberOrNull(lng),
      weatherIcon: icon.trim() || null,
      temp: temp.trim() || null,
      condition: cond.trim() || null,
    })
  }

  return (
    <SheetShell onClose={onClose} ariaLabel={isEdit ? 'Edit destination' : 'Add destination'}>
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", marginBottom: 4 }}>
        {isEdit ? 'Edit destination' : 'Add destination'}
      </div>
      <div style={{ fontSize: 12.5, color: MUTED_TEXT, fontWeight: 600, marginBottom: 16 }}>
        Stops show up on the route map, weather strip and itinerary
      </div>

      <div style={LABEL_STYLE}>Destination name</div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Munnar"
        aria-label="Destination name"
        className={focus.ring}
        style={{ ...INPUT_STYLE, marginBottom: 18 }}
      />

      <div style={LABEL_STYLE}>When</div>
      <input
        value={dateLabel}
        onChange={(e) => setDateLabel(e.target.value)}
        placeholder="e.g. Jun 18 · 1 night"
        aria-label="Date label"
        className={focus.ring}
        style={{ ...INPUT_STYLE, marginBottom: 18 }}
      />

      <div style={LABEL_STYLE}>Nights</div>
      <input
        value={nights}
        onChange={(e) => setNights(e.target.value)}
        inputMode="numeric"
        placeholder="e.g. 2"
        aria-label="Number of nights"
        className={focus.ring}
        style={{ ...INPUT_STYLE, marginBottom: 18 }}
      />

      <div style={LABEL_STYLE}>Status</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {STATE_OPTIONS.map((opt) => {
          const active = state === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setState(opt.value)}
              aria-pressed={active}
              className={`pressable ${focus.ring}`}
              style={{
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                padding: '9px 16px',
                borderRadius: 16,
                transition: 'all .18s',
                background: active ? 'var(--primary)' : 'var(--tint)',
                color: active ? '#fff' : 'var(--ink)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div style={LABEL_STYLE}>Note</div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What's the plan here?"
        aria-label="Note"
        rows={2}
        className={focus.ring}
        style={{ ...INPUT_STYLE, marginBottom: 18, resize: 'vertical', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
      />

      <div style={LABEL_STYLE}>Weather (optional)</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="☀️"
          aria-label="Weather icon"
          className={focus.ring}
          style={{ ...INPUT_STYLE, width: 70, textAlign: 'center' }}
        />
        <input
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          placeholder="29°"
          aria-label="Temperature"
          className={focus.ring}
          style={{ ...INPUT_STYLE, flex: 1 }}
        />
        <input
          value={cond}
          onChange={(e) => setCond(e.target.value)}
          placeholder="Sunny"
          aria-label="Condition"
          className={focus.ring}
          style={{ ...INPUT_STYLE, flex: 1 }}
        />
      </div>

      <div style={LABEL_STYLE}>Map coordinates (optional)</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: error ? 12 : 20 }}>
        <input
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          inputMode="decimal"
          placeholder="Latitude"
          aria-label="Latitude"
          className={focus.ring}
          style={{ ...INPUT_STYLE, flex: 1 }}
        />
        <input
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          inputMode="decimal"
          placeholder="Longitude"
          aria-label="Longitude"
          className={focus.ring}
          style={{ ...INPUT_STYLE, flex: 1 }}
        />
      </div>

      {error && (
        <div role="alert" style={{ fontSize: 12.5, fontWeight: 700, color: '#c0392b', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving}
        className={`pressable ${focus.ringOnDark}`}
        style={{
          width: '100%',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Baloo 2',sans-serif",
          fontWeight: 800,
          fontSize: 16,
          padding: 16,
          borderRadius: 18,
          color: '#fff',
          background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
          boxShadow: '0 12px 24px var(--shadow)',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add destination'}
      </button>
    </SheetShell>
  )
}
