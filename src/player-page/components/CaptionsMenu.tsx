import { Menu, useCaptionOptions } from '@vidstack/react';
import { ClosedCaptionsIcon } from '@vidstack/react/icons';
import { SettingsRadioGroup, SettingsRowButton, t } from './GlassMenu';

/**
 * CaptionsMenu -- "Altyazılar" submenu for selecting the active caption track.
 *
 * WHY: The default DefaultCaptionMenu is hidden via CSS (EmbedPlayer.css) and
 * recreated here as a flat top-level item using the public useCaptionOptions
 * hook. Renders "Kapalı" (Off) plus one radio per available caption track.
 */
export function CaptionsMenu() {
  const label = t('Captions');
  const offText = t('Off');
  const options = useCaptionOptions({ off: offText });
  const hint = options.selectedTrack?.label ?? offText;

  if (options.disabled) return null;

  return (
    <Menu.Root className="vds-menu">
      <SettingsRowButton label={label} hint={hint} Icon={ClosedCaptionsIcon} />
      <Menu.Items className="vds-menu-items glass-menu-items vds-quick-submenu">
        {/* WHY RadioGroup: bare Menu.Radio children have no radioControllerContext
            ancestor, so mount throws "Cannot read properties of undefined (reading 'add')". */}
        <SettingsRadioGroup
          value={options.selectedValue}
          options={options.map(({ label: optionLabel, value }) => ({ label: optionLabel, value }))}
          onChange={(value) => options.find((option) => option.value === value)?.select()}
        />
      </Menu.Items>
    </Menu.Root>
  );
}
