import { useLayoutEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import type { ProgressBarScope } from '@/types/editor';

type SliderProgressBarProps = {
  currentIndex: number;
  slideCount: number;
  scope?: ProgressBarScope;
  autoPlay?: boolean;
  /** Autoplay interval in milliseconds. */
  intervalMs?: number;
  color?: string;
  fillOpacity?: number;
  trackOpacity?: number;
  /** Bar height in pixels (1–5). */
  heightPx?: number;
  /** When true, show the bar for a single slide (loop replay). */
  loop?: boolean;
  /** Bumps on each autoplay cycle so the fill restarts (e.g. single-slide loop). */
  cycleKey?: number;
  /** Freezes the fill animation (e.g. while the pointer is over the slider). */
  paused?: boolean;
  className?: string;
};

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.trim().replace('#', '');
  const expanded =
    raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.slice(0, 6);
  const parsed = Number.parseInt(expanded, 16);
  if (!Number.isFinite(parsed)) {
    return `rgba(255,255,255,${alpha})`;
  }
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function getProgressWidths(
  scope: ProgressBarScope,
  safeIndex: number,
  slideCount: number,
  autoPlay: boolean,
  autoplayFillActive: boolean,
): { start: number; end: number } {
  if (slideCount < 1) return { start: 0, end: 0 };

  if (scope === 'allSlides') {
    const start = (safeIndex / slideCount) * 100;
    const end = ((safeIndex + 1) / slideCount) * 100;
    if (autoPlay && autoplayFillActive) {
      return { start, end };
    }
    return { start, end: start };
  }

  // perSlide: full bar refills on each slide
  if (autoPlay && autoplayFillActive) {
    return { start: 0, end: 100 };
  }
  return { start: 0, end: 0 };
}

/** Thin progress track at the bottom of the slider (slide position / autoplay fill). */
export function SliderProgressBar({
  currentIndex,
  slideCount,
  scope = 'perSlide',
  autoPlay = false,
  intervalMs = 5000,
  color = '#ffffff',
  fillOpacity = 1,
  trackOpacity = 0.25,
  heightPx = 4,
  loop = false,
  cycleKey = 0,
  paused = false,
  className,
}: SliderProgressBarProps) {
  const [autoplayFillActive, setAutoplayFillActive] = useState(false);

  const safeIndex = Math.min(Math.max(currentIndex, 0), Math.max(slideCount - 1, 0));
  const { start: fillStart, end: fillEnd } = useMemo(
    () => getProgressWidths(scope, safeIndex, slideCount, autoPlay, autoplayFillActive),
    [scope, safeIndex, slideCount, autoPlay, autoplayFillActive],
  );
  const fillPercent = fillEnd;
  const barHeight = Math.min(5, Math.max(1, Math.round(heightPx)));
  const fillColor = hexToRgba(color, fillOpacity);
  const trackColor = hexToRgba(color, trackOpacity);

  // Reset fill before paint when slide / interval / cycle / scope changes.
  useLayoutEffect(() => {
    if (!autoPlay) {
      setAutoplayFillActive(false);
      return;
    }
    setAutoplayFillActive(false);
    const id = requestAnimationFrame(() => setAutoplayFillActive(true));
    return () => cancelAnimationFrame(id);
  }, [autoPlay, safeIndex, intervalMs, cycleKey, scope]);

  if (slideCount < 1) return null;
  if (slideCount <= 1 && !loop) return null;

  const ariaNow =
    scope === 'allSlides'
      ? safeIndex + 1
      : autoplayFillActive
        ? safeIndex + 1
        : safeIndex;

  return (
    <div
      className={cn(
        'msp-pointer-events-none msp-absolute msp-inset-x-0 msp-bottom-0 msp-z-40',
        className,
      )}
      style={{ backgroundColor: trackColor, height: barHeight }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={slideCount}
      aria-valuenow={ariaNow}
      aria-label={`Slide ${safeIndex + 1} of ${slideCount}`}
    >
      <motion.div
        key={`${scope}-${safeIndex}-${cycleKey}`}
        className="msp-h-full msp-shadow-sm"
        style={{ backgroundColor: fillColor }}
        initial={{ width: `${fillStart}%` }}
        animate={{ width: `${fillPercent}%` }}
        transition={
          autoPlay && autoplayFillActive && !paused
            ? { duration: Math.max(0.1, intervalMs / 1000), ease: 'linear' }
            : { duration: 0 }
        }
      />
    </div>
  );
}
