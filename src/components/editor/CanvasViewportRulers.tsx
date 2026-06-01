import React, { useMemo } from 'react';

import { cn } from '@/lib/utils';

/** Top / left ruler thickness (Photoshop-ish corner chunk uses same length). */
export const CANVAS_RULER_THICKNESS_PX = 24;

/** ~Target gap between labelled ticks on screen. */
const TARGET_TICK_GAP_PX = 56;

function rulerStepLogical(zoom: number): number {
  const logicalGuess = TARGET_TICK_GAP_PX / Math.max(zoom, 1e-6);
  const pow10 = 10 ** Math.floor(Math.log10(Math.max(logicalGuess, 1)));
  let n = logicalGuess / pow10;
  if (n <= 1) return pow10;
  if (n <= 2) return pow10 * 2;
  if (n <= 5) return pow10 * 5;
  return pow10 * 10;
}

export type CanvasViewportRulerPointer = {
  /** Mouse X in scroll client / ruler pixels (matches horizontal ruler width). */
  vx: number;
  /** Mouse Y in scroll client / ruler pixels (matches vertical ruler height). */
  vy: number;
  /** Slide-space X in logical px (accounts for zoom). */
  logicalX: number;
  /** Slide-space Y in logical px (accounts for zoom). */
  logicalY: number;
};

export type CanvasViewportRulerMetrics = {
  scrollLeft: number;
  scrollTop: number;
  clientWidth: number;
  clientHeight: number;
  frameOriginX: number;
  frameOriginY: number;
  canvasZoom: number;
  logicalW: number;
  logicalH: number;
  /** Pointer position over the canvas scrollport; drives Photoshop-style hairlines. */
  pointer: CanvasViewportRulerPointer | null;
};

const CanvasRulerCorner = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={cn(
      'msp-border-b msp-border-r msp-border-border/70 msp-bg-muted msp-shrink-0',
      className,
    )}
    style={{
      width: CANVAS_RULER_THICKNESS_PX,
      height: CANVAS_RULER_THICKNESS_PX,
    }}
  />
);

