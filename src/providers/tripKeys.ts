/** Shared query-key constant for the user's trip list.
 *
 * Kept in its own module (not in TripProvider.tsx) so the provider file only
 * exports components/hooks — required for React Fast Refresh.
 */
export const MY_TRIPS_KEY = ['trips', 'mine'] as const
