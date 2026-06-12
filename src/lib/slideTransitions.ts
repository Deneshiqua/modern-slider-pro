import type { Target, Transition } from 'framer-motion';

import { DEFAULT_SLIDER_SETTINGS } from '@/lib/constants';
import type { ProgressBarScope, SliderSettings, SlideTransitionType } from '@/types/editor';

/** 1 = forward (next), -1 = backward (previous) */
export type SlideTransitionDirection = 1 | -1;

export const SLIDE_TRANSITION_OPTIONS: { value: SlideTransitionType; labelKey: string }[] = [
  { value: 'none', labelKey: 'editor.slideTransition.none' },
  { value: 'fade', labelKey: 'editor.slideTransition.fade' },
  { value: 'slide', labelKey: 'editor.slideTransition.slide' },
  { value: 'slideUp', labelKey: 'editor.slideTransition.slideUp' },
  { value: 'zoom', labelKey: 'editor.slideTransition.zoom' },
];

/** Transition types shown when slide transitions are enabled (excludes "none"). */
export const SLIDE_TRANSITION_STYLE_OPTIONS = SLIDE_TRANSITION_OPTIONS.filter(
  (opt) => opt.value !== 'none',
);

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

function normalizeProgressBarScope(value: unknown): ProgressBarScope {
  return value === 'allSlides' ? 'allSlides' : 'perSlide';
}

function clampProgressBarHeight(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SLIDER_SETTINGS.progressBarHeight;
  return Math.min(5, Math.max(1, Math.round(value)));
}

export function normalizeSliderSettings(settings: Partial<SliderSettings> | undefined): SliderSettings {
  const merged = {
    ...DEFAULT_SLIDER_SETTINGS,
    ...settings,
    slideTransition: settings?.slideTransition ?? DEFAULT_SLIDER_SETTINGS.slideTransition,
    slideTransitionDuration:
      settings?.slideTransitionDuration ?? DEFAULT_SLIDER_SETTINGS.slideTransitionDuration,
    progressBarColor: settings?.progressBarColor ?? DEFAULT_SLIDER_SETTINGS.progressBarColor,
    progressBarOpacity: clamp01(
      settings?.progressBarOpacity ?? DEFAULT_SLIDER_SETTINGS.progressBarOpacity,
    ),
    progressBarTrackOpacity: clamp01(
      settings?.progressBarTrackOpacity ?? DEFAULT_SLIDER_SETTINGS.progressBarTrackOpacity,
    ),
    progressBarScope: normalizeProgressBarScope(
      settings?.progressBarScope ?? DEFAULT_SLIDER_SETTINGS.progressBarScope,
    ),
    progressBarHeight: clampProgressBarHeight(
      settings?.progressBarHeight ?? DEFAULT_SLIDER_SETTINGS.progressBarHeight,
    ),
  };

  const slideTransitionEnabled =
    settings?.slideTransitionEnabled ??
    (settings?.slideTransition !== undefined
      ? settings.slideTransition !== 'none'
      : DEFAULT_SLIDER_SETTINGS.slideTransitionEnabled);

  return {
    ...merged,
    slideTransitionEnabled,
    slideTransition:
      merged.slideTransition === 'none' && slideTransitionEnabled
        ? 'fade'
        : merged.slideTransition,
  };
}

export function getEffectiveSlideTransition(settings: SliderSettings): SlideTransitionType {
  if (!settings.slideTransitionEnabled) return 'none';
  const type = settings.slideTransition;
  return type === 'none' ? 'fade' : type;
}

export function resolveSlideTransitionMotion(
  type: SlideTransitionType,
  durationSeconds: number,
  direction: SlideTransitionDirection,
): {
  initial: Target | false;
  animate: Target;
  exit: Target;
  transition: Transition;
} {
  const duration = type === 'none' ? 0 : Math.max(0.1, durationSeconds);
  const transition: Transition = { duration, ease: [0.4, 0, 0.2, 1] };

  if (type === 'none') {
    return {
      initial: false,
      animate: {},
      exit: {},
      transition: { duration: 0 },
    };
  }

  if (type === 'fade') {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition,
    };
  }

  if (type === 'zoom') {
    return {
      initial: { opacity: 0, scale: 0.92 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.06 },
      transition,
    };
  }

  if (type === 'slideUp') {
    const enterY = direction === 1 ? '100%' : '-100%';
    const exitY = direction === 1 ? '-100%' : '100%';
    return {
      initial: { y: enterY, opacity: 0.85 },
      animate: { y: 0, opacity: 1 },
      exit: { y: exitY, opacity: 0.85 },
      transition,
    };
  }

  // slide (horizontal)
  const enterX = direction === 1 ? '100%' : '-100%';
  const exitX = direction === 1 ? '-100%' : '100%';
  return {
    initial: { x: enterX, opacity: 0.9 },
    animate: { x: 0, opacity: 1 },
    exit: { x: exitX, opacity: 0.9 },
    transition,
  };
}
