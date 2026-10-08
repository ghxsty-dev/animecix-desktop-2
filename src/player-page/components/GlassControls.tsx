import { useEffect } from 'react';
import {
  Captions,
  Controls,
  FullscreenButton,
  Gesture,
  MediaAnnouncer,
  Menu,
  MuteButton,
  PIPButton,
  PlayButton,
  Spinner,
  Time,
  TimeSlider,
  Title,
  VolumeSlider,
  useMediaPlayer,
  useMediaState,
} from '@vidstack/react';
import {
  FullscreenExitIcon,
  FullscreenIcon,
  MuteIcon,
  PauseIcon,
  PictureInPictureExitIcon,
  PictureInPictureIcon,
  PlayIcon,
  ReplayIcon,
  SettingsIcon,
  VolumeHighIcon,
  VolumeLowIcon,
} from '@vidstack/react/icons';
import { CaptionStylesMenu } from './CaptionStylesMenu';
import { CaptionsMenu } from './CaptionsMenu';
import { EnhancementPanel } from './EnhancementPanel';
import type { UpscalePreset, ColorFilters, EnhancementStats } from '../hooks/useVideoEnhancement';
import { FlatSettingsMenu } from './FlatSettingsMenu';
import { QualityMenu } from './QualityMenu';
import { SpeedMenu } from './SpeedMenu';
import { t } from './GlassMenu';
import { postToParent } from '../hooks/useParentMessages';
import { turkishTranslations } from './translations';
import './GlassControls.css';

interface GlassControlsProps {
  thumbnails?: string;
  hasNext: boolean;
  announcements: boolean;
  onAnnouncementsChange: (enabled: boolean) => void;
  enhancement: {
    preset: UpscalePreset;
    onPresetChange: (preset: UpscalePreset) => void;
    filters: ColorFilters;
    onFiltersChange: (filters: Partial<ColorFilters>) => void;
    stats: EnhancementStats;
    isActive: boolean;
    panelOpen: boolean;
    onPanelToggle: () => void;
  };
}

/**
 * Settings (gear) pill button + dropdown panel: flat toggles, Kalite, Hız,
 * Altyazılar, Altyazı Tarzları.
 */
function SettingsMenu({
  announcements,
  onAnnouncementsChange,
}: {
  announcements: boolean;
  onAnnouncementsChange: (enabled: boolean) => void;
}) {
  return (
    <Menu.Root className="glass-settings">
      <Menu.Button className="glass-btn" aria-label={t('Settings')} title={t('Settings')}>
        <SettingsIcon className="vds-icon" />
      </Menu.Button>
      <Menu.Items className="vds-menu-items glass-menu-items" placement="top end" offset={4}>
        <FlatSettingsMenu announcements={announcements} onAnnouncementsChange={onAnnouncementsChange} />
        <QualityMenu />
        <SpeedMenu />
        <CaptionsMenu />
        <CaptionStylesMenu />
      </Menu.Items>
    </Menu.Root>
  );
}

/** Blue next-episode pill (replaces the old side arrows). */
function NextEpisodePill() {
  return (
    <button
      className="glass-next-pill"
      aria-label="Sonraki bölüm"
      onClick={() => postToParent('next')}
    >
      <span>Sonraki Bölüm</span>
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      </svg>
    </button>
  );
}

/** Anime + episode title next to the clock (set by the parent site). */
function GlassTitle() {
  const title = useMediaState('title');
  if (!title) return null;
  return <Title className="glass-title" />;
}

/** PiP pill button (design puts it in the right pill, next to settings). */
function GlassPipButton() {
  const canPiP = useMediaState('canPictureInPicture');
  const pip = useMediaState('pictureInPicture');
  if (!canPiP) return null;
  return (
    <PIPButton className="glass-btn" aria-label={pip ? t('Exit PiP') : t('Enter PiP')}>
      {pip ? (
        <PictureInPictureExitIcon className="vds-icon" />
      ) : (
        <PictureInPictureIcon className="vds-icon" />
      )}
    </PIPButton>
  );
}

function GlassPlayButton() {
  const paused = useMediaState('paused');
  const ended = useMediaState('ended');
  return (
    <PlayButton className="glass-btn glass-btn-play" aria-label={paused ? t('Play') : t('Pause')}>
      {ended ? (
        <ReplayIcon className="vds-icon" />
      ) : paused ? (
        <PlayIcon className="vds-icon" />
      ) : (
        <PauseIcon className="vds-icon" />
      )}
    </PlayButton>
  );
}

function GlassMuteButton() {
  const muted = useMediaState('muted');
  const volume = useMediaState('volume');
  return (
    <MuteButton className="glass-btn" aria-label={muted ? t('Unmute') : t('Mute')}>
      {muted || volume === 0 ? (
        <MuteIcon className="vds-icon" />
      ) : volume < 0.5 ? (
        <VolumeLowIcon className="vds-icon" />
      ) : (
        <VolumeHighIcon className="vds-icon" />
      )}
    </MuteButton>
  );
}

