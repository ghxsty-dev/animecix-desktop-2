import { loadSavedQuality } from '../hooks/useQualityPersistence';

/**
 * The quality height the player is going to ask for once it is ready, or null
 * when the viewer has never picked one.
 *
 * useQualityPersistence restores the stored quality as soon as the new sources
 * are in. If that quality is not the source already loading, restoring it swaps
 * `video.src` and the browser aborts the request in flight — which leaves the
 * element with metadata, an empty buffer and NETWORK_IDLE, and a `play()`
 * promise that never settles. Leading the source list with this height makes
 * the restore a no-op instead of a second load.
 *
 * Vidstack's own `tau-video` key is deliberately not read: it may still hold a
 * quality from before PlayerStorage stopped writing it.
 */
export function readPreferredQualityHeight(): number | null {
  return loadSavedQuality()?.height ?? null;
}
