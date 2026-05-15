import { ANIMATION_PRESETS, BORDER_RADII, FONT_SIZES } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowDown, ArrowUp, BringToFront, Image as ImageIcon, Palette, SendToBack, Type, Video } from 'lucide-react';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from '@/components/ui/button';
import ColorPicker from './ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MediaManager from './MediaManager';
import { Slider } from "@/components/ui/slider";
import { Switch } from '@/components/ui/switch';
import { EditorElement, ResponsivePropertyMode } from '@/types/editor';
import { getElementPropertiesForMode } from '@/lib/responsive';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';

const PropertiesPanel = () => {
  const {
    selectedElementId,
    slides,
    currentSlideIndex,
    updateElement,
    updateElementForMode,
    updateSlideBackground,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    propertyMode,
    setPropertyMode,
    setViewMode,
  } = useEditor();
  const { t } = useLanguage();

  // State to persist accordion open/close status
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['style', 'content', 'settings']);
  const [isBackgroundMediaManagerOpen, setIsBackgroundMediaManagerOpen] = useState(false);

  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide.elements.find(e => e.id === selectedElementId);

  // Helper to find element recursively if not found at root
  const findElementRecursive = (elements: EditorElement[], id: string): EditorElement | null => {
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
  const editableElement = activeElement ? getElementPropertiesForMode(activeElement, propertyMode) : null;
  const activeElementOpacity = typeof editableElement?.style.opacity === 'number' ? editableElement.style.opacity : 1;

  if (!activeElement) {
    return (
      <>
        <div className="msp-flex msp-flex-col msp-h-full msp-overflow-hidden msp-bg-card">
          <div className="msp-px-3 msp-py-2 msp-border-b msp-font-semibold msp-text-xs msp-shrink-0">{t('editor.properties.title')}</div>
          <div className="msp-flex-1 msp-overflow-y-auto">
            <div className="msp-p-3 msp-space-y-4">

              {/* Background Settings */}
              <div className="msp-space-y-4">
                <Label className="msp-text-xs msp-font-semibold">{t('editor.properties.background')}</Label>

                <Tabs
                  defaultValue={currentSlide.backgroundType || 'color'}
                  onValueChange={(val) => {
                    let value = '';
                    if (val === 'color') value = currentSlide.background || '#ffffff';
                    else if (val === 'image') value = currentSlide.backgroundImage || '';
                    else if (val === 'video') value = currentSlide.backgroundVideo || '';

                    updateSlideBackground(value, val as 'color' | 'image' | 'video');
                  }}
                  className="msp-w-full"
                >
                  <TabsList className="msp-grid msp-w-full msp-grid-cols-3 msp-h-7">
                    <TabsTrigger value="color" className="msp-flex msp-gap-1 msp-text-xs msp-py-0"><Palette className="msp-w-3 msp-h-3" /> Renk</TabsTrigger>
                    <TabsTrigger value="image" className="msp-flex msp-gap-1 msp-text-xs msp-py-0"><ImageIcon className="msp-w-3 msp-h-3" /> Görsel</TabsTrigger>
                    <TabsTrigger value="video" className="msp-flex msp-gap-1 msp-text-xs msp-py-0"><Video className="msp-w-3 msp-h-3" /> Video</TabsTrigger>
                  </TabsList>

                  <TabsContent value="color" className="msp-space-y-2 msp-mt-2">
                    <Label className="msp-text-xs">{t('editor.properties.backgroundColor')}</Label>
                    <ColorPicker
                      value={currentSlide.background || ''}
                      onChange={(color) => updateSlideBackground(color || '#ffffff', 'color')}
                    />
                  </TabsContent>

                  <TabsContent value="image" className="msp-space-y-2 msp-mt-2">
                    <Label className="msp-text-xs">{t('editor.properties.backgroundImage')}</Label>
                    <Input
                      className="msp-h-7 msp-text-xs"
                      value={currentSlide.backgroundImage || ''}
                      onChange={(e) => updateSlideBackground(e.target.value, 'image')}
                      placeholder="/images/photo.jpg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="msp-w-full msp-justify-center msp-gap-1 msp-h-7 msp-text-xs"
                      onClick={() => setIsBackgroundMediaManagerOpen(true)}
                    >
                      <ImageIcon className="msp-h-3 msp-w-3" />
                      {t('mediaManager.upload')}
                    </Button>
                    <p className="msp-text-xs msp-text-muted-foreground">{t('editor.properties.imageDesc')}</p>
                  </TabsContent>

                  <TabsContent value="video" className="msp-space-y-2 msp-mt-2">
                    <Label className="msp-text-xs">{t('editor.properties.backgroundVideo')}</Label>
                    <Input
                      className="msp-h-7 msp-text-xs"
                      value={currentSlide.backgroundVideo || ''}
                      onChange={(e) => updateSlideBackground(e.target.value, 'video')}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="msp-text-xs msp-text-muted-foreground">{t('editor.properties.videoDesc')}</p>
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

  const handleResponsiveStyleChange = (key: string, value: string | number) => {
    updateElementForMode(activeElement.id, {
      style: {
        [key]: value,
      },
    }, propertyMode);
  };

  const handlePropertyModeChange = (mode: ResponsivePropertyMode) => {
    setPropertyMode(mode);

    if (mode !== 'default') {
      setViewMode(mode);
    }
  };

  return (
    <div className="msp-flex msp-flex-col msp-h-full msp-overflow-hidden msp-bg-card">
      <div className="msp-p-4 msp-border-b msp-font-semibold msp-shrink-0">{t('editor.properties.title')}</div>

      <div className="msp-flex-1 msp-overflow-y-auto">
        <div className="msp-p-3 msp-border-b msp-space-y-2">
          <Label className="msp-text-xs">Özellik Modu</Label>
          <Tabs value={propertyMode} onValueChange={(value) => handlePropertyModeChange(value as ResponsivePropertyMode)}>
            <TabsList className="msp-grid msp-grid-cols-4 msp-h-8">
              <TabsTrigger value="default" className="msp-text-xs">Default</TabsTrigger>
              <TabsTrigger value="desktop" className="msp-text-xs">Desktop</TabsTrigger>
              <TabsTrigger value="tablet" className="msp-text-xs">Tablet</TabsTrigger>
              <TabsTrigger value="mobile" className="msp-text-xs">Mobile</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="msp-text-[11px] msp-text-muted-foreground">
            Default temel değerdir; cihaz modları sadece farklılaştırmak istediğiniz alanları override eder.
          </p>
        </div>

        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={setOpenAccordionItems}
          className="msp-w-full"
        >

          {/* Style Section */}
          <AccordionItem value="style">
            <AccordionTrigger className="msp-px-3 msp-py-2 msp-text-xs hover:msp-no-underline hover:msp-bg-muted/50">{t('editor.properties.style')}</AccordionTrigger>
            <AccordionContent className="msp-px-3 msp-py-2 msp-space-y-3">
              {/* Layer Management */}
              <div className="msp-space-y-1.5 msp-pb-3 msp-border-b">
                <Label className="msp-text-xs">{t('editor.properties.layerOrder')}</Label>
                <div className="msp-flex msp-gap-1.5">
                  <Button variant="outline" size="icon" className="msp-h-7 msp-w-7" onClick={() => bringToFront(activeElement.id)} title={t('editor.contextMenu.bringToFront')}>
                    <BringToFront className="msp-h-3 msp-w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="msp-h-7 msp-w-7" onClick={() => bringForward(activeElement.id)} title={t('editor.contextMenu.bringForward')}>
                    <ArrowUp className="msp-h-3 msp-w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="msp-h-7 msp-w-7" onClick={() => sendBackward(activeElement.id)} title={t('editor.contextMenu.sendBackward')}>
                    <ArrowDown className="msp-h-3 msp-w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="msp-h-7 msp-w-7" onClick={() => sendToBack(activeElement.id)} title={t('editor.contextMenu.sendToBack')}>
                    <SendToBack className="msp-h-3 msp-w-3" />
                  </Button>
                </div>
              </div>

              <div className="msp-grid msp-grid-cols-2 msp-gap-3">
                <div className="msp-space-y-1">
                  <Label className="msp-text-xs">X {t('editor.properties.position')}</Label>
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    value={editableElement?.x ?? activeElement.x}
                    onChange={(e) => updateElementForMode(activeElement.id, { x: Number(e.target.value) }, propertyMode)}
                  />
                </div>
                <div className="msp-space-y-1">
                  <Label className="msp-text-xs">Y {t('editor.properties.position')}</Label>
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    value={editableElement?.y ?? activeElement.y}
                    onChange={(e) => updateElementForMode(activeElement.id, { y: Number(e.target.value) }, propertyMode)}
                  />
                </div>
              </div>

              <div className="msp-grid msp-grid-cols-2 msp-gap-3">
                <div className="msp-space-y-1">
                  <Label className="msp-text-xs">{t('editor.properties.size')} (W)</Label>
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    value={editableElement?.style.width || ''}
                    onChange={(e) => handleResponsiveStyleChange('width', Number(e.target.value))}
                    placeholder="Auto"
                  />
                </div>
                <div className="msp-space-y-1">
                  <Label className="msp-text-xs">{t('editor.properties.size')} (H)</Label>
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    value={editableElement?.style.height || ''}
                    onChange={(e) => handleResponsiveStyleChange('height', Number(e.target.value))}
                    placeholder="Auto"
                  />
                </div>
              </div>

              <div className="msp-space-y-1">
                <Label className="msp-text-xs">Döndürme (°)</Label>
                <Input
                  className="msp-h-7 msp-text-xs"
                  type="number"
                  min={0}
                  max={360}
                  value={editableElement?.rotation ?? 0}
                  onChange={(e) => updateElementForMode(activeElement.id, { rotation: ((Number(e.target.value) % 360) + 360) % 360 }, propertyMode)}
                />
              </div>

              {/* Object Fit Control for Images */}
              {activeElement.type === 'image' && (
                <div className="msp-space-y-1">
                  <Label className="msp-text-xs">{t('editor.properties.imageFit')}</Label>
                  <Select
                    value={editableElement?.style.objectFit || 'cover'}
                    onValueChange={(val) => handleResponsiveStyleChange('objectFit', val)}
                  >
                    <SelectTrigger className="msp-h-7 msp-text-xs">
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

              <div className="msp-space-y-1">
                <Label className="msp-text-xs">{t('editor.properties.opacity')} ({activeElementOpacity})</Label>
                <Slider
                  value={[activeElementOpacity]}
                  max={1}
                  step={0.1}
                  onValueChange={([val]) => handleResponsiveStyleChange('opacity', val)}
                />
              </div>

              <div className="msp-space-y-1">
                <Label className="msp-text-xs">{t('editor.properties.backgroundColor')}</Label>
                <ColorPicker
                  value={String(editableElement?.style.backgroundColor || '')}
                  onChange={(color) => handleResponsiveStyleChange('backgroundColor', color)}
                />
              </div>

              <div className="msp-space-y-1">
                <ColorPicker
                  label={t('editor.properties.textColor')}
                  value={String(editableElement?.style.color || '')}
                  onChange={(color) => handleResponsiveStyleChange('color', color)}
                />
              </div>

              <div className="msp-grid msp-grid-cols-2 msp-gap-3">
                <div className="msp-space-y-1">
                  <Label className="msp-text-xs">{t('editor.properties.fontSize')}</Label>
                  <Select
                    value={String(editableElement?.style.fontSize || 16)}
                    onValueChange={(val) => handleResponsiveStyleChange('fontSize', Number(val))}
                  >
                    <SelectTrigger className="msp-h-7 msp-text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SIZES.map(size => (
                        <SelectItem key={size} value={String(size)} className="msp-text-xs">{size}px</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="msp-space-y-1">
                  <Label className="msp-text-xs">{t('editor.properties.borderRadius')}</Label>
                  <Select
                    value={String(editableElement?.style.borderRadius || 0)}
                    onValueChange={(val) => handleResponsiveStyleChange('borderRadius', Number(val))}
                  >
                    <SelectTrigger className="msp-h-7 msp-text-xs">
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
            <AccordionTrigger className="msp-px-3 msp-py-2 msp-text-xs hover:msp-no-underline hover:msp-bg-muted/50">{t('editor.properties.content')}</AccordionTrigger>
            <AccordionContent className="msp-px-3 msp-py-2 msp-space-y-3">
              <div className="msp-space-y-1">
                <Label className="msp-text-xs">{t('editor.properties.content')}</Label>
                <Input
                  className="msp-h-7 msp-text-xs"
                  value={activeElement.content}
                  onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                />
              </div>
              {activeElement.type === 'text' || activeElement.type === 'button' ? (
                <div className="msp-space-y-1">
                  <Label className="msp-text-xs">{t('editor.properties.textAlign')}</Label>
                  <Select
                    value={editableElement?.style.textAlign || 'left'}
                    onValueChange={(val) => handleResponsiveStyleChange('textAlign', val)}
                  >
                    <SelectTrigger className="msp-h-7 msp-text-xs">
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
            <AccordionTrigger className="msp-px-3 msp-py-2 msp-text-xs hover:msp-no-underline hover:msp-bg-muted/50">{t('editor.properties.animation')}</AccordionTrigger>
            <AccordionContent className="msp-px-3 msp-py-2 msp-space-y-3">
              <div className="msp-space-y-1">
                <Label className="msp-text-xs">{t('editor.properties.entranceAnimation')}</Label>
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
                  <SelectTrigger className="msp-h-7 msp-text-xs">
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
                <div className="msp-p-2 msp-bg-secondary/50 msp-rounded-md msp-text-xs">
                  <p>Animasyon: {activeElement.animation.name}</p>
                  <p className="msp-text-muted-foreground msp-mt-1">Önizle butonuna bas.</p>
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