/** Uniform scale so typography and assets keep aspect ratio (letterbox/center in container). */
export function getSlideStageScale(
  displayWidth: number,
  displayHeight: number,
  designWidth: number,
  designHeight: number,
): { scale: number } {
  if (designWidth <= 0 || designHeight <= 0 || displayWidth <= 0 || displayHeight <= 0) {
    return { scale: 1 };
  }

  const scaleX = displayWidth / designWidth;
  const scaleY = displayHeight / designHeight;

  return { scale: Math.min(scaleX, scaleY) };
}

export function getDefaultSlideDesignSize(
  canvasSettings?: { canvasWidth?: number; canvasHeight?: number },
  fallbackWidth = 1280,
  fallbackHeight = 720,
): { width: number; height: number } {
  return {
    width: canvasSettings?.canvasWidth ?? fallbackWidth,
    height: canvasSettings?.canvasHeight ?? fallbackHeight,
  };
}
