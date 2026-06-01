import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Group, LayoutGrid, Monitor, PanelBottom, Play, Plus, Redo2, RotateCcw, Save, Settings, SlidersHorizontal, Smartphone, Square, Tablet, Terminal, Undo2, Ungroup, Upload } from 'lucide-react';
import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider as SliderInput } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { normalizeSliderSettings, SLIDE_TRANSITION_OPTIONS } from '@/lib/slideTransitions';
import type { SlideTransitionType } from '@/types/editor';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePublishedSlides } from '@/context/PublishedSlidesContext';
import { useTheme } from '@/context/ThemeContext';
import { Slide, SliderEditorSavePayload, SliderProject } from '@/types/editor';

type ToolbarProps = {
  onDemoSave?: (slides: Slide[]) => void;
  onSave?: (payload: SliderEditorSavePayload) => void | Promise<void>;
  saveButtonLabel?: string;
};

const isSliderProject = (value: unknown): value is SliderProject => {
  if (!value || typeof value !== 'object') return false;

  const project = value as Partial<SliderProject>;

  return project.version === 1 && Array.isArray(project.slides);
};

/** Fixed canvas presets (width × height). Labels are derived as `WxHpx`. */
const CANVAS_SIZE_PRESETS = [
  { w: 1280, h: 720 },
  { w: 1024, h: 768 },
  { w: 800, h: 800 },
  { w: 720, h: 1280 },
] as const;

const LANGUAGE_OPTIONS = [
  { code: 'en' as const, label: 'English' },
  { code: 'tr' as const, label: 'Türkçe' },
];

