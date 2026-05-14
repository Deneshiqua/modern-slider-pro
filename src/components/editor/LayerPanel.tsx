import { ChevronLeft, ChevronRight, Clock, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { EditorElement } from '@/types/editor';
import { cn } from '@/lib/utils';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';

interface LayerItemProps {
  element: EditorElement;
  isSelected: boolean;
  selectElement: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  removeElement: (id: string) => void;
}

const LayerItem = ({ element, isSelected, selectElement, updateElement, removeElement }: LayerItemProps) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={element}
      id={element.id}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md text-sm cursor-pointer hover:bg-secondary/50 group relative select-none",
        isSelected ? "bg-secondary" : "bg-card"
      )}
      onClick={() => selectElement(element.id)}
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>

      <span className="flex-1 truncate font-medium">
        {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
        <span className="text-muted-foreground ml-2 font-normal text-xs">
          {element.content.substring(0, 15)}
          {element.content.length > 15 ? '...' : ''}
        </span>
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          updateElement(element.id, {
            style: {
              ...element.style,
              opacity: element.style.opacity === 0 ? 1 : 0
            }
          });
        }}
      >
        {element.style.opacity === 0 ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          removeElement(element.id);
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </Reorder.Item>
  );
};

const LayerPanel = () => {
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    selectElement,
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
    <Tabs defaultValue="layers" className="flex flex-col h-full overflow-hidden">
      <TabsList className="w-full rounded-none border-b h-9 bg-secondary/30 shrink-0 justify-start px-1 gap-0">
        <TabsTrigger value="layers" className="text-xs h-7 px-3 rounded-sm">
          {t('editor.layers.title')}
        </TabsTrigger>
        <TabsTrigger value="slides" className="text-xs h-7 px-3 rounded-sm">
          Slaytlar
        </TabsTrigger>
        <TabsTrigger value="history" className="text-xs h-7 px-3 rounded-sm" disabled>
          <Clock className="h-3 w-3 mr-1 opacity-40" />
          Tarihçe
        </TabsTrigger>
      </TabsList>

      {/* Katmanlar */}
      <TabsContent
        value="layers"
        className="flex-1 min-h-0 overflow-y-auto m-0 p-2 data-[state=inactive]:hidden"
      >
        {!items || items.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-4">
            Bu slayta eleman eklenmemiş
          </div>
        ) : (
          <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-1">
            {items.map((element) => (
              <LayerItem
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                selectElement={selectElement}
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
        className="flex-1 min-h-0 overflow-hidden m-0 flex flex-col data-[state=inactive]:hidden"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
          <span className="text-xs text-muted-foreground">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCurrentSlide(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm group',
                i === currentSlideIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary/60'
              )}
            >
              <div
                className="h-8 w-12 rounded shrink-0 border border-white/10"
                style={{ backgroundColor: slide.backgroundColor || slide.background || '#1e1e1e' }}
              />
              <span className="flex-1 text-xs font-medium truncate">
                Slayt {i + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
                  i === currentSlideIndex
                    ? 'hover:bg-primary-foreground/20 text-primary-foreground'
                    : 'text-destructive'
                )}
                disabled={slides.length <= 1}
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlide(slide.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="p-2 border-t shrink-0">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={addSlide}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Slayt Ekle
          </Button>
        </div>
      </TabsContent>

      {/* Tarihçe — placeholder */}
      <TabsContent
        value="history"
        className="flex-1 min-h-0 m-0 flex items-center justify-center data-[state=inactive]:hidden"
      >
        <p className="text-xs text-muted-foreground">Yakında</p>
      </TabsContent>
    </Tabs>
  );
};

export default LayerPanel;