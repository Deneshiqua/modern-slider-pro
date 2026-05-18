import type { EditorElement } from '@/types/editor';

/** True when `targetId` is `boxId` or a descendant of that box anywhere on the slide tree. */
export const elementSubtreeContainsSlide = (
  slideRoots: EditorElement[],
  boxId: string,
  targetId: string,
): boolean => {
  const stack: EditorElement[] = [...slideRoots];
  while (stack.length > 0) {
    const el = stack.pop()!;
    if (el.id === boxId) {
      if (el.id === targetId) return true;
      const visit = (nodes: EditorElement[]): boolean =>
        nodes.some((n) => n.id === targetId || Boolean(n.children && visit(n.children)));
      return el.children?.length ? visit(el.children) : false;
    }
    if (el.children?.length) stack.push(...el.children);
  }
  return false;
};
