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
import {
  flattenSlideElements,
  getSlideAutoplayDwellSeconds,
  getSlideTimelineDuration,
  shouldRunSliderAutoplay,
} from '@/lib/timelineBridge';

type SlideTimelinePlaybackContextValue = {
  registerTimeline: (api: TimelineState | null) => void;
  isTimelinePaused: boolean;
  autoplayPausedByHover: boolean;
  setAutoplayPausedByHover: (paused: boolean) => void;
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
    settings,
    setCurrentSlide,
    startSlideTimelinePreview,
    stopSlideTimelinePreview,
  } = useEditor();

  const timelineRef = useRef<TimelineState | null>(null);
  /** Timeline-only preview stop (panel play, not toolbar). */
  const timelineEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Toolbar preview: advance to next slide. */
  const slideAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detachEngineRef = useRef<(() => void) | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const durationRef = useRef(6);
  const currentSlideIndexRef = useRef(currentSlideIndex);
  const slidesRef = useRef(slides);
  const settingsRef = useRef(settings);

  const [isTimelinePaused, setIsTimelinePaused] = useState(false);
  const [autoplayPausedByHover, setAutoplayPausedByHover] = useState(false);

  const slide = slides[currentSlideIndex];
  const duration = slide ? getSlideTimelineDuration(slide) : 6;
  isPlayingRef.current = isPlaying;
  durationRef.current = duration;
  currentSlideIndexRef.current = currentSlideIndex;
  slidesRef.current = slides;
  settingsRef.current = settings;

  const clearTimelineEndTimer = useCallback(() => {
    if (timelineEndTimerRef.current !== null) {
      clearTimeout(timelineEndTimerRef.current);
      timelineEndTimerRef.current = null;
    }
  }, []);

  const clearSlideAdvanceTimer = useCallback(() => {
    if (slideAdvanceTimerRef.current !== null) {
      clearTimeout(slideAdvanceTimerRef.current);
      slideAdvanceTimerRef.current = null;
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
    clearTimelineEndTimer();
    clearSlideAdvanceTimer();
    timelineRef.current?.pause();
    timelineRef.current?.setTime(0);
    stopSlideTimelinePreview();
    setIsTimelinePaused(false);
  }, [clearSlideAdvanceTimer, clearTimelineEndTimer, stopSlideTimelinePreview]);

  const scheduleTimelineEnd = useCallback(() => {
    clearTimelineEndTimer();
    timelineEndTimerRef.current = setTimeout(() => {
      timelineEndTimerRef.current = null;
      stop();
    }, Math.max(50, durationRef.current * 1000));
  }, [clearTimelineEndTimer, stop]);

  const replayCurrentSlidePreview = useCallback(() => {
    const slideList = slidesRef.current;
    const idx = currentSlideIndexRef.current;
    const activeSlide = slideList[idx];
    if (!activeSlide) return;

    startSlideTimelinePreview();
    if (flattenSlideElements(activeSlide.elements).length > 0) {
      syncTimelinePlayhead(getSlideTimelineDuration(activeSlide));
    }
  }, [startSlideTimelinePreview, syncTimelinePlayhead]);

  const scheduleSlideAdvanceRef = useRef<() => void>(() => {});

  const scheduleSlideAdvance = useCallback(() => {
    clearSlideAdvanceTimer();

    const slideList = slidesRef.current;
    const autoplaySettings = settingsRef.current;
    if (!shouldRunSliderAutoplay(slideList.length, autoplaySettings.autoPlay, autoplaySettings.loop)) {
      return;
    }

    const activeSlide = slideList[currentSlideIndexRef.current];
    if (!activeSlide) return;

    const dwellMs = getSlideAutoplayDwellSeconds(activeSlide, autoplaySettings.interval ?? 5) * 1000;

    slideAdvanceTimerRef.current = setTimeout(() => {
      slideAdvanceTimerRef.current = null;
      if (!isPlayingRef.current) return;

      const settingsNow = settingsRef.current;
      const slidesNow = slidesRef.current;
      if (!shouldRunSliderAutoplay(slidesNow.length, settingsNow.autoPlay, settingsNow.loop)) {
        return;
      }

      const prev = currentSlideIndexRef.current;

      if (slidesNow.length <= 1 && settingsNow.loop) {
        replayCurrentSlidePreview();
      } else {
        const next = settingsNow.loop
          ? (prev + 1) % slidesNow.length
          : Math.min(prev + 1, slidesNow.length - 1);
        if (next !== prev) {
          setCurrentSlide(next);
        }
      }

      scheduleSlideAdvanceRef.current();
    }, dwellMs);
  }, [clearSlideAdvanceTimer, replayCurrentSlidePreview, setCurrentSlide]);

  scheduleSlideAdvanceRef.current = scheduleSlideAdvance;

  const play = useCallback(() => {
    if (!slide) return;

    const hasClips = flattenSlideElements(slide.elements).length > 0;

    if (isPlayingRef.current) {
      if (hasClips) {
        startSlideTimelinePreview();
        syncTimelinePlayhead(duration);
      }
      setIsTimelinePaused(false);
      return;
    }

    if (!hasClips) return;

    startSlideTimelinePreview();
    syncTimelinePlayhead(duration);
    scheduleTimelineEnd();
    setIsTimelinePaused(false);
  }, [duration, scheduleTimelineEnd, slide, startSlideTimelinePreview, syncTimelinePlayhead]);

  const pause = useCallback(() => {
    clearTimelineEndTimer();
    timelineRef.current?.pause();
    setIsTimelinePaused(true);
  }, [clearTimelineEndTimer]);

  const registerTimeline = useCallback(
    (api: TimelineState | null) => {
      detachEngineRef.current?.();
      detachEngineRef.current = null;
      timelineRef.current = api;
      if (!api) return;

      const engine = api.listener;
      const handleEnded = () => {
        if (isPlayingRef.current) {
          timelineRef.current?.pause();
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
    [stop],
  );

  useEffect(() => {
    if (!isPlaying) {
      setAutoplayPausedByHover(false);
    }
  }, [isPlaying]);

  /** Toolbar preview: schedule slide change / single-slide loop replay. */
  useEffect(() => {
    if (!isPlaying || autoplayPausedByHover) {
      clearSlideAdvanceTimer();
      return;
    }

    scheduleSlideAdvance();
    return () => clearSlideAdvanceTimer();
  }, [
    isPlaying,
    autoplayPausedByHover,
    currentSlideIndex,
    settings.autoPlay,
    settings.interval,
    settings.loop,
    slides.length,
    duration,
    scheduleSlideAdvance,
    clearSlideAdvanceTimer,
  ]);

  /** Toolbar preview: restart timeline entrance clips when preview starts or slide changes. */
  useEffect(() => {
    if (!isPlaying) return;
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => play());
    });
    return () => {
      cancelAnimationFrame(outerId);
      if (innerId) cancelAnimationFrame(innerId);
      clearTimelineEndTimer();
      timelineRef.current?.pause();
      timelineRef.current?.setTime(0);
    };
  }, [isPlaying, currentSlideIndex, play, clearTimelineEndTimer]);

  useEffect(() => {
    if (!isPlaying) stop();
  }, [isPlaying, stop]);

  useEffect(() => {
    if (isPlaying) return;
    stop();
  }, [currentSlideIndex, isPlaying, stop]);

  useEffect(
    () => () => {
      clearTimelineEndTimer();
      clearSlideAdvanceTimer();
      detachEngineRef.current?.();
    },
    [clearSlideAdvanceTimer, clearTimelineEndTimer],
  );

  const value = React.useMemo(
    () => ({
      registerTimeline,
      isTimelinePaused,
      autoplayPausedByHover,
      setAutoplayPausedByHover,
      play,
      pause,
      stop,
    }),
    [registerTimeline, isTimelinePaused, autoplayPausedByHover, play, pause, stop],
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
