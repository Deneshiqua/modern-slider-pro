import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react';

import SiteLayout from '@/components/SiteLayout';
import { SITE_CONTAINER_CLASS } from '@/components/siteContainer';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Tiny code block with copy-to-clipboard                                     */
/* -------------------------------------------------------------------------- */
const CodeBlock = ({ code, language = 'tsx' }: { code: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="msp-relative msp-group msp-rounded-lg msp-border msp-bg-[#0f172a] msp-text-sm msp-overflow-hidden">
            <div className="msp-flex msp-items-center msp-justify-between msp-px-4 msp-py-2 msp-border-b msp-border-white/10">
                <span className="msp-text-xs msp-text-slate-400 msp-font-mono">{language}</span>
                <button
                    onClick={handleCopy}
                    className="msp-flex msp-items-center msp-gap-1.5 msp-text-xs msp-text-slate-400 hover:msp-text-white msp-transition-colors"
                >
                    {copied ? <Check className="msp-h-3.5 msp-w-3.5" /> : <Copy className="msp-h-3.5 msp-w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="msp-p-4 msp-overflow-x-auto msp-text-slate-200 msp-font-mono msp-leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*  Section heading                                                             */
/* -------------------------------------------------------------------------- */
const SectionHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <h2 id={id} className="msp-text-2xl msp-font-bold msp-mt-14 msp-mb-4 msp-scroll-mt-20 msp-group msp-flex msp-items-center msp-gap-2">
        <a href={`#${id}`} className="msp-opacity-0 group-hover:msp-opacity-40 msp-text-foreground msp-no-underline msp-transition">
            #
        </a>
        {children}
    </h2>
);

const SubHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <h3 id={id} className="msp-text-lg msp-font-semibold msp-mt-8 msp-mb-3 msp-scroll-mt-20">
        {children}
    </h3>
);

/* -------------------------------------------------------------------------- */
/*  Prop table                                                                  */
/* -------------------------------------------------------------------------- */
const PropTable = ({
    rows,
}: {
    rows: { name: string; type: string; default?: string; description: string }[];
}) => (
    <div className="msp-overflow-x-auto">
        <table className="msp-w-full msp-text-sm msp-border msp-rounded-lg msp-overflow-hidden">
            <thead>
                <tr className="msp-bg-muted msp-text-left">
                    <th className="msp-px-4 msp-py-2 msp-font-semibold msp-w-36">Prop</th>
                    <th className="msp-px-4 msp-py-2 msp-font-semibold msp-w-44">Type</th>
                    <th className="msp-px-4 msp-py-2 msp-font-semibold msp-w-28">Default</th>
                    <th className="msp-px-4 msp-py-2 msp-font-semibold">Description</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={row.name} className={cn('border-t', i % 2 === 1 && 'bg-muted/30')}>
                        <td className="msp-px-4 msp-py-2 msp-font-mono msp-text-primary">{row.name}</td>
                        <td className="msp-px-4 msp-py-2 msp-font-mono msp-text-xs msp-text-amber-600 dark:msp-text-amber-400">{row.type}</td>
                        <td className="msp-px-4 msp-py-2 msp-font-mono msp-text-xs msp-text-muted-foreground">{row.default ?? '—'}</td>
                        <td className="msp-px-4 msp-py-2 msp-text-muted-foreground">{row.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Callout = ({ children }: { children: React.ReactNode }) => (
    <div className="msp-not-prose msp-mt-4 msp-rounded-lg msp-border msp-border-amber-200 msp-bg-amber-50 dark:msp-border-amber-900 dark:msp-bg-amber-950/30 msp-px-4 msp-py-3 msp-text-sm msp-text-amber-800 dark:msp-text-amber-300">
        {children}
    </div>
);

/* -------------------------------------------------------------------------- */
/*  Sidebar nav items                                                           */
/* -------------------------------------------------------------------------- */
const NAV = [
    { id: 'installation', label: 'Installation' },
    { id: 'quick-start', label: 'Quick Start' },
    { id: 'slider-editor', label: 'SliderEditor' },
    { id: 'slider-runner', label: 'SliderRunner' },
    { id: 'use-editor', label: 'useEditor Hook' },
    { id: 'theming', label: 'Theme & Language' },
    { id: 'media-picker', label: 'Media Picker' },
    { id: 'types', label: 'Types' },
    { id: 'styling', label: 'Styling' },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                        */
/* -------------------------------------------------------------------------- */
const DocsPage = () => {
    return (
        <SiteLayout>
            <div className={cn(SITE_CONTAINER_CLASS, 'msp-flex msp-gap-10 msp-py-10')}>
                {/* Sidebar */}
                <aside className="msp-hidden lg:msp-block msp-w-52 msp-shrink-0">
                    <nav className="msp-sticky msp-top-24 msp-space-y-1">
                        <p className="msp-text-xs msp-font-semibold msp-uppercase msp-tracking-wider msp-text-muted-foreground msp-mb-3">
                            On this page
                        </p>
                        {NAV.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="msp-block msp-text-sm msp-py-1 msp-text-muted-foreground hover:msp-text-foreground msp-transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="msp-min-w-0 msp-flex-1 msp-prose msp-prose-neutral dark:msp-prose-invert msp-max-w-none">
                    <div className="msp-not-prose msp-mb-10">
                        <h1 className="msp-text-4xl msp-font-bold msp-mb-3">Documentation</h1>
                        <p className="msp-text-muted-foreground msp-text-lg">
                            Embed the visual slider builder and lightweight runtime in your React app.
                        </p>
                    </div>

                    <SectionHeading id="installation">Installation</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        Install the package and its <strong>peer dependencies</strong>:
                    </p>
                    <CodeBlock language="bash" code={`npm install modern-slider-pro react react-dom framer-motion
# or
pnpm add modern-slider-pro react react-dom framer-motion`} />

                    <p className="msp-text-muted-foreground msp-mt-4 msp-mb-4">
                        Import the bundled CSS once in your app entry:
                    </p>
                    <CodeBlock language="tsx" code={`// main.tsx or index.tsx
import 'modern-slider-pro/style.css';`} />

                    <SectionHeading id="quick-start">Quick Start</SectionHeading>

                    <SubHeading id="qs-editor">Embed the editor and save project JSON</SubHeading>
                    <CodeBlock language="tsx" code={`import { SliderEditor } from 'modern-slider-pro';
import type { SliderEditorSavePayload } from 'modern-slider-pro';
import 'modern-slider-pro/style.css';

export default function App() {
  const handleSave = async (payload: SliderEditorSavePayload) => {
    await fetch('/api/sliders/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  return (
    <div style={{ height: '100vh' }}>
      <SliderEditor onSave={handleSave} saveButtonLabel="Save Slider" />
    </div>
  );
}`} />

                    <SubHeading id="qs-runner">Render from saved project data</SubHeading>
                    <CodeBlock language="tsx" code={`import { SliderRunner } from 'modern-slider-pro';
import type { SliderProject } from 'modern-slider-pro';
import 'modern-slider-pro/style.css';

import projectJson from './homepage-slider.json';

const project = projectJson as SliderProject;

export default function HeroSection() {
  return <SliderRunner project={project} width="100%" />;
}`} />

                    <Callout>
                        <strong>Tip:</strong> Use the toolbar <em>Export</em> button in the editor to download versioned JSON
                        ({'{ slides, settings, canvasSettings }'}). Pass it to <code className="msp-text-xs msp-bg-amber-100 dark:msp-bg-amber-900 msp-px-1 msp-rounded">SliderRunner</code> via the{' '}
                        <code className="msp-text-xs msp-bg-amber-100 dark:msp-bg-amber-900 msp-px-1 msp-rounded">project</code> prop.
                        Legacy slide-only arrays still work via <code className="msp-text-xs msp-bg-amber-100 dark:msp-bg-amber-900 msp-px-1 msp-rounded">slides</code>.
                    </Callout>

                    <SectionHeading id="slider-editor">SliderEditor</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        Full drag-and-drop editor. Mounts its own providers (theme, language, editor state, tooltips).
                        No wrapper setup required for the default experience.
                    </p>

                    <PropTable rows={[
                        { name: 'onSave', type: '(payload: SliderEditorSavePayload) => void | Promise<void>', description: 'Called when the user saves. Receives versioned project JSON.' },
                        { name: 'onDemoSave', type: '(slides: Slide[]) => void', description: 'Legacy callback — slides only, no settings/canvas.' },
                        { name: 'saveButtonLabel', type: 'string', description: 'Custom label for the save/export toolbar button.' },
                        { name: 'initialSlides', type: 'Slide[]', description: 'Pre-load slide data.' },
                        { name: 'initialSettings', type: 'SliderSettings', description: 'Pre-load slider playback settings.' },
                        { name: 'initialCanvasSettings', type: 'CanvasSettings', description: 'Pre-load canvas size, grid, rulers, height mode, etc.' },
                        { name: 'onOpenMediaPicker', type: 'MediaPickerHandler', description: 'Replace the built-in media library with your own file manager.' },
                        { name: 'language', type: "'en' | 'tr'", description: 'Controlled UI language.' },
                        { name: 'defaultLanguage', type: "'en' | 'tr'", description: 'Initial language when uncontrolled.' },
                        { name: 'onLanguageChange', type: '(lang) => void', description: 'Fired when the user changes language in settings.' },
                        { name: 'theme', type: "'light' | 'dark'", description: 'Controlled theme.' },
                        { name: 'defaultTheme', type: "'light' | 'dark'", default: 'system', description: 'Initial theme when uncontrolled. Defaults to system preference.' },
                        { name: 'onThemeChange', type: '(theme) => void', description: 'Fired when the user toggles theme.' },
                        { name: 'themeStorageKey', type: 'string', default: 'msp-theme', description: 'localStorage key for persisting an explicit theme choice.' },
                        { name: 'useSystemTheme', type: 'boolean', default: 'true', description: 'Follow OS light/dark until the user picks a theme.' },
                        { name: 'showToaster', type: 'boolean', default: 'true', description: 'Show in-editor toast notifications (clipboard, etc.).' },
                        { name: 'className', type: 'string', description: 'Extra class on the editor root shell.' },
                    ]} />

                    <SubHeading id="save-payload">Save payload</SubHeading>
                    <CodeBlock language="ts" code={`type SliderEditorSavePayload = {
  version: 1;
  slides: Slide[];
  settings: SliderSettings;
  canvasSettings: CanvasSettings;
};`} />

                    <SectionHeading id="slider-runner">SliderRunner</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        Lightweight display-only component. Renders slides with entrance animations, slide transitions,
                        progress bar, arrows, dots, and responsive scaling. Pauses autoplay while hovered.
                    </p>

                    <PropTable rows={[
                        { name: 'project', type: 'SliderProject', description: 'Preferred — full exported project (slides + settings + canvas).' },
                        { name: 'slides', type: 'Slide[]', description: 'Legacy slide-only data when no project is provided.' },
                        { name: 'autoPlay', type: 'boolean', description: 'Overrides project/settings autoplay when set.' },
                        { name: 'interval', type: 'number', description: 'Autoplay interval in milliseconds (overrides settings when set). Settings store seconds.' },
                        { name: 'showDots', type: 'boolean', description: 'Overrides project dot navigation setting.' },
                        { name: 'showArrows', type: 'boolean', description: 'Overrides project arrow navigation setting.' },
                        { name: 'showProgressBar', type: 'boolean', description: 'Overrides project progress bar setting.' },
                        { name: 'width', type: 'string | number', default: '100%', description: 'Container width. With project, defaults to canvas width logic.' },
                        { name: 'height', type: 'string | number', description: 'Explicit height — mainly for fixed canvasHeightMode or legacy slides prop.' },
                        { name: 'viewMode', type: "'desktop' | 'tablet' | 'mobile'", default: 'desktop', description: 'Which responsive element overrides to apply.' },
                        { name: 'onSlideChange', type: '(index: number) => void', description: 'Called when the active slide index changes.' },
                    ]} />

                    <SubHeading id="runner-height">Site height behavior</SubHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        When using <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">project</code>, outer height comes from{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">canvasSettings.canvasHeightMode</code>:
                    </p>
                    <PropTable rows={[
                        { name: 'fixed', type: '—', description: 'Always use canvasHeight (px).' },
                        { name: 'responsive', type: '—', description: 'Width 100%, aspect ratio from canvas dimensions, max-height = canvasHeight.' },
                        { name: 'fitBackground', type: '—', description: 'When background image uses contain, height follows image aspect ratio up to canvasHeight.' },
                    ]} />

                    <SectionHeading id="use-editor">useEditor Hook</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        For custom UIs, wrap children with <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">EditorProvider</code>{' '}
                        (or use the built-in <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">SliderEditor</code> shell).
                    </p>

                    <CodeBlock language="tsx" code={`import { EditorProvider, SliderEditor, useEditor } from 'modern-slider-pro';

function SaveButton() {
  const { slides, settings, canvasSettings } = useEditor();

  const handleSave = () => {
    const payload = { version: 1 as const, slides, settings, canvasSettings };
    localStorage.setItem('my-slider', JSON.stringify(payload));
  };

  return <button onClick={handleSave}>Save</button>;
}

export default function App() {
  return (
    <EditorProvider>
      <SliderEditor showToaster={false} />
      <SaveButton />
    </EditorProvider>
  );
}`} />

                    <SubHeading id="use-editor-state">State</SubHeading>
                    <PropTable rows={[
                        { name: 'slides', type: 'Slide[]', description: 'All slides in the project.' },
                        { name: 'currentSlideIndex', type: 'number', description: 'Active slide index.' },
                        { name: 'selectedElementId', type: 'string | null', description: 'Primary selected element.' },
                        { name: 'selectedElementIds', type: 'string[]', description: 'Multi-selection IDs.' },
                        { name: 'settings', type: 'SliderSettings', description: 'Autoplay, arrows, dots, transitions, progress bar, etc.' },
                        { name: 'canvasSettings', type: 'CanvasSettings', description: 'Canvas size, grid, rulers, timeline panel, height mode.' },
                        { name: 'viewMode', type: 'ViewMode', description: 'desktop | tablet | mobile canvas viewport.' },
                        { name: 'isPlaying', type: 'boolean', description: 'Toolbar preview mode active.' },
                        { name: 'isDirty', type: 'boolean', description: 'Unsaved changes since last save marker.' },
                        { name: 'canUndo / canRedo', type: 'boolean', description: 'History availability (per-slide + global stacks).' },
                        { name: 'canResetSlide', type: 'boolean', description: 'Active slide can be reset to session baseline.' },
                    ]} />

                    <SubHeading id="use-editor-actions">Common actions</SubHeading>
                    <PropTable rows={[
                        { name: 'addSlide()', type: '() => void', description: 'Append a blank slide.' },
                        { name: 'removeSlide(id)', type: '(id: string) => void', description: 'Delete a slide.' },
                        { name: 'setCurrentSlide(index)', type: '(index: number) => void', description: 'Switch active slide.' },
                        { name: 'addElement(type)', type: '(type: ElementType) => void', description: 'Add text, image, video, button, or box to the active slide.' },
                        { name: 'updateElement(id, updates)', type: '(id, Partial<EditorElement>) => void', description: 'Patch element properties.' },
                        { name: 'updateElementForMode(id, updates, mode?)', type: '—', description: 'Patch desktop/tablet/mobile responsive overrides.' },
                        { name: 'removeElement(id)', type: '(id: string) => void', description: 'Remove element from the active slide tree.' },
                        { name: 'loadSlides(slides)', type: '(slides: Slide[]) => void', description: 'Replace all slides (e.g. JSON import).' },
                        { name: 'updateSettings(patch)', type: '(Partial<SliderSettings>) => void', description: 'Update global slider settings.' },
                        { name: 'updateCanvasSettings(patch)', type: '(Partial<CanvasSettings>) => void', description: 'Update canvas configuration.' },
                        { name: 'undo() / redo()', type: '() => void', description: 'History navigation.' },
                        { name: 'resetActiveSlide()', type: '() => void', description: 'Revert active slide to first-edit baseline.' },
                        { name: 'groupSelectedElements()', type: '() => void', description: 'Group current selection into a box.' },
                        { name: 'setResponsiveViewport(mode)', type: '(ViewMode) => void', description: 'Sync toolbar viewport + property mode.' },
                    ]} />

                    <Callout>
                        The full <code className="msp-text-xs msp-bg-amber-100 dark:msp-bg-amber-900 msp-px-1 msp-rounded">useEditor()</code> API
                        also exposes layer ordering, clipboard, timeline preview, slide background/overlay helpers, and zoom controls.
                        See exported TypeScript types in the package for every method.
                    </Callout>

                    <SectionHeading id="theming">Theme &amp; Language</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">SliderEditor</code> includes{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">ThemeProvider</code> and{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">LanguageProvider</code> internally.
                        For host apps building custom chrome, export and compose them:
                    </p>
                    <CodeBlock language="tsx" code={`import {
  ThemeProvider,
  LanguageProvider,
  SliderEditor,
  useTheme,
  useLanguage,
} from 'modern-slider-pro';

export function App() {
  return (
    <ThemeProvider storageKey="msp-theme" useSystemTheme attachThemeClassToHtml>
      <LanguageProvider storageKey="msp-language">
        <SliderEditor />
      </LanguageProvider>
    </ThemeProvider>
  );
}`} />
                    <p className="msp-text-muted-foreground msp-mt-4 msp-mb-4">
                        Supported languages: <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">en</code>,{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">tr</code>.
                        Pass <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">translationsOverride</code> on{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">LanguageProvider</code> to customize strings.
                        Until the user explicitly changes theme or language, defaults follow the OS / browser preference.
                    </p>

                    <SectionHeading id="media-picker">Media Picker</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        By default the editor can use a built-in Supabase media library when env vars are configured.
                        For production apps, wire your own asset manager:
                    </p>
                    <CodeBlock language="tsx" code={`import type { MediaPickerHandler, MediaPickerRequest } from 'modern-slider-pro';

const openMediaPicker: MediaPickerHandler = (request: MediaPickerRequest) => {
  // Open your file manager UI, then call:
  request.onSelect('https://cdn.example.com/hero.jpg');
};

<SliderEditor onOpenMediaPicker={openMediaPicker} />`} />
                    <p className="msp-text-muted-foreground msp-mt-4 msp-mb-4">
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">request.purpose</code> is{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">'image'</code> or{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">'video'</code>.
                        Call <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">request.onCancel()</code> if the user dismisses the picker.
                    </p>

                    <SectionHeading id="types">Types</SectionHeading>

                    <SubHeading id="types-project">SliderProject</SubHeading>
                    <CodeBlock language="ts" code={`interface SliderProject {
  version: 1;
  slides: Slide[];
  settings: SliderSettings;
  canvasSettings: CanvasSettings;
}`} />

                    <SubHeading id="types-slide">Slide</SubHeading>
                    <CodeBlock language="ts" code={`interface Slide {
  id: string;
  backgroundColor: string;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundType: 'color' | 'image' | 'video';
  background: string;              // legacy mirror of active background value
  backgroundFit?: 'cover' | 'contain' | 'fill' | 'none';
  overlayEnabled?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;         // 0–1
  elements: EditorElement[];
  timeline?: { duration: number }; // slide timeline length (seconds)
}`} />

                    <SubHeading id="types-element">EditorElement</SubHeading>
                    <CodeBlock language="ts" code={`interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'box' | 'video';
  name?: string;
  content: string;                 // text/HTML, label, or media URL
  x: number;
  y: number;
  rotation?: number;
  isLocked?: boolean;
  isVisible?: boolean;
  style: React.CSSProperties & { objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' };
  hoverStyle?: Partial<Pick<React.CSSProperties, 'backgroundColor' | 'color' | /* border colors */>>;
  responsive?: Partial<Record<'desktop' | 'tablet' | 'mobile', {
    x?: number; y?: number; rotation?: number; style?: object; hoverStyle?: object;
  }>>;
  animation?: AnimationConfig;
  timelineClip?: { start: number; end: number };
  children?: EditorElement[];
  isGroup?: boolean;
}`} />

                    <SubHeading id="types-settings">SliderSettings</SubHeading>
                    <CodeBlock language="ts" code={`interface SliderSettings {
  autoPlay: boolean;
  interval: number;                // seconds
  loop: boolean;
  showArrows: boolean;
  showDots: boolean;
  showProgressBar: boolean;
  progressBarColor: string;
  progressBarOpacity: number;        // 0–1
  progressBarTrackOpacity: number;
  progressBarScope: 'perSlide' | 'allSlides';
  progressBarHeight: number;       // 1–5 px
  slideTransitionEnabled: boolean;
  slideTransition: 'none' | 'fade' | 'slide' | 'slideUp' | 'zoom';
  slideTransitionDuration: number;   // seconds
}`} />

                    <SubHeading id="types-canvas">CanvasSettings</SubHeading>
                    <CodeBlock language="ts" code={`interface CanvasSettings {
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToElements: boolean;
  showCenterGuides: boolean;
  showTimeline: boolean;
  canvasWidth: number;
  canvasHeight: number;
  canvasHeightMode?: 'fixed' | 'responsive' | 'fitBackground';
}`} />

                    <SubHeading id="types-constants">Exported constants &amp; helpers</SubHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        Useful when building custom tooling around the same data model:
                    </p>
                    <CodeBlock language="ts" code={`import {
  DEFAULT_SLIDE,
  DEFAULT_SLIDER_SETTINGS,
  DEFAULT_CANVAS_SETTINGS,
  ANIMATION_PRESETS,
  resolveRunnerContainerStyle,
  normalizeSliderSettings,
  getSlideBackgroundFit,
  getSlideOverlayStyle,
} from 'modern-slider-pro';`} />

                    <SectionHeading id="styling">Styling</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        All internal Tailwind classes use the <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">msp-</code> prefix
                        (e.g. <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">msp-flex</code>) so they do not clash with your app CSS.
                        Theme variables are scoped under <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">.msp-slider-pro</code> — you do not need
                        to patch your global <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">:root</code> theme.
                    </p>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        Import the compiled stylesheet once:
                    </p>
                    <CodeBlock language="tsx" code={`import 'modern-slider-pro/style.css';`} />
                    <p className="msp-text-muted-foreground msp-mt-4 msp-mb-4">
                        No <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">tailwind.config</code> changes are required in the host app.
                        Portaled UI (dialogs, selects, menus) uses elevated z-index tokens so overlays work inside embedded layouts.
                    </p>
                </main>
            </div>
        </SiteLayout>
    );
};

export default DocsPage;