const Toolbar = ({ onDemoSave, onSave, saveButtonLabel }: ToolbarProps) => {
  const {
    viewMode,
    setResponsiveViewport,
    currentSlideIndex,
    isPlaying,
    togglePlay,
    slides,
    showBorders,
    setShowBorders,
    loadSlides,
    settings,
    updateSettings,
    canvasSettings,
    updateCanvasSettings,
    isDirty,
    markSaved,
    canUndo,
    canRedo,
    canResetSlide,
    undo,
    redo,
    resetActiveSlide,
    selectedElementId,
    selectedElementIds,
    groupSelectedElements,
    ungroupElement,
  } = useEditor();

  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { publishSlides } = usePublishedSlides();

  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isSliderSettingsOpen, setIsSliderSettingsOpen] = useState(false);
  const [isCanvasSettingsOpen, setIsCanvasSettingsOpen] = useState(false);
  const [isTimelineSettingsOpen, setIsTimelineSettingsOpen] = useState(false);
  const GRID_PRESETS = [10, 20, 25, 50, 100];
  const [showCustomGrid, setShowCustomGrid] = useState(false);
  /** User chose "Özel" so width/height fields are shown; cleared when picking a preset. */
  const [explicitCanvasCustomSize, setExplicitCanvasCustomSize] = useState(false);

  const canvasSizePresetHit = CANVAS_SIZE_PRESETS.find(
    preset => preset.w === canvasSettings.canvasWidth && preset.h === canvasSettings.canvasHeight,
  );
  const showCanvasDimensionInputs =
    explicitCanvasCustomSize || canvasSizePresetHit === undefined;
  const selectedRootElement = selectedElementId
    ? slides[currentSlideIndex]?.elements.find(element => element.id === selectedElementId)
    : null;
  const canGroup = selectedElementIds.length > 1;
  const canUngroup = selectedRootElement?.type === 'box' && Boolean(selectedRootElement.children?.length);
  const showPublishButton = Boolean(onDemoSave || onSave);
  const resolvedSaveLabel = saveButtonLabel ?? t('editor.toolbar.save');
  const resolvedSaveTooltip = t('editor.toolbar.save');

  const createSavePayload = (): SliderEditorSavePayload => ({
    version: 1,
    slides,
    settings,
    canvasSettings,
  });

  const handleSave = () => {
    const json = JSON.stringify(createSavePayload(), null, 2);
    setJsonOutput(json);
    setIsSaveOpen(true);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonOutput);
    toast.success(t('editor.toolbar.jsonCopied'));
  };

  const handleTest = () => {
    try {
      const parsedValue = JSON.parse(jsonInput);

      if (isSliderProject(parsedValue)) {
        loadSlides(parsedValue.slides);
        updateSettings(normalizeSliderSettings(parsedValue.settings));
        updateCanvasSettings(parsedValue.canvasSettings ?? {});
        setIsTestOpen(false);
        setJsonInput('');
        toast.success(t('editor.toolbar.slidesLoaded'));
      } else if (Array.isArray(parsedValue)) {
        loadSlides(parsedValue);
        setIsTestOpen(false);
        setJsonInput('');
        toast.success(t('editor.toolbar.slidesLoaded'));
      } else {
        toast.error(t('editor.toolbar.invalidJsonArray'));
      }
    } catch (error) {
      console.error('Failed to parse slider JSON', error);
      toast.error(t('editor.toolbar.invalidJson'));
    }
  };

  const handlePublish = async () => {
    const payload = createSavePayload();

    try {
      await onSave?.(payload);
      publishSlides(slides);
      onDemoSave?.(slides);
      markSaved();
      toast.success(t('editor.toolbar.saved'));
    } catch (error) {
      console.error('Failed to save slider', error);
      toast.error(t('editor.toolbar.saveFailed'));
    }
  };

  return (
    <div className="msp-relative msp-flex msp-h-14 msp-min-w-0 msp-shrink-0 msp-items-center msp-border-b msp-bg-card msp-px-4">
      <div className="msp-z-10 msp-flex msp-min-w-0 msp-flex-1 msp-items-center msp-gap-2">
        <h1 className="msp-mr-2 msp-min-w-0 msp-shrink msp-truncate msp-text-lg msp-font-bold">
          {t('editor.toolbar.title')}
        </h1>

        <div className="msp-flex msp-items-center msp-gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetActiveSlide}
                  disabled={!canResetSlide}
                >
                  <RotateCcw className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('editor.toolbar.resetSlide')}</p>
                <p className="msp-mt-1 msp-max-w-xs msp-text-xs msp-text-muted-foreground">{t('editor.toolbar.resetSlideHint')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo}>
                  <Undo2 className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.undo')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo}>
                  <Redo2 className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.redo')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="msp-flex msp-items-center msp-gap-1 msp-ml-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={groupSelectedElements} disabled={!canGroup}>
                  <Group className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Seçili öğeleri grupla</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectedElementId && ungroupElement(selectedElementId)}
                  disabled={!canUngroup}
                >
                  <Ungroup className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grubu çöz</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="msp-pointer-events-none msp-absolute msp-inset-0 msp-z-20 msp-flex msp-items-center msp-justify-center">
        <div className="msp-pointer-events-auto msp-flex msp-items-center msp-rounded-md msp-bg-secondary msp-p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setResponsiveViewport('desktop')}
                >
                  <Monitor className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.desktopView')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setResponsiveViewport('tablet')}
                >
                  <Tablet className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tablet (768×1024)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setResponsiveViewport('mobile')}
                >
                  <Smartphone className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.mobileView')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="msp-z-10 msp-flex msp-min-w-0 msp-flex-1 msp-items-center msp-justify-end msp-gap-2">
        {/* Canvas settings (popover avoids modal overlay/focus trap for embedders) */}
        <Popover modal={false} open={isCanvasSettingsOpen} onOpenChange={setIsCanvasSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={t('editor.toolbar.tooltipCanvasSettings')}
              aria-label={t('editor.toolbar.tooltipCanvasSettings')}
            >
              <LayoutGrid className="msp-h-5 msp-w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="msp-max-w-sm msp-w-[min(calc(100vw-2rem),24rem)] msp-max-h-[min(32rem,calc(100vh-5rem))] msp-overflow-y-auto msp-p-4">
            <div className="msp-space-y-1.5 msp-border-b msp-pb-3 msp-mb-1">
              <h2 className="msp-text-base msp-font-semibold msp-leading-none">Canvas Ayarları</h2>
              <p className="msp-text-sm msp-text-muted-foreground">
                Canvas boyutu, kenarlıklar, grid ve hizalama çizgisi ayarlarını yapın.
              </p>
            </div>
            <div className="msp-space-y-5 msp-pt-3">
              {/* Canvas Size */}
              <div className="msp-space-y-2">
                <Label>Canvas Boyutu</Label>
                <div className="msp-flex msp-gap-1.5 msp-flex-wrap">
                  {CANVAS_SIZE_PRESETS.map(({ w, h }) => {
                    const label = `${w}×${h}px`;
                    const isHit = canvasSizePresetHit?.w === w && canvasSizePresetHit?.h === h;
                    const selected = Boolean(isHit && !explicitCanvasCustomSize);

                    return (
                      <Button
                        key={`${w}x${h}`}
                        variant={selected ? 'default' : 'outline'}
                        size="sm"
                        className="msp-h-7 msp-text-xs msp-px-2.5"
                        onClick={() => {
                          updateCanvasSettings({ canvasWidth: w, canvasHeight: h });
                          setExplicitCanvasCustomSize(false);
                        }}
                      >
                        {label}
                      </Button>
                    );
                  })}
                  <Button
                    variant={explicitCanvasCustomSize || !canvasSizePresetHit ? 'default' : 'outline'}
                    size="sm"
                    className="msp-h-7 msp-text-xs msp-px-2.5"
                    onClick={() => setExplicitCanvasCustomSize(true)}
                  >
                    Özel
                  </Button>
                </div>
                {showCanvasDimensionInputs && (
                  <div className="msp-grid msp-grid-cols-2 msp-gap-2 msp-pt-1">
                    <div className="msp-space-y-1">
                      <Label className="msp-text-xs msp-text-muted-foreground">Genişlik (px)</Label>
                      <Input
                        type="number"
                        className="msp-h-7 msp-text-xs"
                        value={canvasSettings.canvasWidth}
                        min={100}
                        max={3840}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value);
                          if (!Number.isNaN(val) && val >= 100) updateCanvasSettings({ canvasWidth: val });
                        }}
                      />
                    </div>
                    <div className="msp-space-y-1">
                      <Label className="msp-text-xs msp-text-muted-foreground">Yükseklik (px)</Label>
                      <Input
                        type="number"
                        className="msp-h-7 msp-text-xs"
                        value={canvasSettings.canvasHeight}
                        min={100}
                        max={2160}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value);
                          if (!Number.isNaN(val) && val >= 100) updateCanvasSettings({ canvasHeight: val });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="msp-border-t" />

              <div className="msp-flex msp-items-center msp-justify-between">
                <Label htmlFor="tb-show-borders">{t('editor.toolbar.showBorders')}</Label>
                <Switch
                  id="tb-show-borders"
                  checked={showBorders}
                  onCheckedChange={setShowBorders}
                />
              </div>

              <div className="msp-border-t" />

              <div className="msp-flex msp-items-center msp-justify-between">
                <div>
                  <Label htmlFor="tb-show-rulers">{t('editor.toolbar.showRulers')}</Label>
                  <p className="msp-text-xs msp-text-muted-foreground msp-mt-0.5">{t('editor.toolbar.showRulersHint')}</p>
                </div>
                <Switch
                  id="tb-show-rulers"
                  checked={canvasSettings.showRulers}
                  onCheckedChange={(checked) => updateCanvasSettings({ showRulers: checked })}
                />
              </div>

              <div className="msp-border-t" />

              {/* Grid Toggle */}
              <div className="msp-flex msp-items-center msp-justify-between">
                <Label htmlFor="tb-showGrid">Grid Göster</Label>
                <Switch
                  id="tb-showGrid"
                  checked={canvasSettings.showGrid}
                  onCheckedChange={(checked) => updateCanvasSettings({ showGrid: checked })}
                />
              </div>

              {/* Grid Size */}
              {canvasSettings.showGrid && (
                <div className="msp-space-y-2">
                  <Label>Grid Boyutu</Label>
                  <div className="msp-flex msp-gap-1.5 msp-flex-wrap">
                    {GRID_PRESETS.map(size => (
                      <Button
                        key={size}
                        variant={canvasSettings.gridSize === size && !showCustomGrid ? 'default' : 'outline'}
                        size="sm"
                        className="msp-h-7 msp-text-xs msp-px-2.5"
                        onClick={() => { updateCanvasSettings({ gridSize: size }); setShowCustomGrid(false); }}
                      >
                        {size}px
                      </Button>
                    ))}
                    <Button
                      variant={showCustomGrid ? 'default' : 'outline'}
                      size="sm"
                      className="msp-h-7 msp-text-xs msp-px-2.5"
                      onClick={() => setShowCustomGrid(v => !v)}
                    >
                      Özel
                    </Button>
                  </div>
                  {showCustomGrid && (
                    <div className="msp-flex msp-items-center msp-gap-2 msp-pt-1">
                      <Input
                        type="number"
                        className="msp-h-7 msp-text-xs"
                        placeholder="px"
                        defaultValue={canvasSettings.gridSize}
                        min={5}
                        max={500}
                        autoFocus
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value);
                          if (!Number.isNaN(val) && val >= 5) updateCanvasSettings({ gridSize: val });
                        }}
                      />
                      <span className="msp-text-xs msp-text-muted-foreground">px</span>
                    </div>
                  )}
                </div>
              )}

              {/* Snap Guides */}
              <div className="msp-flex msp-items-center msp-justify-between">
                <div>
                  <Label htmlFor="tb-snapGuides">Hizalama Çizgileri</Label>
                  <p className="msp-text-xs msp-text-muted-foreground msp-mt-0.5">Sürüklerken Photoshop gibi hizalama kılavuzları</p>
                </div>
                <Switch
                  id="tb-snapGuides"
                  checked={canvasSettings.snapToElements}
                  onCheckedChange={(checked) => updateCanvasSettings({ snapToElements: checked })}
                />
              </div>

              <div className="msp-flex msp-items-center msp-justify-between">
                <div>
                  <Label htmlFor="tb-centerGuides">{t('editor.toolbar.centerGuides')}</Label>
                  <p className="msp-text-xs msp-text-muted-foreground msp-mt-0.5">{t('editor.toolbar.centerGuidesHint')}</p>
                </div>
                <Switch
                  id="tb-centerGuides"
                  checked={canvasSettings.showCenterGuides}
                  onCheckedChange={(checked) => updateCanvasSettings({ showCenterGuides: checked })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover modal={false} open={isTimelineSettingsOpen} onOpenChange={setIsTimelineSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={t('editor.toolbar.tooltipTimelineSettings')}
              aria-label={t('editor.toolbar.tooltipTimelineSettings')}
            >
              <PanelBottom className="msp-h-5 msp-w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="msp-max-w-sm msp-w-[min(calc(100vw-2rem),24rem)] msp-p-4">
            <div className="msp-space-y-1.5 msp-border-b msp-pb-3 msp-mb-1">
              <h2 className="msp-text-base msp-font-semibold msp-leading-none">
                {t('editor.toolbar.timelineSettingsTitle')}
              </h2>
              <p className="msp-text-sm msp-text-muted-foreground">
                {t('editor.toolbar.timelineSettingsDesc')}
              </p>
            </div>
            <div className="msp-flex msp-items-center msp-justify-between msp-pt-3">
              <div>
                <Label htmlFor="tb-show-timeline">{t('editor.toolbar.showTimeline')}</Label>
                <p className="msp-text-xs msp-text-muted-foreground msp-mt-0.5">
                  {t('editor.toolbar.showTimelineHint')}
                </p>
              </div>
              <Switch
                id="tb-show-timeline"
                checked={canvasSettings.showTimeline !== false}
                onCheckedChange={(checked) => updateCanvasSettings({ showTimeline: checked })}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover modal={false} open={isSliderSettingsOpen} onOpenChange={setIsSliderSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={t('editor.toolbar.tooltipSliderSettings')}
              aria-label={t('editor.toolbar.tooltipSliderSettings')}
            >
              <SlidersHorizontal className="msp-h-5 msp-w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="msp-max-w-sm msp-w-[min(calc(100vw-2rem),24rem)] msp-max-h-[min(28rem,calc(100vh-5rem))] msp-overflow-y-auto msp-p-4">
            <div className="msp-space-y-1.5 msp-border-b msp-pb-3 msp-mb-1">
              <h2 className="msp-text-base msp-font-semibold msp-leading-none">Slider Ayarları</h2>
              <p className="msp-text-sm msp-text-muted-foreground">Slider'in genel davranışını buradan ayarlayın.</p>
            </div>
            <div className="msp-space-y-5 msp-pt-3">
              <div className="msp-flex msp-items-center msp-justify-between">
                <Label htmlFor="tb-autoPlay">{t('editor.properties.autoPlay')}</Label>
                <Switch
                  id="tb-autoPlay"
                  checked={settings.autoPlay}
                  onCheckedChange={(checked) => updateSettings({ autoPlay: checked })}
                />
              </div>
              {settings.autoPlay && (
                <div className="msp-space-y-2">
                  <Label>{t('editor.properties.interval')}</Label>
                  <div className="msp-flex msp-items-center msp-gap-3">
                    <SliderInput
                      value={[settings.interval]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={([val]) => updateSettings({ interval: val })}
                      className="msp-flex-1"
                    />
                    <span className="msp-w-8 msp-text-right msp-text-sm">{settings.interval}s</span>
                  </div>
                </div>
              )}
              <div className="msp-flex msp-items-center msp-justify-between">
                <Label htmlFor="tb-loop">{t('editor.properties.loop')}</Label>
                <Switch
                  id="tb-loop"
                  checked={settings.loop}
                  onCheckedChange={(checked) => updateSettings({ loop: checked })}
                />
              </div>
              <div className="msp-flex msp-items-center msp-justify-between">
                <Label htmlFor="tb-showArrows">{t('editor.properties.showArrows')}</Label>
                <Switch
                  id="tb-showArrows"
                  checked={settings.showArrows}
                  onCheckedChange={(checked) => updateSettings({ showArrows: checked })}
                />
              </div>
              <div className="msp-flex msp-items-center msp-justify-between">
                <Label htmlFor="tb-showDots">{t('editor.properties.showDots')}</Label>
                <Switch
                  id="tb-showDots"
                  checked={settings.showDots}
                  onCheckedChange={(checked) => updateSettings({ showDots: checked })}
                />
              </div>
              <div className="msp-space-y-2 msp-border-t msp-pt-4">
                <Label className="msp-text-xs">{t('editor.slideTransition.label')}</Label>
                <Select
                  value={settings.slideTransition}
                  onValueChange={(value) =>
                    updateSettings({ slideTransition: value as SlideTransitionType })
                  }
                >
                  <SelectTrigger id="tb-slideTransition" className="msp-h-8 msp-text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SLIDE_TRANSITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="msp-text-xs">
                        {t(opt.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {settings.slideTransition !== 'none' && (
                  <div className="msp-space-y-1.5">
                    <Label className="msp-text-xs">{t('editor.slideTransition.duration')}</Label>
                    <div className="msp-flex msp-items-center msp-gap-3">
                      <SliderInput
                        value={[settings.slideTransitionDuration]}
                        min={0.1}
                        max={2}
                        step={0.1}
                        onValueChange={([val]) => updateSettings({ slideTransitionDuration: val })}
                        className="msp-flex-1"
                      />
                      <span className="msp-w-10 msp-text-right msp-text-sm msp-tabular-nums">
                        {settings.slideTransitionDuration.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover modal={false}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={t('settings.title')}
              aria-label={t('settings.title')}
            >
              <Settings className="msp-h-5 msp-w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="msp-max-w-sm msp-w-[min(calc(100vw-2rem),20rem)] msp-p-4">
            <div className="msp-space-y-1.5 msp-border-b msp-pb-3 msp-mb-1">
              <h2 className="msp-text-base msp-font-semibold msp-leading-none">{t('settings.title')}</h2>
            </div>
            <div className="msp-space-y-4 msp-pt-3">
              <div className="msp-flex msp-items-center msp-justify-between">
                <Label>{t('settings.theme')}</Label>
                <div className="msp-flex msp-items-center msp-gap-2">
                  <span className="msp-text-sm">{theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</span>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </div>
              <div className="msp-flex msp-gap-1.5">
                {LANGUAGE_OPTIONS.map(({ code, label }) => (
                  <Button
                    key={code}
                    type="button"
                    variant={language === code ? 'default' : 'outline'}
                    size="sm"
                    className="msp-h-7 msp-flex-1 msp-text-xs"
                    onClick={() => setLanguage(code)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Save Button & Dialog */}
        <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="msp-h-4 msp-w-4 msp-mr-2" /> {t('editor.toolbar.save')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.exportJson')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="msp-max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('editor.toolbar.exportTitle')}</DialogTitle>
              <DialogDescription>
                {t('editor.toolbar.exportDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="msp-py-4">
              <Textarea
                value={jsonOutput}
                readOnly
                className="msp-h-[300px] msp-font-mono msp-text-xs"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCopyJson}>{t('editor.toolbar.copyClipboard')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Button & Dialog */}
        <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setIsTestOpen(true)}>
                  <Terminal className="msp-h-4 msp-w-4 msp-mr-2" /> {t('editor.toolbar.test')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.importJson')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="msp-max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('editor.toolbar.importTitle')}</DialogTitle>
              <DialogDescription>
                {t('editor.toolbar.importDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="msp-py-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={t('editor.toolbar.pasteJson')}
                className="msp-h-[300px] msp-font-mono msp-text-xs"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleTest}>{t('editor.toolbar.run')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="sm"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <>
              <Square className="msp-h-3.5 msp-w-3.5 msp-mr-1.5" /> {t('editor.toolbar.stop')}
            </>
          ) : (
            <>
              <Play className="msp-h-3.5 msp-w-3.5 msp-mr-1.5" /> {t('editor.toolbar.preview')}
            </>
          )}
        </Button>
        {showPublishButton && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePublish}
                >
                  <Upload className="msp-h-4 msp-w-4 msp-mr-2" /> {resolvedSaveLabel}
                  {isDirty ? ' *' : ''}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{resolvedSaveTooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default Toolbar;