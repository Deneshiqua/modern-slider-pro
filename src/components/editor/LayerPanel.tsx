import { ChevronLeft, ChevronRight, Clock, Eye, EyeOff, GripVertical, Lock, Plus, Trash2, Unlock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { EditorElement } from '@/types/editor';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';

interface LayerItemProps {
  element: EditorElement;
  isSelected: boolean;
  selectElement: (id: string | null) => void;
  toggleElementSelection: (id: string) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  removeElement: (id: string) => void;
}

const LayerItem = ({ element, isSelected, selectElement, toggleElementSelection, updateElement, removeElement }: LayerItemProps) => {
  const controls = useDragControls();
  const defaultName = element.type.charAt(0).toUpperCase() + element.type.slice(1);
  const displayName = element.name?.trim() || defaultName;
  const [draftName, setDraftName] = useState(displayName);

  useEffect(() => {
    setDraftName(displayName);
  }, [displayName]);

  const commitName = () => {
    const nextName = draftName.trim();
    if (nextName === displayName) return;

    updateElement(element.id, { name: nextName || undefined });
  };

  return (
    <Reorder.Item
      value={element}
      id={element.id}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "msp-flex msp-items-center msp-gap-2 msp-p-2 msp-rounded-md msp-text-sm msp-cursor-pointer hover:msp-bg-secondary/50 msp-group msp-relative msp-select-none",
        isSelected ? "bg-secondary" : "bg-card"
      )}
      onClick={(event) => {
        if (event.ctrlKey || event.metaKey) {
          toggleElementSelection(element.id);
          return;
        }

        selectElement(element.id);
      }}
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="msp-cursor-grab active:msp-cursor-grabbing msp-p-1 hover:msp-bg-muted msp-rounded"
      >
        <GripVertical className="msp-h-3 msp-w-3 msp-text-muted-foreground" />
      </div>

      <div className="msp-flex-1 msp-min-w-0">
        <Input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
          onClick={(event) => event.stopPropagation()}
          className="msp-h-6 msp-border-0 msp-bg-transparent msp-px-1 msp-text-xs msp-font-medium focus-visible:msp-ring-1"
        />
        <span className="msp-text-muted-foreground msp-ml-2 msp-font-normal msp-text-xs">
          {element.content.substring(0, 15)}
          {element.content.length > 15 ? '...' : ''}
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
    </Reorder.Item>
  );
};

const LayerPanel = () => {
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    selectedElementIds,
    selectElement,
    toggleElementSelection,
    removeElement,
    updateElement,
    reorderElements,
    addSlide,
    setCurrentSlide,
  } = useEditor();
  const { t } = useLanguage();

  const currentSlide = slides[currentSlideIndex];

  const [items, setItems] = useState<EditorElement[]>([]);

  useEffect(() => {
    if (!currentSlide?.elements) return;
    const sorted = [...currentSlide.elements].sort((a, b) => {
      const zA = Number(a.style.zIndex) || 0;
      const zB = Number(b.style.zIndex) || 0;
      if (zA !== zB) return zB - zA;
      return currentSlide.elements.indexOf(b) - currentSlide.elements.indexOf(a);
    });
    setItems(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(sorted)) return sorted;
      return prev;
    });
  }, [currentSlide?.elements]);

  const handleReorder = (newOrder: EditorElement[]) => {
    setItems(newOrder);
    const ids = newOrder.map(item => item.id);
    reorderElements(ids);
  };

  // removeSlide is not exposed directly; use the context's removeSlide if available
  const { removeSlide } = useEditor();

  return (
    <Tabs defaultValue="layers" className="msp-flex msp-flex-col msp-h-full msp-overflow-hidden">
      <TabsList className="msp-w-full msp-rounded-none msp-border-b msp-h-9 msp-bg-secondary/30 msp-shrink-0 msp-justify-start msp-px-1 msp-gap-0">
        <TabsTrigger value="layers" className="msp-text-xs msp-h-7 msp-px-3 msp-rounded-sm">
          {t('editor.layers.title')}
        </TabsTrigger>
        <TabsTrigger value="slides" className="msp-text-xs msp-h-7 msp-px-3 msp-rounded-sm">
          Slaytlar
        </TabsTrigger>
        <TabsTrigger value="history" className="msp-text-xs msp-h-7 msp-px-3 msp-rounded-sm" disabled>
          <Clock className="msp-h-3 msp-w-3 msp-mr-1 msp-opacity-40" />
          Tarihçe
        </TabsTrigger>
      </TabsList>

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
          <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="msp-space-y-1">
            {items.map((element) => (
              <LayerItem
                key={element.id}
                element={element}
                isSelected={selectedElementIds.includes(element.id) || selectedElementId === element.id}
                selectElement={selectElement}
                toggleElementSelection={toggleElementSelection}
                updateElement={updateElement}
                removeElement={removeElement}
              />
            ))}
          </Reorder.Group>
        )}
      </TabsContent>

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

      {/* Tarihçe — placeholder */}
      <TabsContent
        value="history"
        className="msp-flex-1 msp-min-h-0 msp-m-0 msp-flex msp-items-center msp-justify-center data-[state=inactive]:msp-hidden"
      >
        <p className="msp-text-xs msp-text-muted-foreground">Yakında</p>
      </TabsContent>
    </Tabs>
  );
};

export default LayerPanel;