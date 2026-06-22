/**
 * Friendly empty state for a trip with no stops yet. Editors get the Add CTA;
 * members see a read-only "nothing planned yet" message.
 */
import { MUTED_TEXT } from '../ui/a11y'
import { AddDestinationButton } from './AddDestinationButton'

interface ItineraryEmptyStateProps {
  canEdit: boolean
  onAdd: () => void
}

export function ItineraryEmptyState({ canEdit, onAdd }: ItineraryEmptyStateProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '32px 24px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(11,77,74,.05)',
      }}
    >
      <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 10 }} aria-hidden="true">🗺️</div>
      <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Baloo 2',sans-serif", color: 'var(--ink)' }}>
        No destinations yet
      </div>
      <div style={{ fontSize: 13, color: MUTED_TEXT, fontWeight: 600, margin: '6px 0 18px', lineHeight: 1.45 }}>
        {canEdit
          ? 'Add your first stop to start building the route, weather and itinerary.'
          : 'The route head hasn’t added any stops yet. Check back soon.'}
      </div>
      {canEdit && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AddDestinationButton onClick={onAdd} variant="solid" />
        </div>
      )}
    </div>
  )
}
