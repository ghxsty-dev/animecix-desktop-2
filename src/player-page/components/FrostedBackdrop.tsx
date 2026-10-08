import { useEffect, useRef } from 'react';
import { useMediaPlayer } from '@vidstack/react';

/**
 * One-shot frosted glass for menu panels.
 *
 * WHY not plain `backdrop-filter`: it provably samples nothing in this
 * stack (verified pixel-clean: a transparent+blurred panel shows the
 * picture razor sharp). Instead we paint ONE snapshot of the live frame,
 * cropped to the panel's own box, into a canvas behind the panel content
 * and blur the canvas with a regular CSS filter.
 *
 * The panel mounts while still hidden, so painting is driven by a
 * MutationObserver (open/close) + ResizeObserver (reposition) — no rAF
 * loop, one draw per open.
 */
export function FrostedBackdrop() {
  const player = useMediaPlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = player?.el?.querySelector('video');
    if (!canvas || !video) return;

    const panel = canvas.parentElement;
    if (!panel) return;

    const paint = () => {
      try {
        const panelRect = panel.getBoundingClientRect();
        // Closed/hidden panel (also covers display:none → 0×0).
        if (panelRect.width < 2 || panelRect.height < 2 || panel.offsetParent === null) return;
        if (!video.videoWidth) return;

        const width = Math.round(panelRect.width);
        const height = Math.round(panelRect.height);
        canvas.width = width;
        canvas.height = height;

        // object-fit: contain mapping of the intrinsic frame into the
        // video element box (viewport pixels).
        const videoRect = video.getBoundingClientRect();
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const scale = Math.min(videoRect.width / vw, videoRect.height / vh);
        const frameX = videoRect.x + (videoRect.width - vw * scale) / 2;
        const frameY = videoRect.y + (videoRect.height - vh * scale) / 2;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(
          video,
          ((panelRect.x - frameX) / scale) | 0,
          ((panelRect.y - frameY) / scale) | 0,
          Math.round(panelRect.width / scale),
          Math.round(panelRect.height / scale),
          0,
          0,
          width,
          height,
        );
      } catch {
        // Tainted frame or detached panel — the flat panel background shows.
      }
    };

    const attrs = new MutationObserver(paint);
    attrs.observe(panel, { attributes: true, attributeFilter: ['aria-hidden', 'hidden', 'style'] });
    const size = new ResizeObserver(paint);
    size.observe(panel);

    paint();
    return () => {
      attrs.disconnect();
      size.disconnect();
    };
  }, [player]);

  return <canvas className="frost-canvas" ref={canvasRef} aria-hidden="true" />;
}
