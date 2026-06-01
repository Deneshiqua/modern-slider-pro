import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { TimelineState } from '@xzdarcy/react-timeline-editor';

import { useEditor } from '@/context/EditorContext';
import { flattenSlideElements, getSlideTimelineDuration } from '@/lib/timelineBridge';

type SlideTimelinePlaybackContextValue = {
  registerTimeline: (api: TimelineState | null) => void;
  isTimelinePaused: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
};

const SlideTimelinePlaybackContext = createContext<SlideTimelinePlaybackContextValue | null>(null);

export function SlideTimelinePlaybackProvider({ children }: { children: ReactNode }) {
  const {
    slides,
    currentSlideIndex,
    isPlaying,
    startSlideTimelinePreview,
    stopSlideTimelinePreview,
  } = useEditor();

  const timelineRef = useRef<TimelineState | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detachEngineRef = useRef<(() => void) | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const durationRef = useRef(6);

  const [isTimelinePaused, setIsTimelinePaused] = useState(false);

  const slide = slides[currentSlideIndex];
  const duration = slide ? getSlideTimelineDuration(slide) : 6;
  isPlayingRef.current = isPlaying;
  durationRef.current = duration;

  const clearEndTimer = useCallback(() => {
    if (endTimerRef.current !== null) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
  }, []);

  const syncTimelinePlayhead = useCallback((toTime: number) => {
    const api = timelineRef.current;
    if (!api) return;
    api.setTime(0);
    api.play({ toTime, autoEnd: true });
    setIsTimelinePaused(false);
  }, []);

  const stop = useCallback(() => {
    clearEndTimer();
    timelineRef.current?.pause();
    timelineRef.current?.setTime(0);
    stopSlideTimelinePreview();
    setIsTimelinePaused(false);
  }, [clearEndTimer, stopSlideTimelinePreview]);

  const scheduleEndRef = useRef<() => void>(() => {});

  const scheduleEnd = useCallback(() => {
    clearEndTimer();
    endTimerRef.current = setTimeout(() => {
      endTimerRef.current = null;
      if (isPlayingRef.current) {
        startSlideTimelinePreview();
        syncTimelinePlayhead(durationRef.current);
        scheduleEndRef.current();
        return;
      }
      stop();
    }, Math.max(50, durationRef.current * 1000));
  }, [clearEndTimer, startSlideTimelinePreview, stop, syncTimelinePlayhead]);

  scheduleEndRef.current = scheduleEnd;

  const play = useCallback(() => {
    if (!slide || flattenSlideElements(slide.elements).length === 0) return;
    startSlideTimelinePreview();
    syncTimelinePlayhead(duration);
    scheduleEnd();
    setIsTimelinePaused(false);
  }, [duration, scheduleEnd, slide, startSlideTimelinePreview, syncTimelinePlayhead]);

  const pause = useCallback(() => {
    clearEndTimer();
    timelineRef.current?.pause();
    setIsTimelinePaused(true);
  }, [clearEndTimer]);

  const registerTimeline = useCallback(
    (api: TimelineState | null) => {
      detachEngineRef.current?.();
      detachEngineRef.current = null;
      timelineRef.current = api;
      if (!api) return;

      const engine = api.listener;
      const handleEnded = () => {
        if (isPlayingRef.current) {
          startSlideTimelinePreview();
          syncTimelinePlayhead(durationRef.current);
          scheduleEndRef.current();
          return;
        }
        stop();
      };
      const handlePaused = () => setIsTimelinePaused(true);
      const handlePlay = () => setIsTimelinePaused(false);

      engine.on('ended', handleEnded);
      engine.on('paused', handlePaused);
      engine.on('play', handlePlay);

      detachEngineRef.current = () => {
        engine.off('ended', handleEnded);
        engine.off('paused', handlePaused);
        engine.off('play', handlePlay);
      };
    },
    [startSlideTimelinePreview, stop, syncTimelinePlayhead],
  );

  /** Toolbar preview: loop entrance animations while isPlaying (works with timeline panel hidden). */
  useEffect(() => {
    if (!isPlaying) return;
    play();
    return () => {
      clearEndTimer();
      timelineRef.current?.pause();
      timelineRef.current?.setTime(0);
    };
  }, [isPlaying, currentSlideIndex, play, clearEndTimer]);

  useEffect(() => {
    if (!isPlaying) stop();
  }, [isPlaying, stop]);

  useEffect(() => {
    if (isPlaying) return;
    stop();
  }, [currentSlideIndex, isPlaying, stop]);

  useEffect(
    () => () => {
      clearEndTimer();
      detachEngineRef.current?.();
    },
    [clearEndTimer],
  );

  const value = React.useMemo(
    () => ({
      registerTimeline,
      isTimelinePaused,
      play,
      pause,
      stop,
    }),
    [registerTimeline, isTimelinePaused, play, pause, stop],
  );

  return (
    <SlideTimelinePlaybackContext.Provider value={value}>
      {children}
    </SlideTimelinePlaybackContext.Provider>
  );
}

export function useSlideTimelinePlayback() {
  const ctx = useContext(SlideTimelinePlaybackContext);
  if (!ctx) {
    throw new Error('useSlideTimelinePlayback must be used within SlideTimelinePlaybackProvider');
  }
  return ctx;
}
