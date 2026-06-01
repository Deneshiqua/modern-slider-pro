import React, { useCallback, useMemo } from 'react';
import { Timeline } from '@xzdarcy/react-timeline-editor';
import '@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  DEFAULT_SLIDE_TIMELINE_DURATION_S,
  MSP_TIMELINE_EFFECTS,
  flattenSlideElements,
  getElementTimelineClip,
  getSlideTimelineDuration,
  slideElementsToTimelineRows,
  timelineRowsToElementClips,
  type MspTimelineRow,
} from '@/lib/timelineBridge';
import type { ElementTimelineClip } from '@/types/editor';
import { cn } from '@/lib/utils';

function timelineClipsEqual(
  next: Record<string, ElementTimelineClip>,
  slideElements: ReturnType<typeof flattenSlideElements>,
): boolean {
  for (const el of slideElements) {
    const clip = getElementTimelineClip(el);
    const n = next[el.id];
    if (!n || n.start !== clip.start || n.end !== clip.end) return false;
  }
  return Object.keys(next).length === slideElements.length;
}

const SlideTimelinePanel = () => {
  const { t } = useLanguage();
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    selectElement,
    updateElementsForMode,
    updateSlideTimelineDuration,
    propertyMode,
    isPlaying,
  } = useEditor();

  const slide = slides[currentSlideIndex];
  const duration = slide ? getSlideTimelineDuration(slide) : DEFAULT_SLIDE_TIMELINE_DURATION_S;

  const editorData = useMemo(
    () => (slide ? slideElementsToTimelineRows(slide) : []),
    [slide],
  );

  const elementLabels = useMemo(() => {
    const map = new Map<string, string>();
    if (!slide) return map;
    for (const el of flattenSlideElements(slide.elements)) {
      map.set(el.id, el.name?.trim() || el.type);
    }
    return map;
  }, [slide]);

  const flatElements = useMemo(
    () => (slide ? flattenSlideElements(slide.elements) : []),
    [slide],
  );

  const handleChange = useCallback(
    (rows: MspTimelineRow[]) => {
      const clips = timelineRowsToElementClips(rows);
      if (Object.keys(clips).length === 0) return;
      if (timelineClipsEqual(clips, flatElements)) return;
      const updates: Record<string, { timelineClip: { start: number; end: number } }> = {};
      for (const [id, timelineClip] of Object.entries(clips)) {
        updates[id] = { timelineClip };
      }
      updateElementsForMode(updates, propertyMode);
    },
    [flatElements, propertyMode, updateElementsForMode],
  );

  const handleSelectRow = useCallback(
    (_e: unknown, { row }: { row: { id: string } }) => {
      selectElement(row.id);
    },
    [selectElement],
  );

  const getActionRender = useCallback(
    (action: { effectId: string }, row: { id: string }) => (
      <span
        className={cn(
          'msp-h-full msp-w-full msp-rounded-sm msp-px-1 msp-text-[10px] msp-leading-[26px] msp-truncate',
          row.id === selectedElementId
            ? 'msp-bg-primary msp-text-primary-foreground'
            : 'msp-bg-primary/70 msp-text-primary-foreground',
        )}
        title={action.effectId}
      >
        {row.id === selectedElementId ? '● ' : ''}
        {elementLabels.get(row.id) ?? row.id.slice(0, 12)}
      </span>
    ),
    [elementLabels, selectedElementId],
  );

  if (!slide) return null;

  const headerClass =
    'msp-flex msp-shrink-0 msp-items-center msp-justify-between msp-gap-3 msp-border-b msp-border-border msp-px-3 msp-py-2';

  return (
    <div className="msp-flex msp-h-full msp-min-h-0 msp-flex-col msp-border-t msp-border-border msp-bg-card msp-text-foreground">
      <div className={headerClass}>
        <div>
          <p className="msp-text-xs msp-font-semibold">{t('editor.timeline.title')}</p>
          <p className="msp-text-[10px] msp-text-muted-foreground msp-leading-snug">
            {t('editor.timeline.hint')}
          </p>
        </div>
        <div className="msp-flex msp-items-center msp-gap-2">
          <Label htmlFor="msp-slide-duration" className="msp-text-[10px] msp-whitespace-nowrap">
            {t('editor.timeline.duration')}
          </Label>
          <Input
            id="msp-slide-duration"
            type="number"
            min={1}
            step={0.5}
            className="msp-h-7 msp-w-16 msp-text-xs"
            value={duration}
            onChange={(e) => updateSlideTimelineDuration(Number(e.target.value))}
          />
        </div>
      </div>

      <div
        className={cn(
          'msp-min-h-0 msp-flex-1 msp-overflow-hidden',
          '[&_.timeline-editor]:!msp-bg-card',
          isPlaying && 'msp-pointer-events-none msp-opacity-60',
        )}
      >
        {editorData.length === 0 ? (
          <p className="msp-p-4 msp-text-xs msp-text-muted-foreground">{t('editor.timeline.empty')}</p>
        ) : (
          <Timeline
            editorData={editorData}
            effects={MSP_TIMELINE_EFFECTS}
            scale={1}
            scaleWidth={72}
            scaleSplitCount={5}
            rowHeight={28}
            gridSnap
            dragLine
            onChange={handleChange}
            onClickRow={handleSelectRow}
            onClickActionOnly={handleSelectRow}
            getActionRender={getActionRender}
          />
        )}
      </div>
    </div>
  );
};

export default SlideTimelinePanel;