function GlassFullscreenButton() {
  const fullscreen = useMediaState('fullscreen');
  return (
    <FullscreenButton
      className="glass-btn"
      aria-label={fullscreen ? t('Exit Fullscreen') : t('Enter Fullscreen')}
    >
      {fullscreen ? (
        <FullscreenExitIcon className="vds-icon" />
      ) : (
        <FullscreenIcon className="vds-icon" />
      )}
    </FullscreenButton>
  );
}

/** Keyboard shortcuts: Space/K play-pause, arrows seek ∓10s, F fullscreen, M mute. */
function useKeyboardShortcuts() {
  const player = useMediaPlayer();

  useEffect(() => {
    if (!player) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      switch (event.key) {
        case ' ':
        case 'k':
          event.preventDefault();
          if (player.state.paused) player.play().catch(() => {});
          else player.pause();
          break;
        case 'ArrowRight':
          event.preventDefault();
          player.currentTime = Math.min(player.state.duration || 0, player.state.currentTime + 10);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          player.currentTime = Math.max(0, player.state.currentTime - 10);
          break;
        case 'f':
          event.preventDefault();
          if (player.state.fullscreen) player.remote.exitFullscreen();
          else player.remote.requestFullscreen();
          break;
        case 'm':
          event.preventDefault();
          if (player.state.muted) player.remote.requestUnmute();
          else player.remote.requestMute();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [player]);
}

export function GlassControls({ thumbnails, hasNext, announcements, onAnnouncementsChange, enhancement }: GlassControlsProps) {
  useKeyboardShortcuts();
  const live = useMediaState('live');

  return (
    <>
      <div className="vds-gestures">
        <Gesture className="vds-gesture" event="pointerup" action="toggle:paused" />
        <Gesture className="vds-gesture" event="pointerup" action="toggle:controls" />
        <Gesture className="vds-gesture" event="dblpointerup" action="toggle:fullscreen" />
      </div>

      <Captions className="vds-captions" />

      <Spinner.Root className="glass-spinner">
        <Spinner.Track className="glass-spinner-track">
          <Spinner.TrackFill className="glass-spinner-fill" />
        </Spinner.Track>
      </Spinner.Root>

      {announcements && <MediaAnnouncer translations={turkishTranslations} />}

      <Controls.Root className="glass-controls">
        <Controls.Group className="glass-button-row">
          {!live && (
            <div className="glass-pill glass-play-pill" role="group" aria-label="Oynatma">
              <GlassPlayButton />

              <div className="glass-volume">
                <GlassMuteButton />
                <div className="glass-volume-popup">
                  <VolumeSlider.Root className="glass-volume-slider" orientation="vertical" aria-label={t('Volume')}>
                    <VolumeSlider.Track className="glass-mini-track">
                      <VolumeSlider.TrackFill className="glass-mini-fill glass-mini-track" />
                    </VolumeSlider.Track>
                    <VolumeSlider.Thumb className="glass-mini-thumb" />
                  </VolumeSlider.Root>
                </div>
              </div>
            </div>
          )}

          {!live && (
            <div className="glass-pill glass-time-pill">
              <div className="glass-time">
                <Time className="glass-time-current" type="current" />
                <span className="glass-time-divider">/</span>
                <Time className="glass-time-duration" type="duration" />
              </div>
            </div>
          )}

          {live && <div className="glass-live-spacer" />}

          {!live && <GlassTitle />}

          <div className="glass-spacer" />

          {!live && hasNext && <NextEpisodePill />}

          <div className="glass-pill" role="group" aria-label={t('Settings')}>
            <SettingsMenu announcements={announcements} onAnnouncementsChange={onAnnouncementsChange} />
            <GlassPipButton />
            <EnhancementPanel
              preset={enhancement.preset}
              onPresetChange={enhancement.onPresetChange}
              filters={enhancement.filters}
              onFiltersChange={enhancement.onFiltersChange}
              stats={enhancement.stats}
              isActive={enhancement.isActive}
              panelOpen={enhancement.panelOpen}
              onPanelToggle={enhancement.onPanelToggle}
            />
            <GlassFullscreenButton />
          </div>
        </Controls.Group>

        {!live && (
          <TimeSlider.Root className="glass-time-slider" aria-label={t('Seek')}>
            <TimeSlider.Track className="glass-slider-track">
              <TimeSlider.TrackFill className="glass-slider-fill glass-slider-track" />
              <TimeSlider.Progress className="glass-slider-progress glass-slider-track" />
            </TimeSlider.Track>
            <TimeSlider.Thumb className="glass-slider-thumb" />
            <TimeSlider.Preview className="glass-slider-preview">
              {thumbnails && (
                <TimeSlider.Thumbnail.Root src={thumbnails} className="glass-slider-thumbnail">
                  <TimeSlider.Thumbnail.Img />
                </TimeSlider.Thumbnail.Root>
              )}
              <TimeSlider.ChapterTitle className="glass-slider-chapter" />
              <TimeSlider.Value className="glass-slider-value" />
            </TimeSlider.Preview>
          </TimeSlider.Root>
        )}
      </Controls.Root>
    </>
  );
}
