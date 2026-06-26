import { ANIMATION_PRESETS } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, BringToFront, Image as ImageIcon, Palette, SendToBack, Type, Video } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { Button } from '@/components/ui/button';
import ColorPicker from './ColorPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMediaPicker } from '@/context/MediaPickerContext';
import { Slider } from "@/components/ui/slider";
import { Switch } from '@/components/ui/switch';
import { getElementPropertiesForMode } from '@/lib/responsive';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { SettingsPanelDivider } from '@/components/editor/SettingsPanelDivider';
import { SLIDE_BACKGROUND_FIT_OPTIONS, getSlideBackgroundColor, getSlideBackgroundFit } from '@/lib/slideBackground';
import { getSlideOverlayOpacity } from '@/lib/slideOverlay';
import { EditorElement, ResponsivePropertyMode, type SlideBackgroundFit } from '@/types/editor';
import AlignmentControls from './AlignmentControls';
import ColorAndBorderControls from './ColorAndBorderControls';
import { MultiSelectionAlignmentControls } from './MultiSelectionAlignmentControls';
import { RowAlignmentControls } from './RowAlignmentControls';
import { ColumnAlignmentControls } from './ColumnAlignmentControls';
import SpacingControls from './SpacingControls';
import TextContentEditorModal from './TextContentEditorModal';
import FontPropertiesControls from './FontPropertiesControls';
import PropertyField from './PropertyField';
import { pruneMultiSelectionIds } from '@/lib/alignment';

