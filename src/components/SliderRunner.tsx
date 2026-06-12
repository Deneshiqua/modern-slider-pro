import React, { useCallback, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Slide, SliderProject, ViewMode } from '@/types/editor';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_SLIDER_SETTINGS } from '@/lib/constants';
import { resolveElementProperties } from '@/lib/responsive';
import { formatElementHoverStyleTag } from '@/lib/elementHoverCss';
import {
  getEffectiveSlideTransition,
  normalizeSliderSettings,
  resolveSlideTransitionMotion,
  type SlideTransitionDirection,
} from '@/lib/slideTransitions';
import {
  getSlideAutoplayDwellSeconds,
  resolveElementPlaybackTransition,
  shouldRunSliderAutoplay,
} from '@/lib/timelineBridge';
import { SlideOverlayLayer } from '@/components/SlideOverlayLayer';
import { SliderProgressBar } from '@/components/SliderProgressBar';
import {
  getSlideBackgroundFit,
  getSlideBackgroundImageUrl,
  getSlideBackgroundVideoUrl,
  getSlideImageBackgroundCss,
  getSlideVideoObjectFitClass,
  getSlideYoutubeIframeClassName,
  getYoutubeEmbedUrl,
  isYoutubeBackgroundUrl,
} from '@/lib/slideBackground';
import { getDefaultSlideDesignSize, getSlideStageScale } from '@/lib/slideStageLayout';

interface SliderRunnerProps {
  slides?: Slide[];
  project?: SliderProject;
  autoPlay?: boolean;
  interval?: number;
  width?: string | number;
  height?: string | number;
  showDots?: boolean;
  showArrows?: boolean;
  showProgressBar?: boolean;
  viewMode?: ViewMode;
  onSlideChange?: (index: number) => void;
}

