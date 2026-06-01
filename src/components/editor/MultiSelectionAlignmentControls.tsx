import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  computeMultiSelectionCanvasAlignDelta,
  findElementInTree,
  getAncestorSlideOffset,
  guessClosestMultiSelectionCanvasAnchor,
  pruneMultiSelectionIds,
} from '@/lib/alignment';
import { resolveElementProperties } from '@/lib/responsive';
import type { EditorElement, ResponsivePropertyMode } from '@/types/editor';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { AlignPositionIcon } from './AlignPositionIcon';
import { ALIGNMENT_GRID } from './alignmentAnchorGrid';
import type { AlignmentAnchor } from '@/lib/alignment';
import { getEditorViewportSize } from '@/lib/constants';
import { computeCanvasAnchorUnionShift, readSlideElementLogicalBox } from '@/lib/slideElementDomBox';
import { cn } from '@/lib/utils';

export function MultiSelectionAlignmentControls({
  selectionIds,
  propertyMode,
}: {
  selectionIds: string[];
  propertyMode: ResponsivePropertyMode;
}) {
  const { t } = useLanguage();
  const { slides, currentSlideIndex, viewMode, canvasSettings, updateElementsForMode, canvasZoom } = useEditor();
  const slideElements = slides[currentSlideIndex]?.elements ?? [];

  const guessedAnchor = useMemo(
    () => guessClosestMultiSelectionCanvasAnchor(selectionIds, slideElements, viewMode, canvasSettings),
    [selectionIds, slideElements, viewMode, canvasSettings],
  );

  const handleAlign = (anchor: AlignmentAnchor) => {
    const pruned = pruneMultiSelectionIds(selectionIds, slideElements);
    if (pruned.length < 2) return;

    const z = canvasZoom > 0 ? canvasZoom : 1;
    const { width: vw, height: vh } = getEditorViewportSize(viewMode, canvasSettings);
    const extraFromDom = computeCanvasAnchorUnionShift(anchor, pruned, z, vw, vh);

    if (extraFromDom != null && (extraFromDom.dx !== 0 || extraFromDom.dy !== 0)) {
      const refined: Record<string, Partial<EditorElement>> = {};
      for (const id of pruned) {
        const b = readSlideElementLogicalBox(id, z);
        if (!b) {
          break;
        }
        const ancestor = getAncestorSlideOffset(slideElements, id, viewMode);
        refined[id] = {
          x: Math.round(b.left + extraFromDom.dx - ancestor.x),
          y: Math.round(b.top + extraFromDom.dy - ancestor.y),
        };
      }
      if (Object.keys(refined).length === pruned.length) {
        updateElementsForMode(refined, propertyMode);
        return;
      }
    }

    if (extraFromDom != null && extraFromDom.dx === 0 && extraFromDom.dy === 0) {
      return;
    }

    const delta = computeMultiSelectionCanvasAlignDelta(
      anchor,
      slideElements,
      selectionIds,
      viewMode,
      canvasSettings,
    );
    if (!delta) return;

    const updates: Record<string, Partial<EditorElement>> = {};
    for (const id of pruned) {
      const match = findElementInTree(slideElements, id);
      if (!match) continue;
      const r = resolveElementProperties(match.element, viewMode);
      updates[id] = { x: Math.round((r.x ?? 0) + delta.dx), y: Math.round((r.y ?? 0) + delta.dy) };
    }
    updateElementsForMode(updates, propertyMode);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const extra = computeCanvasAnchorUnionShift(anchor, pruned, z, vw, vh);
        if (!extra || (extra.dx === 0 && extra.dy === 0)) return;
        const refined: Record<string, Partial<EditorElement>> = {};
        for (const id of pruned) {
          const b = readSlideElementLogicalBox(id, z);
          if (!b) continue;
          const ancestor = getAncestorSlideOffset(slideElements, id, viewMode);
          refined[id] = {
            x: Math.round(b.left + extra.dx - ancestor.x),
            y: Math.round(b.top + extra.dy - ancestor.y),
          };
        }
        updateElementsForMode(refined, propertyMode);
      });
    });
  };

  return (
    <div className="msp-space-y-2 msp-pt-1">
      <Label className="msp-text-xs msp-font-semibold">{t('editor.properties.multiAlignment')}</Label>
      <p className="msp-text-[11px] msp-text-muted-foreground msp-leading-snug">{t('editor.properties.multiAlignHint')}</p>
      <div className="msp-grid msp-w-full msp-grid-cols-3 msp-gap-1">
        {ALIGNMENT_GRID.map((anchor) => (
          <Button
            key={anchor}
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={guessedAnchor === anchor}
            className={cn(
              'msp-h-8 msp-min-h-8 msp-w-full msp-min-w-0 msp-shrink-0 msp-px-0 msp-py-0 msp-flex msp-items-center msp-justify-center [&_svg]:msp-size-4',
              guessedAnchor === anchor &&
                'msp-border-primary msp-bg-primary/15 msp-text-primary msp-ring-2 msp-ring-primary/35',
            )}
            title={t(`editor.properties.alignAnchor.${anchor}`)}
            onClick={() => handleAlign(anchor)}
          >
            <AlignPositionIcon anchor={anchor} />
          </Button>
        ))}
      </div>
    </div>
  );
}
