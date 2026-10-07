import { useState } from 'react';
import { Menu, Slider } from '@vidstack/react';
import { CheckIcon, ChevronLeftIcon } from '@vidstack/react/icons';
import { turkishTranslations } from './translations';

/** Typed lookup into the Turkish translation map (replaces useDefaultLayoutWord). */
export function t(word: keyof typeof turkishTranslations): string {
  return turkishTranslations[word];
}

interface RowButtonProps {
  label: string;
  hint?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  onBack?: () => void;
}

/**
 * Submenu trigger row: label + current-value hint + icon. When the submenu is
 * open the same row becomes the panel header with a back chevron (mirrors the
 * old DefaultMenuButton + sticky-header CSS contract in EmbedPlayer.css).
 */
export function SettingsRowButton({ label, hint, Icon, onBack }: RowButtonProps) {
  return (
    <Menu.Button className="vds-menu-item" aria-label={label}>
      {onBack ? (
        <ChevronLeftIcon className="vds-menu-item-icon vds-icon" />
      ) : (
        Icon && <Icon className="vds-menu-item-icon vds-icon" />
      )}
      <div className="vds-menu-item-label">{label}</div>
      {hint && <div className="vds-menu-item-hint">{hint}</div>}
    </Menu.Button>
  );
}

interface RadioGroupProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

/** Radio list used by the Kalite / Hız / Altyazılar submenus. */
export function SettingsRadioGroup({ value, options, onChange }: RadioGroupProps) {
  return (
    <Menu.RadioGroup className="vds-radio-group" role="radiogroup" value={value}>
      {options.map((option) => (
        <Menu.Radio
          className="vds-radio"
          value={option.value}
          onSelect={() => onChange(option.value)}
          key={option.value}
        >
          <CheckIcon className="vds-icon" />
          <span className="vds-radio-label">{option.label}</span>
        </Menu.Radio>
      ))}
    </Menu.RadioGroup>
  );
}

interface CheckboxProps {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  storageKey: string;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Flat toggle row (Döngü / Duyurular / Klavye Animasyonları). Persists to
 * localStorage under the given key, mirroring DefaultMenuCheckbox behaviour.
 */
export function SettingsCheckbox({ label, Icon, storageKey, defaultChecked, onChange }: CheckboxProps) {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved != null ? saved === 'true' : !!defaultChecked;
    } catch {
      return !!defaultChecked;
    }
  });

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // Storage unavailable (private mode) — the toggle still works in-memory.
    }
    onChange(next);
  };

  return (
    <div className="vds-menu-item" role="menuitemcheckbox" aria-checked={checked} onClick={toggle}>
      <Icon className="vds-menu-item-icon vds-icon" />
      <div className="vds-menu-item-label">{label}</div>
      <button
        className={`glass-switch${checked ? ' on' : ''}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
      >
        <span className="glass-switch-thumb" />
      </button>
    </div>
  );
}

/** Section header grouping rows inside the Altyazı Tarzları panel. */
export function SettingsSection({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="vds-menu-section">
      {label && <div className="vds-menu-section-label">{label}</div>}
      {children}
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}

/** Slider row for the font-size / opacity controls. */
export function SettingsSliderRow({ label, value, min, max, step, display, onChange }: SliderRowProps) {
  return (
    <div className="vds-menu-item vds-slider-item">
      <div className="vds-menu-item-label">{label}</div>
      <div className="vds-menu-item-hint">{display}</div>
      <Slider.Root
        className="vds-slider glass-mini-slider"
        min={min}
        max={max}
        step={step}
        keyStep={step}
        value={value}
        aria-label={label}
        onValueChange={(newValue) => onChange(newValue)}
        onDragValueChange={(newValue) => onChange(newValue)}
      >
        <Slider.Track className="vds-slider-track">
          <Slider.TrackFill className="vds-slider-track-fill vds-slider-track" />
        </Slider.Track>
        <Slider.Thumb className="vds-slider-thumb" />
      </Slider.Root>
    </div>
  );
}