const PropertiesPanel = () => {
  const PROPERTIES_ACCORDION_STORAGE_KEY = 'msp:properties:open-accordion-items';
  const {
    selectedElementId,
    selectedElementIds,
    slides,
    currentSlideIndex,
    updateElement,
    updateElementForMode,
    updateSlideBackground,
    updateSlideBackgroundFit,
    updateSlideOverlay,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    propertyMode,
    setPropertyMode,
    setResponsiveViewport,
  } = useEditor();
  const { t } = useLanguage();
  const { openMediaPicker } = useMediaPicker();

  // State to persist accordion open/close status
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return ['content', 'color', 'font', 'style', 'animation', 'spacing'];
    }

    try {
      const raw = window.localStorage.getItem(PROPERTIES_ACCORDION_STORAGE_KEY);
      if (!raw) return ['content', 'color', 'font', 'style', 'animation', 'spacing'];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed;
      }
    } catch {
      // Ignore invalid persisted value and fallback to defaults.
    }

    return ['content', 'color', 'font', 'style', 'animation', 'spacing'];
  });
  const currentSlide = slides[currentSlideIndex];
  const backgroundFitSelect = (
    <PropertyField label={t('editor.properties.backgroundFit')}>
      <Select
        value={getSlideBackgroundFit(currentSlide)}
        onValueChange={(value) => updateSlideBackgroundFit(value as SlideBackgroundFit)}
      >
        <SelectTrigger className="msp-h-7 msp-text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SLIDE_BACKGROUND_FIT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="msp-text-xs">
              {t(opt.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </PropertyField>
  );
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

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PROPERTIES_ACCORDION_STORAGE_KEY,
        JSON.stringify(openAccordionItems),
      );
    } catch {
      // Ignore storage write failures.
    }
  }, [openAccordionItems]);

  const handlePropertyModeChange = (mode: ResponsivePropertyMode) => {
    setPropertyMode(mode);

    if (mode !== 'default') {
      setResponsiveViewport(mode);
    }
  };

  if (selectedElementIds.length >= 2) {
    const pruned = pruneMultiSelectionIds(selectedElementIds, currentSlide.elements);

    return (
      <div className="msp-flex msp-flex-col msp-h-full msp-overflow-hidden msp-bg-card">
        <div className="msp-px-3 msp-py-2 msp-border-b msp-font-semibold msp-text-xs msp-shrink-0">
          <span>{t('editor.properties.multiSelectionTitle')}</span>
          <span className="msp-text-muted-foreground msp-font-normal"> · {selectedElementIds.length}</span>
        </div>
        <div className="msp-flex-1 msp-overflow-y-auto">
          <div className="msp-p-3 msp-border-b msp-space-y-2">
            <Tabs value={propertyMode} onValueChange={(value) => handlePropertyModeChange(value as ResponsivePropertyMode)}>
              <TabsList className="msp-grid msp-w-full msp-grid-cols-4 msp-h-8">
                <TabsTrigger value="default" className="msp-text-xs">Default</TabsTrigger>
                <TabsTrigger value="desktop" className="msp-text-xs">Desktop</TabsTrigger>
                <TabsTrigger value="tablet" className="msp-text-xs">Tablet</TabsTrigger>
                <TabsTrigger value="mobile" className="msp-text-xs">Mobile</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="msp-text-[11px] msp-text-muted-foreground">{t('editor.properties.multiSelectionModeHint')}</p>
          </div>
          <div className="msp-p-3 msp-space-y-3">
            <ColumnAlignmentControls propertyMode={propertyMode} />
            <RowAlignmentControls propertyMode={propertyMode} />
            {pruned.length >= 2 ? (
              <MultiSelectionAlignmentControls selectionIds={selectedElementIds} propertyMode={propertyMode} />
            ) : (
              <p className="msp-text-xs msp-text-muted-foreground">{t('editor.properties.multiSelectionPrunedHint')}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

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
                    if (val === 'color') {
                      value = getSlideBackgroundColor(currentSlide);
                    } else if (val === 'image') value = currentSlide.backgroundImage || '';
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
                    <ColorPicker
                      label={t('editor.properties.backgroundColor')}
                      value={
                        getSlideBackgroundColor(currentSlide) === 'transparent'
                          ? ''
                          : getSlideBackgroundColor(currentSlide)
                      }
                      onChange={(color) =>
                        updateSlideBackground(color.trim() ? color : 'transparent', 'color')
                      }
                    />
                  </TabsContent>

                  <TabsContent value="image" className="msp-space-y-2 msp-mt-2">
                    <PropertyField label={t('editor.properties.backgroundImage')}>
                      <Input
                        className="msp-h-7 msp-text-xs"
                        value={currentSlide.backgroundImage || ''}
                        onChange={(e) => updateSlideBackground(e.target.value, 'image')}
                        placeholder="/images/photo.jpg"
                      />
                    </PropertyField>
                    <Button
                      variant="outline"
                      size="sm"
                      className="msp-w-full msp-justify-center msp-gap-1 msp-h-7 msp-text-xs"
                      onClick={() =>
                        openMediaPicker({
                          purpose: 'image',
                          onSelect: (url) => updateSlideBackground(url, 'image'),
                        })
                      }
                    >
                      <ImageIcon className="msp-h-3 msp-w-3" />
                      {t('mediaManager.upload')}
                    </Button>
                    <p className="msp-text-xs msp-text-muted-foreground">{t('editor.properties.imageDesc')}</p>
                    {backgroundFitSelect}
                  </TabsContent>

                  <TabsContent value="video" className="msp-space-y-2 msp-mt-2">
                    <PropertyField label={t('editor.properties.backgroundVideo')}>
                      <Input
                        className="msp-h-7 msp-text-xs"
                        value={currentSlide.backgroundVideo || ''}
                        onChange={(e) => updateSlideBackground(e.target.value, 'video')}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </PropertyField>
                    <p className="msp-text-xs msp-text-muted-foreground">{t('editor.properties.videoDesc')}</p>
                    {backgroundFitSelect}
                  </TabsContent>
                </Tabs>

                <SettingsPanelDivider />

                <div className="msp-space-y-3">
                  <div className="msp-flex msp-items-center msp-justify-between msp-gap-2">
                    <div className="msp-min-w-0">
                      <Label htmlFor="pp-overlay-enabled">{t('editor.properties.overlay')}</Label>
                      <p className="msp-mt-0.5 msp-text-[11px] msp-text-muted-foreground">
                        {t('editor.properties.overlayHint')}
                      </p>
                    </div>
                    <Switch
                      id="pp-overlay-enabled"
                      checked={Boolean(currentSlide.overlayEnabled)}
                      onCheckedChange={(checked) => updateSlideOverlay({ overlayEnabled: checked })}
                    />
                  </div>
                  {currentSlide.overlayEnabled && (
                    <>
                      <ColorPicker
                        label={t('editor.properties.overlayColor')}
                        value={currentSlide.overlayColor || '#000000'}
                        onChange={(overlayColor) => updateSlideOverlay({ overlayColor })}
                      />
                      <PropertyField label={t('editor.properties.overlayOpacity')}>
                        <div className="msp-flex msp-items-center msp-gap-2">
                          <Slider
                            value={[Math.round(getSlideOverlayOpacity(currentSlide) * 100)]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={([val]) =>
                              updateSlideOverlay({ overlayOpacity: val / 100 })
                            }
                            className="msp-flex-1"
                          />
                          <span className="msp-w-10 msp-text-right msp-text-xs msp-tabular-nums msp-shrink-0">
                            {Math.round(getSlideOverlayOpacity(currentSlide) * 100)}%
                          </span>
                        </div>
                      </PropertyField>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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

  const accordionTriggerClass =
    'msp-min-h-8 msp-px-3 msp-py-2 msp-text-[12px] msp-font-medium msp-leading-tight msp-text-foreground msp-transition-colors hover:msp-no-underline hover:msp-bg-muted/55 data-[state=closed]:msp-bg-muted/15 data-[state=open]:msp-bg-muted/40 data-[state=open]:msp-border-b msp-border-border';
  const accordionBodyClass = 'msp-px-3 msp-pt-3 msp-pb-4 msp-bg-muted/20';

  const resolvedTextAlign =
    editableElement?.style.textAlign === 'center' || editableElement?.style.textAlign === 'right'
      ? editableElement.style.textAlign
      : 'left';

  return (
    <div className="msp-flex msp-flex-col msp-h-full msp-overflow-hidden msp-bg-card">
      <div className="msp-px-3 msp-py-2 msp-border-b msp-font-semibold msp-text-xs msp-shrink-0">{t('editor.properties.title')}</div>

      <div className="msp-flex-1 msp-overflow-y-auto">
        <div className="msp-p-3 msp-border-b msp-space-y-2">
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

        <div className="msp-px-3 msp-py-4">
          <Accordion
            type="multiple"
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
            className="msp-w-full msp-space-y-3"
          >

            {/* Content */}
            <AccordionItem value="content">
              <AccordionTrigger className={accordionTriggerClass}>{t('editor.properties.content')}</AccordionTrigger>
              <AccordionContent className={`${accordionBodyClass} msp-space-y-3`}>
                <PropertyField label={t('editor.properties.content')} stacked>
                  {activeElement.type === 'text' ? (
                    <TextContentEditorModal
                      elementId={activeElement.id}
                      value={activeElement.content}
                      onChange={(html) => updateElement(activeElement.id, { content: html })}
                    />
                  ) : activeElement.type === 'button' ? (
                    <Textarea
                      className="msp-min-h-[72px] msp-resize-y msp-text-xs"
                      value={activeElement.content}
                      onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                    />
                  ) : (
                    <Input
                      className="msp-h-7 msp-text-xs"
                      value={activeElement.content}
                      onChange={(e) => updateElement(activeElement.id, { content: e.target.value })}
                    />
                  )}
                  {activeElement.type === 'image' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="msp-w-full msp-justify-center msp-gap-1 msp-h-7 msp-text-xs"
                      onClick={() =>
                        openMediaPicker({
                          purpose: 'image',
                          onSelect: (url) => updateElement(activeElement.id, { content: url }),
                        })
                      }
                    >
                      <ImageIcon className="msp-h-3 msp-w-3" />
                      {t('mediaManager.upload')}
                    </Button>
                  ) : null}
                </PropertyField>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="layout">
              <AccordionTrigger className={accordionTriggerClass}>
                {t('editor.properties.layout')}
              </AccordionTrigger>
              <AccordionContent className={`${accordionBodyClass} msp-space-y-3`}>
                {activeElement.type === 'text' || activeElement.type === 'button' ? (
                  <PropertyField label={t('editor.properties.textAlign')}>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="sm"
                      className="msp-grid msp-w-full msp-grid-cols-3 msp-gap-1"
                      value={resolvedTextAlign}
                      onValueChange={(val) => {
                        if (val) handleResponsiveStyleChange('textAlign', val);
                      }}
                    >
                      <ToggleGroupItem
                        value="left"
                        aria-label={t('editor.properties.alignLeft')}
                        title={t('editor.properties.alignLeft')}
                        className="msp-h-8 msp-w-full msp-p-0 data-[state=on]:msp-border-primary data-[state=on]:msp-bg-primary/15"
                      >
                        <AlignLeft className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="center"
                        aria-label={t('editor.properties.alignCenter')}
                        title={t('editor.properties.alignCenter')}
                        className="msp-h-8 msp-w-full msp-p-0 data-[state=on]:msp-border-primary data-[state=on]:msp-bg-primary/15"
                      >
                        <AlignCenter className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="right"
                        aria-label={t('editor.properties.alignRight')}
                        title={t('editor.properties.alignRight')}
                        className="msp-h-8 msp-w-full msp-p-0 data-[state=on]:msp-border-primary data-[state=on]:msp-bg-primary/15"
                      >
                        <AlignRight className="msp-h-3.5 msp-w-3.5" strokeWidth={1.75} />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </PropertyField>
                ) : null}
                <ColumnAlignmentControls propertyMode={propertyMode} />
                <RowAlignmentControls propertyMode={propertyMode} />
                <AlignmentControls elementId={activeElement.id} propertyMode={propertyMode} />
              </AccordionContent>
            </AccordionItem>

            {activeElement.type === 'button' ? (
              <AccordionItem value="link">
                <AccordionTrigger className={accordionTriggerClass}>
                  {t('editor.properties.buttonLinkSettings')}
                </AccordionTrigger>
                <AccordionContent className={`${accordionBodyClass} msp-space-y-3`}>
                  <PropertyField label={t('editor.properties.buttonLink')}>
                    <Input
                      className="msp-h-7 msp-text-xs"
                      value={activeElement.buttonLink || ''}
                      placeholder={t('editor.properties.buttonLinkPlaceholder')}
                      onChange={(e) =>
                        updateElement(activeElement.id, {
                          buttonLink: e.target.value,
                        })
                      }
                    />
                  </PropertyField>

                  <PropertyField label={t('editor.properties.buttonLinkTarget')}>
                    <Select
                      value={activeElement.buttonLinkTarget || '_blank'}
                      onValueChange={(value) =>
                        updateElement(activeElement.id, {
                          buttonLinkTarget: value as '_self' | '_blank',
                        })
                      }
                    >
                      <SelectTrigger className="msp-h-7 msp-text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_self">{t('editor.properties.buttonLinkTargetSelf')}</SelectItem>
                        <SelectItem value="_blank">{t('editor.properties.buttonLinkTargetBlank')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </PropertyField>
                </AccordionContent>
              </AccordionItem>
            ) : null}

            <AccordionItem value="color">
              <AccordionTrigger className={accordionTriggerClass}>{t('editor.properties.colorTitle')}</AccordionTrigger>
              <AccordionContent className={`${accordionBodyClass} msp-space-y-3`}>
                {editableElement ? (
                  <ColorAndBorderControls
                    elementId={activeElement.id}
                    editableElement={editableElement}
                    propertyMode={propertyMode}
                  />
                ) : null}
              </AccordionContent>
            </AccordionItem>

            {activeElement.type === 'text' || activeElement.type === 'button' ? (
              <AccordionItem value="font">
                <AccordionTrigger className={accordionTriggerClass}>
                  {t('editor.properties.fontTitle')}
                </AccordionTrigger>
                <AccordionContent className={accordionBodyClass}>
                  {editableElement ? (
                    <FontPropertiesControls
                      fontFamily={
                        typeof editableElement.style.fontFamily === 'string'
                          ? editableElement.style.fontFamily
                          : undefined
                      }
                      fontSize={editableElement.style.fontSize}
                      fontWeight={editableElement.style.fontWeight}
                      lineHeight={editableElement.style.lineHeight}
                      letterSpacing={editableElement.style.letterSpacing}
                      onFontFamilyChange={(family) => handleResponsiveStyleChange('fontFamily', family)}
                      onFontSizeChange={(size) => handleResponsiveStyleChange('fontSize', size)}
                      onFontWeightChange={(weight) => handleResponsiveStyleChange('fontWeight', weight)}
                      onLineHeightChange={(value) => handleResponsiveStyleChange('lineHeight', value)}
                      onLetterSpacingChange={(value) => handleResponsiveStyleChange('letterSpacing', value)}
                    />
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ) : null}

            {/* Style */}
            <AccordionItem value="style">
              <AccordionTrigger className={accordionTriggerClass}>{t('editor.properties.style')}</AccordionTrigger>
              <AccordionContent className={`${accordionBodyClass} msp-space-y-3`}>
                {/* Layer Management */}
                <div className="msp-space-y-1.5 msp-pb-3 msp-border-b">
                  <PropertyField label={t('editor.properties.layerOrder')}>
                    <div className="msp-flex msp-gap-1 msp-justify-end">
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
                  </PropertyField>
                </div>

                <PropertyField label={`X ${t('editor.properties.position')}`}>
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    value={editableElement?.x ?? activeElement.x}
                    onChange={(e) => updateElementForMode(activeElement.id, { x: Number(e.target.value) }, propertyMode)}
                  />
                </PropertyField>

                <PropertyField label={`Y ${t('editor.properties.position')}`}>
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    value={editableElement?.y ?? activeElement.y}
                    onChange={(e) => updateElementForMode(activeElement.id, { y: Number(e.target.value) }, propertyMode)}
                  />
                </PropertyField>

                <PropertyField label={`${t('editor.properties.size')} (W)`}>
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    value={editableElement?.style.width || ''}
                    onChange={(e) => handleResponsiveStyleChange('width', Number(e.target.value))}
                    placeholder="Auto"
                  />
                </PropertyField>

                <PropertyField label={`${t('editor.properties.size')} (H)`}>
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    value={editableElement?.style.height || ''}
                    onChange={(e) => handleResponsiveStyleChange('height', Number(e.target.value))}
                    placeholder="Auto"
                  />
                </PropertyField>

                <PropertyField label="Döndürme (°)">
                  <Input
                    className="msp-h-7 msp-text-xs"
                    type="number"
                    min={0}
                    max={360}
                    value={editableElement?.rotation ?? 0}
                    onChange={(e) => updateElementForMode(activeElement.id, { rotation: ((Number(e.target.value) % 360) + 360) % 360 }, propertyMode)}
                  />
                </PropertyField>

                {activeElement.type === 'image' && (
                  <PropertyField label={t('editor.properties.imageFit')}>
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
                  </PropertyField>
                )}

                <PropertyField label={`${t('editor.properties.opacity')} (${activeElementOpacity})`}>
                  <Slider
                    value={[activeElementOpacity]}
                    max={1}
                    step={0.1}
                    onValueChange={([val]) => handleResponsiveStyleChange('opacity', val)}
                  />
                </PropertyField>

              </AccordionContent>
            </AccordionItem>

            {/* Animation */}
            <AccordionItem value="animation">
              <AccordionTrigger className={accordionTriggerClass}>{t('editor.properties.animation')}</AccordionTrigger>
              <AccordionContent className={`${accordionBodyClass} msp-space-y-3`}>
                <PropertyField label={t('editor.properties.entranceAnimation')}>
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
                </PropertyField>

                {activeElement.animation && activeElement.animation.name !== 'None' && (
                  <div className="msp-p-2 msp-bg-secondary/50 msp-rounded-md msp-text-xs">
                    <p>Animasyon: {activeElement.animation.name}</p>
                    <p className="msp-text-muted-foreground msp-mt-1">Önizle butonuna bas.</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Spacing */}
            <AccordionItem value="spacing">
              <AccordionTrigger className={accordionTriggerClass}>{t('editor.properties.spacingTitle')}</AccordionTrigger>
              <AccordionContent className={accordionBodyClass}>
                {editableElement ? (
                  <SpacingControls
                    elementId={activeElement.id}
                    editableElement={editableElement}
                    propertyMode={propertyMode}
                  />
                ) : null}
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;