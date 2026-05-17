import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { getEditorViewportSize } from '@/lib/constants';
import DraggableElement from './DraggableElement';
import { cn } from '@/lib/utils';
import { resolveElementProperties } from '@/lib/responsive';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

const Canvas = () => {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlide,
    viewMode,
    selectElement,
    selectedElementIds,
    selectedElementId,
    isPlaying,
    removeSelectedElements,
    updateElementsForMode,
    canvasSettings,
    snapGuides,
    settings,
    propertyMode,
    zoomCanvasIn,
    zoomCanvasOut,
    resetCanvasZoom,
  } = useEditor();

  const { theme } = useTheme();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[currentSlideIndex];
  const viewport = getEditorViewportSize(viewMode, canvasSettings);
  const scaledWidth = viewport.width * canvasZoom;
  const scaledHeight = viewport.height * canvasZoom;

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();

      if (event.deltaY > 0) {
        zoomCanvasOut();
      } else {
        zoomCanvasIn();
      }
    };

    scrollElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => scrollElement.removeEventListener('wheel', handleWheel);
  }, [zoomCanvasIn, zoomCanvasOut]);

  // Autoplay in preview mode
  useEffect(() => {
    if (!isPlaying || !settings.autoPlay || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(
        settings.loop
          ? (currentSlideIndex + 1) % slides.length
          : Math.min(currentSlideIndex + 1, slides.length - 1)
      );
    }, (settings.interval ?? 5) * 1000);
    return () => clearInterval(interval);
  }, [isPlaying, settings.autoPlay, settings.loop, settings.interval, currentSlideIndex, slides.length, setCurrentSlide]);

  const goNext = () => setCurrentSlide(
    settings.loop
      ? (currentSlideIndex + 1) % slides.length
      : Math.min(currentSlideIndex + 1, slides.length - 1)
  );
  const goPrev = () => setCurrentSlide(
    settings.loop
      ? (currentSlideIndex - 1 + slides.length) % slides.length
      : Math.max(currentSlideIndex - 1, 0)
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlaying) return;

      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      const activeSelectionIds = selectedElementIds.length ? selectedElementIds : selectedElementId ? [selectedElementId] : [];

      if (activeSelectionIds.length) {
        const step = e.shiftKey ? 10 : 1;
        const selectedRootElements = slides[currentSlideIndex].elements.filter(el => activeSelectionIds.includes(el.id) && !el.isLocked);
        if (!selectedRootElements.length) return;

        const moveSelectedElements = (deltaX: number, deltaY: number) => {
          const updates = selectedRootElements.reduce<Record<string, { x: number; y: number }>>((acc, element) => {
            const renderedElement = resolveElementProperties(element, viewMode);
            acc[element.id] = {
              x: renderedElement.x + deltaX,
              y: renderedElement.y + deltaY,
            };
            return acc;
          }, {});

          updateElementsForMode(updates, propertyMode);
        };

        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault();
            removeSelectedElements();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            moveSelectedElements(-step, 0);
            break;
          case 'ArrowRight':
            e.preventDefault();
            moveSelectedElements(step, 0);
            break;
          case 'ArrowUp':
            e.preventDefault();
            moveSelectedElements(0, -step);
            break;
          case 'ArrowDown':
            e.preventDefault();
            moveSelectedElements(0, step);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElementId,
    selectedElementIds,
    isPlaying,
    slides,
    currentSlideIndex,
    viewMode,
    propertyMode,
    removeSelectedElements,
    updateElementsForMode,
  ]);

  const handleBackgroundClick = () => {
    selectElement(null);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
      } else if (url.includes('youtu.be')) {
        const videoId = url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!currentSlide) return { backgroundColor: '#fff' };

    const style: React.CSSProperties = {
      width: viewport.width,
      height: viewport.height,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    if (currentSlide.backgroundType === 'color') {
      if (theme === 'dark' && currentSlide.background === '#ffffff') {
        style.backgroundColor = '#1f2937';
      } else {
        style.backgroundColor = currentSlide.background;
      }
    } else if (currentSlide.backgroundType === 'image') {
      style.backgroundImage = `url(${currentSlide.background})`;
    } else if (currentSlide.backgroundType === 'video') {
      style.backgroundColor = '#000';
    }

    return style;
  };

  return (
    <div className="msp-relative msp-flex-1 msp-min-h-0 msp-min-w-0 msp-bg-muted msp-overflow-hidden">
      <div
        ref={scrollRef}
        className="msp-h-full msp-w-full msp-overflow-auto"
      >
        <div className="msp-inline-flex msp-min-w-full msp-justify-center msp-p-4">
          <div
            className="msp-relative msp-shrink-0"
            style={{ width: scaledWidth, height: scaledHeight }}
          >
            <div
              className={cn(
                'msp-absolute msp-left-0 msp-top-0 msp-origin-top-left msp-shadow-xl msp-transition-[box-shadow,border-color] msp-duration-300 msp-overflow-hidden',
                viewMode === 'mobile'
                  ? 'msp-border-[8px] msp-border-gray-800 msp-rounded-[30px]'
                  : 'msp-border msp-border-gray-300 dark:msp-border-gray-700',
              )}
              style={{
                ...getBackgroundStyle(),
                transform: `scale(${canvasZoom})`,
              }}
              onClick={handleBackgroundClick}
            >
              {currentSlide?.backgroundType === 'video' && currentSlide.background && (
                <div className="msp-absolute msp-inset-0 msp-z-0 msp-overflow-hidden msp-pointer-events-none">
                  {currentSlide.background.includes('youtube') || currentSlide.background.includes('youtu.be') ? (
                    <iframe
                      src={getEmbedUrl(currentSlide.background)}
                      className="msp-w-full msp-h-full msp-object-cover msp-scale-150"
                      style={{ pointerEvents: 'none' }}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="Background video"
                    />
                  ) : (
                    <video
                      src={currentSlide.background}
                      className="msp-w-full msp-h-full msp-object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  )}
                  <div className="msp-absolute msp-inset-0 msp-bg-transparent" />
                </div>
              )}

              <div className="msp-absolute msp-inset-0 msp-z-10">
                {currentSlide?.elements.filter(element => element.isVisible !== false).map((element) => (
                  <DraggableElement
                    key={element.id}
                    element={element}
                    isPreview={isPlaying}
                  />
                ))}
              </div>

              {isPlaying && settings.showArrows && (
                <>
                  <div
                    className="msp-absolute msp-left-3 msp-top-1/2 -msp-translate-y-1/2 msp-z-40 msp-bg-black/30 msp-text-white msp-rounded-full msp-p-1.5 msp-opacity-60 msp-cursor-pointer hover:msp-opacity-90"
                    onClick={goPrev}
                  >
                    <ChevronLeft className="msp-w-5 msp-h-5" />
                  </div>
                  <div
                    className="msp-absolute msp-right-3 msp-top-1/2 -msp-translate-y-1/2 msp-z-40 msp-bg-black/30 msp-text-white msp-rounded-full msp-p-1.5 msp-opacity-60 msp-cursor-pointer hover:msp-opacity-90"
                    onClick={goNext}
                  >
                    <ChevronRight className="msp-w-5 msp-h-5" />
                  </div>
                </>
              )}

              {isPlaying && settings.showDots && (
                <div className="msp-absolute msp-bottom-3 msp-left-1/2 -msp-translate-x-1/2 msp-flex msp-gap-1.5 msp-z-40">
                  {slides.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={cn(
                        'msp-rounded-full msp-transition-colors msp-cursor-pointer hover:msp-bg-white',
                        idx === currentSlideIndex ? 'msp-w-2.5 msp-h-2.5 msp-bg-white' : 'msp-w-2 msp-h-2 msp-bg-white/50',
                      )}
                    />
                  ))}
                </div>
              )}

              {!isPlaying && canvasSettings.showGrid && (
                <div
                  className="msp-absolute msp-inset-0 msp-pointer-events-none msp-opacity-10 msp-z-20"
                  style={{
                    backgroundImage: theme === 'dark'
                      ? 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)'
                      : 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: `${canvasSettings.gridSize}px ${canvasSettings.gridSize}px`,
                  }}
                />
              )}

              {!isPlaying && canvasSettings.snapToElements && snapGuides.x.map((x, i) => (
                <div
                  key={`sg-x-${i}`}
                  className="msp-absolute msp-top-0 msp-bottom-0 msp-pointer-events-none msp-z-30"
                  style={{ left: x, width: 1, backgroundColor: '#00d4ff', opacity: 0.85 }}
                />
              ))}
              {!isPlaying && canvasSettings.snapToElements && snapGuides.y.map((y, i) => (
                <div
                  key={`sg-y-${i}`}
                  className="msp-absolute msp-left-0 msp-right-0 msp-pointer-events-none msp-z-30"
                  style={{ top: y, height: 1, backgroundColor: '#00d4ff', opacity: 0.85 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {!isPlaying && (
        <div className="msp-pointer-events-none msp-absolute msp-bottom-3 msp-right-3 msp-z-50 msp-flex msp-items-center msp-gap-1">
          <div className="msp-pointer-events-auto msp-flex msp-items-center msp-gap-0.5 msp-rounded-md msp-border msp-bg-card/95 msp-p-0.5 msp-shadow-md msp-backdrop-blur-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={zoomCanvasOut}
              title={t('editor.canvas.zoomOut')}
            >
              <Minus className="msp-h-3.5 msp-w-3.5" />
            </Button>
            <button
              type="button"
              className="msp-min-w-[3rem] msp-px-1 msp-text-xs msp-font-medium msp-tabular-nums hover:msp-bg-muted msp-rounded-sm msp-h-7"
              onClick={resetCanvasZoom}
              title={t('editor.canvas.zoomReset')}
            >
              {Math.round(canvasZoom * 100)}%
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={zoomCanvasIn}
              title={t('editor.canvas.zoomIn')}
            >
              <Plus className="msp-h-3.5 msp-w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={resetCanvasZoom}
              title={t('editor.canvas.zoomReset')}
            >
              <RotateCcw className="msp-h-3.5 msp-w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