const SliderRunner = ({
  slides: slidesProp,
  project,
  autoPlay,
  interval,
  width,
  height,
  showDots,
  showArrows,
  showProgressBar,
  viewMode = 'desktop',
  onSlideChange,
}: SliderRunnerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplayCycle, setAutoplayCycle] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<SlideTransitionDirection>(1);
  const slides = project?.slides ?? slidesProp ?? [];
  const sliderSettings = normalizeSliderSettings(project?.settings);
  const resolvedAutoPlay = autoPlay ?? sliderSettings.autoPlay;
  const autoplayIntervalSeconds =
    interval !== undefined ? interval / 1000 : sliderSettings.interval;
  const resolvedLoop = sliderSettings.loop;
  const resolvedShowDots = showDots ?? sliderSettings.showDots;
  const resolvedShowArrows = showArrows ?? sliderSettings.showArrows;
  const resolvedShowProgressBar = showProgressBar ?? sliderSettings.showProgressBar;
  const slideTransition = getEffectiveSlideTransition(sliderSettings);
  const slideTransitionDuration =
    sliderSettings.slideTransitionDuration ?? DEFAULT_SLIDER_SETTINGS.slideTransitionDuration;
  const designSize = getDefaultSlideDesignSize(project?.canvasSettings, 1280, 600);
  const resolvedWidth = width ?? (project ? `${designSize.width}px` : '100%');
  const resolvedHeight = height ?? (project ? `${designSize.height}px` : '600px');
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [resolvedWidth, resolvedHeight]);

  const displayWidth = containerSize?.width ?? designSize.width;
  const displayHeight = containerSize?.height ?? designSize.height;
  const { scale } = getSlideStageScale(
    displayWidth,
    displayHeight,
    designSize.width,
    designSize.height,
  );

  const canGoPrev = resolvedLoop || currentIndex > 0;
  const canGoNext = resolvedLoop || currentIndex < slides.length - 1;

  const goTo = useCallback(
    (index: number, direction?: SlideTransitionDirection) => {
      setTransitionDirection(direction ?? (index >= currentIndex ? 1 : -1));
      setCurrentIndex(index);
      onSlideChange?.(index);
    },
    [currentIndex, onSlideChange],
  );

  useEffect(() => {
    if (currentIndex <= slides.length - 1) return;

    setCurrentIndex(Math.max(slides.length - 1, 0));
  }, [currentIndex, slides.length]);

  const nextSlide = useCallback(() => {
    if (!canGoNext) return;
    goTo(currentIndex === slides.length - 1 ? 0 : currentIndex + 1, 1);
  }, [canGoNext, currentIndex, goTo, slides.length]);

  const autoplayActive = resolvedAutoPlay && !isHovered;

  useEffect(() => {
    if (!shouldRunSliderAutoplay(slides.length, autoplayActive, resolvedLoop)) {
      return;
    }
    if (!resolvedLoop && currentIndex === slides.length - 1) {
      return;
    }

    const slide = slides[currentIndex];
    if (!slide) return;

    const dwellMs = getSlideAutoplayDwellSeconds(slide, autoplayIntervalSeconds) * 1000;
    const timer = setTimeout(() => {
      if (slides.length <= 1 && resolvedLoop) {
        setAutoplayCycle((c) => c + 1);
        return;
      }
      nextSlide();
    }, dwellMs);

    return () => clearTimeout(timer);
  }, [
    autoplayIntervalSeconds,
    currentIndex,
    nextSlide,
    autoplayActive,
    resolvedLoop,
    slides,
  ]);

  const prevSlide = () => {
    if (!canGoPrev) return;
    goTo(currentIndex === 0 ? slides.length - 1 : currentIndex - 1, -1);
  };

  if (!slides.length) return null;

  const currentSlide = slides[currentIndex];
  const slideMotion = resolveSlideTransitionMotion(
    slideTransition,
    slideTransitionDuration,
    transitionDirection,
  );
  const backgroundFit = getSlideBackgroundFit(currentSlide);
  const backgroundImageUrl = getSlideBackgroundImageUrl(currentSlide);
  const backgroundVideoUrl = getSlideBackgroundVideoUrl(currentSlide);

  return (
    <div
      ref={containerRef}
      className="msp-relative msp-overflow-hidden msp-bg-gray-100 msp-group"
      style={{ width: resolvedWidth, height: resolvedHeight }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slides.length <= 1 && resolvedLoop ? `${currentSlide.id}-${autoplayCycle}` : currentSlide.id}
          initial={slideMotion.initial}
          animate={slideMotion.animate}
          exit={slideMotion.exit}
          transition={slideMotion.transition}
          className="msp-absolute msp-inset-0 msp-w-full msp-h-full"
          style={{
            backgroundColor:
              currentSlide.backgroundType === 'color'
                ? currentSlide.backgroundColor || currentSlide.background
                : currentSlide.backgroundType === 'video'
                  ? '#000'
                  : currentSlide.background,
            backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
            ...getSlideImageBackgroundCss(backgroundFit),
          }}
        >
          {backgroundVideoUrl ? (
            <div className="msp-pointer-events-none msp-absolute msp-inset-0 msp-z-0 msp-flex msp-items-center msp-justify-center msp-overflow-hidden">
              {isYoutubeBackgroundUrl(backgroundVideoUrl) ? (
                <iframe
                  src={getYoutubeEmbedUrl(backgroundVideoUrl)}
                  className={getSlideYoutubeIframeClassName(backgroundFit)}
                  style={{ pointerEvents: 'none' }}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Background video"
                />
              ) : (
                <video
                  src={backgroundVideoUrl}
                  className={`msp-h-full msp-w-full ${getSlideVideoObjectFitClass(backgroundFit)}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
            </div>
          ) : null}
          <SlideOverlayLayer slide={currentSlide} />
          <div className="msp-absolute msp-inset-0 msp-flex msp-items-center msp-justify-center">
          <div
            className="msp-shrink-0 msp-origin-center"
            style={{
              width: designSize.width,
              height: designSize.height,
              transform: `scale(${scale})`,
            }}
          >
          {currentSlide.elements.filter(element => element.isVisible !== false).map((element) => {
            const renderedElement = resolveElementProperties(element, viewMode);
            const hoverCss = formatElementHoverStyleTag(element.id, renderedElement.hoverStyle);

            return (
              <React.Fragment key={element.id}>
                {hoverCss ? <style>{hoverCss}</style> : null}
                <motion.div
                  data-msp-el-hover={element.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  initial={element.animation?.initial as any}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  animate={element.animation?.animate as any}
                  transition={resolveElementPlaybackTransition(element) ?? element.animation?.transition}
                  style={{
                    position: 'absolute',
                    left: renderedElement.x,
                    top: renderedElement.y,
                    ...renderedElement.style,
                    ...(renderedElement.rotation ? { transform: `rotate(${renderedElement.rotation}deg)`, transformOrigin: 'msp-center msp-center' } : {}),
                  }}
                >
                  {renderedElement.type === 'text' && (
                    <p className="msp-m-0 msp-block msp-min-w-0 msp-w-full msp-p-0 msp-whitespace-pre-wrap msp-indent-0">
                      {renderedElement.content}
                    </p>
                  )}
                  {renderedElement.type === 'image' && (
                    <img
                      src={renderedElement.content}
                      alt=""
                      className="msp-w-full msp-h-full msp-object-cover"
                    />
                  )}
                  {renderedElement.type === 'button' && (
                    <button className="msp-w-full msp-h-full">{renderedElement.content}</button>
                  )}
                  {renderedElement.type === 'box' && <div className="msp-w-full msp-h-full" />}
                </motion.div>
              </React.Fragment>
            );
          })}
          </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          {resolvedShowArrows && (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prevSlide}
                disabled={!canGoPrev}
                className="msp-absolute msp-left-4 msp-top-1/2 msp-z-50 -msp-translate-y-1/2 msp-bg-black/30 hover:msp-bg-black/50 disabled:msp-opacity-30 msp-text-white msp-p-2 msp-rounded-full msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={nextSlide}
                disabled={!canGoNext}
                className="msp-absolute msp-right-4 msp-top-1/2 msp-z-50 -msp-translate-y-1/2 msp-bg-black/30 hover:msp-bg-black/50 disabled:msp-opacity-30 msp-text-white msp-p-2 msp-rounded-full msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {resolvedShowDots && (
            <div className="msp-absolute msp-bottom-4 msp-left-1/2 msp-z-50 msp-flex -msp-translate-x-1/2 msp-gap-2">
              {slides.map((slide, idx) => (
                <button
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  key={slide.id || idx}
                  onClick={() => goTo(idx)}
                  className={`msp-w-2 msp-h-2 msp-rounded-full msp-transition-colors ${idx === currentIndex ? 'msp-bg-white' : 'msp-bg-white/50'}`}
                />
              ))}
            </div>
          )}

          {resolvedShowProgressBar && currentSlide && (
            <SliderProgressBar
              currentIndex={currentIndex}
              slideCount={slides.length}
              scope={sliderSettings.progressBarScope}
              autoPlay={resolvedAutoPlay}
              paused={isHovered}
              intervalMs={getSlideAutoplayDwellSeconds(currentSlide, autoplayIntervalSeconds) * 1000}
              loop={resolvedLoop}
              cycleKey={autoplayCycle}
              color={sliderSettings.progressBarColor}
              fillOpacity={sliderSettings.progressBarOpacity}
              trackOpacity={sliderSettings.progressBarTrackOpacity}
              heightPx={sliderSettings.progressBarHeight}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SliderRunner;