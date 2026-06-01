import type { Transition } from 'framer-motion';

import type { EditorElement, ElementTimelineClip, Slide } from '@/types/editor';

/** Compatible with @xzdarcy/timeline-engine row/action shapes (not re-exported by react-timeline-editor). */
export interface MspTimelineAction {
  id: string;
  start: number;
  end: number;
  effectId: string;
  flexible?: boolean;
  movable?: boolean;
  minStart?: number;
  maxEnd?: number;
}

export interface MspTimelineRow {
  id: string;
  actions: MspTimelineAction[];
}

export const DEFAULT_SLIDE_TIMELINE_DURATION_S = 6;
export const MIN_TIMELINE_CLIP_DURATION_S = 0.05;

export const MSP_TIMELINE_EFFECTS = {
  entrance: {
    id: 'entrance',
    name: 'Entrance',
  },
} as const;

export function flattenSlideElements(elements: EditorElement[]): EditorElement[] {
  const out: EditorElement[] = [];
  const walk = (nodes: EditorElement[]) => {
    for (const el of nodes) {
      if (el.isVisible === false) continue;
      out.push(el);
      if (el.children?.length) walk(el.children);
    }
  };
  walk(elements);
  return out;
}

export function getSlideTimelineDuration(slide: Slide): number {
  return slide.timeline?.duration ?? DEFAULT_SLIDE_TIMELINE_DURATION_S;
}

export function defaultTimelineClipForElement(el: EditorElement): ElementTimelineClip {
  const tr = el.animation?.transition;
  const delay =
    tr && typeof tr === 'object' && 'delay' in tr && typeof tr.delay === 'number' ? tr.delay : 0;
  const duration =
    tr && typeof tr === 'object' && 'duration' in tr && typeof tr.duration === 'number'
      ? tr.duration
      : 0.5;
  return {
    start: delay,
    end: Math.max(delay + MIN_TIMELINE_CLIP_DURATION_S, delay + duration),
  };
}

export function getElementTimelineClip(el: EditorElement): ElementTimelineClip {
  return el.timelineClip ?? defaultTimelineClipForElement(el);
}

export function slideElementsToTimelineRows(slide: Slide): MspTimelineRow[] {
  const maxEnd = getSlideTimelineDuration(slide);
  return flattenSlideElements(slide.elements).map((el) => {
    const clip = getElementTimelineClip(el);
    const end = Math.min(maxEnd, Math.max(clip.start + MIN_TIMELINE_CLIP_DURATION_S, clip.end));
    const start = Math.max(0, Math.min(clip.start, end - MIN_TIMELINE_CLIP_DURATION_S));
    const label = el.name?.trim() || el.type;
    return {
      id: el.id,
      actions: [
        {
          id: `clip-${el.id}`,
          start,
          end,
          effectId: MSP_TIMELINE_EFFECTS.entrance.id,
          flexible: true,
          movable: true,
          minStart: 0,
          maxEnd,
        } satisfies MspTimelineAction,
      ],
    } satisfies MspTimelineRow;
  });
}

export function timelineRowsToElementClips(rows: MspTimelineRow[]): Record<string, ElementTimelineClip> {
  const updates: Record<string, ElementTimelineClip> = {};
  for (const row of rows) {
    const action = row.actions?.[0];
    if (!action) continue;
    const start = Math.max(0, action.start);
    const end = Math.max(start + MIN_TIMELINE_CLIP_DURATION_S, action.end);
    updates[row.id] = { start, end };
  }
  return updates;
}

/** Merge timeline clip into Framer Motion transition for entrance presets. */
export function resolveElementPlaybackTransition(element: EditorElement): Transition | undefined {
  if (!element.animation || element.animation.name === 'None') return undefined;
  const base = { ...element.animation.transition } as Transition;
  const clip = element.timelineClip;
  if (!clip) return base;
  return {
    ...base,
    delay: clip.start,
    duration: Math.max(MIN_TIMELINE_CLIP_DURATION_S, clip.end - clip.start),
  };
}
