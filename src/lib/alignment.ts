import { CanvasSettings, EditorElement, ViewMode } from '@/types/editor';
import { getEditorViewportSize } from '@/lib/constants';
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

const getAncestorSlideOffset = (
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
