import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Group, Monitor, Play, Plus, Redo2, RotateCcw, Settings, Smartphone, Square, Tablet, Terminal, Undo2, Ungroup, Upload } from 'lucide-react';
import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { normalizeSliderSettings } from '@/lib/slideTransitions';
import JsonCodeEditor from './JsonCodeEditor';
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
                  <Download className="msp-h-4 msp-w-4 msp-mr-2" /> {t('editor.toolbar.export')}
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
              {isSaveOpen && (
                <JsonCodeEditor value={jsonOutput} readOnly height={320} />
              )}
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
              {isTestOpen && (
                <JsonCodeEditor value={jsonInput} onChange={setJsonInput} height={320} />
              )}
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