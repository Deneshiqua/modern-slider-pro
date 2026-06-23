import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import ContextMenu from './ContextMenu';
import TextElementContent from './TextElementContent';
import { CanvasSettings, EditorElement, ViewMode } from '@/types/editor';
import { Rnd } from 'react-rnd';
import { getEditorViewportSize } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { elementSubtreeContainsSlide } from '@/lib/elementSubtree';
import { formatElementHoverStyleTag } from '@/lib/elementHoverCss';
import { resolveElementProperties } from '@/lib/responsive';
import { getAncestorSlideOffset } from '@/lib/alignment';
import { getElementOuterSize } from '@/lib/groupBounds';
import { pointerClientToSlideLogical } from '@/lib/pointerClientToSlideLogical';
import { useEditor } from '@/context/EditorContext';
import { useSetSnapGuides } from '@/context/SnapGuidesContext';
import { resolveElementPlaybackTransition } from '@/lib/timelineBridge';

interface DraggableElementProps {
  element: EditorElement;
  isPreview?: boolean;
  /** No nested Rnd — used inside grouped boxes so the parent group can receive drag. */
  staticInGroupLayer?: boolean;
}

const SNAP_THRESHOLD = 6;

/** Ekran koordinatı (`clientX`/`clientY`) — cetvel/ölçümle kıyas için. */
function getPointerClientFromDragEvent(e: unknown): { x: number; y: number } | undefined {
  if (!e || typeof e !== 'object') return undefined;
  const o = e as Record<string, unknown>;
  if (typeof o.clientX === 'number' && typeof o.clientY === 'number') {
    return { x: o.clientX, y: o.clientY };
  }
  const ne = o.nativeEvent;
  if (ne && typeof ne === 'object' && typeof (ne as MouseEvent).clientX === 'number') {
    const m = ne as MouseEvent;
    return { x: m.clientX, y: m.clientY };
  }
  return undefined;
}

function devLogPointerFields(e: unknown, canvasZoom: number) {
  const mouseClient = getPointerClientFromDragEvent(e);
  const pointerInSlide =
    mouseClient != null ? pointerClientToSlideLogical(mouseClient.x, mouseClient.y, canvasZoom) : null;
  return { mouseClient, pointerInSlide };
}

function localToSlideXY(
  localX: number,
  localY: number,
  elementId: string,
  slideRoots: EditorElement[],
  viewMode: ViewMode,
) {
  const ancestor = getAncestorSlideOffset(slideRoots, elementId, viewMode);
  return { x: localX + ancestor.x, y: localY + ancestor.y };
}

function slideToLocalXY(
  slideX: number,
  slideY: number,
  elementId: string,
  slideRoots: EditorElement[],
  viewMode: ViewMode,
) {
  const ancestor = getAncestorSlideOffset(slideRoots, elementId, viewMode);
  return { x: slideX - ancestor.x, y: slideY - ancestor.y };
}

function resolveLocalPositionFromPointer(
  e: unknown,
  canvasZoom: number,
  grabOffsetSlide: { x: number; y: number } | null,
  elementId: string,
  slideRoots: EditorElement[],
  viewMode: ViewMode,
): { x: number; y: number } | null {
  const mouse = getPointerClientFromDragEvent(e);
  if (!mouse || !grabOffsetSlide) return null;
  const slidePt = pointerClientToSlideLogical(mouse.x, mouse.y, canvasZoom);
  if (!slidePt) return null;
  return slideToLocalXY(
    slidePt.x - grabOffsetSlide.x,
    slidePt.y - grabOffsetSlide.y,
    elementId,
    slideRoots,
    viewMode,
  );
}

