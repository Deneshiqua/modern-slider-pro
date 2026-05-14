import React, { useRef } from 'react';

import ContextMenu from './ContextMenu';
import { EditorElement } from '@/types/editor';
import { Rnd } from 'react-rnd';
import { VIEWPORT_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useEditor } from '@/context/EditorContext';

interface DraggableElementProps {
  element: EditorElement;
  isPreview?: boolean;
}

const SNAP_THRESHOLD = 6;

const DraggableElement = ({ element, isPreview = false }: DraggableElementProps) => {
  const { selectElement, selectedElementId, updateElement, showBorders, slides, currentSlideIndex, viewMode, canvasSettings, setSnapGuides } = useEditor();
  const isSelected = selectedElementId === element.id;
  const rndRef = useRef<Rnd>(null);

  const handleRotationMouseDown = (e: React.MouseEvent) => {
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
      updateElement(element.id, { rotation: normalized });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const calculateSnapGuides = (x: number, y: number) => {
    const w = Number(element.style.width || 100);
    const h = Number(element.style.height || 50);
    const viewportBase = VIEWPORT_SIZE[viewMode];
    const viewport = {
      width: canvasSettings.canvasWidth ?? viewportBase.width,
      height: canvasSettings.canvasHeight ?? viewportBase.height,
    };

    // Snap target lines: canvas edges + center + sibling elements
    const targetX: number[] = [0, viewport.width / 2, viewport.width];
    const targetY: number[] = [0, viewport.height / 2, viewport.height];

    const siblings = slides[currentSlideIndex].elements.filter(e => e.id !== element.id);
    for (const sib of siblings) {
      const sw = Number(sib.style.width || 100);
      const sh = Number(sib.style.height || 50);
      targetX.push(sib.x, sib.x + sw / 2, sib.x + sw);
      targetY.push(sib.y, sib.y + sh / 2, sib.y + sh);
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
        return <p>{element.content}</p>;
      case 'image':
        return (
          <img
            src={element.content}
            alt="element"
            className="w-full h-full block"
            style={{
              objectFit: (element.style.objectFit as React.CSSProperties['objectFit']) || 'cover',
              pointerEvents: 'none'
            }}
          />
        );
      case 'button':
        return (
          <button className="w-full h-full flex items-center justify-center pointer-events-none">
            {element.content}
          </button>
        );
      case 'box':
        return (
          <div className="w-full h-full relative">
            {element.children?.map(child => (
              <DraggableElement key={child.id} element={child} isPreview={isPreview} />
            ))}
          </div>
        );
      case 'video':
        return (
          <div className="w-full h-full bg-black overflow-hidden rounded-sm border border-transparent">
            <iframe
              width="100%"
              height="100%"
              src={element.content}
              title="Video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full pointer-events-none"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const content = (
    <div
      className={cn(
        "w-full h-full cursor-move select-none",
        // Show borders if enabled and not in preview
        showBorders && !isPreview && !isSelected ? "border border-dashed border-gray-400" : ""
      )}
      style={{
        ...element.style,
        width: '100%',
        height: '100%',
        // Ensure children don't inherit zIndex from parent container wrapper
        zIndex: undefined,
        ...(element.rotation ? { transform: `rotate(${element.rotation}deg)`, transformOrigin: 'center center' } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPreview) selectElement(element.id);
      }}
    >
      {renderContent()}
    </div>
  );

  // If preview mode, just render the content (with animation if exists)
  if (isPreview) {
    const previewStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      ...element.style,
      width: element.style.width,
      height: element.style.height,
      // rotation must come AFTER element.style spread so it isn't overridden
      ...(element.rotation ? { transform: `rotate(${element.rotation}deg)`, transformOrigin: 'center center' } : {}),
    };

    if (element.animation) {
      return (
        <motion.div
          initial={element.animation.initial}
          animate={element.animation.animate}
          transition={element.animation.transition}
          style={previewStyle}
        >
          {renderContent()}
        </motion.div>
      );
    }

    return (
      <div style={previewStyle}>
        {renderContent()}
      </div>
    );
  }

  // Solid square handle — fills its 8×8 wrapper
  const SquareHandle = () => (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#3b82f6', borderRadius: 1 }} />
  );

  return (
    <Rnd
      ref={rndRef}
      size={{ width: element.style.width || 'auto', height: element.style.height || 'auto' }}
      position={{ x: element.x, y: element.y }}
      onDrag={(_e, d) => {
        if (!canvasSettings.snapToElements) return;
        const { guidesX, guidesY } = calculateSnapGuides(d.x, d.y);
        setSnapGuides({ x: guidesX, y: guidesY });
      }}
      onDragStop={(_e, d) => {
        setSnapGuides({ x: [], y: [] });
        if (canvasSettings.snapToElements) {
          const { snapX, snapY } = calculateSnapGuides(d.x, d.y);
          updateElement(element.id, { x: snapX, y: snapY });
        } else {
          updateElement(element.id, { x: d.x, y: d.y });
        }
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updateElement(element.id, {
          style: {
            ...element.style,
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          },
          ...position,
        });
      }}
      onDragStart={(e) => {
        e.stopPropagation();
        selectElement(element.id);
      }}
      disableDragging={isPreview}
      enableResizing={!isPreview && isSelected
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
        zIndex: element.style.zIndex,
        ...(isSelected && !isPreview ? { outline: '1.5px solid #3b82f6' } : {})
      }}
    >
      {/* Rotation handle — positioned above element center */}
      {isSelected && !isPreview && (
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

export default DraggableElement;