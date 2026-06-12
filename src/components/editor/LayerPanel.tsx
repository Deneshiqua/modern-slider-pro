import { ChevronLeft, ChevronRight, Eye, EyeOff, GripVertical, Lock, Plus, Trash2, Unlock } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { EditorElement } from '@/types/editor';
import { cn } from '@/lib/utils';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import ContextMenu from '@/components/editor/ContextMenu';
import CanvasSettingsPanel from '@/components/editor/CanvasSettingsPanel';
import SliderSettingsPanel from '@/components/editor/SliderSettingsPanel';

function findElementInSlideTree(elements: EditorElement[], id: string): EditorElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children?.length) {
      const found = findElementInSlideTree(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Fields that affect layer list / ordering — excludes x,y,rotation to avoid Framer `Reorder` sync loops on drag. */
function layerListSignature(elements: EditorElement[]): string {
  return elements
    .map((e) => {
      const z = Number(e.style?.zIndex) || 0;
      const vis = e.isVisible === false ? '0' : '1';
      const lock = e.isLocked ? '1' : '0';
      const kids = e.children?.length ? String(e.children.length) : '0';
      const c = (e.content ?? '').slice(0, 64);
      return `${e.id}:${e.type}:${z}:${vis}:${lock}:${kids}:${e.name ?? ''}:${c}`;
    })
    .join('\u001e');
}

interface LayerItemProps {
  element: EditorElement;
  isSelected: boolean;
  selectionCount: number;
  selectElement: (id: string | null) => void;
  toggleElementSelection: (id: string) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  removeElement: (id: string) => void;
  enterLayersDrill: (parentElementId: string) => void;
}

const LayerItem = ({ element, isSelected, selectionCount, selectElement, toggleElementSelection, updateElement, removeElement, enterLayersDrill }: LayerItemProps) => {
  const controls = useDragControls();
  const defaultName = element.type.charAt(0).toUpperCase() + element.type.slice(1);
  const displayName = element.name?.trim() || defaultName;

  return (
    <Reorder.Item
      value={element}
      id={element.id}
      data-layer-row={element.id}
      dragListener={false}
      dragControls={controls}
      aria-selected={isSelected}
      className="msp-flex msp-min-w-0 msp-w-full msp-flex-col"
    >
      <div className="msp-w-full msp-min-w-0">
      <ContextMenu elementId={element.id}>
        <div
          className={cn(
            'msp-flex msp-flex-1 msp-items-center msp-gap-2 msp-min-w-0 msp-w-full msp-p-2 msp-rounded-md msp-text-sm msp-cursor-pointer msp-relative msp-group msp-select-none',
            'msp-border msp-border-transparent msp-shadow-sm',
            !isSelected && 'msp-bg-card hover:msp-bg-secondary/65',
            isSelected &&
              cn(
                'msp-z-[1] msp-shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:msp-shadow-[0_0_0_1px_rgba(255,255,255,.08)]',
                'msp-ring-2 msp-ring-offset-2 msp-ring-offset-background',
                element.isLocked &&
                  cn('msp-ring-amber-500 dark:msp-ring-amber-400 msp-bg-amber-500/16 dark:msp-bg-amber-500/22'),
                !element.isLocked &&
                  selectionCount > 1 &&
                  cn('msp-ring-emerald-500 dark:msp-ring-emerald-400 msp-bg-emerald-500/16 dark:msp-bg-emerald-500/22'),
                !element.isLocked &&
                  selectionCount <= 1 &&
                  cn('msp-ring-blue-500 dark:msp-ring-blue-400 msp-bg-blue-500/16 dark:msp-bg-blue-500/24'),
              ),
          )}
          onClick={(event) => {
            if (event.ctrlKey || event.metaKey) {
              toggleElementSelection(element.id);
              return;
            }

            selectElement(element.id);
          }}
          onDoubleClick={(event) => {
            if (!element.children?.length) return;
            event.preventDefault();
            event.stopPropagation();
            enterLayersDrill(element.id);
          }}
        >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="msp-cursor-grab active:msp-cursor-grabbing msp-p-1 hover:msp-bg-muted msp-rounded msp-shrink-0"
      >
        <GripVertical className="msp-h-3 msp-w-3 msp-text-muted-foreground" />
      </div>

      <div className="msp-flex-1 msp-min-w-0">
        <span className="msp-block msp-truncate msp-text-xs msp-font-semibold" title={displayName}>
          {displayName}
        </span>
        <span className="msp-block msp-truncate msp-text-muted-foreground msp-font-normal msp-text-xs" title={element.content}>
          {element.content || '\u00A0'}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="msp-h-6 msp-w-6 msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          updateElement(element.id, { isVisible: element.isVisible === false });
        }}
      >
        {element.isVisible === false ? (
          <EyeOff className="msp-h-3 msp-w-3" />
        ) : (
          <Eye className="msp-h-3 msp-w-3" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="msp-h-6 msp-w-6 msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          updateElement(element.id, { isLocked: !element.isLocked });
        }}
      >
        {element.isLocked ? (
          <Lock className="msp-h-3 msp-w-3" />
        ) : (
          <Unlock className="msp-h-3 msp-w-3" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="msp-h-6 msp-w-6 msp-text-destructive msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity"
        disabled={element.isLocked}
        onClick={(e) => {
          e.stopPropagation();
          if (element.isLocked) return;
          removeElement(element.id);
        }}
      >
        <Trash2 className="msp-h-3 msp-w-3" />
      </Button>
        </div>
      </ContextMenu>
      </div>
    </Reorder.Item>
  );
};

export type LayerPanelTab = 'slides' | 'layers' | 'canvas-settings' | 'slider-settings';

type LayerPanelProps = {
  activeTab: LayerPanelTab;
  onTabChange: (tab: LayerPanelTab) => void;
};

const LayerPanel = ({ activeTab, onTabChange }: LayerPanelProps) => {
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    selectedElementIds,
    selectElement,
    toggleElementSelection,
    removeElement,
    removeSlide,
    updateElement,
    reorderElements,
    reorderGroupChildren,
    layersDrillParentId,
    enterLayersDrill,
    exitLayersDrill,
    addSlide,
    setCurrentSlide,
    clearSelection,
  } = useEditor();
  const { t } = useLanguage();

  const handleTabChange = (value: string) => {
    const nextTab = value as LayerPanelTab;
    if (nextTab !== activeTab) {
      clearSelection();
    }
    onTabChange(nextTab);
  };

  const currentSlide = slides[currentSlideIndex];

  const drilledParentEl = useMemo(() => {
    if (!layersDrillParentId || !currentSlide?.elements) return null;
    return findElementInSlideTree(currentSlide.elements, layersDrillParentId);
  }, [currentSlide?.elements, layersDrillParentId]);

  const sourceLayers = drilledParentEl?.children?.length
    ? drilledParentEl.children
    : currentSlide?.elements ?? [];

  const [items, setItems] = useState<EditorElement[]>([]);

  useEffect(() => {
    if (!currentSlide?.elements && sourceLayers.length === 0) return;
    const sorted = [...sourceLayers].sort((a, b) => {
      const zA = Number(a.style.zIndex) || 0;
      const zB = Number(b.style.zIndex) || 0;
      if (zA !== zB) return zB - zA;
      return sourceLayers.indexOf(b) - sourceLayers.indexOf(a);
    });
    setItems(prev => {
      if (prev.length !== sorted.length) return sorted;
      if (layerListSignature(prev) !== layerListSignature(sorted)) return sorted;
      return prev;
    });
  }, [currentSlide?.elements, layersDrillParentId, sourceLayers]);

  const handleReorder = (newOrder: EditorElement[]) => {
    setItems(newOrder);
    const ids = newOrder.map(item => item.id);
    if (layersDrillParentId) {
      reorderGroupChildren(layersDrillParentId, ids);
    } else {
      reorderElements(ids);
    }
  };

  /** Tek seçimde seçili katman kartı liste içinde görünsün (drill/root değişiminde dahil). */
  useLayoutEffect(() => {
    if (selectedElementIds.length !== 1) return;
    const id = selectedElementIds[0];
    if (!items.some((el) => el.id === id)) return;
    const escaped = typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(id) : id;
    const row = document.querySelector<HTMLElement>(`[data-layer-row="${escaped}"]`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedElementIds, items, layersDrillParentId]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="msp-flex msp-flex-col msp-h-full msp-overflow-hidden"
    >
      <TabsList className="msp-grid msp-w-full msp-shrink-0 msp-grid-cols-4 msp-rounded-none msp-border-b msp-bg-secondary/30 msp-h-9 msp-gap-0 msp-p-0">
        <TabsTrigger
          value="slides"
          className="msp-h-9 msp-rounded-none msp-border-0 msp-text-[10px] msp-px-0.5 msp-shadow-none data-[state=active]:msp-bg-background"
        >
          {t('editor.layers.slidesTab')}
        </TabsTrigger>
        <TabsTrigger
          value="layers"
          className="msp-h-9 msp-rounded-none msp-border-0 msp-text-[10px] msp-px-0.5 msp-shadow-none data-[state=active]:msp-bg-background"
        >
          {t('editor.layers.title')}
        </TabsTrigger>
        <TabsTrigger
          value="canvas-settings"
          className="msp-h-9 msp-rounded-none msp-border-0 msp-text-[10px] msp-px-0.5 msp-leading-tight msp-shadow-none data-[state=active]:msp-bg-background"
        >
          {t('editor.layers.canvasSettingsTab')}
        </TabsTrigger>
        <TabsTrigger
          value="slider-settings"
          className="msp-h-9 msp-rounded-none msp-border-0 msp-text-[10px] msp-px-0.5 msp-leading-tight msp-shadow-none data-[state=active]:msp-bg-background"
        >
          {t('editor.layers.sliderSettingsTab')}
        </TabsTrigger>
      </TabsList>

      {/* Slaytlar */}
      <TabsContent
        value="slides"
        className="msp-flex-1 msp-min-h-0 msp-overflow-hidden msp-m-0 msp-flex msp-flex-col data-[state=inactive]:msp-hidden"
      >
        <div className="msp-flex msp-items-center msp-justify-between msp-px-3 msp-py-2 msp-border-b msp-shrink-0">
          <span className="msp-text-xs msp-text-muted-foreground">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <div className="msp-flex msp-items-center msp-gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="msp-h-6 msp-w-6"
              onClick={() => setCurrentSlide(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="msp-h-3.5 msp-w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="msp-h-6 msp-w-6"
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <ChevronRight className="msp-h-3.5 msp-w-3.5" />
            </Button>
          </div>
        </div>

        <div className="msp-flex-1 msp-min-h-0 msp-overflow-y-auto msp-p-2 msp-space-y-1">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                'msp-flex msp-items-center msp-gap-2 msp-px-2 msp-py-1.5 msp-rounded-md msp-cursor-pointer msp-text-sm msp-group',
                i === currentSlideIndex
                  ? 'msp-bg-primary msp-text-primary-foreground'
                  : 'hover:bg-secondary/60'
              )}
            >
              <div
                className="msp-h-8 msp-w-12 msp-rounded msp-shrink-0 msp-border msp-border-white/10"
                style={{ backgroundColor: slide.backgroundColor || slide.background || '#1e1e1e' }}
              />
              <span className="msp-flex-1 msp-text-xs msp-font-medium msp-truncate">
                Slayt {i + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'msp-h-5 msp-w-5 msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity msp-shrink-0',
                  i === currentSlideIndex
                    ? 'hover:msp-bg-primary-foreground/20 msp-text-primary-foreground'
                    : 'text-destructive'
                )}
                disabled={slides.length <= 1}
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlide(slide.id);
                }}
              >
                <Trash2 className="msp-h-3 msp-w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="msp-p-2 msp-border-t msp-shrink-0">
          <Button variant="outline" size="sm" className="msp-w-full msp-text-xs" onClick={addSlide}>
            <Plus className="msp-h-3.5 msp-w-3.5 msp-mr-1.5" /> Slayt Ekle
          </Button>
        </div>
      </TabsContent>

      {/* Katmanlar */}
      <TabsContent
        value="layers"
        className="msp-flex-1 msp-min-h-0 msp-overflow-y-auto msp-m-0 msp-p-2 data-[state=inactive]:msp-hidden"
      >
        {!items || items.length === 0 ? (
          <div className="msp-text-center msp-text-muted-foreground msp-text-xs msp-py-4">
            Bu slayta eleman eklenmemiş
          </div>
        ) : (
          <>
            {layersDrillParentId ? (
              <div className="msp-mb-2 msp-flex msp-shrink-0 msp-items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="msp-h-7 msp-gap-1 msp-pl-2 msp-pr-3 msp-text-xs"
                  onClick={exitLayersDrill}
                >
                  <ChevronLeft className="msp-h-3.5 msp-w-3.5 msp-shrink-0" />
                  {t('editor.layers.backFromGroup')}
                </Button>
              </div>
            ) : null}
            <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="msp-flex msp-w-full msp-min-w-0 msp-flex-col msp-gap-1">
            {items.map((element) => (
              <LayerItem
                key={element.id}
                element={element}
                selectionCount={selectedElementIds.length}
                isSelected={selectedElementIds.includes(element.id) || selectedElementId === element.id}
                selectElement={selectElement}
                toggleElementSelection={toggleElementSelection}
                updateElement={updateElement}
                removeElement={removeElement}
                enterLayersDrill={enterLayersDrill}
              />
            ))}
          </Reorder.Group>
          </>
        )}
      </TabsContent>

      <TabsContent
        value="canvas-settings"
        className="msp-m-0 msp-flex msp-min-h-0 msp-flex-1 msp-flex-col msp-overflow-hidden data-[state=inactive]:msp-hidden"
      >
        <CanvasSettingsPanel />
      </TabsContent>

      <TabsContent
        value="slider-settings"
        className="msp-m-0 msp-flex msp-min-h-0 msp-flex-1 msp-flex-col msp-overflow-hidden data-[state=inactive]:msp-hidden"
      >
        <SliderSettingsPanel />
      </TabsContent>
    </Tabs>
  );
};

export default LayerPanel;