/**
 * Tarayıcı `clientX`/`clientY` → slayt mantık pikseli (cetvel / `Rnd` ile aynı uzay).
 * `Canvas` içindeki scroll + çerçeve ölçüleriyle `handleScrollPointerMove` ile uyumlu.
 */
export function pointerClientToSlideLogical(
  clientX: number,
  clientY: number,
  canvasZoom: number,
): { x: number; y: number } | null {
  if (typeof document === 'undefined') return null;
  const scrollEl = document.querySelector('[data-msp-editor-canvas-scroll]') as HTMLElement | null;
  const frameEl = document.querySelector('[data-msp-editor-canvas-frame]') as HTMLElement | null;
  if (!scrollEl || !frameEl) return null;
  const sr = scrollEl.getBoundingClientRect();
  const fr = frameEl.getBoundingClientRect();
  const vx = clientX - sr.left;
  const vy = clientY - sr.top;
  const z = canvasZoom > 0 ? canvasZoom : 1;
  const frameOriginX = scrollEl.scrollLeft + (fr.left - sr.left);
  const frameOriginY = scrollEl.scrollTop + (fr.top - sr.top);
  const contentX = scrollEl.scrollLeft + vx;
  const contentY = scrollEl.scrollTop + vy;
  return {
    x: Math.round((contentX - frameOriginX) / z),
    y: Math.round((contentY - frameOriginY) / z),
  };
}
