import React, { useMemo } from 'react';
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  computeMultiSelectionRowAlignDelta,
  findElementInTree,
  getAncestorSlideOffset,
  guessClosestRowAlignHorizontal,
  pruneMultiSelectionIds,
} from '@/lib/alignment';
import type { RowAlignHorizontal } from '@/lib/alignment';
import type { EditorElement } from '@/types/editor';
import { resolveElementProperties } from '@/lib/responsive';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { ResponsivePropertyMode } from '@/types/editor';
import { getEditorViewportSize } from '@/lib/constants';
import { computeCanvasRowUnionShift, readSlideElementLogicalBox } from '@/lib/slideElementDomBox';
import { cn } from '@/lib/utils';

export function RowAlignmentControls({ propertyMode }: { propertyMode: ResponsivePropertyMode }) {
  const { t } = useLanguage();
  const { slides, currentSlideIndex, viewMode, canvasSettings, updateElementsForMode, selectedElementIds, canvasZoom } =
    useEditor();
  const slideElements = slides[currentSlideIndex]?.elements ?? [];

  const pruned = useMemo(
    () => pruneMultiSelectionIds(selectedElementIds, slideElements),
    [selectedElementIds, slideElements],
  );

  const guessed = useMemo(
    () => guessClosestRowAlignHorizontal(slideElements, selectedElementIds, viewMode, canvasSettings),
    [slideElements, selectedElementIds, viewMode, canvasSettings],
  );

  const apply = (horizontal: RowAlignHorizontal) => {
    if (pruned.length < 1) return;

    const z = canvasZoom > 0 ? canvasZoom : 1;
    const vw = getEditorViewportSize(viewMode, canvasSettings).width;
    const shiftFromDom = computeCanvasRowUnionShift(horizontal, pruned, z, vw);

    /** DOM birleşik kutu ile tek adım; önce model delta + rAF düzeltmesi iki hareket üretirdi. */
    if (shiftFromDom != null) {
      if (shiftFromDom === 0) return;
      const refined: Record<string, Partial<EditorElement>> = {};
      for (const id of pruned) {
        const b = readSlideElementLogicalBox(id, z);
        if (!b) {
          break;
        }
        const ancestor = getAncestorSlideOffset(slideElements, id, viewMode);
        refined[id] = { x: Math.round(b.left + shiftFromDom - ancestor.x) };
      }
      if (Object.keys(refined).length === pruned.length) {
        updateElementsForMode(refined, propertyMode);
        return;
      }
    }

    const delta = computeMultiSelectionRowAlignDelta(
      horizontal,
      slideElements,
      selectedElementIds,
      viewMode,
      canvasSettings,
    );
    if (!delta) return;

    const updates: Record<string, Partial<EditorElement>> = {};
    for (const id of pruned) {
      const match = findElementInTree(slideElements, id);
      if (!match) continue;
      // Must match canvas / drag: positions are merged from viewMode overrides, not only the property tab (default vs desktop).
      const r = resolveElementProperties(match.element, viewMode);
      updates[id] = { x: Math.round((r.x ?? 0) + delta.dx) };
    }
    updateElementsForMode(updates, propertyMode);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const shift = computeCanvasRowUnionShift(horizontal, pruned, z, vw);
        if (shift == null || shift === 0) return;
        const refined: Record<string, Partial<EditorElement>> = {};
        for (const id of pruned) {
          const b = readSlideElementLogicalBox(id, z);
          if (!b) continue;
          const ancestor = getAncestorSlideOffset(slideElements, id, viewMode);
          refined[id] = { x: Math.round(b.left + shift - ancestor.x) };
        }
        updateElementsForMode(refined, propertyMode);
      });
    });
  };

  const rowBtn = (horizontal: RowAlignHorizontal, icon: React.ReactNode, labelKey: 'editor.properties.alignLeft' | 'editor.properties.alignCenter' | 'editor.properties.alignRight') => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={guessed === horizontal}
      title={t(labelKey)}
      onClick={() => apply(horizontal)}
      className={cn(
        'msp-h-8 msp-min-h-8 msp-w-full msp-min-w-0 msp-shrink-0 msp-px-0 msp-py-0 msp-flex msp-items-center msp-justify-center [&_svg]:msp-size-4',
        guessed === horizontal &&
          'msp-border-primary msp-bg-primary/15 msp-text-primary msp-ring-2 msp-ring-primary/35',
      )}
    >
      {icon}
    </Button>
  );

  if (pruned.length < 1) return null;

  return (
    <div className="msp-space-y-2 msp-pt-0.5">
      <Label className="msp-text-xs msp-font-semibold">{t('editor.properties.rowAlignment')}</Label>
      <p className="msp-text-[11px] msp-text-muted-foreground msp-leading-snug">{t('editor.properties.rowAlignmentHint')}</p>
      <div className="msp-grid msp-w-full msp-grid-cols-3 msp-gap-1">
        {rowBtn('left', <AlignLeft className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />, 'editor.properties.alignLeft')}
        {rowBtn('center', <AlignCenter className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />, 'editor.properties.alignCenter')}
        {rowBtn('right', <AlignRight className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />, 'editor.properties.alignRight')}
      </div>
    </div>
  );
}
