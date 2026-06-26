import { EditorElement, ViewMode } from '@/types/editor';
import type { LengthUnit } from '@/components/editor/SpacingControls';
import { readBoxModel } from '@/components/editor/SpacingControls';
import { resolveElementProperties } from '@/lib/responsive';
import { htmlToPlainText } from '@/lib/htmlContent';
import { fontSizeToPx } from '@/lib/fontSizeUnits';

export type BoundsRect = { minX: number; minY: number; maxX: number; maxY: number };

const EPS = 0.5;

/** Approximate one line-box height when width/height are auto (alignment vs shrink-wrapped Rnd). */
function resolveApproxLineBoxPx(style: EditorElement['style'], fontSizePx: number): number {
  const lh = style.lineHeight;
  const fallback = Math.max(fontSizePx * 1.165, fontSizePx + Math.ceil(fontSizePx * 0.12));

  if (lh == null || lh === '') return fallback;
  if (typeof lh === 'number' && lh > 0) {
    // Unitless multiplier (often fractional, e.g. 1.15 in demoSlides) vs px line-heights ≥ font size.
    if (lh <= 4 || (lh < 10 && lh % 1 !== 0)) {
      return Math.max(fontSizePx * lh, Math.min(fontSizePx + 10, fallback));
    }
    return Math.max(lh, 10);
  }
  if (typeof lh === 'string') {
    const t = lh.trim().toLowerCase();
    if (t === 'normal') return fallback;
    const pct = /^([\d.]+)%$/.exec(t);
    if (pct?.[1] != null)
      return Math.max((fontSizePx * Number.parseFloat(pct[1])) / 100, Math.min(fontSizePx + 8, fallback * 1.05));
    const pxMatch = /^([\d.]+)px$/.exec(t);
    if (pxMatch?.[1] != null) return Math.max(Number.parseFloat(pxMatch[1]), 10);
    const n = Number.parseFloat(t);
    if (Number.isFinite(n)) {
      if (n <= 4) return Math.max(fontSizePx * n, Math.min(fontSizePx + 10, fallback));
      return Math.max(n, 10);
    }
  }

  return fallback;
}

function parseCssLength(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
  return undefined;
}

/** Sum left+right / top+bottom padding in approximate px (% ignored — needs parent width). */
function approxPaddingAxisPx(
  box: { nums: readonly [number, number, number, number]; unit: LengthUnit },
  axis: 'h' | 'v',
): number {
  const [top, right, bottom, left] = box.nums;
  const { unit } = box;
  const mul = unit === 'rem' ? 16 : 1;
  if (unit === '%') return 0;
  const sum = axis === 'h' ? left + right : top + bottom;
  return Math.max(0, sum * mul);
}

function borderInsetSidePx(style: EditorElement['style'], side: 'Left' | 'Right' | 'Top' | 'Bottom'): number {
  const key = `border${side}Width` as keyof EditorElement['style'];
  const v = style[key];
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, v);
  const s = String(v).trim().toLowerCase();
  if (s === 'thin') return 1;
  const m = /^([\d.]+)px$/i.exec(s);
  if (m?.[1] != null) return Math.max(0, Number.parseFloat(m[1]));
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function horizontalBorderInsetPx(style: EditorElement['style']): number {
  return borderInsetSidePx(style, 'Left') + borderInsetSidePx(style, 'Right');
}

