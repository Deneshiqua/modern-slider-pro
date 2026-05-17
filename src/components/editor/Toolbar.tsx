import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Grid, Group, LayoutGrid, Monitor, Play, Plus, Redo2, Save, Settings, SlidersHorizontal, Smartphone, Square, Tablet, Terminal, Undo2, Ungroup, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider as SliderInput } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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

const Toolbar = ({ onDemoSave, onSave, saveButtonLabel }: ToolbarProps) => {
  const {
    viewMode,
    setViewMode,
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
    undo,
    redo,
    setPropertyMode,
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
  const GRID_PRESETS = [10, 20, 25, 50, 100];
  const [showCustomGrid, setShowCustomGrid] = useState(false);
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
        updateSettings(parsedValue.settings ?? {});
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
    <div className="msp-h-14 msp-border-b msp-bg-card msp-flex msp-items-center msp-justify-between msp-px-4 msp-shrink-0 msp-min-w-0">
      <div className="msp-flex msp-items-center msp-gap-2">
        <h1 className="msp-font-bold msp-text-lg msp-mr-4">{t('editor.toolbar.title')}</h1>

        <div className="msp-flex msp-items-center msp-bg-secondary msp-rounded-md msp-p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('desktop');
                    setPropertyMode('desktop');
                  }}
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
                  onClick={() => {
                    setViewMode('tablet');
                    setPropertyMode('tablet');
                  }}
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
                  onClick={() => {
                    setViewMode('mobile');
                    setPropertyMode('mobile');
                  }}
                >
                  <Smartphone className="msp-h-4 msp-w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.mobileView')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="msp-flex msp-items-center msp-gap-1 msp-ml-2">
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

      <div className="msp-flex msp-items-center msp-gap-2">
        <div className="msp-flex msp-items-center msp-gap-2 msp-mr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="msp-flex msp-items-center msp-gap-2">
                  <Switch
                    id="show-borders"
                    checked={showBorders}
                    onCheckedChange={setShowBorders}
                  />
                  <Label htmlFor="show-borders" className="msp-cursor-pointer">
                    <Grid className="msp-h-4 msp-w-4" />
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.showBorders')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Canvas Settings Dialog */}
        <Dialog open={isCanvasSettingsOpen} onOpenChange={setIsCanvasSettingsOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsCanvasSettingsOpen(true)}>
                  <LayoutGrid className="msp-h-5 msp-w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Canvas Ayarları</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="msp-max-w-sm">
            <DialogHeader>
              <DialogTitle>Canvas Ayarları</DialogTitle>
              <DialogDescription>Canvas boyutu, grid ve hizalama çizgisi ayarlarını yapın.</DialogDescription>
            </DialogHeader>
            <div className="msp-space-y-5 msp-py-2">
              {/* Canvas Size */}
              <div className="msp-space-y-2">
                <Label>Canvas Boyutu</Label>
                <div className="msp-grid msp-grid-cols-2 msp-gap-2">
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
                <div className="msp-flex msp-gap-1.5 msp-flex-wrap msp-pt-1">
                  {[
                    { label: '16:9', w: 1280, h: 720 },
                    { label: '4:3', w: 1024, h: 768 },
                    { label: '1:1', w: 800, h: 800 },
                    { label: '9:16', w: 720, h: 1280 },
                  ].map(({ label, w, h }) => (
                    <Button
                      key={label}
                      variant={canvasSettings.canvasWidth === w && canvasSettings.canvasHeight === h ? 'default' : 'outline'}
                      size="sm"
                      className="msp-h-7 msp-text-xs msp-px-2.5"
                      onClick={() => updateCanvasSettings({ canvasWidth: w, canvasHeight: h })}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Slider Settings Dialog */}
        <Dialog open={isSliderSettingsOpen} onOpenChange={setIsSliderSettingsOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsSliderSettingsOpen(true)}>
                  <SlidersHorizontal className="msp-h-5 msp-w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Slider Ayarları</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="msp-max-w-sm">
            <DialogHeader>
              <DialogTitle>Slider Ayarları</DialogTitle>
              <DialogDescription>Slider'in genel davranışını buradan ayarlayın.</DialogDescription>
            </DialogHeader>
            <div className="msp-space-y-5 msp-py-2">
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
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="msp-h-5 msp-w-5" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>{t('settings.title')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('settings.title')}</DialogTitle>
            </DialogHeader>
            <div className="msp-space-y-4 msp-py-4">
              <div className="msp-flex msp-items-center msp-justify-between">
                <Label>{t('settings.theme')}</Label>
                <div className="msp-flex msp-items-center msp-gap-2">
                  <span className="msp-text-sm">{theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</span>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </div>
              <div className="msp-space-y-2">
                <Label>{t('settings.language')}</Label>
                <Select value={language} onValueChange={(val: 'en' | 'tr') => setLanguage(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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