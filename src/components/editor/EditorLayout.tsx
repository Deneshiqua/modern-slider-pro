import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { toast, Toaster } from 'sonner';

import Canvas from './Canvas';
import { EditorProvider, useEditor } from '@/context/EditorContext';
import LayerPanel from './LayerPanel';
import { CanvasViewportProvider } from '@/context/CanvasViewportContext';
import { SlideTimelinePlaybackProvider } from '@/context/SlideTimelinePlaybackContext';
import { SnapGuidesProvider } from '@/context/SnapGuidesContext';
import { Language } from '@/lib/translations';
import { LanguageProvider, TranslationDictionary, useLanguage, type TranslationKey } from '@/context/LanguageContext';
import PropertiesPanel from './PropertiesPanel';
import { PublishedSlidesProvider } from '@/context/PublishedSlidesContext';
import Sidebar from './Sidebar';
import { Theme, ThemeProvider, useTheme } from '@/context/ThemeContext';
import Toolbar from './Toolbar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useDirtyReloadGuard } from '@/hooks/useDirtyReloadGuard';
import { CanvasSettings, Slide, SliderEditorSavePayload, SliderSettings } from '@/types/editor';
import { cn } from '@/lib/utils';

const SlideTimelinePanel = React.lazy(() => import('./SlideTimelinePanel'));

const CLIPBOARD_FEEDBACK_MS = 2200;

const toastClipboardAction = (
  kind: 'copy' | 'cut' | 'paste',
  count: number,
  t: (key: TranslationKey | string) => string,
) => {
  if (count <= 0) return;
  let message: string;
  if (count === 1) {
    message = t(
      kind === 'copy'
        ? 'editor.clipboard.copiedOne'
        : kind === 'cut'
          ? 'editor.clipboard.cutOne'
          : 'editor.clipboard.pastedOne',
    );
  } else {
    const manyKey =
      kind === 'copy'
        ? 'editor.clipboard.copiedMany'
        : kind === 'cut'
          ? 'editor.clipboard.cutMany'
          : 'editor.clipboard.pastedMany';
    message = t(manyKey).replace(/\{count\}/g, String(count));
  }
  toast.success(message, { duration: CLIPBOARD_FEEDBACK_MS });
};

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

const TimelinePanelSlot = () => {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setReady(true), { timeout: 1200 });
      return () => cancelIdleCallback(id);
    }
    const t = globalThis.setTimeout(() => setReady(true), 80);
    return () => globalThis.clearTimeout(t);
  }, []);

  if (!ready) {
    return <div className="msp-h-full msp-min-h-0 msp-bg-muted/30" aria-hidden />;
  }

  return (
    <React.Suspense fallback={<div className="msp-h-full msp-min-h-0 msp-bg-muted/30" aria-hidden />}>
      <SlideTimelinePanel />
    </React.Suspense>
  );
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
  const {
    canRedo,
    canUndo,
    canvasSettings,
    isDirty,
    isPlaying,
    redo,
    undo,
    copySelectionToClipboard,
    cutSelectionToClipboard,
    pasteClipboardElements,
    selectAllRootElements,
  } = useEditor();

  const showTimeline = canvasSettings.showTimeline !== false;

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
      if (isPlaying) return;

      const key = event.key.toLowerCase();
      const usesModifier = event.ctrlKey || event.metaKey;
      const wantsUndo = usesModifier && key === 'z' && !event.shiftKey;
      const wantsRedo = usesModifier && (key === 'y' || (key === 'z' && event.shiftKey));
      const wantsCopy = usesModifier && key === 'c' && !event.shiftKey;
      const wantsCut = usesModifier && key === 'x' && !event.shiftKey;
      const wantsPaste = usesModifier && key === 'v' && !event.shiftKey;
      const wantsSelectAll = usesModifier && key === 'a' && !event.shiftKey;

      if (wantsSelectAll) {
        event.preventDefault();
        selectAllRootElements();
        return;
      }

      if (wantsCopy) {
        const n = copySelectionToClipboard();
        if (n > 0) {
          event.preventDefault();
          toastClipboardAction('copy', n, t);
        }
        return;
      }
      if (wantsCut) {
        const n = cutSelectionToClipboard();
        if (n > 0) {
          event.preventDefault();
          toastClipboardAction('cut', n, t);
        }
        return;
      }
      if (wantsPaste) {
        const n = pasteClipboardElements();
        if (n > 0) {
          event.preventDefault();
          toastClipboardAction('paste', n, t);
        }
        return;
      }

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
  }, [
    canRedo,
    canUndo,
    copySelectionToClipboard,
    cutSelectionToClipboard,
    isPlaying,
    pasteClipboardElements,
    redo,
    selectAllRootElements,
    t,
    undo,
  ]);

  return (
    <div
      className={cn(
        'msp-slider-pro msp-flex msp-flex-col msp-h-full msp-w-full msp-min-h-0 msp-overflow-hidden msp-bg-background msp-text-foreground',
        theme === 'dark' ? 'msp-dark dark' : 'msp-light',
        className,
      )}
    >
      {showToaster && <Toaster theme={theme} />}
      <Toolbar onDemoSave={onDemoSave} onSave={onSave} saveButtonLabel={saveButtonLabel} />
      <div className="msp-flex msp-flex-1 msp-min-h-0 msp-min-w-0 msp-overflow-hidden">
        <Sidebar />
        <ResizablePanelGroup direction="horizontal" className="msp-flex-1 msp-min-h-0 msp-min-w-0">
          <ResizablePanel
            defaultSize={75}
            minSize={45}
            className="msp-flex msp-h-full msp-min-h-0 msp-min-w-0 msp-flex-col msp-overflow-hidden"
          >
            <ResizablePanelGroup direction="vertical" className="msp-h-full msp-min-h-0">
              <ResizablePanel
                defaultSize={showTimeline ? 72 : 100}
                minSize={showTimeline ? 40 : 100}
                className="msp-flex msp-min-h-0 msp-flex-col msp-overflow-hidden"
              >
                <Canvas />
              </ResizablePanel>
              {showTimeline && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel
                    defaultSize={28}
                    minSize={15}
                    maxSize={45}
                    className="msp-min-h-0 msp-overflow-hidden"
                  >
                    <TimelinePanelSlot />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle className="msp-w-1.5 msp-bg-border hover:msp-bg-primary/20 msp-transition-colors" />

          <ResizablePanel
            defaultSize={25}
            minSize={18}
            maxSize={50}
            className="msp-min-h-0 msp-min-w-0 msp-border-l msp-bg-card"
          >
            <ResizablePanelGroup direction="vertical" className="msp-h-full">

              <ResizablePanel defaultSize={35} minSize={10}>
                <LayerPanel />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={65} minSize={20}>
                <PropertiesPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
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
      attachThemeClassToHtml
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
            <SnapGuidesProvider>
            <CanvasViewportProvider>
            <SlideTimelinePlaybackProvider>
            <TooltipProvider>
              <EditorShell
                onDemoSave={onDemoSave}
                onSave={onSave}
                saveButtonLabel={saveButtonLabel}
                showToaster={showToaster}
                className={className}
              />
            </TooltipProvider>
            </SlideTimelinePlaybackProvider>
            </CanvasViewportProvider>
            </SnapGuidesProvider>
          </EditorProvider>
        </PublishedSlidesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default EditorLayout;