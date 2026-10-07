import { Menu, useMediaContext, useMediaState } from '@vidstack/react';
import { OdometerIcon } from '@vidstack/react/icons';
import { SettingsRadioGroup, SettingsRowButton, t } from './GlassMenu';

// The range form's fields are optional because the expansion below supplies
// defaults for each of them.
type PlaybackRates = number[] | { min?: number; max?: number; step?: number };

/**
 * The speeds offered in the Hız submenu, in 0.25 steps up to 4x.
 *
 * Passed to the layout's playbackRates prop, which is where the menu reads them
 * from. Kept as a named constant (and covered by a test) because an earlier
 * revision quietly trimmed the list at 2x, which removed the fast-watch speeds
 * people actually use without anything failing.
 */
export const PLAYBACK_RATES = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4,
];

/**
 * Resolves the discrete selectable speeds from the layout playbackRates config.
 * Arrays are used verbatim; { min, max, step } ranges are expanded into a list.
 */
export function getSpeedOptions(rates: PlaybackRates | undefined): number[] {
  // The layout context types playbackRates as optional; falling back to the
  // configured list keeps the menu from rendering empty if it is ever missing.
  if (!rates) return PLAYBACK_RATES;
  if (Array.isArray(rates)) return rates;
  const { min = 0, max = 2, step = 0.25 } = rates;
  const options: number[] = [];
  for (let rate = min; rate <= max + 1e-9; rate += step) {
    options.push(Math.round(rate * 100) / 100);
  }
  return options;
}

/**
 * Formats the playback rate for display ("1.5x"), rounding away float noise
 * (e.g. 1.7500000000000002 → "1.75x"). 1x is shown as "Normal".
 */
export function formatSpeedValue(playbackRate: number, normalWord: string): string {
  if (playbackRate === 1) return normalWord;
  const rounded = Math.round(playbackRate * 100) / 100;
  return `${rounded}x`;
}

/**
 * SpeedMenu -- "Hız" submenu with a discrete playback-rate radio list.
 *
 * WHY: A slider bound to the playbackRates range allowed arbitrary
 * intermediate values that made playback feel unstable. The user settled on
 * exactly the presets defined by the layout playbackRates prop; a radio group
 * bound to the media playbackRate keeps the checked option in sync.
 */
export function SpeedMenu() {
  const { remote } = useMediaContext();
  const canSetPlaybackRate = useMediaState('canSetPlaybackRate');
  const playbackRate = useMediaState('playbackRate');
  const speedWord = t('Speed');
  const normalWord = t('Normal');

  if (!canSetPlaybackRate) return null;

  const options = getSpeedOptions(PLAYBACK_RATES);
  const valueLabel = formatSpeedValue(playbackRate, normalWord);

  return (
    <Menu.Root className="vds-menu">
      <SettingsRowButton label={speedWord} hint={valueLabel} Icon={OdometerIcon} />
      <Menu.Items className="vds-menu-items glass-menu-items vds-quick-submenu">
        <SettingsRadioGroup
          value={String(playbackRate)}
          options={options.map((rate) => ({
            label: formatSpeedValue(rate, normalWord),
            value: String(rate),
          }))}
          onChange={(value) => remote.changePlaybackRate(parseFloat(value))}
        />
      </Menu.Items>
    </Menu.Root>
  );
}
