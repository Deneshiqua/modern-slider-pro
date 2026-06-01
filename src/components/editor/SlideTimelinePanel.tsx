import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Timeline } from '@xzdarcy/react-timeline-editor';
import type { TimelineState } from '@xzdarcy/react-timeline-editor';
import '@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEditor } from '@/context/EditorContext';
import { useSlideTimelinePlayback } from '@/context/SlideTimelinePlaybackContext';
import { useLanguage } from '@/context/LanguageContext';
import {
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

const TIMELINE_SCALE_WIDTH_DEFAULT = 72;
const TIMELINE_SCALE_WIDTH_MIN = 36;
const TIMELINE_SCALE_WIDTH_MAX = 240;
const TIMELINE_SCALE_WIDTH_STEP = 8;

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
  const timelineWrapRef = useRef<HTMLDivElement>(null);
  const [scaleWidth, setScaleWidth] = useState(TIMELINE_SCALE_WIDTH_DEFAULT);
  const { registerTimeline, isTimelinePaused, play, pause, stop } = useSlideTimelinePlayback();
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    selectElement,
    updateElementsForMode,
    updateSlideTimelineDuration,
    propertyMode,
    isPlaying,
    isSlideTimelinePlaying,
  } = useEditor();

  const slide = slides[currentSlideIndex];
  const duration = slide ? getSlideTimelineDuration(slide) : 6;

  const editorData = useMemo(
    () => (slide ? slideElementsToTimelineRows(slide) : []),
    [slide],
  );

  const minScaleCount = useMemo(
    () => Math.max(12, Math.ceil(duration / 1) + 4),
    [duration],
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

  const setTimelineRef = useCallback(
    (instance: TimelineState | null) => {
      registerTimeline(instance);
    },
    [registerTimeline],
  );

  const handlePlayPause = useCallback(() => {
    if (!editorData.length) return;

    if (!isSlideTimelinePlaying || isTimelinePaused) {
      play();
      return;
    }

    pause();
  }, [editorData.length, isSlideTimelinePlaying, isTimelinePaused, play, pause]);

  useEffect(() => {
    const wrap = timelineWrapRef.current;
    if (!wrap) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -TIMELINE_SCALE_WIDTH_STEP : TIMELINE_SCALE_WIDTH_STEP;
      setScaleWidth((prev) =>
        Math.min(TIMELINE_SCALE_WIDTH_MAX, Math.max(TIMELINE_SCALE_WIDTH_MIN, prev + delta)),
      );
    };

    const preventSelect = (event: Event) => {
      event.preventDefault();
    };

    wrap.addEventListener('wheel', handleWheel, { passive: false });
    wrap.addEventListener('selectstart', preventSelect);
    wrap.addEventListener('dragstart', preventSelect);
    return () => {
      wrap.removeEventListener('wheel', handleWheel);
      wrap.removeEventListener('selectstart', preventSelect);
      wrap.removeEventListener('dragstart', preventSelect);
    };
  }, [editorData.length]);

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
          'msp-h-full msp-w-full msp-select-none msp-rounded-sm msp-px-1 msp-text-[10px] msp-leading-[26px] msp-truncate',
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
        <div className="msp-flex msp-min-w-0 msp-flex-1 msp-items-center msp-gap-2">
          <div className="msp-flex msp-items-center msp-gap-0.5">
            <Button
              type="button"
              variant={isSlideTimelinePlaying && !isTimelinePaused ? 'secondary' : 'default'}
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={handlePlayPause}
              disabled={isPlaying || editorData.length === 0}
              title={
                isSlideTimelinePlaying && !isTimelinePaused
                  ? t('editor.timeline.pause')
                  : t('editor.timeline.play')
              }
            >
              {isSlideTimelinePlaying && !isTimelinePaused ? (
                <Pause className="msp-h-3.5 msp-w-3.5" />
              ) : (
                <Play className="msp-h-3.5 msp-w-3.5" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={stop}
              disabled={!isSlideTimelinePlaying}
              title={t('editor.timeline.stop')}
            >
              <Square className="msp-h-3 msp-w-3" />
            </Button>
          </div>
          <div className="msp-min-w-0">
            <p className="msp-text-xs msp-font-semibold">{t('editor.timeline.title')}</p>
            <p className="msp-text-[10px] msp-text-muted-foreground msp-leading-snug msp-truncate">
              {t('editor.timeline.hint')}
            </p>
          </div>
        </div>
        <div className="msp-flex msp-shrink-0 msp-items-center msp-gap-2">
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
            disabled={isSlideTimelinePlaying}
          />
        </div>
      </div>

      <div
        ref={timelineWrapRef}
        className={cn(
          'msp-min-h-0 msp-flex-1 msp-overflow-hidden msp-select-none',
          '[&_.timeline-editor]:!msp-select-none [&_.timeline-editor_*]:!msp-select-none',
          '[&_.timeline-editor]:!msp-h-full [&_.timeline-editor]:!msp-w-full [&_.timeline-editor]:!msp-min-h-0',
          '[&_.timeline-editor]:!msp-bg-card',
          '[&_.ReactVirtualized__Grid]:!overflow-auto',
          '[&_.ReactVirtualized__Grid::-webkit-scrollbar]:!h-2 [&_.ReactVirtualized__Grid::-webkit-scrollbar]:!w-2',
          '[scrollbar-width:thin]',
          '[&_.timeline-editor-action-left-stretch]:!cursor-ew-resize',
          '[&_.timeline-editor-action-right-stretch]:!cursor-ew-resize',
          '[&_.timeline-editor-action-left-stretch]:!z-10',
          '[&_.timeline-editor-action-right-stretch]:!z-10',
          isPlaying && 'msp-pointer-events-none msp-opacity-60',
        )}
      >
        {editorData.length === 0 ? (
          <p className="msp-p-4 msp-text-xs msp-text-muted-foreground">{t('editor.timeline.empty')}</p>
        ) : (
          <Timeline
            ref={setTimelineRef}
            style={{ width: '100%', height: '100%' }}
            editorData={editorData}
            effects={MSP_TIMELINE_EFFECTS}
            scale={1}
            scaleWidth={scaleWidth}
            scaleSplitCount={5}
            minScaleCount={minScaleCount}
            rowHeight={28}
            gridSnap
            dragLine
            autoScroll
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
