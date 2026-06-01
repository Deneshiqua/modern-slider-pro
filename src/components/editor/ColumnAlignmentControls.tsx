import React, { useMemo } from 'react';
import { AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  computeMultiSelectionColumnAlignDelta,
  findElementInTree,
  getAncestorSlideOffset,
  guessClosestColumnAlignVertical,
  pruneMultiSelectionIds,
} from '@/lib/alignment';
import type { ColumnAlignVertical } from '@/lib/alignment';
import type { EditorElement } from '@/types/editor';
import { resolveElementProperties } from '@/lib/responsive';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { ResponsivePropertyMode } from '@/types/editor';
import { getEditorViewportSize } from '@/lib/constants';
import { computeCanvasColumnUnionShift, readSlideElementLogicalBox } from '@/lib/slideElementDomBox';
import { cn } from '@/lib/utils';

export function ColumnAlignmentControls({ propertyMode }: { propertyMode: ResponsivePropertyMode }) {
  const { t } = useLanguage();
  const { slides, currentSlideIndex, viewMode, canvasSettings, updateElementsForMode, selectedElementIds, canvasZoom } =
    useEditor();
  const slideElements = slides[currentSlideIndex]?.elements ?? [];

  const pruned = useMemo(
    () => pruneMultiSelectionIds(selectedElementIds, slideElements),
    [selectedElementIds, slideElements],
  );

  const guessed = useMemo(
    () => guessClosestColumnAlignVertical(slideElements, selectedElementIds, viewMode, canvasSettings),
    [slideElements, selectedElementIds, viewMode, canvasSettings],
  );

  const apply = (vertical: ColumnAlignVertical) => {
    if (pruned.length < 1) return;

    const z = canvasZoom > 0 ? canvasZoom : 1;
    const vh = getEditorViewportSize(viewMode, canvasSettings).height;
    const shiftFromDom = computeCanvasColumnUnionShift(vertical, pruned, z, vh);

    if (shiftFromDom != null) {
      if (shiftFromDom === 0) return;
      const refined: Record<string, Partial<EditorElement>> = {};
      for (const id of pruned) {
        const b = readSlideElementLogicalBox(id, z);
        if (!b) {
          break;
        }
        const ancestor = getAncestorSlideOffset(slideElements, id, viewMode);
        refined[id] = { y: Math.round(b.top + shiftFromDom - ancestor.y) };
      }
      if (Object.keys(refined).length === pruned.length) {
        updateElementsForMode(refined, propertyMode);
        return;
      }
    }

    const delta = computeMultiSelectionColumnAlignDelta(
      vertical,
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
      const r = resolveElementProperties(match.element, viewMode);
      updates[id] = { y: Math.round((r.y ?? 0) + delta.dy) };
    }
    updateElementsForMode(updates, propertyMode);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const shift = computeCanvasColumnUnionShift(vertical, pruned, z, vh);
        if (shift == null || shift === 0) return;
        const refined: Record<string, Partial<EditorElement>> = {};
        for (const id of pruned) {
          const b = readSlideElementLogicalBox(id, z);
          if (!b) continue;
          const ancestor = getAncestorSlideOffset(slideElements, id, viewMode);
          refined[id] = { y: Math.round(b.top + shift - ancestor.y) };
        }
        updateElementsForMode(refined, propertyMode);
      });
    });
  };

  const colBtn = (
    vertical: ColumnAlignVertical,
    icon: React.ReactNode,
    labelKey: 'editor.properties.alignTop' | 'editor.properties.alignMiddle' | 'editor.properties.alignBottom',
  ) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={guessed === vertical}
      title={t(labelKey)}
      onClick={() => apply(vertical)}
      className={cn(
        'msp-h-8 msp-min-h-8 msp-w-full msp-min-w-0 msp-shrink-0 msp-px-0 msp-py-0 msp-flex msp-items-center msp-justify-center [&_svg]:msp-size-4',
        guessed === vertical &&
          'msp-border-primary msp-bg-primary/15 msp-text-primary msp-ring-2 msp-ring-primary/35',
      )}
    >
      {icon}
    </Button>
  );

  if (pruned.length < 1) return null;

  return (
    <div className="msp-space-y-2 msp-pt-0.5">
      <Label className="msp-text-xs msp-font-semibold">{t('editor.properties.verticalAlignment')}</Label>
      <p className="msp-text-[11px] msp-text-muted-foreground msp-leading-snug">{t('editor.properties.verticalAlignmentHint')}</p>
      <div className="msp-grid msp-w-full msp-grid-cols-3 msp-gap-1">
        {colBtn(
          'top',
          <AlignVerticalJustifyStart className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />,
          'editor.properties.alignTop',
        )}
        {colBtn(
          'middle',
          <AlignVerticalJustifyCenter className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />,
          'editor.properties.alignMiddle',
        )}
        {colBtn(
          'bottom',
          <AlignVerticalJustifyEnd className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />,
          'editor.properties.alignBottom',
        )}
      </div>
    </div>
  );
}
