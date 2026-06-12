import type { CSSProperties } from 'react';

import type { Slide } from '@/types/editor';

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.trim().replace('#', '');
  const expanded =
    raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.slice(0, 6);
  const parsed = Number.parseInt(expanded, 16);
  if (!Number.isFinite(parsed)) {
    return `rgba(0,0,0,${alpha})`;
  }
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getSlideOverlayOpacity(slide: Pick<Slide, 'overlayOpacity'>): number {
  return clamp01(slide.overlayOpacity ?? 0.4);
}

export function getSlideOverlayColor(slide: Pick<Slide, 'overlayColor'>): string {
  const color = slide.overlayColor?.trim();
  return color && color.length > 0 ? color : '#000000';
}

export function isSlideOverlayEnabled(slide: Pick<Slide, 'overlayEnabled'>): boolean {
  return Boolean(slide.overlayEnabled);
}

export function getSlideOverlayStyle(slide: Slide): CSSProperties | null {
  if (!isSlideOverlayEnabled(slide)) return null;
  return {
    backgroundColor: hexToRgba(getSlideOverlayColor(slide), getSlideOverlayOpacity(slide)),
  };
}
