import type { CSSProperties } from 'react';

import type { Slide, SlideBackgroundFit } from '@/types/editor';

export type { SlideBackgroundFit };

export const SLIDE_BACKGROUND_FIT_OPTIONS: { value: SlideBackgroundFit; labelKey: string }[] = [
  { value: 'cover', labelKey: 'editor.properties.backgroundFitCover' },
  { value: 'contain', labelKey: 'editor.properties.backgroundFitContain' },
  { value: 'fill', labelKey: 'editor.properties.backgroundFitFill' },
  { value: 'none', labelKey: 'editor.properties.backgroundFitNone' },
];

export function normalizeSlideBackgroundFit(value: unknown): SlideBackgroundFit {
  if (value === 'contain' || value === 'fill' || value === 'none') return value;
  return 'cover';
}

export function getSlideBackgroundFit(slide: Pick<Slide, 'backgroundFit'>): SlideBackgroundFit {
  return normalizeSlideBackgroundFit(slide.backgroundFit);
}

/** Resolved slide fill when backgroundType is `color` (empty / transparent = no fill). */
export function getSlideBackgroundColor(slide: Pick<Slide, 'backgroundType' | 'backgroundColor' | 'background'>): string {
  if (slide.backgroundType !== 'color') return 'transparent';
  const raw = (slide.backgroundColor || slide.background || '').trim();
  if (!raw || raw.toLowerCase() === 'transparent') return 'transparent';
  return raw;
}

export function getSlideImageBackgroundCss(
  fit: SlideBackgroundFit,
): Pick<CSSProperties, 'backgroundSize' | 'backgroundPosition' | 'backgroundRepeat'> {
  switch (fit) {
    case 'contain':
      return {
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    case 'fill':
      return {
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    case 'none':
      return {
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    case 'cover':
    default:
      return {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
  }
}

export function getSlideVideoObjectFitClass(fit: SlideBackgroundFit): string {
  switch (fit) {
    case 'contain':
      return 'msp-object-contain';
    case 'fill':
      return 'msp-object-fill';
    case 'none':
      return 'msp-object-none';
    case 'cover':
    default:
      return 'msp-object-cover';
  }
}

/** Class names for embedded YouTube iframes (no native object-fit). */
export function getSlideYoutubeIframeClassName(fit: SlideBackgroundFit): string {
  const base = 'msp-h-full msp-w-full';
  switch (fit) {
    case 'contain':
      return `${base} msp-max-h-full msp-max-w-full`;
    case 'fill':
      return base;
    case 'none':
      return `${base} msp-max-h-none msp-max-w-none`;
    case 'cover':
    default:
      return `${base} msp-scale-150`;
  }
}

export function getSlideBackgroundImageUrl(slide: Slide): string | undefined {
  if (slide.backgroundType === 'image') {
    return slide.backgroundImage || slide.background || undefined;
  }
  if (slide.backgroundType === 'color') return undefined;
  if (slide.background?.startsWith('http') && !slide.background.includes('youtube')) {
    return slide.background;
  }
  return undefined;
}

export function getSlideBackgroundVideoUrl(slide: Slide): string | undefined {
  if (slide.backgroundType === 'video') {
    return slide.backgroundVideo || slide.background || undefined;
  }
  return undefined;
}

export function isYoutubeBackgroundUrl(url: string): boolean {
  return url.includes('youtube') || url.includes('youtu.be');
}

export function getYoutubeEmbedUrl(url: string): string {
  if (!url) return '';
  try {
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
    }
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
    }
    return url;
  } catch {
    return url;
  }
}
