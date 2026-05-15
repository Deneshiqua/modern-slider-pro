import { Check, ChevronRight, Copy } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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

/* -------------------------------------------------------------------------- */
/*  Sidebar nav items                                                           */
/* -------------------------------------------------------------------------- */
const NAV = [
    { id: 'installation', label: 'Installation' },
    { id: 'quick-start', label: 'Quick Start' },
    { id: 'slider-editor', label: 'SliderEditor' },
    { id: 'slider-runner', label: 'SliderRunner' },
    { id: 'use-editor', label: 'useEditor Hook' },
    { id: 'types', label: 'Types' },
    { id: 'styling', label: 'Styling' },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                        */
/* -------------------------------------------------------------------------- */
const DocsPage = () => {
    return (
        <div className="msp-min-h-screen msp-bg-background msp-text-foreground">
            {/* Top nav */}
            <header className="msp-border-b msp-sticky msp-top-0 msp-z-10 msp-bg-background/80 msp-backdrop-blur">
                <div className="msp-max-w-7xl msp-mx-auto msp-px-6 msp-h-14 msp-flex msp-items-center msp-justify-between">
                    <Link to="/" className="msp-font-bold msp-text-lg msp-tracking-tight">
                        modern-slider-pro
                    </Link>
                    <nav className="msp-flex msp-items-center msp-gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/demo">Demo</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/docs">Docs</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link to="/editor">
                                Open Editor <ChevronRight className="msp-ml-1 msp-h-4 msp-w-4" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <div className="msp-max-w-7xl msp-mx-auto msp-px-6 msp-flex msp-gap-10 msp-py-10">
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
                    {/* Hero */}
                    <div className="msp-not-prose msp-mb-10">
                        <h1 className="msp-text-4xl msp-font-bold msp-mb-3">Documentation</h1>
                        <p className="msp-text-muted-foreground msp-text-lg">
                            Everything you need to embed a visual slider builder and runner in your React project.
                        </p>
                    </div>

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="installation">Installation</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">Install the package and its peer dependencies:</p>
                    <CodeBlock language="bash" code={`npm install modern-slider-pro framer-motion
# or
pnpm add modern-slider-pro framer-motion
# or
yarn add modern-slider-pro framer-motion`} />

                    <p className="msp-text-muted-foreground msp-mt-4 msp-mb-4">Import the bundled CSS in your app's entry file:</p>
                    <CodeBlock language="tsx" code={`// main.tsx or index.tsx
import 'modern-slider-pro/style.css';`} />

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="quick-start">Quick Start</SectionHeading>

                    <SubHeading id="qs-editor">Embed the full editor</SubHeading>
                    <CodeBlock language="tsx" code={`import { SliderEditor } from 'modern-slider-pro';
import 'modern-slider-pro/style.css';

export default function App() {
  return (
    <div style={{ height: '100vh' }}>
      <SliderEditor />
    </div>
  );
}`} />

                    <SubHeading id="qs-runner">Render a slider from saved data</SubHeading>
                    <CodeBlock language="tsx" code={`import { SliderRunner } from 'modern-slider-pro';
import type { Slide } from 'modern-slider-pro';
import 'modern-slider-pro/style.css';

// slides JSON exported from the editor
import slidesData from './my-slides.json';

export default function HeroSection() {
  return (
    <SliderRunner
      slides={slidesData as Slide[]}
      autoPlay
      interval={5000}
      height="500px"
    />
  );
}`} />

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="slider-editor">SliderEditor</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        A fully self-contained visual editor. It manages its own state internally via{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">EditorProvider</code>.
                    </p>

                    <PropTable rows={[
                        { name: '—', type: '—', description: 'No props required. The editor is fully self-contained.' },
                    ]} />

                    <div className="msp-not-prose msp-mt-4 msp-rounded-lg msp-border msp-border-amber-200 msp-bg-amber-50 dark:msp-border-amber-900 dark:msp-bg-amber-950/30 msp-px-4 msp-py-3 msp-text-sm msp-text-amber-800 dark:msp-text-amber-300">
                        <strong>Tip:</strong> Use the toolbar's <em>Export</em> button to download your slides as a JSON file,
                        then feed it to <code className="msp-text-xs msp-bg-amber-100 dark:msp-bg-amber-900 msp-px-1 msp-rounded">SliderRunner</code>.
                    </div>

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="slider-runner">SliderRunner</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        Lightweight display-only component. Renders slides with full animation support.
                    </p>

                    <PropTable rows={[
                        { name: 'slides', type: 'Slide[]', description: 'Array of slide objects (exported from the editor or defined in code).' },
                        { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Automatically advance to the next slide.' },
                        { name: 'interval', type: 'number', default: '5000', description: 'Auto-play interval in milliseconds.' },
                        { name: 'width', type: 'string | number', default: '"100%"', description: 'CSS width of the slider container.' },
                        { name: 'height', type: 'string | number', default: '"600px"', description: 'CSS height of the slider container.' },
                    ]} />

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="use-editor">useEditor Hook</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        Access and mutate editor state from any component inside{' '}
                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">{'<EditorProvider>'}</code>.
                    </p>

                    <CodeBlock language="tsx" code={`import { EditorProvider, useEditor } from 'modern-slider-pro';

function SaveButton() {
  const { slides } = useEditor();

  const handleSave = () => {
    localStorage.setItem('my-slides', JSON.stringify(slides));
  };

  return <button onClick={handleSave}>Save</button>;
}

export default function App() {
  return (
    <EditorProvider>
      {/* SliderEditor renders the canvas internally */}
      <SaveButton />
    </EditorProvider>
  );
}`} />

                    <SubHeading id="use-editor-api">Available values &amp; methods</SubHeading>
                    <PropTable rows={[
                        { name: 'slides', type: 'Slide[]', description: 'All slides in the current project.' },
                        { name: 'currentSlideIndex', type: 'number', description: 'Index of the active slide.' },
                        { name: 'selectedElementId', type: 'string | null', description: 'ID of the currently selected element.' },
                        { name: 'settings', type: 'SliderSettings', description: 'Global slider playback settings.' },
                        { name: 'addSlide()', type: '() => void', description: 'Append a new blank slide.' },
                        { name: 'removeSlide(id)', type: '(id: string) => void', description: 'Delete a slide by ID.' },
                        { name: 'setCurrentSlide(index)', type: '(index: number) => void', description: 'Navigate to a slide.' },
                        { name: 'addElement(type)', type: '(type: ElementType) => void', description: 'Add an element to the active slide.' },
                        { name: 'updateElement(id, updates)', type: '(id, Partial<EditorElement>) => void', description: 'Update element properties.' },
                        { name: 'removeElement(id)', type: '(id: string) => void', description: 'Remove an element from the active slide.' },
                        { name: 'loadSlides(slides)', type: '(slides: Slide[]) => void', description: 'Replace all slides (e.g. load from JSON).' },
                    ]} />

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="types">Types</SectionHeading>

                    <SubHeading id="types-slide">Slide</SubHeading>
                    <CodeBlock language="ts" code={`interface Slide {
  id: string;
  backgroundColor: string;    // hex / rgb
  backgroundImage: string;    // URL
  backgroundVideo: string;    // URL
  backgroundType: 'color' | 'image' | 'video';
  background: string;         // legacy (same as active value)
  elements: EditorElement[];
}`} />

                    <SubHeading id="types-element">EditorElement</SubHeading>
                    <CodeBlock language="ts" code={`interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'box' | 'video';
  content: string;          // text content or media URL
  x: number;                // px from left
  y: number;                // px from top
  style: React.CSSProperties & {
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  };
  animation?: AnimationConfig;
  children?: EditorElement[];
}`} />

                    <SubHeading id="types-animation">AnimationConfig</SubHeading>
                    <CodeBlock language="ts" code={`interface AnimationConfig {
  name: string;
  initial: TargetAndTransition | VariantLabels | boolean;
  animate: TargetAndTransition | VariantLabels | boolean;
  transition: Transition;  // framer-motion Transition
}`} />

                    <SubHeading id="types-settings">SliderSettings</SubHeading>
                    <CodeBlock language="ts" code={`interface SliderSettings {
  autoPlay: boolean;
  interval: number;   // seconds
  loop: boolean;
  showArrows: boolean;
  showDots: boolean;
}`} />

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="styling">Styling</SectionHeading>
                    <p className="msp-text-muted-foreground msp-mb-4">
                        The editor and runner use <strong>Tailwind CSS</strong> classes internally. The compiled CSS is
                        included in <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">dist/style.css</code>.
                    </p>

                    <p className="msp-text-muted-foreground msp-mb-4">
                        If your project already uses Tailwind, you can skip importing the CSS file and instead add
                        the package to your <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">content</code> paths so
                        your build picks up the classes:
                    </p>

                    <CodeBlock language="js" code={`// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/modern-slider-pro/dist/**/*.{js,mjs}',
  ],
  // ...
};`} />

                    <div className="msp-not-prose msp-mt-12 msp-pt-8 msp-border-t msp-text-sm msp-text-muted-foreground msp-flex msp-justify-between msp-items-center">
                        <span>modern-slider-pro — MIT License</span>
                        <div className="msp-flex msp-gap-4">
                            <Link to="/demo" className="hover:msp-text-foreground msp-transition-colors">Demo</Link>
                            <Link to="/" className="hover:msp-text-foreground msp-transition-colors">Editor</Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DocsPage;
