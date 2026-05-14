import { ANIMATION_PRESETS, BORDER_RADII, FONT_SIZES } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowDown, ArrowUp, BringToFront, Image as ImageIcon, Palette, SendToBack, Type, Video } from 'lucide-react';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MediaManager from './MediaManager';
import { Slider } from "@/components/ui/slider";
import { Switch } from '@/components/ui/switch';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';

const PropertiesPanel = () => {
  const {
    selectedElementId,
    slides,
    currentSlideIndex,
    updateElement,
    updateSlideBackground,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useEditor();
  const { t } = useLanguage();

  // State to persist accordion open/close status
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['style', 'content', 'settings']);
  const [isBackgroundMediaManagerOpen, setIsBackgroundMediaManagerOpen] = useState(false);

  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide.elements.find(e => e.id === selectedElementId);

  // Helper to find element recursively if not found at root
  const findElementRecursive = (elements: any[], id: string): any => {
    for (const el of elements) {
      if (el.id === id) return el;
      if (el.children) {
        const found = findElementRecursive(el.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // If selectedElement is not found in root elements, try finding it recursively
  // Note: currentSlide.elements only contains root elements. 
  // Ideally useEditor should provide the selected element directly, but for now we find it.
  const activeElement = selectedElement || (selectedElementId ? findElementRecursive(currentSlide.elements, selectedElementId) : null);

  if (!activeElement) {
    return (
      <>
        <div className="flex flex-col h-full overflow-hidden bg-card">
          <div className="px-3 py-2 border-b font-semibold text-xs shrink-0">{t('editor.properties.title')}</div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-4">

              {/* Background Settings */}
              <div className="space-y-4">
                <Label className="text-xs font-semibold">{t('editor.properties.background')}</Label>

                <Tabs
                  defaultValue={currentSlide.backgroundType || 'color'}
                  onValueChange={(val) => {
                    let value = '';
                    if (val === 'color') value = currentSlide.background || '#ffffff';
                    else if (val === 'image') value = currentSlide.backgroundImage || '';
                    else if (val === 'video') value = currentSlide.backgroundVideo || '';

                    updateSlideBackground(value, val as 'color' | 'image' | 'video');
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 h-7">
                    <TabsTrigger value="color" className="flex gap-1 text-xs py-0"><Palette className="w-3 h-3" /> Renk</TabsTrigger>
                    <TabsTrigger value="image" className="flex gap-1 text-xs py-0"><ImageIcon className="w-3 h-3" /> Görsel</TabsTrigger>
                    <TabsTrigger value="video" className="flex gap-1 text-xs py-0"><Video className="w-3 h-3" /> Video</TabsTrigger>
                  </TabsList>

                  <TabsContent value="color" className="space-y-2 mt-2">
                    <Label className="text-xs">{t('editor.properties.backgroundColor')}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="w-7 h-7 p-0 border rounded cursor-pointer shrink-0"
                        value={currentSlide.background || '#ffffff'}
                        onChange={(e) => updateSlideBackground(e.target.value, 'color')}
                      />
                      <Input
                        className="h-7 text-xs"
                        value={currentSlide.background || ''}
                        onChange={(e) => updateSlideBackground(e.target.value, 'color')}
                        placeholder="#ffffff"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-2 mt-2">
                    <Label className="text-xs">{t('editor.properties.backgroundImage')}</Label>
                    <Input
                      className="h-7 text-xs"
                      value={currentSlide.backgroundImage || ''}
                      onChange={(e) => updateSlideBackground(e.target.value, 'image')}
                      placeholder="/images/photo.jpg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center gap-1 h-7 text-xs"
                      onClick={() => setIsBackgroundMediaManagerOpen(true)}
                    >
                      <ImageIcon className="h-3 w-3" />
                      {t('mediaManager.upload')}
                    </Button>
                    <p className="text-xs text-muted-foreground">{t('editor.properties.imageDesc')}</p>
                  </TabsContent>

                  <TabsContent value="video" className="space-y-2 mt-2">
                    <Label className="text-xs">{t('editor.properties.backgroundVideo')}</Label>
                    <Input
                      className="h-7 text-xs"
                      value={currentSlide.backgroundVideo || ''}
                      onChange={(e) => updateSlideBackground(e.target.value, 'video')}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-muted-foreground">{t('editor.properties.videoDesc')}</p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
        <MediaManager
          isOpen={isBackgroundMediaManagerOpen}
          onClose={() => setIsBackgroundMediaManagerOpen(false)}
          onSelect={(url) => updateSlideBackground(url, 'image')}
        />
      </>
    );
  }

  const handleStyleChange = (key: string, value: string | number) => {
    updateElement(activeElement.id, {
      style: {
        ...activeElement.style,
        [key]: value
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-card">
      <div className="p-4 border-b font-semibold shrink-0">{t('editor.properties.title')}</div>

      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={setOpenAccordionItems}
          className="w-full"
        >

          {/* Style Section */}
          <AccordionItem value="style">
            <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline hover:bg-muted/50">{t('editor.properties.style')}</AccordionTrigger>
            <AccordionContent className="px-3 py-2 space-y-3">
              {/* Layer Management */}
              <div className="space-y-1.5 pb-3 border-b">
                <Label className="text-xs">{t('editor.properties.layerOrder')}</Label>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => bringToFront(activeElement.id)} title={t('editor.contextMenu.bringToFront')}>
                    <BringToFront className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => bringForward(activeElement.id)} title={t('editor.contextMenu.bringForward')}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => sendBackward(activeElement.id)} title={t('editor.contextMenu.sendBackward')}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => sendToBack(activeElement.id)} title={t('editor.contextMenu.sendToBack')}>
                    <SendToBack className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">X {t('editor.properties.position')}</Label>
                  <Input
                    className="h-7 text-xs"
                    type="number"
                    value={activeElement.x}
                    onChange={(e) => updateElement(activeElement.id, { x: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Y {t('editor.properties.position')}</Label>
                  <Input
                    className="h-7 text-xs"
                    type="number"
                    value={activeElement.y}
                    onChange={(e) => updateElement(activeElement.id, { y: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('editor.properties.size')} (W)</Label>
                  <Input
                    className="h-7 text-xs"
                    type="number"
                    value={activeElement.style.width || ''}
                    onChange={(e) => handleStyleChange('width', Number(e.target.value))}
                    placeholder="Auto"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('editor.properties.size')} (H)</Label>
                  <Input
                    className="h-7 text-xs"
                    type="number"
                    value={activeElement.style.height || ''}
                    onChange={(e) => handleStyleChange('height', Number(e.target.value))}
                    placeholder="Auto"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Döndürme (°)</Label>
                <Input
                  className="h-7 text-xs"
                  type="number"
                  min={0}
                  max={360}
                  value={activeElement.rotation ?? 0}
                  onChange={(e) => updateElement(activeElement.id, { rotation: ((Number(e.target.value) % 360) + 360) % 360 })}
                />
              </div>

              {/* Object Fit Control for Images */}
              {activeElement.type === 'image' && (
                <div className="space-y-1">
                  <Label className="text-xs">{t('editor.properties.imageFit')}</Label>
                  <Select
                    value={activeElement.style.objectFit || 'cover'}
                    onValueChange={(val) => handleStyleChange('objectFit', val)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">{t('editor.properties.fitCover')}</SelectItem>
                      <SelectItem value="contain">{t('editor.properties.fitContain')}</SelectItem>
                      <SelectItem value="fill">{t('editor.properties.fitFill')}</SelectItem>
                      <SelectItem value="none">{t('editor.properties.fitNone')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">{t('editor.properties.opacity')} ({activeElement.style.opacity ?? 1})</Label>
                <Slider
                  value={[activeElement.style.opacity ?? 1]}
                  max={1}
                  step={0.1}
                  onValueChange={([val]) => handleStyleChange('opacity', val)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t('editor.properties.backgroundColor')}</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-7 h-7 p-0 border rounded cursor-pointer shrink-0"
                    value={activeElement.style.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  />
                  <Input
                    className="h-7 text-xs"
                    value={activeElement.style.backgroundColor || ''}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t('editor.properties.textColor')}</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-7 h-7 p-0 border rounded cursor-pointer shrink-0"
                    value={activeElement.style.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                  />
                  <Input
                    className="h-7 text-xs"
                    value={activeElement.style.color || ''}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t('editor.properties.fontSize')}</Label>
                  <Select
                    value={String(activeElement.style.fontSize || 16)}
                    onValueChange={(val) => handleStyleChange('fontSize', Number(val))}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SIZES.map(size => (
                        <SelectItem key={size} value={String(size)} className="text-xs">{size}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('editor.properties.borderRadius')}</Label>
                  <Select
                    value={String(activeElement.style.borderRadius || 0)}
                    onValueChange={(val) => handleStyleChange('borderRadius', Number(val))}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDER_RADII.map(radius => (
                        <SelectItem key={radius} value={String(radius)}>
                          {radius === 9999 ? 'Circle' : `${radius}px`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Content Section */}
          <AccordionItem value="content">
            <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline hover:bg-muted/50">{t('editor.properties.content')}</AccordionTrigger>
            <AccordionContent className="px-3 py-2 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">{t('editor.properties.content')}</Label>
                <Input
                  className="h-7 text-xs"
                  value={activeElement.content}
                  onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                />
              </div>
              {activeElement.type === 'text' || activeElement.type === 'button' ? (
                <div className="space-y-1">
                  <Label className="text-xs">{t('editor.properties.textAlign')}</Label>
                  <Select
                    value={activeElement.style.textAlign || 'left'}
                    onValueChange={(val) => handleStyleChange('textAlign', val)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">{t('editor.properties.alignLeft')}</SelectItem>
                      <SelectItem value="center">{t('editor.properties.alignCenter')}</SelectItem>
                      <SelectItem value="right">{t('editor.properties.alignRight')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>

          {/* Animation Section */}
          <AccordionItem value="animation">
            <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline hover:bg-muted/50">{t('editor.properties.animation')}</AccordionTrigger>
            <AccordionContent className="px-3 py-2 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">{t('editor.properties.entranceAnimation')}</Label>
                <Select
                  value={activeElement.animation?.name || 'None'}
                  onValueChange={(name) => {
                    const presetKey = Object.keys(ANIMATION_PRESETS).find(
                      key => ANIMATION_PRESETS[key].name === name
                    );
                    if (presetKey) {
                      updateElement(activeElement.id, {
                        animation: ANIMATION_PRESETS[presetKey]
                      });
                    }
                  }}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Animasyon seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ANIMATION_PRESETS).map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeElement.animation && activeElement.animation.name !== 'None' && (
                <div className="p-2 bg-secondary/50 rounded-md text-xs">
                  <p>Animasyon: {activeElement.animation.name}</p>
                  <p className="text-muted-foreground mt-1">Önizle butonuna bas.</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </div>
  );
};

export default PropertiesPanel;