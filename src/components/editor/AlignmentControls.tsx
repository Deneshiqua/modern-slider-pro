import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  AlignmentAnchor,
  AlignmentReference,
  canUseAlignmentReference,
  computeAlignedLocalPosition,
  findElementInTree,
} from '@/lib/alignment';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { ResponsivePropertyMode } from '@/types/editor';

const ALIGNMENT_GRID: AlignmentAnchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'middle-center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const ANCHOR_DOT_CLASS: Record<AlignmentAnchor, string> = {
  'top-left': 'msp-left-0.5 msp-top-0.5',
  'top-center': 'msp-left-1/2 -msp-translate-x-1/2 msp-top-0.5',
  'top-right': 'msp-right-0.5 msp-top-0.5',
  'middle-left': 'msp-left-0.5 msp-top-1/2 -msp-translate-y-1/2',
  'middle-center': 'msp-left-1/2 msp-top-1/2 -msp-translate-x-1/2 -msp-translate-y-1/2',
  'middle-right': 'msp-right-0.5 msp-top-1/2 -msp-translate-y-1/2',
  'bottom-left': 'msp-left-0.5 msp-bottom-0.5',
  'bottom-center': 'msp-left-1/2 -msp-translate-x-1/2 msp-bottom-0.5',
  'bottom-right': 'msp-right-0.5 msp-bottom-0.5',
};

const AlignPositionIcon = ({ anchor }: { anchor: AlignmentAnchor }) => (
  <span className="msp-relative msp-block msp-h-4 msp-w-4 msp-rounded-sm msp-border msp-border-current">
    <span className={cn('msp-absolute msp-h-1 msp-w-1 msp-rounded-full msp-bg-current', ANCHOR_DOT_CLASS[anchor])} />
  </span>
);

type AlignmentControlsProps = {
  elementId: string;
  propertyMode: ResponsivePropertyMode;
};

const AlignmentControls = ({ elementId, propertyMode }: AlignmentControlsProps) => {
  const { t } = useLanguage();
  const { slides, currentSlideIndex, viewMode, canvasSettings, updateElementForMode } = useEditor();
  const slideElements = slides[currentSlideIndex]?.elements ?? [];

  const [reference, setReference] = useState<AlignmentReference>('canvas');

  const match = findElementInTree(slideElements, elementId);
  if (!match) return null;

  const references: AlignmentReference[] = ['element', 'group', 'canvas'];
  const activeReference = canUseAlignmentReference(reference, elementId, slideElements)
    ? reference
    : references.find((ref) => canUseAlignmentReference(ref, elementId, slideElements)) ?? 'canvas';

  const handleAlign = (anchor: AlignmentAnchor) => {
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
  };

  return (
    <div className="msp-space-y-2 msp-pt-1 msp-border-t">
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

      <div className="msp-grid msp-grid-cols-3 msp-gap-1 msp-w-[108px]">
        {ALIGNMENT_GRID.map((anchor) => (
          <Button
            key={anchor}
            type="button"
            variant="outline"
            size="icon"
            className="msp-h-8 msp-w-8"
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
