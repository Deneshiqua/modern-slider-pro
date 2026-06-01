import { CanvasSettings, EditorElement, ViewMode } from '@/types/editor';
import { getEditorViewportSize } from '@/lib/constants';
import type { BoundsRect } from '@/lib/groupBounds';
import { getElementOuterSize } from '@/lib/groupBounds';
import { resolveElementProperties } from '@/lib/responsive';

export type AlignmentAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type AlignmentReference = 'element' | 'group' | 'canvas';

export type ElementTreeMatch = {
  element: EditorElement;
  parent: EditorElement | null;
};

export const findElementInTree = (
  elements: EditorElement[],
  id: string,
  parent: EditorElement | null = null,
): ElementTreeMatch | null => {
  for (const element of elements) {
    if (element.id === id) {
      return { element, parent };
    }

    if (element.children?.length) {
      const found = findElementInTree(element.children, id, element);
      if (found) return found;
    }
  }

  return null;
};

export const getAncestorSlideOffset = (
  elements: EditorElement[],
  elementId: string,
  viewMode: ViewMode,
): { x: number; y: number } => {
  const path: EditorElement[] = [];

  const walk = (nodes: EditorElement[], targetId: string, chain: EditorElement[]): boolean => {
    for (const node of nodes) {
      const nextChain = [...chain, node];

      if (node.id === targetId) {
        path.push(...chain);
        return true;
      }

      if (node.children?.length && walk(node.children, targetId, nextChain)) {
        return true;
      }
    }

    return false;
  };

  walk(elements, elementId, []);

  return path.reduce(
    (acc, node) => {
      const resolved = resolveElementProperties(node, viewMode);
      return {
        x: acc.x + resolved.x,
        y: acc.y + resolved.y,
      };
    },
    { x: 0, y: 0 },
  );
};

const getSlidePosition = (
  elements: EditorElement[],
  elementId: string,
  viewMode: ViewMode,
): { x: number; y: number } => {
  const match = findElementInTree(elements, elementId);
  if (!match) return { x: 0, y: 0 };

  const ancestorOffset = getAncestorSlideOffset(elements, elementId, viewMode);
  const resolved = resolveElementProperties(match.element, viewMode);

  return {
    x: ancestorOffset.x + resolved.x,
    y: ancestorOffset.y + resolved.y,
  };
};

