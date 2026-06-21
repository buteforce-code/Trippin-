/**
 * Shared accessibility constants.
 *
 * `MUTED_TEXT` is a slightly deeper version of the brand `--muted` teal
 * (#5C8A85). The token value only reaches ~3.4:1 contrast on white and the
 * pastel `--tint` surfaces, which fails WCAG 2.2 AA (1.4.3) for the small
 * 9–13px secondary text it is used for. #46726E keeps the same hue but clears
 * 4.5:1 on white and stays ≥4.4:1 on every theme tint. Use it for small muted
 * copy; the brand `var(--muted)` is fine for large/decorative use.
 */
export const MUTED_TEXT = '#46726e'