function verticalBorderInsetPx(style: EditorElement['style']): number {
  return borderInsetSidePx(style, 'Top') + borderInsetSidePx(style, 'Bottom');
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

/** Letter-spacing adds (n−1) extra gaps on a line — must match CSS for `width:auto` Rnd boxes. */
function parseLetterSpacingPx(style: EditorElement['style'], fontSizePx: number): number {
  const ls = style.letterSpacing;
  if (ls == null || ls === 'normal') return 0;
  if (typeof ls === 'number' && Number.isFinite(ls)) return Math.max(0, ls);
  if (typeof ls === 'string') {
    const t = ls.trim().toLowerCase();
    const em = /^([\d.]+)em$/i.exec(t);
    if (em?.[1] != null) return Math.max(0, Number.parseFloat(em[1]) * fontSizePx);
    const rem = /^([\d.]+)rem$/i.exec(t);
    if (rem?.[1] != null) return Math.max(0, Number.parseFloat(rem[1]) * 16);
    const px = /^([\d.]+)px$/i.exec(t);
    if (px?.[1] != null) return Math.max(0, Number.parseFloat(px[1]));
    const n = Number.parseFloat(t);
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return 0;
}

/** Match rendered text for width heuristics (uppercase etc. changes glyph widths). */
function displayTextForMetrics(
  content: string,
  textTransform: EditorElement['style']['textTransform'] | undefined,
): string {
  if (textTransform == null) return content;
  const t = String(textTransform).toLowerCase();
  if (t === 'uppercase') return content.toLocaleUpperCase('und');
  if (t === 'lowercase') return content.toLowerCase();
  if (t === 'capitalize') {
    return content.replace(/\S+/gu, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }
  return content;
}

function inferSizeForBounds(resolved: EditorElement): { w: number; h: number } {
  const fs = fontSizeToPx(resolved.style.fontSize);
  switch (resolved.type) {
    case 'text': {
      const raw = displayTextForMetrics(
        htmlToPlainText(resolved.content),
        resolved.style.textTransform,
      );
      const lines = raw.split('\n').map(line => line.replace(/\r/g, ''));
      const letterGapPx = parseLetterSpacingPx(resolved.style, fs);
      const lineBoxPx = resolveApproxLineBoxPx(resolved.style, fs);
      const padRead = readBoxModel(resolved.style, 'padding');
      const padH = approxPaddingAxisPx(padRead, 'h');
      const padV = approxPaddingAxisPx(padRead, 'v');
      const borderH = horizontalBorderInsetPx(resolved.style);
      const borderV = verticalBorderInsetPx(resolved.style);
      // Per-line width: glyph estimate + letter-spacing gaps (demo badge uses wide tracking).
      let maxContentW = Math.ceil(fs * 1.85);
      for (const line of lines) {
        const run = Math.max(1, [...line].length);
        const baseGlyphW = Math.ceil(run * fs * 0.485 + fs * 0.35 + Math.min(fs * 0.25, 6));
        const letterExtra = Math.max(0, run - 1) * letterGapPx;
        maxContentW = Math.max(maxContentW, baseGlyphW + letterExtra);
      }
      const wInner = Math.min(1600, maxContentW);
      const interLineExtras = Math.max(0, lines.length - 1) * Math.min(4, Math.ceil(fs * 0.08));
      const hStack = Math.ceil(lines.length * lineBoxPx + interLineExtras);
      const hInner = Math.max(Math.ceil(fs * 1.05), hStack);
      return {
        w: Math.ceil(wInner + padH + borderH),
        h: Math.ceil(hInner + padV + borderV),
      };
    }
    case 'image':
      return { w: 320, h: 240 };
    case 'video':
      return { w: 320, h: 200 };
    case 'button': {
      const label = displayTextForMetrics(
        htmlToPlainText(resolved.content || ''),
        resolved.style.textTransform,
      );
      const len = Math.max([...label].length, 4);
      const padRead = readBoxModel(resolved.style, 'padding');
      const padH = approxPaddingAxisPx(padRead, 'h');
      const padV = approxPaddingAxisPx(padRead, 'v');
      const borderH = horizontalBorderInsetPx(resolved.style);
      const borderV = verticalBorderInsetPx(resolved.style);
      const letterExtra = Math.max(0, len - 1) * parseLetterSpacingPx(resolved.style, fs);
      const contentW = Math.ceil(len * fs * 0.48 + fs * 1.85 + letterExtra);
      const hInner = Math.max(34, Math.ceil(fs * 1.58 + fs * 0.35 + 10));
      return {
        w: Math.ceil(Math.max(88, Math.min(880, contentW)) + padH + borderH),
        h: Math.ceil(hInner + padV + borderV),
      };
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

/** Width and height of an element's axis-aligned bounding box (parent-local, rotation included). */
export function getElementOuterSize(element: EditorElement, viewMode: ViewMode): { width: number; height: number } {
  const rect = localOuterBounds(element, viewMode);
  return {
    width: Math.max(0, rect.maxX - rect.minX),
    height: Math.max(0, rect.maxY - rect.minY),
  };
}
