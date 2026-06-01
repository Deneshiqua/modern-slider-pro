import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ChevronLeft, ChevronRight, Crosshair, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import { useSnapGuides } from '@/context/SnapGuidesContext';
import {
  CANVAS_ZOOM_DEFAULT,
  CANVAS_ZOOM_MAX,
  CANVAS_ZOOM_MIN,
  CANVAS_ZOOM_STEP,
  getEditorViewportSize,
} from '@/lib/constants';
import DraggableElement from './DraggableElement';
import { CANVAS_RULER_THICKNESS_PX, CanvasViewportRulers } from './CanvasViewportRulers';
import { cn } from '@/lib/utils';
import { resolveElementProperties } from '@/lib/responsive';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

/** Matches `msp-p-4` — included in shell min dimensions for scroll/pan gutters. */
const CANVAS_SHELL_PAD_PX = 32;
/** Fits slide into scrollport breathing room (`p-4` + small inset). */
const CANVAS_FIT_VIEW_MARGIN_EXTRA_PX = 24;

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
    settings,
    propertyMode,
    setCanvasZoom,
    canvasZoom,
  } = useEditor();
  const snapGuides = useSnapGuides();

  const { theme } = useTheme();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  /** Scrollport size (inside padding box) — drives symmetric pan gutters. */
  const [scrollClient, setScrollClient] = useState({ w: 0, h: 0 });
  const centerLayoutKeyRef = useRef<string>('');
  const canvasZoomRef = useRef(canvasZoom);
  canvasZoomRef.current = canvasZoom;

  const [rulerViewport, setRulerViewport] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 0,
    clientHeight: 0,
    frameOriginX: 0,
    frameOriginY: 0,
  });
  /** Photoshop-style ruler hairlines (scroll client px + slide logical px at pointer). */
  const [rulerPointer, setRulerPointer] = useState<{
    vx: number;
    vy: number;
    logicalX: number;
    logicalY: number;
  } | null>(null);

  /** Batches pointer position to one commit per frame; avoids sync update storms with ResizeObserver + rulers. */
  const pendingRulerPointerRef = useRef<{ vx: number; vy: number; logicalX: number; logicalY: number } | null>(null);
  const rulerPointerRafRef = useRef<number | null>(null);

  const cancelRulerPointerRaf = useCallback(() => {
    if (rulerPointerRafRef.current != null) {
      cancelAnimationFrame(rulerPointerRafRef.current);
      rulerPointerRafRef.current = null;
    }
    pendingRulerPointerRef.current = null;
  }, []);

  const flushPendingRulerPointer = useCallback(() => {
    rulerPointerRafRef.current = null;
    const pending = pendingRulerPointerRef.current;
    pendingRulerPointerRef.current = null;
    if (!pending) return;
    setRulerPointer((prev) => {
      if (
        prev &&
        Math.abs(prev.vx - pending.vx) < 0.35 &&
        Math.abs(prev.vy - pending.vy) < 0.35 &&
        prev.logicalX === pending.logicalX &&
        prev.logicalY === pending.logicalY
      ) {
        return prev;
      }
      return pending;
    });
  }, []);

  const flushRulerViewport = useCallback(() => {
    const scrollEl = scrollRef.current;
    const frameEl = frameRef.current;
    if (!scrollEl || !frameEl) return;
    const sr = scrollEl.getBoundingClientRect();
    const fr = frameEl.getBoundingClientRect();
    const next = {
      scrollLeft: scrollEl.scrollLeft,
      scrollTop: scrollEl.scrollTop,
      clientWidth: scrollEl.clientWidth,
      clientHeight: scrollEl.clientHeight,
      frameOriginX: scrollEl.scrollLeft + (fr.left - sr.left),
      frameOriginY: scrollEl.scrollTop + (fr.top - sr.top),
    };
    const approxEq = (a: number, b: number, eps = 0.35) => Math.abs(a - b) < eps;
    setRulerViewport((prev) => {
      if (
        approxEq(prev.scrollLeft, next.scrollLeft, 0.05) &&
        approxEq(prev.scrollTop, next.scrollTop, 0.05) &&
        prev.clientWidth === next.clientWidth &&
        prev.clientHeight === next.clientHeight &&
        approxEq(prev.frameOriginX, next.frameOriginX) &&
        approxEq(prev.frameOriginY, next.frameOriginY)
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const handleScrollPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isPlaying || !canvasSettings.showRulers) {
        cancelRulerPointerRaf();
        setRulerPointer(null);
        return;
      }
      const scrollEl = scrollRef.current;
      const frameEl = frameRef.current;
      if (!scrollEl || !frameEl) return;
      const sr = scrollEl.getBoundingClientRect();
      const fr = frameEl.getBoundingClientRect();
      const vx = e.clientX - sr.left;
      const vy = e.clientY - sr.top;
      const cw = scrollEl.clientWidth;
      const ch = scrollEl.clientHeight;
      if (vx < 0 || vy < 0 || vx >= cw || vy >= ch) {
        cancelRulerPointerRaf();
        setRulerPointer(null);
        return;
      }
      const frameOriginX = scrollEl.scrollLeft + (fr.left - sr.left);
      const frameOriginY = scrollEl.scrollTop + (fr.top - sr.top);
      const contentX = scrollEl.scrollLeft + vx;
      const contentY = scrollEl.scrollTop + vy;
      const logicalX = Math.round((contentX - frameOriginX) / canvasZoom);
      const logicalY = Math.round((contentY - frameOriginY) / canvasZoom);
      pendingRulerPointerRef.current = { vx, vy, logicalX, logicalY };
      rulerPointerRafRef.current ??= requestAnimationFrame(flushPendingRulerPointer);
    },
    [
      cancelRulerPointerRaf,
      canvasSettings.showRulers,
      canvasZoom,
      flushPendingRulerPointer,
      isPlaying,
    ],
  );

  const handleScrollPointerLeave = useCallback(() => {
    cancelRulerPointerRaf();
    setRulerPointer(null);
  }, [cancelRulerPointerRaf]);

  const clampZoom = useCallback((z: number) => {
    return Math.min(CANVAS_ZOOM_MAX, Math.max(CANVAS_ZOOM_MIN, Math.round(z * 100) / 100));
  }, []);

  /** Zoom and keep pointer (client coords) anchored over the canvas frame — same semantics as Photoshop / map zoom. */
  const zoomTowardScreenPoint = useCallback(
    (nextZoomRaw: number, clientX: number, clientY: number) => {
      const scrollEl = scrollRef.current;
      const frameEl = frameRef.current;
      const nextZoom = clampZoom(nextZoomRaw);
      const prevZoom = canvasZoomRef.current;
      if (!scrollEl || !frameEl || nextZoom === prevZoom) return;

      const scrollRect = scrollEl.getBoundingClientRect();
      const vx = clientX - scrollRect.left;
      const vy = clientY - scrollRect.top;
      const frameRect = frameEl.getBoundingClientRect();

      const frameLeftScroll = scrollEl.scrollLeft + (frameRect.left - scrollRect.left);
      const frameTopScroll = scrollEl.scrollTop + (frameRect.top - scrollRect.top);
      const ux = scrollEl.scrollLeft + vx - frameLeftScroll;
      const uy = scrollEl.scrollTop + vy - frameTopScroll;

      const fw = frameRect.width;
      const fh = frameRect.height;
      const rx = fw > 0 ? ux / fw : 0.5;
      const ry = fh > 0 ? uy / fh : 0.5;

      flushSync(() => {
        setCanvasZoom(nextZoom);
      });

      canvasZoomRef.current = nextZoom;

      const scrollRect2 = scrollEl.getBoundingClientRect();
      const frameRect2 = frameEl.getBoundingClientRect();
      const fw2 = frameRect2.width;
      const fh2 = frameRect2.height;
      if (fw2 <= 0 || fh2 <= 0) return;

      const frameLeftScroll2 = scrollEl.scrollLeft + (frameRect2.left - scrollRect2.left);
      const frameTopScroll2 = scrollEl.scrollTop + (frameRect2.top - scrollRect2.top);

      scrollEl.scrollLeft = frameLeftScroll2 + rx * fw2 - vx;
      scrollEl.scrollTop = frameTopScroll2 + ry * fh2 - vy;
    },
    [clampZoom, setCanvasZoom],
  );

  const centerScrollViewport = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const maxSX = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
    const maxSY = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
    scrollEl.scrollLeft = maxSX / 2;
    scrollEl.scrollTop = maxSY / 2;
  }, []);

  const zoomTowardViewportCenter = useCallback(
    (nextZoomRaw: number) => {
      const scrollEl = scrollRef.current;
      if (!scrollEl) {
        const z = clampZoom(nextZoomRaw);
        if (z === canvasZoomRef.current) return;
        flushSync(() => setCanvasZoom(z));
        canvasZoomRef.current = z;
        return;
      }
      const rect = scrollEl.getBoundingClientRect();
      zoomTowardScreenPoint(nextZoomRaw, rect.left + rect.width / 2, rect.top + rect.height / 2);
    },
    [clampZoom, zoomTowardScreenPoint, setCanvasZoom],
  );
  const currentSlide = slides[currentSlideIndex];
  const viewport = getEditorViewportSize(viewMode, canvasSettings);
  const scaledWidth = viewport.width * canvasZoom;
  const scaledHeight = viewport.height * canvasZoom;

  const fitCanvasToViewport = useCallback(() => {
    const scrollEl = scrollRef.current;
    const vp = getEditorViewportSize(viewMode, canvasSettings);
    const vu = vp.width;
    const vh = vp.height;

    if (!scrollEl || vu <= 0 || vh <= 0) return;

    const margin = CANVAS_SHELL_PAD_PX + CANVAS_FIT_VIEW_MARGIN_EXTRA_PX;
    const usableW = Math.max(vu * CANVAS_ZOOM_MIN, scrollEl.clientWidth - margin * 2);
    const usableH = Math.max(vh * CANVAS_ZOOM_MIN, scrollEl.clientHeight - margin * 2);

    const fitZ = clampZoom(Math.min(usableW / vu, usableH / vh));
    zoomTowardViewportCenter(fitZ);

    queueMicrotask(() => {
      requestAnimationFrame(() => centerScrollViewport());
    });
  }, [canvasSettings, clampZoom, centerScrollViewport, viewMode, zoomTowardViewportCenter]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setScrollClient(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof ResizeObserver === 'undefined') return;

    const flush = () => flushRulerViewport();

    scrollEl.addEventListener('scroll', flush, { passive: true });

    const ro = new ResizeObserver(flush);
    ro.observe(scrollEl);
    const fe = frameRef.current;
    if (fe) ro.observe(fe);

    flush();

    return () => {
      scrollEl.removeEventListener('scroll', flush);
      ro.disconnect();
    };
  }, [flushRulerViewport, scaledWidth, scaledHeight]);

  useLayoutEffect(() => {
    flushRulerViewport();
  }, [
    flushRulerViewport,
    canvasZoom,
    viewport.width,
    viewport.height,
    scrollClient.w,
    scrollClient.h,
    currentSlideIndex,
  ]);

  useEffect(() => {
    if (isPlaying || !canvasSettings.showRulers) {
      cancelRulerPointerRaf();
      setRulerPointer(null);
    }
  }, [cancelRulerPointerRaf, isPlaying, canvasSettings.showRulers]);

  /** Avoid setState after unmount from deferred ruler pointer flush. */
  useEffect(() => () => cancelRulerPointerRaf(), [cancelRulerPointerRaf]);

  /** Aynı moda geri dönünce yeniden ortalayabilmek için önbelleği sıfırla */
  useLayoutEffect(() => {
    centerLayoutKeyRef.current = '';
  }, [viewMode]);

  /** Başlangıçta ortada; zoom’a dokunmaz — görünüm modu veya düzen değişince yeniden ortalar. Orta fare pan için yatay/dikey kaydırılabilir alanı genişletir (`shell` min ölçüleri). */
  useLayoutEffect(() => {
    const cw = scrollClient.w;
    const ch = scrollClient.h;
    if (cw <= 16 || ch <= 16) return;

    const keyDims = `${viewMode}:${viewport.width}x${viewport.height}`;
    if (centerLayoutKeyRef.current === keyDims) return;

    centerLayoutKeyRef.current = keyDims;

    const center = () => {
      const scrollEl = scrollRef.current;
      if (!scrollEl) return;

      const maxSX = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
      const maxSY = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);

      scrollEl.scrollLeft = maxSX / 2;
      scrollEl.scrollTop = maxSY / 2;
    };

    queueMicrotask(() => {
      requestAnimationFrame(center);
    });
  }, [viewMode, viewport.width, viewport.height, scrollClient.w, scrollClient.h]);

  const fitOnLayoutKeyRef = useRef('');
  useLayoutEffect(() => {
    const cw = scrollClient.w;
    const ch = scrollClient.h;
    if (cw <= 16 || ch <= 16) return;

    const key = `${viewMode}:${viewport.width}x${viewport.height}:${cw}x${ch}`;
    if (fitOnLayoutKeyRef.current === key) return;
    fitOnLayoutKeyRef.current = key;

    queueMicrotask(() => {
      requestAnimationFrame(() => fitCanvasToViewport());
    });
  }, [fitCanvasToViewport, scrollClient.w, scrollClient.h, viewMode, viewport.width, viewport.height]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleWheel = (event: WheelEvent) => {
      if (isPlaying) return;

      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : 0;
      if (delta === 0) return;

      event.preventDefault();

      const step = CANVAS_ZOOM_STEP;
      const direction = delta > 0 ? -step : step;
      const nextZoom = clampZoom(canvasZoomRef.current + direction);
      zoomTowardScreenPoint(nextZoom, event.clientX, event.clientY);
    };

    scrollElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => scrollElement.removeEventListener('wheel', handleWheel);
  }, [clampZoom, isPlaying, zoomTowardScreenPoint]);

  // Middle-mouse drag to pan the canvas viewport (Photoshop-style).
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || isPlaying) return;

    let panning = false;
    let startClientX = 0;
    let startClientY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    const endPan = () => {
      if (!panning) return;
      panning = false;
      scrollElement.style.cursor = '';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 1) return;
      event.preventDefault();
      panning = true;
      startClientX = event.clientX;
      startClientY = event.clientY;
      startScrollLeft = scrollElement.scrollLeft;
      startScrollTop = scrollElement.scrollTop;
      scrollElement.style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!panning) return;
      event.preventDefault();
      scrollElement.scrollLeft = startScrollLeft - (event.clientX - startClientX);
      scrollElement.scrollTop = startScrollTop - (event.clientY - startClientY);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 1) endPan();
    };

    scrollElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      scrollElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      endPan();
    };
  }, [isPlaying]);

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

  const cw = scrollClient.w;
  const ch = scrollClient.h;
  /** Pan gutters (~one viewport per side); capped so scroll area cannot balloon with the scrollport. */
  const panGutterX = cw > 16 ? Math.min(cw, Math.max(scaledWidth, 320)) : 0;
  const panGutterY = ch > 16 ? Math.min(ch, Math.max(scaledHeight, 240)) : 0;
  const shellMinStyle: React.CSSProperties =
    panGutterX > 0 && panGutterY > 0
      ? {
          minWidth: scaledWidth + CANVAS_SHELL_PAD_PX + panGutterX * 2,
          minHeight: scaledHeight + CANVAS_SHELL_PAD_PX + panGutterY * 2,
        }
      : { minWidth: '100%', minHeight: '100%' };

  const showChromeRulers = !isPlaying && canvasSettings.showRulers;
  const rulerMetrics = {
    ...rulerViewport,
    canvasZoom,
    logicalW: viewport.width,
    logicalH: viewport.height,
    pointer: showChromeRulers ? rulerPointer : null,
  };

  return (
    <div className="msp-relative msp-flex msp-min-h-0 msp-w-full msp-flex-1 msp-flex-col msp-bg-muted msp-overflow-hidden">
      <div
        className={cn('msp-min-h-0 msp-w-full msp-flex-1', !showChromeRulers && 'msp-flex msp-flex-col')}
        style={
          showChromeRulers
            ? {
                display: 'grid',
                gridTemplateColumns: `${CANVAS_RULER_THICKNESS_PX}px minmax(0, 1fr)`,
                gridTemplateRows: `${CANVAS_RULER_THICKNESS_PX}px minmax(0, 1fr)`,
                gap: 0,
                minHeight: 0,
              }
            : { minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' as const }
        }
      >
        {showChromeRulers && <CanvasViewportRulers metrics={rulerMetrics} />}
        <div
          ref={scrollRef}
          data-msp-editor-canvas-scroll
          onPointerMove={handleScrollPointerMove}
          onPointerLeave={handleScrollPointerLeave}
          className={cn(
            'msp-min-h-0 msp-w-full msp-overflow-auto',
            !showChromeRulers && 'msp-flex-1',
            showChromeRulers && 'msp-col-start-2 msp-row-start-2 msp-min-w-0',
            // Keep overflow scrollable for wheel zoom + middle-mouse pan, but hide native
            // scrollbars so layout doesn’t reserve a gutter strip that jumps when zooming.
            '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          )}
        >
        <div
          className="msp-box-border msp-flex msp-min-h-full msp-min-w-full msp-flex-col msp-items-center msp-justify-center msp-p-4"
          style={shellMinStyle}
        >
          <div
            ref={frameRef}
            data-msp-editor-canvas-frame
            className="msp-relative msp-shrink-0"
            style={{ width: scaledWidth, height: scaledHeight }}
          >
            <div
              data-msp-slide-root
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

              {!isPlaying && canvasSettings.showCenterGuides && (
                <>
                  <div
                    className="msp-absolute msp-top-0 msp-bottom-0 msp-pointer-events-none msp-z-[28] msp-w-px msp-bg-primary/80"
                    style={{ left: viewport.width / 2 }}
                    aria-hidden
                  />
                  <div
                    className="msp-absolute msp-left-0 msp-right-0 msp-pointer-events-none msp-z-[28] msp-h-px msp-bg-primary/80"
                    style={{ top: viewport.height / 2 }}
                    aria-hidden
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {!isPlaying && (
        <div className="msp-pointer-events-none msp-absolute msp-bottom-3 msp-right-3 msp-z-50 msp-flex msp-items-center msp-gap-1">
          <div
            className="msp-rounded-md msp-border msp-bg-card/95 msp-px-2 msp-py-1 msp-text-[10px] msp-font-medium msp-tabular-nums msp-text-muted-foreground msp-shadow-md msp-backdrop-blur-sm"
            title={t('editor.canvas.slideSize')}
          >
            {viewport.width} × {viewport.height}
          </div>
          <div className="msp-pointer-events-auto msp-flex msp-items-center msp-gap-0.5 msp-rounded-md msp-border msp-bg-card/95 msp-p-0.5 msp-shadow-md msp-backdrop-blur-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={() => zoomTowardViewportCenter(canvasZoomRef.current - CANVAS_ZOOM_STEP)}
              title={t('editor.canvas.zoomOut')}
            >
              <Minus className="msp-h-3.5 msp-w-3.5" />
            </Button>
            <button
              type="button"
              className="msp-min-w-[3rem] msp-px-1 msp-text-xs msp-font-medium msp-tabular-nums hover:msp-bg-muted msp-rounded-sm msp-h-7"
              onClick={() => zoomTowardViewportCenter(CANVAS_ZOOM_DEFAULT)}
              title={t('editor.canvas.zoomReset')}
            >
              {Math.round(canvasZoom * 100)}%
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={() => zoomTowardViewportCenter(canvasZoomRef.current + CANVAS_ZOOM_STEP)}
              title={t('editor.canvas.zoomIn')}
            >
              <Plus className="msp-h-3.5 msp-w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={fitCanvasToViewport}
              title={t('editor.canvas.fitToViewport')}
            >
              <Maximize2 className="msp-h-3.5 msp-w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={() => zoomTowardViewportCenter(CANVAS_ZOOM_DEFAULT)}
              title={t('editor.canvas.zoomReset')}
            >
              <RotateCcw className="msp-h-3.5 msp-w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="msp-h-7 msp-w-7"
              onClick={centerScrollViewport}
              title={t('editor.canvas.centerView')}
            >
              <Crosshair className="msp-h-3.5 msp-w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
