import {
  ArrowRight,
  Code2,
  Layers,
  MousePointerClick,
  Package,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEMO_SLIDES } from '@/lib/demoSlides';
import { Link } from 'react-router-dom';
import SliderRunner from '@/components/SliderRunner';

const FEATURES = [
  {
    icon: MousePointerClick,
    title: 'Drag & Drop Editor',
    description:
      'Visually place text, buttons, images, and boxes on your slides. No code required.',
  },
  {
    icon: Sparkles,
    title: 'Per-Element Animations',
    description:
      'Assign Framer Motion animations to each element independently with full control over timing and easing.',
  },
  {
    icon: Layers,
    title: 'Multi-Slide Management',
    description:
      'Add, reorder, duplicate, and delete slides from the layer panel. Full undo-friendly state.',
  },
  {
    icon: Code2,
    title: 'Export-Ready JSON',
    description:
      'Slides are plain JSON — export and embed them anywhere. Zero lock-in.',
  },
  {
    icon: Package,
    title: 'npm Package',
    description:
      'Install with a single command. Tree-shakable ESM + CJS, TypeScript types included.',
  },
  {
    icon: Zap,
    title: 'Lightweight Runtime',
    description:
      'SliderRunner is a tiny render-only component. Ship it without the editor overhead.',
  },
];

const Index = () => {
  const [autoPlay, setAutoPlay] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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
                Open Editor <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-5 text-xs px-3 py-1">
          v0.1.0 — Open Source
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
          Build beautiful sliders{' '}
          <span className="text-primary">visually</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-8">
          A drag-and-drop slider builder for React. Design in the editor,
          ship with{' '}
          <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
            SliderRunner
          </code>
          .
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/editor">
              Open Editor <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/docs">Read the Docs</Link>
          </Button>
        </div>

        {/* Install snippet */}
        <div className="mt-8 inline-flex items-center gap-3 bg-muted rounded-lg px-5 py-3 font-mono text-sm">
          <span className="text-muted-foreground select-none">$</span>
          <span>npm install modern-slider-pro</span>
        </div>
      </section>

      {/* Live Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">See it in action</h2>
          <p className="text-muted-foreground">
            Built entirely with the visual editor — no handwritten slide code.
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-5">
          <Button
            variant={autoPlay ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoPlay(true)}
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Auto Play
          </Button>
          <Button
            variant={!autoPlay ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoPlay(false)}
          >
            Manual
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden shadow-2xl border">
          <SliderRunner
            slides={DEMO_SLIDES}
            autoPlay={autoPlay}
            interval={5000}
            showDots
            showArrows
            height={420}
          />
        </div>

        <div className="text-center mt-5">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/demo">
              Full demo page <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From design to deployment, modern-slider-pro has you covered.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-background rounded-xl border p-6 flex flex-col gap-3"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Quick start</h2>
          <p className="text-muted-foreground">Up and running in minutes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Install',
              code: 'npm install modern-slider-pro',
            },
            {
              step: '02',
              title: 'Add the editor',
              code: `import { SliderEditor } from 'modern-slider-pro';
import 'modern-slider-pro/style.css';

<SliderEditor />`,
            },
            {
              step: '03',
              title: 'Embed the runner',
              code: `import { SliderRunner } from 'modern-slider-pro';

<SliderRunner slides={slides} autoPlay />`,
            },
          ].map(({ step, title, code }) => (
            <div
              key={step}
              className="rounded-xl border bg-background p-6 flex flex-col gap-3"
            >
              <span className="text-4xl font-black text-primary/20 leading-none">
                {step}
              </span>
              <h3 className="font-semibold">{title}</h3>
              <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild>
            <Link to="/docs">
              Full documentation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Open the editor and create your first slider in minutes — no sign-up required.
          </p>
          <Button size="lg" asChild>
            <Link to="/editor">
              Launch Editor <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-sm text-muted-foreground">
          <span>modern-slider-pro</span>
          <div className="flex items-center gap-4">
            <Link to="/demo" className="hover:text-foreground transition-colors">
              Demo
            </Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link to="/editor" className="hover:text-foreground transition-colors">
              Editor
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;