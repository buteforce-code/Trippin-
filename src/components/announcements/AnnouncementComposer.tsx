import { useState } from 'react'
import { usePostAnnouncement } from '../../hooks/queries'
import { MUTED_TEXT } from '../ui/a11y'
import focus from '../ui/focus.module.css'

interface AnnouncementComposerProps {
  tripId: string | null
}

/** Compose box for Route Head / Assistant: textarea + Pin toggle + Post button. */
export function AnnouncementComposer({ tripId }: AnnouncementComposerProps) {
  const post = usePostAnnouncement(tripId)
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)

  const trimmed = body.trim()
  const canPost = trimmed.length > 0 && !post.isPending

  const handlePost = async () => {
    if (!canPost) return
    await post.mutateAsync({ body: trimmed, pinned })
    setBody('')
    setPinned(false)
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: 'var(--card-shadow)',
        marginBottom: 16,
      }}
    >
      <label
        htmlFor="announcement-body"
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 800,
          color: MUTED_TEXT,
          marginBottom: 9,
          textTransform: 'uppercase',
          letterSpacing: '.4px',
        }}
      >
        Post an announcement
      </label>
      <textarea
        id="announcement-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share an update with the group…"
        rows={3}
        className={focus.ring}
        style={{
          width: '100%',
          border: '1.5px solid #e3efec',
          background: 'var(--bg)',
          borderRadius: 14,
          padding: '13px 15px',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.5,
          color: 'var(--ink)',
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 13 }}>
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          aria-pressed={pinned}
          className={`pressable ${focus.ring}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: pinned ? '1.5px solid var(--primary)' : '1.5px solid #e3efec',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: 12.5,
            padding: '8px 14px',
            borderRadius: 20,
            background: pinned ? 'var(--tint)' : '#fff',
            color: pinned ? 'var(--primary-d)' : MUTED_TEXT,
            transition: 'all var(--dur-fast)',
          }}
        >
          <span aria-hidden="true">📌</span> {pinned ? 'Pinned' : 'Pin'}
        </button>

        <button
          type="button"
          onClick={handlePost}
          disabled={!canPost}
          className={`pressable ${focus.ringOnDark}`}
          style={{
            border: 'none',
            cursor: canPost ? 'pointer' : 'default',
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 800,
            fontSize: 14.5,
            padding: '11px 22px',
            borderRadius: 16,
            color: '#fff',
            background: 'linear-gradient(135deg,var(--primary),var(--primary-d))',
            boxShadow: '0 10px 20px var(--shadow)',
            opacity: canPost ? 1 : 0.5,
          }}
        >
          {post.isPending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
