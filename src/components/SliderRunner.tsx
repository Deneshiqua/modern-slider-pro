import React, { useState, useEffect } from 'react';
import { Slide, SliderProject, ViewMode } from '@/types/editor';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveElementProperties } from '@/lib/responsive';
import { formatElementHoverStyleTag } from '@/lib/elementHoverCss';

interface SliderRunnerProps {
  slides?: Slide[];
  project?: SliderProject;
  autoPlay?: boolean;
  interval?: number;
  width?: string | number;
  height?: string | number;
  showDots?: boolean;
  showArrows?: boolean;
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
  viewMode = 'desktop',
  onSlideChange,
}: SliderRunnerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = project?.slides ?? slidesProp ?? [];
  const resolvedAutoPlay = autoPlay ?? project?.settings.autoPlay ?? true;
  const resolvedInterval = interval ?? (project ? project.settings.interval * 1000 : 5000);
  const resolvedLoop = project?.settings.loop ?? true;
  const resolvedShowDots = showDots ?? project?.settings.showDots ?? true;
  const resolvedShowArrows = showArrows ?? project?.settings.showArrows ?? true;
  const resolvedWidth = width ?? (project ? `${project.canvasSettings.canvasWidth}px` : '100%');
  const resolvedHeight = height ?? (project ? `${project.canvasSettings.canvasHeight}px` : '600px');
  const canGoPrev = resolvedLoop || currentIndex > 0;
  const canGoNext = resolvedLoop || currentIndex < slides.length - 1;

  const goTo = (index: number) => {
    setCurrentIndex(index);
    onSlideChange?.(index);
  };

  useEffect(() => {
    if (currentIndex <= slides.length - 1) return;

    setCurrentIndex(Math.max(slides.length - 1, 0));
  }, [currentIndex, slides.length]);

  useEffect(() => {
    if (!resolvedAutoPlay || slides.length <= 1 || (!resolvedLoop && currentIndex === slides.length - 1)) return;

    const timer = setInterval(() => {
      nextSlide();
    }, resolvedInterval);

    return () => clearInterval(timer);
  }, [resolvedAutoPlay, resolvedInterval, resolvedLoop, slides.length, currentIndex]);

  const nextSlide = () => {
    if (!canGoNext) return;

    goTo(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  };

  const prevSlide = () => {
    if (!canGoPrev) return;

    goTo(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  };

  if (!slides.length) return null;

  const currentSlide = slides[currentIndex];
  const backgroundImage = currentSlide.backgroundType === 'image'
    ? currentSlide.backgroundImage
    : currentSlide.background.startsWith('http')
      ? currentSlide.background
      : undefined;

  return (
    <div
      className="msp-relative msp-overflow-hidden msp-bg-gray-100 msp-group"
      style={{ width: resolvedWidth, height: resolvedHeight }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="msp-absolute msp-inset-0 msp-w-full msp-h-full"
          style={{
            backgroundColor: currentSlide.backgroundType === 'color' ? currentSlide.backgroundColor : currentSlide.background,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
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
                  transition={element.animation?.transition}
                  style={{
                    position: 'absolute',
                    left: renderedElement.x,
                    top: renderedElement.y,
                    ...renderedElement.style,
                    ...(renderedElement.rotation ? { transform: `rotate(${renderedElement.rotation}deg)`, transformOrigin: 'msp-center msp-center' } : {}),
                  }}
                >
                  {renderedElement.type === 'text' && <p>{renderedElement.content}</p>}
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
                className="msp-absolute msp-left-4 msp-top-1/2 -msp-translate-y-1/2 msp-bg-black/30 hover:msp-bg-black/50 disabled:msp-opacity-30 msp-text-white msp-p-2 msp-rounded-full msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={nextSlide}
                disabled={!canGoNext}
                className="msp-absolute msp-right-4 msp-top-1/2 -msp-translate-y-1/2 msp-bg-black/30 hover:msp-bg-black/50 disabled:msp-opacity-30 msp-text-white msp-p-2 msp-rounded-full msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {resolvedShowDots && (
            <div className="msp-absolute msp-bottom-4 msp-left-1/2 -msp-translate-x-1/2 msp-flex msp-gap-2">
              {slides.map((slide, idx) => (
                <button
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  key={slide.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`msp-w-2 msp-h-2 msp-rounded-full msp-transition-colors ${idx === currentIndex ? 'msp-bg-white' : 'msp-bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SliderRunner;