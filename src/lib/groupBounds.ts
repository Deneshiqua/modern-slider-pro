import { EditorElement, ViewMode } from '@/types/editor';
import { resolveElementProperties } from '@/lib/responsive';

export type BoundsRect = { minX: number; minY: number; maxX: number; maxY: number };

const EPS = 0.5;

function parseCssLength(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
  return undefined;
}

function unionBounds(rects: BoundsRect[]): BoundsRect {
  if (rects.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  return rects.reduce(
    (acc, r) => ({
      minX: Math.min(acc.minX, r.minX),
      minY: Math.min(acc.minY, r.minY),
      maxX: Math.max(acc.maxX, r.maxX),
      maxY: Math.max(acc.maxY, r.maxY),
    }),
    { ...rects[0] },
  );
}

function offsetBounds(rect: BoundsRect, ox: number, oy: number): BoundsRect {
  return {
    minX: rect.minX + ox,
    minY: rect.minY + oy,
    maxX: rect.maxX + ox,
    maxY: rect.maxY + oy,
  };
}

/** Axis-aligned bounding box of a rectangle (x,y)-(x+w,y+h) rotated around its center. */
function aabbForRotatedRect(x: number, y: number, w: number, h: number, rotationDeg?: number): BoundsRect {
  if (!rotationDeg || Math.abs(rotationDeg % 360) < EPS) {
    return { minX: x, minY: y, maxX: x + w, maxY: y + h };
  }
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ] as const;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [dx, dy] of corners) {
    const rx = dx * cos - dy * sin + cx;
    const ry = dx * sin + dy * cos + cy;
    minX = Math.min(minX, rx);
    minY = Math.min(minY, ry);
    maxX = Math.max(maxX, rx);
    maxY = Math.max(maxY, ry);
  }
  return { minX, minY, maxX, maxY };
}

function inferSizeForBounds(resolved: EditorElement): { w: number; h: number } {
  const fs = Number(resolved.style.fontSize) || 16;
  switch (resolved.type) {
    case 'text': {
      const lines = resolved.content.split('\n');
      const maxLineLen = Math.max(1, ...lines.map(l => l.length));
      const lineHeight = Math.max(fs * 1.25, 12);
      const w = Math.min(1200, Math.max(48, maxLineLen * fs * 0.52 + 24));
      const h = Math.max(lineHeight, lines.length * lineHeight + 8);
      return { w, h };
    }
    case 'image':
      return { w: 320, h: 240 };
    case 'video':
      return { w: 320, h: 200 };
    case 'button': {
      const len = Math.max(resolved.content.length || 1, 4);
      return { w: Math.max(96, len * fs * 0.45 + 40), h: Math.max(40, fs * 2 + 16) };
    }
    case 'box':
    default:
      return { w: 200, h: 120 };
  }
}

/**
 * Outer bounds of an element in **parent-local** coordinates (this node's own x/y are not applied here;
 * child offsets are applied when composing nested boxes).
 */
function localOuterBounds(element: EditorElement, viewMode: ViewMode): BoundsRect {
  const r = resolveElementProperties(element, viewMode);
  let w = parseCssLength(r.style.width);
  let h = parseCssLength(r.style.height);
  const hasKids = r.type === 'box' && r.children?.some(c => c.isVisible !== false);

  if (!hasKids) {
    if (w == null || h == null) {
      const inf = inferSizeForBounds(r);
      if (w == null) w = inf.w;
      if (h == null) h = inf.h;
    }
    return aabbForRotatedRect(0, 0, w!, h!, r.rotation);
  }

  const parts: BoundsRect[] = [];
  if (w != null && h != null) {
    parts.push(aabbForRotatedRect(0, 0, w, h, r.rotation));
  }
  for (const child of r.children ?? []) {
    if (child.isVisible === false) continue;
    parts.push(offsetBounds(localOuterBounds(child, viewMode), child.x, child.y));
  }
  if (parts.length === 0) {
    const inf = inferSizeForBounds(r);
    return aabbForRotatedRect(0, 0, inf.w, inf.h, r.rotation);
  }
  return unionBounds(parts);
}

/** Bounding rect in slide space for one root-level element (used when grouping). */
export function getSlideSpaceOuterRect(element: EditorElement, viewMode: ViewMode): BoundsRect {
  const r = resolveElementProperties(element, viewMode);
  const local = localOuterBounds(element, viewMode);
  return offsetBounds(local, r.x, r.y);
}
