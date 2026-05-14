import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { VIEWPORT_SIZE } from '@/lib/constants';
import DraggableElement from './DraggableElement';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

const Canvas = () => {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlide,
    viewMode,
    selectElement,
    selectedElementId,
    isPlaying,
    removeElement,
    updateElement,
    canvasSettings,
    snapGuides,
    settings,
  } = useEditor();

  const { theme } = useTheme();
  const currentSlide = slides[currentSlideIndex];
  const viewportBase = VIEWPORT_SIZE[viewMode];
  const viewport = {
    width: canvasSettings.canvasWidth ?? viewportBase.width,
    height: canvasSettings.canvasHeight ?? viewportBase.height,
  };

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

      // Ignore if an input or textarea is focused
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      if (selectedElementId) {
        const step = e.shiftKey ? 10 : 1;
        const currentElement = slides[currentSlideIndex].elements.find(el => el.id === selectedElementId);

        if (!currentElement) return;

        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            removeElement(selectedElementId);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            updateElement(selectedElementId, { x: currentElement.x - step });
            break;
          case 'ArrowRight':
            e.preventDefault();
            updateElement(selectedElementId, { x: currentElement.x + step });
            break;
          case 'ArrowUp':
            e.preventDefault();
            updateElement(selectedElementId, { y: currentElement.y - step });
            break;
          case 'ArrowDown':
            e.preventDefault();
            updateElement(selectedElementId, { y: currentElement.y + step });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, isPlaying, slides, currentSlideIndex, removeElement, updateElement]);

  const handleBackgroundClick = () => {
    selectElement(null);
  };

  // Helper to convert YouTube URL to embed URL
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
    } catch (e) {
      return url;
    }
  };

  // Determine background styles
  const getBackgroundStyle = () => {
    if (!currentSlide) return { backgroundColor: '#fff' };

    const style: React.CSSProperties = {
      width: viewport.width,
      height: viewport.height,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    // Handle Color
    if (currentSlide.backgroundType === 'color') {
      if (theme === 'dark' && currentSlide.background === '#ffffff') {
        style.backgroundColor = '#1f2937';
      } else {
        style.backgroundColor = currentSlide.background;
      }
    }
    // Handle Image
    else if (currentSlide.backgroundType === 'image') {
      style.backgroundImage = `url(${currentSlide.background})`;
    }
    // Handle Video (Background color as fallback)
    else if (currentSlide.backgroundType === 'video') {
      style.backgroundColor = '#000';
    }

    return style;
  };

  return (
    <div className="flex-1 bg-gray-100 dark:bg-black overflow-auto flex items-center justify-center p-8">
      <div
        className={cn(
          "relative shadow-xl transition-all duration-300 overflow-hidden",
          viewMode === 'mobile' ? "border-[8px] border-gray-800 rounded-[30px]" : "border border-gray-300 dark:border-gray-700"
        )}
        style={getBackgroundStyle()}
        onClick={handleBackgroundClick}
      >
        {/* Video Background Layer */}
        {currentSlide?.backgroundType === 'video' && currentSlide.background && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {currentSlide.background.includes('youtube') || currentSlide.background.includes('youtu.be') ? (
              <iframe
                src={getEmbedUrl(currentSlide.background)}
                className="w-full h-full object-cover scale-150" // Scale up to cover
                style={{ pointerEvents: 'none' }}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                src={currentSlide.background}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            )}
            {/* Overlay to ensure text readability if needed, or just to prevent interaction */}
            <div className="absolute inset-0 bg-transparent" />
          </div>
        )}

        {/* Elements Layer */}
        <div className="absolute inset-0 z-10">
          {currentSlide?.elements.map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              isPreview={isPlaying}
            />
          ))}
        </div>

        {/* Arrows overlay */}
        {settings.showArrows && (
          <>
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 z-40 bg-black/30 text-white rounded-full p-1.5 opacity-60",
                isPlaying ? "cursor-pointer hover:opacity-90" : "pointer-events-none"
              )}
              onClick={isPlaying ? goPrev : undefined}
            >
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 z-40 bg-black/30 text-white rounded-full p-1.5 opacity-60",
                isPlaying ? "cursor-pointer hover:opacity-90" : "pointer-events-none"
              )}
              onClick={isPlaying ? goNext : undefined}
            >
              <ChevronRight className="w-5 h-5" />
            </div>
          </>
        )}

        {/* Dots overlay */}
        {settings.showDots && (
          <div className={cn(
            "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-40",
            isPlaying ? "" : "pointer-events-none"
          )}>
            {slides.map((_, idx) => (
              <div
                key={idx}
                onClick={isPlaying ? () => setCurrentSlide(idx) : undefined}
                className={cn(
                  "rounded-full transition-colors",
                  idx === currentSlideIndex ? 'w-2.5 h-2.5 bg-white' : 'w-2 h-2 bg-white/50',
                  isPlaying ? 'cursor-pointer hover:bg-white' : ''
                )}
              />
            ))}
          </div>
        )}

        {/* Grid lines */}
        {!isPlaying && canvasSettings.showGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-10 z-20"
            style={{
              backgroundImage: theme === 'dark'
                ? 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)'
                : 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: `${canvasSettings.gridSize}px ${canvasSettings.gridSize}px`
            }}
          />
        )}

        {/* Snap guide lines (shown during drag when snapToElements is on) */}
        {!isPlaying && canvasSettings.snapToElements && snapGuides.x.map((x, i) => (
          <div
            key={`sg-x-${i}`}
            className="absolute top-0 bottom-0 pointer-events-none z-30"
            style={{ left: x, width: 1, backgroundColor: '#00d4ff', opacity: 0.85 }}
          />
        ))}
        {!isPlaying && canvasSettings.snapToElements && snapGuides.y.map((y, i) => (
          <div
            key={`sg-y-${i}`}
            className="absolute left-0 right-0 pointer-events-none z-30"
            style={{ top: y, height: 1, backgroundColor: '#00d4ff', opacity: 0.85 }}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;