function clampLocalToSlideBounds(
  localX: number,
  localY: number,
  element: EditorElement,
  slideRoots: EditorElement[],
  viewMode: ViewMode,
  canvasSettings: CanvasSettings,
) {
  const slide = localToSlideXY(localX, localY, element.id, slideRoots, viewMode);
  const { width: vw, height: vh } = getEditorViewportSize(viewMode, canvasSettings);
  const { width: ew, height: eh } = getElementOuterSize(element, viewMode);
  const clampedSlide = {
    x: Math.max(0, Math.min(slide.x, vw - ew)),
    y: Math.max(0, Math.min(slide.y, vh - eh)),
  };
  return slideToLocalXY(clampedSlide.x, clampedSlide.y, element.id, slideRoots, viewMode);
}

function findElementInTree(elements: EditorElement[], id: string): EditorElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children?.length) {
      const found = findElementInTree(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

const DraggableElement = ({ element, isPreview = false, staticInGroupLayer = false }: DraggableElementProps) => {
  const {
    selectElement,
    selectedElementIds,
    toggleElementSelection,
    updateElementForMode,
    updateElementsForMode,
    showBorders,
    slides,
    currentSlideIndex,
    viewMode,
    propertyMode,
    canvasSettings,
    canvasZoom,
    enterLayersDrill,
    layersDrillParentId,
  } = useEditor();
  const setSnapGuides = useSetSnapGuides();
  const renderedElement = resolveElementProperties(element, viewMode);
  const isSelected = selectedElementIds.includes(element.id);
  const rndRef = useRef<Rnd>(null);
  const dragStartPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  /** İmleç ile katman arasındaki slayt-uzayı ofseti (`react-rnd` `scale` + `transform` yerine). */
  const dragGrabOffsetSlideRef = useRef<{ x: number; y: number } | null>(null);
  const selectedElementIdsRef = useRef(selectedElementIds);
  selectedElementIdsRef.current = selectedElementIds;
  /** Tek seçimde sürüklerken sadece bu öğe yeniden çizer; `setSlides` her mousemove tetiklemez (akıcı sürükleme). */
  const [localDragPos, setLocalDragPos] = useState<{ x: number; y: number } | null>(null);
  const snapGuidesRafRef = useRef<number | null>(null);
  const pendingSnapGuidesRef = useRef<{ x: number[]; y: number[] } | null>(null);

  const flushSnapGuides = () => {
    snapGuidesRafRef.current = null;
    const p = pendingSnapGuidesRef.current;
    pendingSnapGuidesRef.current = null;
    if (p) setSnapGuides(p);
  };

  const scheduleSnapGuides = (next: { x: number[]; y: number[] }) => {
    pendingSnapGuidesRef.current = next;
    snapGuidesRafRef.current ??= requestAnimationFrame(flushSnapGuides);
  };

  const cancelSnapGuidesRaf = () => {
    if (snapGuidesRafRef.current != null) {
      cancelAnimationFrame(snapGuidesRafRef.current);
      snapGuidesRafRef.current = null;
    }
    pendingSnapGuidesRef.current = null;
  };

  useEffect(() => () => cancelSnapGuidesRaf(), []);

  const isLocked = element.isLocked === true;

  const slideRoots = slides[currentSlideIndex]?.elements ?? [];
  /** Katmanlar'da grubun içine drill edildiğinde statik/group kilidini kaldırır (nested Rnd + pointer events). */
  const insideLayersDrillSubtree =
    layersDrillParentId != null &&
    elementSubtreeContainsSlide(slideRoots, layersDrillParentId, element.id);
  const isolatedInGroupedLayer = staticInGroupLayer && !insideLayersDrillSubtree;

  /** Sadece isGroup kutuları: içine drill olununca kabuğu yanlışlıkla kaydırma/yeniden boyutlamayı kapatır */
  const freezeGroupHullWhileDrillingInside =
    !isPreview &&
    !isLocked &&
    element.isGroup === true &&
    layersDrillParentId !== null &&
    element.id === layersDrillParentId;

  /** Bu grup için Katman drill açık; içeride başka şey seçili olsa bile grup sınırını göster */
  const drilledIntoThisGroupHull =
    !isPreview && element.isGroup === true && layersDrillParentId === element.id;

  if (element.isVisible === false) return null;

  const handleRotationMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rndEl = (rndRef.current as any)?.resizableElement?.current as HTMLElement | null;
    if (!rndEl) return;
    const rect = rndEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const onMove = (ev: MouseEvent) => {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90;
      const normalized = Math.round(((angle % 360) + 360) % 360);
      updateElementForMode(element.id, { rotation: normalized }, propertyMode);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const calculateSnapGuides = (x: number, y: number) => {
    const { width: w, height: h } = getElementOuterSize(element, viewMode);
    const viewport = getEditorViewportSize(viewMode, canvasSettings);

    // Snap target lines: canvas edges + center + sibling elements
    const targetX: number[] = [0, viewport.width / 2, viewport.width];
    const targetY: number[] = [0, viewport.height / 2, viewport.height];

    const siblingRoots = slides[currentSlideIndex].elements.filter(e => e.id !== element.id);
    for (const rawSib of siblingRoots) {
      const resolvedSib = resolveElementProperties(rawSib, viewMode);
      const { width: sw, height: sh } = getElementOuterSize(rawSib, viewMode);
      targetX.push(resolvedSib.x, resolvedSib.x + sw / 2, resolvedSib.x + sw);
      targetY.push(resolvedSib.y, resolvedSib.y + sh / 2, resolvedSib.y + sh);
    }

    // My edges: [left, center, right] and [top, center, bottom]
    const myX = [x, x + w / 2, x + w];
    const myY = [y, y + h / 2, y + h];
    const offX = [0, w / 2, w];
    const offY = [0, h / 2, h];

    const guidesX: number[] = [];
    const guidesY: number[] = [];
    let snapX = x;
    let snapY = y;

    for (const tx of targetX) {
      for (let i = 0; i < myX.length; i++) {
        if (Math.abs(myX[i] - tx) < SNAP_THRESHOLD) {
          guidesX.push(tx);
          snapX = tx - offX[i];
          break;
        }
      }
    }
    for (const ty of targetY) {
      for (let i = 0; i < myY.length; i++) {
        if (Math.abs(myY[i] - ty) < SNAP_THRESHOLD) {
          guidesY.push(ty);
          snapY = ty - offY[i];
          break;
        }
      }
    }

    return {
      guidesX: [...new Set(guidesX)],
      guidesY: [...new Set(guidesY)],
      snapX,
      snapY,
    };
  };

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return <TextElementContent content={renderedElement.content} />;
      case 'image':
        return (
          <img
              src={renderedElement.content}
            alt="element"
            className="msp-w-full msp-h-full msp-block"
            style={{
              objectFit: (renderedElement.style.objectFit as React.CSSProperties['objectFit']) || 'cover',
              pointerEvents: 'none'
            }}
          />
        );
      case 'button':
        return (
          <button className="msp-w-full msp-h-full msp-flex msp-items-center msp-justify-center msp-whitespace-pre-wrap msp-pointer-events-none">
            {renderedElement.content}
          </button>
        );
      case 'box':
        return (
          <div className="msp-w-full msp-h-full msp-relative">
            {renderedElement.children?.filter(child => child.isVisible !== false).map(child => (
              <DraggableElement
                key={child.id}
                element={child}
                isPreview={isPreview}
                staticInGroupLayer={staticInGroupLayer || element.isGroup === true}
              />
            ))}
          </div>
        );
      case 'video':
        return (
          <div className="msp-w-full msp-h-full msp-bg-black msp-overflow-hidden msp-rounded-sm msp-border msp-border-transparent">
            <iframe
              width="100%"
              height="100%"
            src={renderedElement.content}
              title="Video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="msp-w-full msp-h-full msp-pointer-events-none"
            />
          </div>
        );
      default:
        return null;
    }
  };

  /** Hover benzeri vurgu: seçili OL ya da grubun içine drill ile düzenlenebilir olduğunda grup kabuğu. */
  const selectionRingClasses =
    isSelected && !isPreview
      ? isLocked
        ? 'msp-ring-2 msp-ring-amber-500 msp-ring-offset-2 msp-ring-offset-background msp-bg-amber-500/10'
        : selectedElementIds.length > 1
          ? 'msp-ring-2 msp-ring-emerald-500 msp-ring-offset-2 msp-ring-offset-background msp-bg-emerald-500/10'
          : 'msp-ring-2 msp-ring-blue-500 msp-ring-offset-2 msp-ring-offset-background msp-bg-blue-500/10'
      : drilledIntoThisGroupHull
        ? 'msp-ring-2 msp-ring-blue-500 msp-ring-offset-2 msp-ring-offset-background msp-bg-blue-500/10'
        : '';

  /** Editor + published slideshow: `:hover` renkleri (inline stilleri !important ile ezer). */
  const hoverCssTag = formatElementHoverStyleTag(element.id, renderedElement.hoverStyle);

  /** Hover hedefi olarak dış kutuya `data-msp-el-hover`; stiller `:hover { … }` ile uygulanır. */
  const content = (
    <>
      {hoverCssTag ? <style>{hoverCssTag}</style> : null}
      <div
        data-msp-el-hover={element.id}
        className={cn(
          'msp-box-border msp-w-full msp-h-full msp-cursor-move msp-select-none msp-rounded-sm msp-transition-shadow',
          // Show dashed border only when seçili değil; seçiliyken ring öne çıksın
          showBorders && !isPreview && !isSelected && !drilledIntoThisGroupHull
            ? 'msp-border msp-border-dashed msp-border-gray-400'
            : '',
          selectionRingClasses,
        )}
        style={{
          ...renderedElement.style,
          width: '100%',
          height: '100%',
          // Ensure children don't inherit zIndex from parent container wrapper
          zIndex: undefined,
          ...(renderedElement.rotation ? { transform: `rotate(${renderedElement.rotation}deg)`, transformOrigin: 'msp-center msp-center' } : {}),
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          if (isPreview || isLocked) return;

          // react-rnd drag start may not expose modifier keys reliably; handle selection here
          // so state is committed before drag, and avoid double-toggle (mousedown + click).
          if (e.ctrlKey || e.metaKey) {
            e.stopPropagation();
            flushSync(() => {
              toggleElementSelection(element.id);
            });
            return;
          }

          // Do not stopPropagation on normal drag — Rnd listens on an ancestor; blocking bubble prevented dragging.
          if (!selectedElementIds.includes(element.id)) {
            flushSync(() => {
              selectElement(element.id);
            });
          }
        }}
        onDoubleClick={(e) => {
          if (isPreview || isLocked || isolatedInGroupedLayer) return;
          if (element.type !== 'box' || !element.children?.length) return;
          e.preventDefault();
          e.stopPropagation();
          enterLayersDrill(element.id);
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {renderContent()}
      </div>
    </>
  );

  // Önizleme veya grupta kapalı düzen — Katman drill aktif olduğunda bu alt-ağaç Rnd ile açılır.
  if (isPreview || isolatedInGroupedLayer) {
    const baseZ = Number(renderedElement.style?.zIndex) || 0;
    /** Liste/katman seçiminde grubun içinde görünür vurgu; ring üstte kalsın diye hafif z-index sıçrat */
    const bringSelectedForward =
      isolatedInGroupedLayer && !isPreview && isSelected ? { zIndex: baseZ + 2000 } : {};

    const previewStyle: React.CSSProperties = {
      position: 'absolute',
      left: renderedElement.x,
      top: renderedElement.y,
      ...renderedElement.style,
      width: renderedElement.style.width,
      height: renderedElement.style.height,
      pointerEvents: isolatedInGroupedLayer ? 'none' : undefined,
      ...bringSelectedForward,
      // rotation must come AFTER element.style spread so it isn't overridden
      ...(renderedElement.rotation ? { transform: `rotate(${renderedElement.rotation}deg)`, transformOrigin: 'msp-center msp-center' } : {}),
    };

    /** Grup içi: seçim görünümü için dış kutuda ring (pointer-events hep none). */
    const groupLayerOutline =
      isolatedInGroupedLayer && !isPreview && isSelected
        ? {
            outline: `2px solid ${isLocked ? '#f59e0b' : selectedElementIds.length > 1 ? '#22c55e' : '#3b82f6'}`,
            outlineOffset: '1px',
          }
        : {};

    const previewShellClassName = cn(
      'msp-box-border msp-rounded-sm',
      isolatedInGroupedLayer && !isPreview ? selectionRingClasses : '',
      showBorders && isolatedInGroupedLayer && !isPreview && !isSelected ? 'msp-border msp-border-dashed msp-border-gray-400' : '',
    );

    if (element.animation) {
      return (
        <>
          {hoverCssTag ? <style>{hoverCssTag}</style> : null}
          <motion.div
            data-msp-el-hover={element.id}
            initial={element.animation.initial}
            animate={element.animation.animate}
            transition={
              isPreview
                ? resolveElementPlaybackTransition(element) ?? element.animation.transition
                : element.animation.transition
            }
            className={previewShellClassName}
            style={{ ...previewStyle, ...groupLayerOutline }}
          >
            {renderContent()}
          </motion.div>
        </>
      );
    }

    return (
      <>
        {hoverCssTag ? <style>{hoverCssTag}</style> : null}
        <div className={previewShellClassName} data-msp-el-hover={element.id} style={{ ...previewStyle, ...groupLayerOutline }}>
          {renderContent()}
        </div>
      </>
    );
  }

  // Solid square handle — fills its 8×8 wrapper
  const SquareHandle = () => (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#3b82f6', borderRadius: 1 }} />
  );

  return (
    <Rnd
      ref={rndRef}
      data-msp-editor-el-id={element.id}
      /** Konum sürüklerken `pointerClientToSlideLogical` ile hesaplanır; `scale` yalnızca yeniden boyutlandırma için. */
      scale={canvasZoom}
      size={{ width: renderedElement.style.width || 'auto', height: renderedElement.style.height || 'auto' }}
      position={{
        x: localDragPos?.x ?? renderedElement.x,
        y: localDragPos?.y ?? renderedElement.y,
      }}
      onDrag={(e, d) => {
        const currentIds = selectedElementIdsRef.current;
        const dragLeaderMulti = currentIds.length > 1 && currentIds.includes(element.id);

        const fromPointer = resolveLocalPositionFromPointer(
          e,
          canvasZoom,
          dragGrabOffsetSlideRef.current,
          element.id,
          slideRoots,
          viewMode,
        );

        const applyLocalPos = (raw: { x: number; y: number }) => {
          const pos = clampLocalToSlideBounds(
            raw.x,
            raw.y,
            element,
            slideRoots,
            viewMode,
            canvasSettings,
          );
          if (canvasSettings.snapToElements) {
            const { guidesX, guidesY } = calculateSnapGuides(pos.x, pos.y);
            scheduleSnapGuides({ x: guidesX, y: guidesY });
          }
          return pos;
        };

        if (fromPointer) {
          if (!dragLeaderMulti) {
            setLocalDragPos(applyLocalPos(fromPointer));
            return;
          }

          const startLeader = dragStartPositionsRef.current[element.id];
          if (!startLeader) return;

          const deltaX = fromPointer.x - startLeader.x;
          const deltaY = fromPointer.y - startLeader.y;

          const updates = currentIds.reduce<Record<string, { x: number; y: number }>>((acc, selectedId) => {
            const startPos = dragStartPositionsRef.current[selectedId];
            if (startPos) {
              acc[selectedId] = {
                x: startPos.x + deltaX,
                y: startPos.y + deltaY,
              };
            }
            return acc;
          }, {});

          if (Object.keys(updates).length > 0) {
            updateElementsForMode(updates, propertyMode, { skipHistory: true });
          }
          return;
        }

        /** Yedek: slayt ölçümü yoksa `react-rnd` konumu */
        if (canvasSettings.snapToElements) {
          const { guidesX, guidesY } = calculateSnapGuides(d.x, d.y);
          scheduleSnapGuides({ x: guidesX, y: guidesY });
          if (!dragLeaderMulti) {
            setLocalDragPos({ x: d.x, y: d.y });
            return;
          }
        } else if (!dragLeaderMulti) {
          setLocalDragPos({ x: d.x, y: d.y });
          return;
        }

        if (!dragLeaderMulti) return;

        const startLeader = dragStartPositionsRef.current[element.id];
        if (!startLeader) return;

        const deltaX = d.x - startLeader.x;
        const deltaY = d.y - startLeader.y;

        const updates = currentIds.reduce<Record<string, { x: number; y: number }>>((acc, selectedId) => {
          const startPos = dragStartPositionsRef.current[selectedId];
          if (startPos) {
            acc[selectedId] = {
              x: startPos.x + deltaX,
              y: startPos.y + deltaY,
            };
          }
          return acc;
        }, {});

        if (Object.keys(updates).length > 0) {
          updateElementsForMode(updates, propertyMode, { skipHistory: true });
        }
      }}
      onDragStop={(e, d) => {
        cancelSnapGuidesRaf();
        setSnapGuides({ x: [], y: [] });
        const currentIds = selectedElementIdsRef.current;
        const activeSelectionIds = currentIds.includes(element.id) && currentIds.length > 1
          ? currentIds
          : [element.id];
        const startPosition = dragStartPositionsRef.current[element.id] ?? { x: renderedElement.x, y: renderedElement.y };

        const pointerEnd = resolveLocalPositionFromPointer(
          e,
          canvasZoom,
          dragGrabOffsetSlideRef.current,
          element.id,
          slideRoots,
          viewMode,
        );
        const releaseLocal = pointerEnd ?? { x: d.x, y: d.y };
        dragGrabOffsetSlideRef.current = null;

        if (activeSelectionIds.length > 1) {
          const deltaX = releaseLocal.x - startPosition.x;
          const deltaY = releaseLocal.y - startPosition.y;
          const updates = activeSelectionIds.reduce<Record<string, { x: number; y: number }>>((acc, selectedId) => {
            const selectedStartPosition = dragStartPositionsRef.current[selectedId];
            if (selectedStartPosition) {
              acc[selectedId] = {
                x: selectedStartPosition.x + deltaX,
                y: selectedStartPosition.y + deltaY,
              };
            }

            return acc;
          }, {});

          if (import.meta.env.DEV) {
            console.log('[msp-drag:end]', {
              type: 'multi',
              leaderId: element.id,
              delta: { x: deltaX, y: deltaY },
              committed: updates,
              ...devLogPointerFields(e, canvasZoom),
            });
          }

          updateElementsForMode(updates, propertyMode);
          dragStartPositionsRef.current = {};
          return;
        }

        const clampedRelease = clampLocalToSlideBounds(
          releaseLocal.x,
          releaseLocal.y,
          element,
          slideRoots,
          viewMode,
          canvasSettings,
        );
        const committed = canvasSettings.snapToElements
          ? (() => {
              const { snapX, snapY } = calculateSnapGuides(clampedRelease.x, clampedRelease.y);
              return { x: snapX, y: snapY };
            })()
          : clampedRelease;

        if (import.meta.env.DEV) {
          console.log('[msp-drag:end]', {
            type: 'single',
            elementId: element.id,
            rnd: { x: d.x, y: d.y },
            releaseLocal: clampedRelease,
            committed,
            snap: canvasSettings.snapToElements,
            ...devLogPointerFields(e, canvasZoom),
          });
        }

        updateElementForMode(element.id, committed, propertyMode);
        setLocalDragPos(null);
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updateElementForMode(element.id, {
          style: {
            width: Number.parseInt(ref.style.width),
            height: Number.parseInt(ref.style.height),
          },
          ...position,
        }, propertyMode);
      }}
      onDragStart={(e) => {
        const evt = ('nativeEvent' in e ? e.nativeEvent : e) as Event;
        if (evt instanceof MouseEvent && evt.button !== 0) return;

        e.stopPropagation();
        cancelSnapGuidesRaf();
        setLocalDragPos(null);
        dragGrabOffsetSlideRef.current = null;

        const currentIds = selectedElementIdsRef.current;
        const activeSelectionIds = currentIds.includes(element.id) && currentIds.length > 1
          ? currentIds
          : [element.id];

        dragStartPositionsRef.current = activeSelectionIds.reduce<Record<string, { x: number; y: number }>>((acc, selectedId) => {
          const selectedEl = findElementInTree(slides[currentSlideIndex].elements, selectedId);
          if (selectedEl) {
            const resolvedSelectedElement = resolveElementProperties(selectedEl, viewMode);
            acc[selectedId] = {
              x: resolvedSelectedElement.x,
              y: resolvedSelectedElement.y,
            };
          }

          return acc;
        }, {});

        const mouse = getPointerClientFromDragEvent(e);
        const slidePt = mouse ? pointerClientToSlideLogical(mouse.x, mouse.y, canvasZoom) : null;
        const start = dragStartPositionsRef.current[element.id];
        if (slidePt && start) {
          const slideStart = localToSlideXY(start.x, start.y, element.id, slideRoots, viewMode);
          dragGrabOffsetSlideRef.current = {
            x: slidePt.x - slideStart.x,
            y: slidePt.y - slideStart.y,
          };
        }

        if (import.meta.env.DEV) {
          console.log('[msp-drag:start]', {
            elementId: element.id,
            multi: activeSelectionIds.length > 1,
            startPositions: { ...dragStartPositionsRef.current },
            grabOffsetSlide: dragGrabOffsetSlideRef.current,
            ...devLogPointerFields(e, canvasZoom),
          });
        }
      }}
      disableDragging={isPreview || isLocked || freezeGroupHullWhileDrillingInside}
      enableResizing={!isPreview && !isLocked && !freezeGroupHullWhileDrillingInside && isSelected && selectedElementIds.length <= 1
        ? { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true, top: false, bottom: true, left: true, right: true }
        : false
      }
      bounds="parent"
      resizeHandleComponent={isSelected ? {
        topLeft: <SquareHandle />,
        topRight: <SquareHandle />,
        bottomLeft: <SquareHandle />,
        bottomRight: <SquareHandle />,
        bottom: <SquareHandle />,
        left: <SquareHandle />,
        right: <SquareHandle />,
      } : undefined}
      resizeHandleStyles={{
        topLeft: { width: 8, height: 8, left: -4, top: -4 },
        topRight: { width: 8, height: 8, right: -4, top: -4 },
        bottomLeft: { width: 8, height: 8, left: -4, bottom: -4 },
        bottomRight: { width: 8, height: 8, right: -4, bottom: -4 },
        bottom: { width: 8, height: 8, bottom: -4, left: 'calc(50% - 4px)' },
        left: { width: 8, height: 8, left: -4, top: 'calc(50% - 4px)' },
        right: { width: 8, height: 8, right: -4, top: 'calc(50% - 4px)' },
      }}
      style={{
        zIndex: renderedElement.style.zIndex,
        ...(!isPreview && (isSelected || drilledIntoThisGroupHull)
          ? {
              outline: `2px solid ${
                isSelected
                  ? isLocked
                    ? '#f59e0b'
                    : selectedElementIds.length > 1
                      ? '#22c55e'
                      : '#3b82f6'
                  : '#3b82f6'
              }`,
              outlineOffset: '1px',
            }
          : {}),
      }}
    >
      {/* Rotation handle — positioned above element center */}
      {isSelected && !isPreview && !isLocked && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -26,
            transform: 'translateX(-50%)',
            width: 10,
            height: 10,
            backgroundColor: '#fff',
            border: '2px solid #3b82f6',
            borderRadius: '50%',
            cursor: 'grab',
            zIndex: 1000,
            boxSizing: 'border-box',
          }}
          onMouseDown={handleRotationMouseDown}
        />
      )}
      <ContextMenu elementId={element.id}>
        {content}
      </ContextMenu>
    </Rnd>
  );
};

export default React.memo(DraggableElement);