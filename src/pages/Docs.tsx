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
        <div className="relative group rounded-lg border bg-[#0f172a] text-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <span className="text-xs text-slate-400 font-mono">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-200 font-mono leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*  Section heading                                                             */
/* -------------------------------------------------------------------------- */
const SectionHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <h2 id={id} className="text-2xl font-bold mt-14 mb-4 scroll-mt-20 group flex items-center gap-2">
        <a href={`#${id}`} className="opacity-0 group-hover:opacity-40 text-foreground no-underline transition">
            #
        </a>
        {children}
    </h2>
);

const SubHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <h3 id={id} className="text-lg font-semibold mt-8 mb-3 scroll-mt-20">
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
    <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead>
                <tr className="bg-muted text-left">
                    <th className="px-4 py-2 font-semibold w-36">Prop</th>
                    <th className="px-4 py-2 font-semibold w-44">Type</th>
                    <th className="px-4 py-2 font-semibold w-28">Default</th>
                    <th className="px-4 py-2 font-semibold">Description</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={row.name} className={cn('border-t', i % 2 === 1 && 'bg-muted/30')}>
                        <td className="px-4 py-2 font-mono text-primary">{row.name}</td>
                        <td className="px-4 py-2 font-mono text-xs text-amber-600 dark:text-amber-400">{row.type}</td>
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{row.default ?? '—'}</td>
                        <td className="px-4 py-2 text-muted-foreground">{row.description}</td>
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
        <div className="min-h-screen bg-background text-foreground">
            {/* Top nav */}
            <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link to="/" className="font-bold text-lg tracking-tight">
                        modern-slider-pro
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/demo">Demo</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/docs">Docs</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link to="/editor">
                                Open Editor <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 flex gap-10 py-10">
                {/* Sidebar */}
                <aside className="hidden lg:block w-52 shrink-0">
                    <nav className="sticky top-24 space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            On this page
                        </p>
                        {NAV.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="block text-sm py-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="min-w-0 flex-1 prose prose-neutral dark:prose-invert max-w-none">
                    {/* Hero */}
                    <div className="not-prose mb-10">
                        <h1 className="text-4xl font-bold mb-3">Documentation</h1>
                        <p className="text-muted-foreground text-lg">
                            Everything you need to embed a visual slider builder and runner in your React project.
                        </p>
                    </div>

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="installation">Installation</SectionHeading>
                    <p className="text-muted-foreground mb-4">Install the package and its peer dependencies:</p>
                    <CodeBlock language="bash" code={`npm install modern-slider-pro framer-motion
# or
pnpm add modern-slider-pro framer-motion
# or
yarn add modern-slider-pro framer-motion`} />

                    <p className="text-muted-foreground mt-4 mb-4">Import the bundled CSS in your app's entry file:</p>
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
                    <p className="text-muted-foreground mb-4">
                        A fully self-contained visual editor. It manages its own state internally via{' '}
                        <code className="text-xs bg-muted px-1 rounded">EditorProvider</code>.
                    </p>

                    <PropTable rows={[
                        { name: '—', type: '—', description: 'No props required. The editor is fully self-contained.' },
                    ]} />

                    <div className="not-prose mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                        <strong>Tip:</strong> Use the toolbar's <em>Export</em> button to download your slides as a JSON file,
                        then feed it to <code className="text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded">SliderRunner</code>.
                    </div>

                    {/* ---------------------------------------------------------------- */}
                    <SectionHeading id="slider-runner">SliderRunner</SectionHeading>
                    <p className="text-muted-foreground mb-4">
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
                    <p className="text-muted-foreground mb-4">
                        Access and mutate editor state from any component inside{' '}
                        <code className="text-xs bg-muted px-1 rounded">{'<EditorProvider>'}</code>.
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
                    <p className="text-muted-foreground mb-4">
                        The editor and runner use <strong>Tailwind CSS</strong> classes internally. The compiled CSS is
                        included in <code className="text-xs bg-muted px-1 rounded">dist/style.css</code>.
                    </p>

                    <p className="text-muted-foreground mb-4">
                        If your project already uses Tailwind, you can skip importing the CSS file and instead add
                        the package to your <code className="text-xs bg-muted px-1 rounded">content</code> paths so
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

                    <div className="not-prose mt-12 pt-8 border-t text-sm text-muted-foreground flex justify-between items-center">
                        <span>modern-slider-pro — MIT License</span>
                        <div className="flex gap-4">
                            <Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link>
                            <Link to="/" className="hover:text-foreground transition-colors">Editor</Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DocsPage;
