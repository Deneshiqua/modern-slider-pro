import type { AlignmentAnchor } from '@/lib/alignment';

/**
 * Read a slide element’s bounding box in **logical** slide coordinates (matches Rnd x/y + zoom math).
 * Used after layout so canvas alignment snaps to the real rendered size, not heuristics.
 */
export function readSlideElementLogicalBox(
  elementId: string,
  canvasZoom: number,
): { left: number; top: number; width: number; height: number } | null {
  if (typeof document === 'undefined') return null;
  const slide = document.querySelector('[data-msp-slide-root]');
  const safeId =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? CSS.escape(elementId)
      : elementId.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const el = document.querySelector(`[data-msp-editor-el-id="${safeId}"]`);
  if (!slide || !el) return null;
  const sr = slide.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const z = canvasZoom > 0 ? canvasZoom : 1;
  return {
    left: (er.left - sr.left) / z,
    top: (er.top - sr.top) / z,
    width: er.width / z,
    height: er.height / z,
  };
}

/** Rigid shift for multi-select canvas alignment so measured union matches viewport edges. */
export function computeCanvasAnchorUnionShift(
  anchor: AlignmentAnchor,
  elementIds: readonly string[],
  canvasZoom: number,
  vw: number,
  vh: number,
): { dx: number; dy: number } | null {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const id of elementIds) {
    const b = readSlideElementLogicalBox(id, canvasZoom);
    if (!b) return null;
    minX = Math.min(minX, b.left);
    maxX = Math.max(maxX, b.left + b.width);
    minY = Math.min(minY, b.top);
    maxY = Math.max(maxY, b.top + b.height);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;

  const unionW = maxX - minX;
  const unionH = maxY - minY;

  const horizontal = anchor.includes('left')
    ? 'left'
    : anchor.includes('right')
      ? 'right'
      : 'center';
  const vertical = anchor.startsWith('top')
    ? 'top'
    : anchor.startsWith('bottom')
      ? 'bottom'
      : 'middle';

  const targetMinX =
    horizontal === 'left' ? 0 : horizontal === 'right' ? vw - unionW : (vw - unionW) / 2;
  const targetMinY =
    vertical === 'top' ? 0 : vertical === 'bottom' ? vh - unionH : (vh - unionH) / 2;

  return {
    dx: Math.round(targetMinX - minX),
    dy: Math.round(targetMinY - minY),
  };
}

export function computeCanvasRowUnionShift(
  edge: 'left' | 'center' | 'right',
  elementIds: readonly string[],
  canvasZoom: number,
  vw: number,
): number | null {
  let minX = Infinity;
  let maxX = -Infinity;
  for (const id of elementIds) {
    const b = readSlideElementLogicalBox(id, canvasZoom);
    if (!b) return null;
    minX = Math.min(minX, b.left);
    maxX = Math.max(maxX, b.left + b.width);
  }
  if (!Number.isFinite(minX)) return null;
  const unionW = maxX - minX;
  const targetMinX = edge === 'left' ? 0 : edge === 'right' ? vw - unionW : (vw - unionW) / 2;
  return Math.round(targetMinX - minX);
}

export function computeCanvasColumnUnionShift(
  edge: 'top' | 'middle' | 'bottom',
  elementIds: readonly string[],
  canvasZoom: number,
  vh: number,
): number | null {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const id of elementIds) {
    const b = readSlideElementLogicalBox(id, canvasZoom);
    if (!b) return null;
    minY = Math.min(minY, b.top);
    maxY = Math.max(maxY, b.top + b.height);
  }
  if (!Number.isFinite(minY)) return null;
  const unionH = maxY - minY;
  const targetMinY = edge === 'top' ? 0 : edge === 'bottom' ? vh - unionH : (vh - unionH) / 2;
  return Math.round(targetMinY - minY);
}
