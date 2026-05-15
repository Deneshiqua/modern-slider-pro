import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import Canvas from './Canvas';
import { EditorProvider, useEditor } from '@/context/EditorContext';
import LayerPanel from './LayerPanel';
import { Language } from '@/lib/translations';
import { LanguageProvider, TranslationDictionary, useLanguage } from '@/context/LanguageContext';
import PropertiesPanel from './PropertiesPanel';
import { PublishedSlidesProvider } from '@/context/PublishedSlidesContext';
import React from 'react';
import Sidebar from './Sidebar';
import { Theme, ThemeProvider, useTheme } from '@/context/ThemeContext';
import Toolbar from './Toolbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useDirtyReloadGuard } from '@/hooks/useDirtyReloadGuard';
import { Toaster } from 'sonner';

import { CanvasSettings, Slide, SliderEditorSavePayload, SliderSettings } from '@/types/editor';
import { cn } from '@/lib/utils';

export type SliderEditorProps = {
  onDemoSave?: (slides: Slide[]) => void;
  onSave?: (payload: SliderEditorSavePayload) => void | Promise<void>;
  saveButtonLabel?: string;
  initialSlides?: Slide[];
  initialSettings?: SliderSettings;
  initialCanvasSettings?: CanvasSettings;
  language?: Language;
  defaultLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
  translationsOverride?: Partial<TranslationDictionary>;
  theme?: Theme;
  defaultTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  themeStorageKey?: string;
  useSystemTheme?: boolean;
  showToaster?: boolean;
  className?: string;
};

const EditorShell = ({
  onDemoSave,
  onSave,
  saveButtonLabel,
  showToaster = true,
  className,
}: Pick<SliderEditorProps, 'onDemoSave' | 'onSave' | 'saveButtonLabel' | 'showToaster' | 'className'>) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { canRedo, canUndo, isDirty, redo, undo } = useEditor();

  useDirtyReloadGuard(isDirty, t);

  React.useEffect(() => {
    if (globalThis.window === undefined) return;

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;

      const tagName = target.tagName.toLowerCase();

      return target.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
    };

    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const usesModifier = event.ctrlKey || event.metaKey;
      const wantsUndo = usesModifier && key === 'z' && !event.shiftKey;
      const wantsRedo = usesModifier && (key === 'y' || (key === 'z' && event.shiftKey));

      if (wantsUndo && canUndo) {
        event.preventDefault();
        undo();
      }

      if (wantsRedo && canRedo) {
        event.preventDefault();
        redo();
      }
    };

    globalThis.window.addEventListener('keydown', handleKeyboardShortcut);

    return () => globalThis.window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [canRedo, canUndo, redo, undo]);

  return (
    <div
      className={cn(
        'msp-slider-pro msp-flex msp-flex-col msp-h-full msp-w-full msp-bg-background msp-text-foreground',
        theme === 'dark' ? 'msp-dark dark' : 'msp-light',
        className,
      )}
    >
      {showToaster && <Toaster theme={theme} />}
      <Toolbar onDemoSave={onDemoSave} onSave={onSave} saveButtonLabel={saveButtonLabel} />
      <div className="msp-flex msp-flex-1 msp-overflow-hidden">
        <Sidebar />
        <Canvas />

        {/* Right Sidebar with Resizable Panels */}
        <div className="msp-w-80 msp-border-l msp-bg-card msp-flex msp-flex-col">
          <ResizablePanelGroup direction="vertical">

            {/* Layer Panel (Top) */}
            <ResizablePanel defaultSize={35} minSize={10}>
              <LayerPanel />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Properties Panel (Bottom) */}
            <ResizablePanel defaultSize={65} minSize={20}>
              <PropertiesPanel />
            </ResizablePanel>

          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
};

const EditorLayout = ({
  onDemoSave,
  onSave,
  saveButtonLabel,
  initialSlides,
  initialSettings,
  initialCanvasSettings,
  language,
  defaultLanguage,
  onLanguageChange,
  translationsOverride,
  theme,
  defaultTheme = 'dark',
  onThemeChange,
  themeStorageKey,
  useSystemTheme,
  showToaster,
  className,
}: SliderEditorProps) => {
  return (
    <ThemeProvider
      theme={theme}
      defaultTheme={defaultTheme}
      onThemeChange={onThemeChange}
      storageKey={themeStorageKey}
      useSystemTheme={useSystemTheme}
    >
      <LanguageProvider
        language={language}
        defaultLanguage={defaultLanguage}
        onLanguageChange={onLanguageChange}
        translationsOverride={translationsOverride}
      >
        <PublishedSlidesProvider initialSlides={initialSlides}>
          <EditorProvider
            initialSlides={initialSlides}
            initialSettings={initialSettings}
            initialCanvasSettings={initialCanvasSettings}
          >
            <TooltipProvider>
              <EditorShell
                onDemoSave={onDemoSave}
                onSave={onSave}
                saveButtonLabel={saveButtonLabel}
                showToaster={showToaster}
                className={className}
              />
            </TooltipProvider>
          </EditorProvider>
        </PublishedSlidesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default EditorLayout;