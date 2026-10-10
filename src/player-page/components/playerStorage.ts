import { LocalMediaStorage } from '@vidstack/react';

/** localStorage key Vidstack keeps volume, speed, captions and time under. */
const PLAYER_STORAGE_KEY = 'tau-video';

type OnChangeArgs = Parameters<LocalMediaStorage['onChange']>;
type StoredQuality = Awaited<ReturnType<LocalMediaStorage['getVideoQuality']>>;

/**
 * Vidstack's local storage with video quality left out.
 *
 * WHY: Vidstack re-applies its stored quality on every `canPlay`, and `canPlay`
 * fires again after every MP4 quality switch because a switch loads a new file.
 * It only stores a pick when it can see the click behind it, which our quality
 * menu never handed over, so what it re-applied was a stale value: choosing
 * 1080p loaded 1080p and then snapped straight back to an old 480p. The same
 * restore would also undo useQualityGuard's revert of a failed switch and
 * ping-pong between the two. Quality is persisted by useQualityPersistence
 * instead, and applied once per episode.
 */
export class PlayerStorage extends LocalMediaStorage {
  override async getVideoQuality(): Promise<StoredQuality> {
    return null;
  }

  override async setVideoQuality(): Promise<void> {
    // Intentionally not stored — see the class comment.
  }

  // Passing an instance instead of a key string makes Vidstack fall back to the
  // "vds-player" key, which would drop every viewer's saved volume and speed.
  override onChange(src: OnChangeArgs[0], mediaId: OnChangeArgs[1]) {
    super.onChange(src, mediaId, PLAYER_STORAGE_KEY);
  }
}