export const computeAlignedLocalPosition = (
  anchor: AlignmentAnchor,
  reference: AlignmentReference,
  element: EditorElement,
  slideElements: EditorElement[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
): { x: number; y: number } | null => {
  const { width: elementWidth, height: elementHeight } = getElementOuterSize(element, viewMode);
  const match = findElementInTree(slideElements, element.id);

  if (!match) return null;

  const { parent } = match;

  let containerWidth = 0;
  let containerHeight = 0;
  let containerSlideX = 0;
  let containerSlideY = 0;

  if (reference === 'canvas') {
    const viewport = getEditorViewportSize(viewMode, canvasSettings);
    containerWidth = viewport.width;
    containerHeight = viewport.height;
    containerSlideX = 0;
    containerSlideY = 0;
  } else if (reference === 'group') {
    if (!parent?.isGroup) return null;

    const parentSize = getElementOuterSize(parent, viewMode);
    containerWidth = parentSize.width;
    containerHeight = parentSize.height;
    const parentSlide = getSlidePosition(slideElements, parent.id, viewMode);
    containerSlideX = parentSlide.x;
    containerSlideY = parentSlide.y;
  } else {
    if (!parent || parent.type !== 'box') {
      const viewport = getEditorViewportSize(viewMode, canvasSettings);
      containerWidth = viewport.width;
      containerHeight = viewport.height;
      containerSlideX = 0;
      containerSlideY = 0;
    } else {
      const parentSize = getElementOuterSize(parent, viewMode);
      containerWidth = parentSize.width;
      containerHeight = parentSize.height;
      const parentSlide = getSlidePosition(slideElements, parent.id, viewMode);
      containerSlideX = parentSlide.x;
      containerSlideY = parentSlide.y;
    }
  }

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

  const targetSlideX =
    horizontal === 'left'
      ? containerSlideX
      : horizontal === 'right'
        ? containerSlideX + containerWidth - elementWidth
        : containerSlideX + (containerWidth - elementWidth) / 2;

  const targetSlideY =
    vertical === 'top'
      ? containerSlideY
      : vertical === 'bottom'
        ? containerSlideY + containerHeight - elementHeight
        : containerSlideY + (containerHeight - elementHeight) / 2;

  const ancestorOffset = getAncestorSlideOffset(slideElements, element.id, viewMode);

  return {
    x: Math.round(targetSlideX - ancestorOffset.x),
    y: Math.round(targetSlideY - ancestorOffset.y),
  };
};

/** Uses measured slide-space box (DOM) so canvas snapping matches the real Rnd frame. */
export function computeCanvasRefinedLocalPosition(
  anchor: AlignmentAnchor,
  elementId: string,
  slideElements: EditorElement[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
  measured: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  const { width: vw, height: vh } = getEditorViewportSize(viewMode, canvasSettings);
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

  let slideX = measured.left;
  let slideY = measured.top;
  if (horizontal === 'left') slideX = 0;
  else if (horizontal === 'right') slideX = vw - measured.width;
  else slideX = (vw - measured.width) / 2;

  if (vertical === 'top') slideY = 0;
  else if (vertical === 'bottom') slideY = vh - measured.height;
  else slideY = (vh - measured.height) / 2;

  const ancestorOffset = getAncestorSlideOffset(slideElements, elementId, viewMode);
  return {
    x: Math.round(slideX - ancestorOffset.x),
    y: Math.round(slideY - ancestorOffset.y),
  };
}

/** 3×3 grid ordering for alignment picker UI — keep in sync with `alignmentAnchorGrid` */
export const ALIGNMENT_GRID_ANCHORS: AlignmentAnchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/** Highlight the closest grid tile only while the layout still matches that snap (px, local coords / delta). */
const ALIGN_GRID_SELECTION_MATCH_MAX_PX = 64;

/** Which anchor best matches current placement for the chosen reference mode (viewport / canvas math). */
export const guessClosestAlignmentAnchor = (
  reference: AlignmentReference,
  element: EditorElement,
  slideElements: EditorElement[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
): AlignmentAnchor | null => {
  const cur = resolveElementProperties(element, viewMode);
  let best: AlignmentAnchor | null = null;
  let bestScore = Infinity;

  for (const anchor of ALIGNMENT_GRID_ANCHORS) {
    const pos = computeAlignedLocalPosition(
      anchor,
      reference,
      element,
      slideElements,
      viewMode,
      canvasSettings,
    );
    if (!pos) continue;
    const score = Math.hypot(pos.x - cur.x, pos.y - cur.y);
    if (score < bestScore) {
      bestScore = score;
      best = anchor;
    }
  }

  if (best === null || bestScore > ALIGN_GRID_SELECTION_MATCH_MAX_PX) return null;
  return best;
};

/** Canvas-only multi-select: anchored when applying that alignment would barely move selection. */
export const guessClosestMultiSelectionCanvasAnchor = (
  selectedIds: string[],
  slideElements: EditorElement[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
): AlignmentAnchor | null => {
  let best: AlignmentAnchor | null = null;
  let bestScore = Infinity;

  for (const anchor of ALIGNMENT_GRID_ANCHORS) {
    const delta = computeMultiSelectionCanvasAlignDelta(
      anchor,
      slideElements,
      selectedIds,
      viewMode,
      canvasSettings,
    );
    if (!delta) continue;
    const score = Math.hypot(delta.dx, delta.dy);
    if (score < bestScore) {
      bestScore = score;
      best = anchor;
    }
  }

  if (best === null || bestScore > ALIGN_GRID_SELECTION_MATCH_MAX_PX) return null;
  return best;
};

export const canUseAlignmentReference = (
  reference: AlignmentReference,
  elementId: string,
  slideElements: EditorElement[],
): boolean => {
  const match = findElementInTree(slideElements, elementId);
  if (!match) return false;

  if (reference === 'canvas') return true;
  if (reference === 'group') return Boolean(match.parent?.isGroup);
  return Boolean(match.parent?.type === 'box') || !match.parent;
};

const findAncestorChainIds = (
  slideElements: EditorElement[],
  targetId: string,
  chain: EditorElement[] = [],
): EditorElement[] | null => {
  for (const el of slideElements) {
    if (el.id === targetId) {
      return [...chain, el];
    }
    if (el.children?.length) {
      const nested = findAncestorChainIds(el.children, targetId, [...chain, el]);
      if (nested) return nested;
    }
  }
  return null;
};

/**
 * Drops ancestor ids when parent+child both selected — same rule as clipboard.
 */
export const pruneMultiSelectionIds = (selectedIds: string[], slideElements: EditorElement[]): string[] => {
  const uniq = [...new Set(selectedIds.filter(Boolean))];
  return uniq.filter((id) => {
    const chain = findAncestorChainIds(slideElements, id);
    if (!chain?.length) return false;
    const ancestors = chain.slice(0, -1);
    return !ancestors.some((a) => uniq.includes(a.id));
  });
};

const unionRects = (rects: BoundsRect[]): BoundsRect | null => {
  if (!rects.length) return null;
  return rects.reduce(
    (acc, r) => ({
      minX: Math.min(acc.minX, r.minX),
      minY: Math.min(acc.minY, r.minY),
      maxX: Math.max(acc.maxX, r.maxX),
      maxY: Math.max(acc.maxY, r.maxY),
    }),
    { ...rects[0] },
  );
};

/**
 * Approximate axis-aligned bbox in slide space (works well when rotation ~0°).
 */
const approxSlideElementBounds = (
  slideElements: EditorElement[],
  elementId: string,
  viewMode: ViewMode,
): BoundsRect | null => {
  const match = findElementInTree(slideElements, elementId);
  if (!match) return null;
  const { width, height } = getElementOuterSize(match.element, viewMode);
  const tl = getSlidePosition(slideElements, elementId, viewMode);
  return { minX: tl.x, minY: tl.y, maxX: tl.x + width, maxY: tl.y + height };
};

/** Move every selected subtree so their combined bounds snap to canvas edges / center like a single rect. */
export const computeMultiSelectionCanvasAlignDelta = (
  anchor: AlignmentAnchor,
  slideElements: EditorElement[],
  selectedIds: string[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
): { dx: number; dy: number } | null => {
  const ids = pruneMultiSelectionIds(selectedIds, slideElements);
  if (ids.length < 2) return null;

  const rects: BoundsRect[] = [];
  for (const id of ids) {
    const b = approxSlideElementBounds(slideElements, id, viewMode);
    if (b) rects.push(b);
  }

  const union = unionRects(rects);
  if (!union) return null;

  const vw = getEditorViewportSize(viewMode, canvasSettings);
  const groupW = union.maxX - union.minX;
  const groupH = union.maxY - union.minY;

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
    horizontal === 'left'
      ? 0
      : horizontal === 'right'
        ? vw.width - groupW
        : (vw.width - groupW) / 2;
  const targetMinY =
    vertical === 'top'
      ? 0
      : vertical === 'bottom'
        ? vw.height - groupH
        : (vw.height - groupH) / 2;

  return {
    dx: Math.round(targetMinX - union.minX),
    dy: Math.round(targetMinY - union.minY),
  };
};

/** Horizontal-only canvas alignment: move selection by `dx` so the union box aligns left/center/right; `dy` is always 0 (vertical layout preserved). */
export type RowAlignHorizontal = 'left' | 'center' | 'right';

const ROW_ALIGN_SELECTION_MATCH_MAX_PX = 64;

export function computeMultiSelectionRowAlignDelta(
  horizontal: RowAlignHorizontal,
  slideElements: EditorElement[],
  selectedIds: string[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
): { dx: number } | null {
  const ids = pruneMultiSelectionIds(selectedIds, slideElements);
  if (ids.length < 1) return null;

  const rects: BoundsRect[] = [];
  for (const id of ids) {
    const b = approxSlideElementBounds(slideElements, id, viewMode);
    if (b) rects.push(b);
  }

  const union = unionRects(rects);
  if (!union) return null;

  const vw = getEditorViewportSize(viewMode, canvasSettings);
  const groupW = union.maxX - union.minX;

  const targetMinX =
    horizontal === 'left' ? 0 : horizontal === 'right' ? vw.width - groupW : (vw.width - groupW) / 2;

  return { dx: Math.round(targetMinX - union.minX) };
}

/** Vertical-only canvas alignment: move selection by `dy` so the union box aligns top/middle/bottom; `dx` is always 0. */
export type ColumnAlignVertical = 'top' | 'middle' | 'bottom';

export function computeMultiSelectionColumnAlignDelta(
  vertical: ColumnAlignVertical,
  slideElements: EditorElement[],
  selectedIds: string[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
): { dy: number } | null {
  const ids = pruneMultiSelectionIds(selectedIds, slideElements);
  if (ids.length < 1) return null;

  const rects: BoundsRect[] = [];
  for (const id of ids) {
    const b = approxSlideElementBounds(slideElements, id, viewMode);
    if (b) rects.push(b);
  }

  const union = unionRects(rects);
  if (!union) return null;

  const vw = getEditorViewportSize(viewMode, canvasSettings);
  const groupH = union.maxY - union.minY;

  const targetMinY =
    vertical === 'top' ? 0 : vertical === 'bottom' ? vw.height - groupH : (vw.height - groupH) / 2;

  return { dy: Math.round(targetMinY - union.minY) };
}

/** Which column-align mode best matches current placement (smallest vertical correction). */
export function guessClosestColumnAlignVertical(
  slideElements: EditorElement[],
  selectedIds: string[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
): ColumnAlignVertical | null {
  let best: ColumnAlignVertical | null = null;
  let bestScore = Infinity;

  for (const v of (['top', 'middle', 'bottom'] as const)) {
    const d = computeMultiSelectionColumnAlignDelta(v, slideElements, selectedIds, viewMode, canvasSettings);
    if (!d) continue;
    const score = Math.abs(d.dy);
    if (score < bestScore) {
      bestScore = score;
      best = v;
    }
  }

  if (best === null || bestScore > ROW_ALIGN_SELECTION_MATCH_MAX_PX) return null;
  return best;
}

/** Which row-align mode best matches current placement (smallest horizontal correction). */
export function guessClosestRowAlignHorizontal(
  slideElements: EditorElement[],
  selectedIds: string[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
): RowAlignHorizontal | null {
  let best: RowAlignHorizontal | null = null;
  let bestScore = Infinity;

  for (const h of (['left', 'center', 'right'] as const)) {
    const d = computeMultiSelectionRowAlignDelta(h, slideElements, selectedIds, viewMode, canvasSettings);
    if (!d) continue;
    const score = Math.abs(d.dx);
    if (score < bestScore) {
      bestScore = score;
      best = h;
    }
  }

  if (best === null || bestScore > ROW_ALIGN_SELECTION_MATCH_MAX_PX) return null;
  return best;
}
