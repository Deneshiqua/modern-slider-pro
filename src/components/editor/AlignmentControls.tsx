import React, { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlignmentReference,
  canUseAlignmentReference,
  computeAlignedLocalPosition,
  computeCanvasRefinedLocalPosition,
  findElementInTree,
  guessClosestAlignmentAnchor,
} from '@/lib/alignment';
import { readSlideElementLogicalBox } from '@/lib/slideElementDomBox';
import type { AlignmentAnchor } from '@/lib/alignment';
import { cn } from '@/lib/utils';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { ResponsivePropertyMode } from '@/types/editor';
import { AlignPositionIcon } from './AlignPositionIcon';
import { ALIGNMENT_GRID } from './alignmentAnchorGrid';

type AlignmentControlsProps = {
  elementId: string;
  propertyMode: ResponsivePropertyMode;
};

const AlignmentControls = ({ elementId, propertyMode }: AlignmentControlsProps) => {
  const { t } = useLanguage();
  const { slides, currentSlideIndex, viewMode, canvasSettings, updateElementForMode, canvasZoom } = useEditor();
  const slideElements = slides[currentSlideIndex]?.elements ?? [];

  const [reference, setReference] = useState<AlignmentReference>('canvas');

  const match = findElementInTree(slideElements, elementId);

  const references: AlignmentReference[] = ['element', 'group', 'canvas'];
  const activeReference =
    match && canUseAlignmentReference(reference, elementId, slideElements)
      ? reference
      : references.find((ref) => canUseAlignmentReference(ref, elementId, slideElements)) ?? 'canvas';

  const guessedAnchor = useMemo(() => {
    if (!match) return null;
    return guessClosestAlignmentAnchor(
      activeReference,
      match.element,
      slideElements,
      viewMode,
      canvasSettings,
    );
  }, [activeReference, match, slideElements, viewMode, canvasSettings]);

  if (!match) return null;

  const handleAlign = (anchor: AlignmentAnchor) => {
    const z = canvasZoom > 0 ? canvasZoom : 1;

    /** Canvas + DOM: tek güncelleme — aksi halde model konumu + rAF ile düzeltme iki kez hareket ettirir. */
    if (activeReference === 'canvas') {
      const box = readSlideElementLogicalBox(elementId, z);
      if (box) {
        const refined = computeCanvasRefinedLocalPosition(
          anchor,
          elementId,
          slideElements,
          viewMode,
          canvasSettings,
          box,
        );
        updateElementForMode(elementId, refined, propertyMode);
        return;
      }
    }

    const position = computeAlignedLocalPosition(
      anchor,
      activeReference,
      match.element,
      slideElements,
      viewMode,
      canvasSettings,
    );

    if (!position) return;

    updateElementForMode(elementId, position, propertyMode);

    if (activeReference !== 'canvas') return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const box = readSlideElementLogicalBox(elementId, z);
        if (!box) return;
        const refined = computeCanvasRefinedLocalPosition(
          anchor,
          elementId,
          slideElements,
          viewMode,
          canvasSettings,
          box,
        );
        updateElementForMode(elementId, refined, propertyMode);
      });
    });
  };

  return (
    <div className="msp-space-y-2 msp-pt-1">
      <Label className="msp-text-xs msp-font-semibold">{t('editor.properties.alignment')}</Label>

      <Tabs
        value={activeReference}
        onValueChange={(value) => setReference(value as AlignmentReference)}
        className="msp-w-full"
      >
        <TabsList className="msp-grid msp-w-full msp-grid-cols-3 msp-h-7">
          {references.map((ref) => (
            <TabsTrigger
              key={ref}
              value={ref}
              disabled={!canUseAlignmentReference(ref, elementId, slideElements)}
              className="msp-text-[10px] msp-px-1 msp-py-0"
            >
              {t(`editor.properties.alignReference.${ref}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

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
};

export default AlignmentControls;
