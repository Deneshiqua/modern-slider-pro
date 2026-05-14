import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Grid, LayoutGrid, Monitor, Play, Plus, Save, Settings, SlidersHorizontal, Smartphone, Square, Tablet, Terminal, Upload } from 'lucide-react';
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

const Toolbar = ({ onDemoSave }: { onDemoSave?: () => void }) => {
  const {
    viewMode,
    setViewMode,
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

  const handleSave = () => {
    const json = JSON.stringify(slides, null, 2);
    setJsonOutput(json);
    setIsSaveOpen(true);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonOutput);
    toast.success(t('editor.toolbar.jsonCopied'));
  };

  const handleTest = () => {
    try {
      const parsedSlides = JSON.parse(jsonInput);
      if (Array.isArray(parsedSlides)) {
        loadSlides(parsedSlides);
        setIsTestOpen(false);
        setJsonInput('');
        toast.success(t('editor.toolbar.slidesLoaded'));
      } else {
        toast.error(t('editor.toolbar.invalidJsonArray'));
      }
    } catch (error) {
      toast.error(t('editor.toolbar.invalidJson'));
    }
  };

  return (
    <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <h1 className="font-bold text-lg mr-4">{t('editor.toolbar.title')}</h1>

        <div className="flex items-center bg-secondary rounded-md p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
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
                  onClick={() => setViewMode('tablet')}
                >
                  <Tablet className="h-4 w-4" />
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
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.mobileView')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-borders"
                    checked={showBorders}
                    onCheckedChange={setShowBorders}
                  />
                  <Label htmlFor="show-borders" className="cursor-pointer">
                    <Grid className="h-4 w-4" />
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
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Canvas Ayarları</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Canvas Ayarları</DialogTitle>
              <DialogDescription>Canvas boyutu, grid ve hizalama çizgisi ayarlarını yapın.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {/* Canvas Size */}
              <div className="space-y-2">
                <Label>Canvas Boyutu</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Genişlik (px)</Label>
                    <Input
                      type="number"
                      className="h-7 text-xs"
                      value={canvasSettings.canvasWidth}
                      min={100}
                      max={3840}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 100) updateCanvasSettings({ canvasWidth: val });
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Yükseklik (px)</Label>
                    <Input
                      type="number"
                      className="h-7 text-xs"
                      value={canvasSettings.canvasHeight}
                      min={100}
                      max={2160}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 100) updateCanvasSettings({ canvasHeight: val });
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap pt-1">
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
                      className="h-7 text-xs px-2.5"
                      onClick={() => updateCanvasSettings({ canvasWidth: w, canvasHeight: h })}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t" />

              {/* Grid Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="tb-showGrid">Grid Göster</Label>
                <Switch
                  id="tb-showGrid"
                  checked={canvasSettings.showGrid}
                  onCheckedChange={(checked) => updateCanvasSettings({ showGrid: checked })}
                />
              </div>

              {/* Grid Size */}
              {canvasSettings.showGrid && (
                <div className="space-y-2">
                  <Label>Grid Boyutu</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {GRID_PRESETS.map(size => (
                      <Button
                        key={size}
                        variant={canvasSettings.gridSize === size && !showCustomGrid ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => { updateCanvasSettings({ gridSize: size }); setShowCustomGrid(false); }}
                      >
                        {size}px
                      </Button>
                    ))}
                    <Button
                      variant={showCustomGrid ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs px-2.5"
                      onClick={() => setShowCustomGrid(v => !v)}
                    >
                      Özel
                    </Button>
                  </div>
                  {showCustomGrid && (
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        type="number"
                        className="h-7 text-xs"
                        placeholder="px"
                        defaultValue={canvasSettings.gridSize}
                        min={5}
                        max={500}
                        autoFocus
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 5) updateCanvasSettings({ gridSize: val });
                        }}
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                  )}
                </div>
              )}

              {/* Snap Guides */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tb-snapGuides">Hizalama Çizgileri</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Sürüklerken Photoshop gibi hizalama kılavuzları</p>
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
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Slider Ayarları</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Slider Ayarları</DialogTitle>
              <DialogDescription>Slider'in genel davranışını buradan ayarlayın.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tb-autoPlay">{t('editor.properties.autoPlay')}</Label>
                <Switch
                  id="tb-autoPlay"
                  checked={settings.autoPlay}
                  onCheckedChange={(checked) => updateSettings({ autoPlay: checked })}
                />
              </div>
              {settings.autoPlay && (
                <div className="space-y-2">
                  <Label>{t('editor.properties.interval')}</Label>
                  <div className="flex items-center gap-3">
                    <SliderInput
                      value={[settings.interval]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={([val]) => updateSettings({ interval: val })}
                      className="flex-1"
                    />
                    <span className="w-8 text-right text-sm">{settings.interval}s</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="tb-loop">{t('editor.properties.loop')}</Label>
                <Switch
                  id="tb-loop"
                  checked={settings.loop}
                  onCheckedChange={(checked) => updateSettings({ loop: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tb-showArrows">{t('editor.properties.showArrows')}</Label>
                <Switch
                  id="tb-showArrows"
                  checked={settings.showArrows}
                  onCheckedChange={(checked) => updateSettings({ showArrows: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
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
                    <Settings className="h-5 w-5" />
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
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label>{t('settings.theme')}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}</span>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </div>
              <div className="space-y-2">
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
                  <Save className="h-4 w-4 mr-2" /> {t('editor.toolbar.save')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.exportJson')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('editor.toolbar.exportTitle')}</DialogTitle>
              <DialogDescription>
                {t('editor.toolbar.exportDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={jsonOutput}
                readOnly
                className="h-[300px] font-mono text-xs"
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
                  <Terminal className="h-4 w-4 mr-2" /> {t('editor.toolbar.test')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.toolbar.importJson')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('editor.toolbar.importTitle')}</DialogTitle>
              <DialogDescription>
                {t('editor.toolbar.importDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={t('editor.toolbar.pasteJson')}
                className="h-[300px] font-mono text-xs"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleTest}>{t('editor.toolbar.run')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant={isPlaying ? "destructive" : "default"}
          onClick={togglePlay}
          className="w-32"
        >
          {isPlaying ? (
            <>
              <Square className="h-4 w-4 mr-2" /> {t('editor.toolbar.stop')}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" /> {t('editor.toolbar.preview')}
            </>
          )}
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  publishSlides(slides);
                  toast.success('Demo güncellendi!');
                  onDemoSave?.();
                }}
              >
                <Upload className="h-4 w-4 mr-2" /> Demo'ya Kaydet
              </Button>
            </TooltipTrigger>
            <TooltipContent>Slaytları demo sayfasına yayınla (geçici)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Toolbar;