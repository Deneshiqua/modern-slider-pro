import type { CSSProperties } from 'react';

import type { CanvasHeightMode, CanvasSettings } from '@/types/editor';

export type { CanvasHeightMode };

export function normalizeCanvasHeightMode(mode?: CanvasHeightMode | null): CanvasHeightMode {
  if (mode === 'responsive' || mode === 'fitBackground') {
    return mode;
  }
  return 'fixed';
}

export function getCanvasHeightMode(canvasSettings?: CanvasSettings | null): CanvasHeightMode {
  return normalizeCanvasHeightMode(canvasSettings?.canvasHeightMode);
}

/** SliderRunner outer container background (not the slide itself). */
export function getRunnerBackgroundColor(canvasSettings?: CanvasSettings | null): string {
  const raw = canvasSettings?.runnerBackgroundColor?.trim();
  if (!raw || raw.toLowerCase() === 'transparent') {
    return 'transparent';
  }
  return raw;
}

/** Visible height when a wide image is contained at `containerWidth`, capped at `maxHeight`. */
export function getFitBackgroundHeight(
  containerWidth: number,
  imageNaturalWidth: number,
  imageNaturalHeight: number,
  maxHeight: number,
): number {
  if (containerWidth <= 0 || imageNaturalWidth <= 0 || imageNaturalHeight <= 0) {
    return maxHeight;
  }

  const widthLimitedHeight = containerWidth * (imageNaturalHeight / imageNaturalWidth);
  return Math.min(maxHeight, Math.max(50, Math.round(widthLimitedHeight)));
}

export function resolveRunnerContainerStyle(params: {
  heightMode: CanvasHeightMode;
  designWidth: number;
  designHeight: number;
  resolvedWidth: string | number;
  heightProp?: string | number;
  measuredWidth: number;
  backgroundFit: string;
  backgroundImageUrl?: string;
  imageNaturalWidth?: number;
  imageNaturalHeight?: number;
}): CSSProperties {
  const {
    heightMode,
    designWidth,
    designHeight,
    resolvedWidth,
    heightProp,
    measuredWidth,
    backgroundFit,
    backgroundImageUrl,
    imageNaturalWidth,
    imageNaturalHeight,
  } = params;

  if (heightMode === 'responsive') {
    return {
      width: resolvedWidth,
      height: 'auto',
      maxHeight: designHeight,
      aspectRatio: `${designWidth} / ${designHeight}`,
    };
  }

  if (
    heightMode === 'fitBackground' &&
    backgroundFit === 'contain' &&
    backgroundImageUrl &&
    imageNaturalWidth &&
    imageNaturalHeight
  ) {
    const fitHeight = getFitBackgroundHeight(
      measuredWidth,
      imageNaturalWidth,
      imageNaturalHeight,
      designHeight,
    );
    return {
      width: resolvedWidth,
      height: fitHeight,
    };
  }

  const fixedHeight = heightProp ?? `${designHeight}px`;
  return {
    width: resolvedWidth,
    height: fixedHeight,
  };
}