const HorizontalRuler = ({ m }: { m: CanvasViewportRulerMetrics }) => {
  const w = Math.max(0, m.clientWidth);
  const stepL = rulerStepLogical(m.canvasZoom);
  const stepScaled = stepL * m.canvasZoom;
  const h = CANVAS_RULER_THICKNESS_PX;
  const p = m.pointer;

  const tickData = useMemo(() => {
    if (w <= 0 || stepScaled <= 0) {
      return { majors: [] as Array<{ px: number; val: number }>, minors: [] as Array<{ px: number }> };
    }

    const k0 = Math.floor((m.scrollLeft - m.frameOriginX) / stepScaled);
    const k1 = Math.ceil((m.scrollLeft + w - m.frameOriginX) / stepScaled);

    const ticks: Array<{ px: number; val: number }> = [];
    for (let k = k0; k <= k1; k += 1) {
      const contentX = m.frameOriginX + k * stepScaled;
      const rulerPx = contentX - m.scrollLeft;
      if (rulerPx < -0.75 || rulerPx > w + 0.75) continue;
      ticks.push({ px: rulerPx, val: Math.round(k * stepL) });
    }

    /** Ten subdivisions per major tick when they would still read ~6px+. */
    const minors: Array<{ px: number }> = [];
    const miniStep = stepScaled / 10;
    if (miniStep >= 6) {
      for (let k = k0 - 2; k <= k1 + 2; k += 1) {
        const baseCx = m.frameOriginX + k * stepScaled;
        for (let s = 1; s <= 9; s += 1) {
          const cx = baseCx + s * miniStep;
          const px = cx - m.scrollLeft;
          if (px < 0 || px > w) continue;
          minors.push({ px });
        }
      }
    }

    return { majors: ticks, minors };
  }, [w, m.scrollLeft, m.frameOriginX, stepL, stepScaled]);

  if (w <= 0) return null;

  return (
    <div
      aria-hidden
      className={cn(
        'msp-relative msp-min-w-0 msp-border-b msp-border-border/70 msp-bg-muted',
        'msp-overflow-hidden',
      )}
      style={{ height: CANVAS_RULER_THICKNESS_PX }}
    >
      <svg width={w} height={h} className="msp-block msp-text-muted-foreground msp-shrink-0">
        <line x1={0} y1={h - 1} x2={w} y2={h - 1} className="msp-stroke-border/80" strokeWidth={1} />
        {tickData.minors.map((tick, i) => (
          <line
            key={`minor-h-${tick.px.toFixed(2)}-${i}`}
            x1={tick.px}
            y1={h - 1}
            x2={tick.px}
            y2={h - 1 - Math.round(h * 0.18)}
            className="msp-stroke-foreground/25"
            strokeWidth={1}
          />
        ))}
        {tickData.majors.map((tick) => {
          const height = Math.round(h * 0.48);
          const y0 = h - 1 - height;
          return (
            <g key={`major-h-${tick.val}-${tick.px.toFixed(2)}`}>
              <line
                x1={tick.px}
                y1={h - 1}
                x2={tick.px}
                y2={y0}
                className="msp-stroke-foreground/50"
                strokeWidth={1}
              />
              <text
                x={tick.px + 2}
                y={Math.max(11, Math.floor(h * 0.52))}
                className="msp-fill-muted-foreground msp-font-medium"
                fontSize={9}
              >
                {tick.val}
              </text>
            </g>
          );
        })}
        {p && (
          <g pointerEvents="none">
            <line
              x1={p.vx}
              y1={0}
              x2={p.vx}
              y2={h}
              className="msp-stroke-primary msp-drop-shadow-sm"
              strokeWidth={1}
            />
            <polygon
              points={`${p.vx - 4.5},${h - 1} ${p.vx + 4.5},${h - 1} ${p.vx},${h - 1 - 6.5}`}
              className="msp-fill-primary"
            />
            {(() => {
              const labelW = 38;
              const lx = Math.min(Math.max(p.vx - labelW / 2, 2), w - labelW - 2);
              return (
                <>
                  <rect
                    x={lx}
                    y={1.5}
                    width={labelW}
                    height={13}
                    rx={2}
                    className="msp-fill-primary msp-stroke-primary/20"
                    strokeWidth={1}
                  />
                  <text
                    x={lx + labelW / 2}
                    y={10.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="msp-fill-primary-foreground msp-font-semibold"
                    fontSize={10}
                  >
                    {`X ${p.logicalX}`}
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
};

const VerticalRuler = ({ m }: { m: CanvasViewportRulerMetrics }) => {
  const h = Math.max(0, m.clientHeight);
  const stepL = rulerStepLogical(m.canvasZoom);
  const stepScaled = stepL * m.canvasZoom;
  const rulerW = CANVAS_RULER_THICKNESS_PX;
  const p = m.pointer;

  const tickData = useMemo(() => {
    if (h <= 0 || stepScaled <= 0) {
      return { majors: [] as Array<{ px: number; val: number }>, minors: [] as Array<{ px: number }> };
    }

    const k0 = Math.floor((m.scrollTop - m.frameOriginY) / stepScaled);
    const k1 = Math.ceil((m.scrollTop + h - m.frameOriginY) / stepScaled);

    const ticks: Array<{ px: number; val: number }> = [];
    for (let k = k0; k <= k1; k += 1) {
      const contentY = m.frameOriginY + k * stepScaled;
      const rulerPy = contentY - m.scrollTop;
      if (rulerPy < -0.75 || rulerPy > h + 0.75) continue;
      ticks.push({ px: rulerPy, val: Math.round(k * stepL) });
    }

    const minors: Array<{ px: number }> = [];
    const miniStep = stepScaled / 10;
    if (miniStep >= 6) {
      for (let k = k0 - 2; k <= k1 + 2; k += 1) {
        const baseCy = m.frameOriginY + k * stepScaled;
        for (let s = 1; s <= 9; s += 1) {
          const cy = baseCy + s * miniStep;
          const py = cy - m.scrollTop;
          if (py < 0 || py > h) continue;
          minors.push({ px: py });
        }
      }
    }

    return { majors: ticks, minors };
  }, [h, m.scrollTop, m.frameOriginY, stepL, stepScaled]);

  if (h <= 0) return null;

  return (
    <div
      aria-hidden
      className={cn(
        'msp-relative msp-min-h-0 msp-shrink-0 msp-border-r msp-border-border/70 msp-bg-muted',
        'msp-overflow-hidden',
      )}
      style={{ width: rulerW }}
    >
      <svg width={rulerW} height={h} className="msp-block msp-text-muted-foreground">
        <line x1={rulerW - 1} y1={0} x2={rulerW - 1} y2={h} className="msp-stroke-border/80" strokeWidth={1} />
        {tickData.minors.map((tick, i) => (
          <line
            key={`minor-v-${tick.px.toFixed(2)}-${i}`}
            x1={rulerW - 1}
            y1={tick.px}
            x2={rulerW - 1 - Math.round(rulerW * 0.2)}
            y2={tick.px}
            className="msp-stroke-foreground/25"
            strokeWidth={1}
          />
        ))}
        {tickData.majors.map((tick) => {
          const wing = Math.round(rulerW * 0.52);
          const x0 = rulerW - 1 - wing;
          const cx = x0 + 9;
          return (
            <g key={`major-v-${tick.val}-${tick.px.toFixed(2)}`}>
              <line
                x1={rulerW - 1}
                y1={tick.px}
                x2={x0}
                y2={tick.px}
                className="msp-stroke-foreground/50"
                strokeWidth={1}
              />
              <text
                x={cx}
                y={tick.px}
                textAnchor="middle"
                dominantBaseline="central"
                className="msp-fill-muted-foreground msp-font-medium"
                fontSize={9}
                transform={`rotate(-90 ${cx} ${tick.px})`}
              >
                {tick.val}
              </text>
            </g>
          );
        })}
        {p && (
          <g pointerEvents="none">
            <line
              x1={0}
              y1={p.vy}
              x2={rulerW}
              y2={p.vy}
              className="msp-stroke-primary msp-drop-shadow-sm"
              strokeWidth={1}
            />
            <polygon
              points={`${rulerW - 1},${p.vy - 4.5} ${rulerW - 1},${p.vy + 4.5} ${rulerW - 1 - 6.5},${p.vy}`}
              className="msp-fill-primary"
            />
            {(() => {
              const labelH = 14;
              const ly = Math.min(Math.max(p.vy, labelH / 2 + 2), h - labelH / 2 - 2);
              const cx = rulerW / 2;
              return (
                <>
                  <rect
                    x={1.5}
                    y={ly - labelH / 2}
                    width={rulerW - 3}
                    height={labelH}
                    rx={2}
                    className="msp-fill-primary msp-stroke-primary/20"
                    strokeWidth={1}
                  />
                  <text
                    x={cx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="msp-fill-primary-foreground msp-font-semibold"
                    fontSize={9}
                  >
                    {`Y ${p.logicalY}`}
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
};

export const CanvasViewportRulers = ({
  metrics,
}: {
  metrics: CanvasViewportRulerMetrics;
}) => (
  <>
    <CanvasRulerCorner className="msp-col-start-1 msp-row-start-1" />
    <div className="msp-col-start-2 msp-row-start-1 msp-min-w-0">
      <HorizontalRuler m={metrics} />
    </div>
    <div className="msp-col-start-1 msp-row-start-2 msp-flex msp-min-h-0">
      <VerticalRuler m={metrics} />
    </div>
  </>
);
