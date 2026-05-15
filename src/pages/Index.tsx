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
    <div className="msp-min-h-screen msp-bg-background msp-text-foreground">
      {/* Nav */}
      <header className="msp-border-b msp-sticky msp-top-0 msp-z-10 msp-bg-background/80 msp-backdrop-blur">
        <div className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-h-14 msp-flex msp-items-center msp-justify-between">
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
                Open Editor <ArrowRight className="msp-ml-1 msp-h-4 msp-w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-pt-20 msp-pb-16 msp-text-center">
        <Badge variant="secondary" className="msp-mb-5 msp-text-xs msp-px-3 msp-py-1">
          v0.1.0 — Open Source
        </Badge>
        <h1 className="msp-text-5xl sm:msp-text-6xl msp-font-extrabold msp-tracking-tight msp-mb-5 msp-leading-tight">
          Build beautiful sliders{' '}
          <span className="msp-text-primary">visually</span>
        </h1>
        <p className="msp-text-muted-foreground msp-text-xl msp-max-w-2xl msp-mx-auto msp-mb-8">
          A drag-and-drop slider builder for React. Design in the editor,
          ship with{' '}
          <code className="msp-text-sm msp-bg-muted msp-px-1.5 msp-py-0.5 msp-rounded msp-font-mono">
            SliderRunner
          </code>
          .
        </p>
        <div className="msp-flex msp-flex-wrap msp-items-center msp-justify-center msp-gap-3">
          <Button size="lg" asChild>
            <Link to="/editor">
              Open Editor <ArrowRight className="msp-ml-2 msp-h-4 msp-w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/docs">Read the Docs</Link>
          </Button>
        </div>

        {/* Install snippet */}
        <div className="msp-mt-8 msp-inline-flex msp-items-center msp-gap-3 msp-bg-muted msp-rounded-lg msp-px-5 msp-py-3 msp-font-mono msp-text-sm">
          <span className="msp-text-muted-foreground msp-select-none">$</span>
          <span>npm install modern-slider-pro</span>
        </div>
      </section>

      {/* Live Preview */}
      <section className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-pb-20">
        <div className="msp-text-center msp-mb-8">
          <h2 className="msp-text-2xl msp-font-bold msp-mb-2">See it in action</h2>
          <p className="msp-text-muted-foreground">
            Built entirely with the visual editor — no handwritten slide code.
          </p>
        </div>

        <div className="msp-flex msp-justify-center msp-gap-3 msp-mb-5">
          <Button
            variant={autoPlay ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoPlay(true)}
          >
            <Play className="msp-h-3.5 msp-w-3.5 msp-mr-1.5" />
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

        <div className="msp-rounded-xl msp-overflow-hidden msp-shadow-2xl msp-border">
          <SliderRunner
            slides={DEMO_SLIDES}
            autoPlay={autoPlay}
            interval={5000}
            showDots
            showArrows
            height={420}
          />
        </div>

        <div className="msp-text-center msp-mt-5">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/demo">
              Full demo page <ArrowRight className="msp-ml-1 msp-h-3.5 msp-w-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="msp-border-t msp-bg-muted/30">
        <div className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-py-20">
          <div className="msp-text-center msp-mb-12">
            <h2 className="msp-text-3xl msp-font-bold msp-mb-3">Everything you need</h2>
            <p className="msp-text-muted-foreground msp-text-lg msp-max-w-xl msp-mx-auto">
              From design to deployment, modern-slider-pro has you covered.
            </p>
          </div>
          <div className="msp-grid sm:msp-grid-cols-2 lg:msp-grid-cols-3 msp-gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="msp-bg-background msp-rounded-xl msp-border msp-p-6 msp-flex msp-flex-col msp-gap-3"
              >
                <div className="msp-h-10 msp-w-10 msp-rounded-lg msp-bg-primary/10 msp-flex msp-items-center msp-justify-center">
                  <Icon className="msp-h-5 msp-w-5 msp-text-primary" />
                </div>
                <h3 className="msp-font-semibold msp-text-base">{title}</h3>
                <p className="msp-text-sm msp-text-muted-foreground msp-leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-py-20">
        <div className="msp-text-center msp-mb-10">
          <h2 className="msp-text-3xl msp-font-bold msp-mb-3">Quick start</h2>
          <p className="msp-text-muted-foreground">Up and running in minutes.</p>
        </div>
        <div className="msp-grid md:msp-grid-cols-3 msp-gap-6">
          {[
            {
              step: '01',
              title: 'Install',
              code: 'msp-npm msp-install msp-modern-slider-pro',
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
              className="msp-rounded-xl msp-border msp-bg-background msp-p-6 msp-flex msp-flex-col msp-gap-3"
            >
              <span className="msp-text-4xl msp-font-black msp-text-primary/20 msp-leading-none">
                {step}
              </span>
              <h3 className="msp-font-semibold">{title}</h3>
              <pre className="msp-bg-muted msp-rounded-md msp-p-3 msp-text-xs msp-font-mono msp-overflow-x-auto msp-whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          ))}
        </div>
        <div className="msp-text-center msp-mt-8">
          <Button asChild>
            <Link to="/docs">
              Full documentation <ArrowRight className="msp-ml-2 msp-h-4 msp-w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="msp-border-t">
        <div className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-py-20 msp-text-center">
          <h2 className="msp-text-3xl msp-font-bold msp-mb-4">Ready to build?</h2>
          <p className="msp-text-muted-foreground msp-text-lg msp-mb-8 msp-max-w-lg msp-mx-auto">
            Open the editor and create your first slider in minutes — no sign-up required.
          </p>
          <Button size="lg" asChild>
            <Link to="/editor">
              Launch Editor <ArrowRight className="msp-ml-2 msp-h-4 msp-w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="msp-border-t">
        <div className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-h-14 msp-flex msp-items-center msp-justify-between msp-text-sm msp-text-muted-foreground">
          <span>modern-slider-pro</span>
          <div className="msp-flex msp-items-center msp-gap-4">
            <Link to="/demo" className="hover:msp-text-foreground msp-transition-colors">
              Demo
            </Link>
            <Link to="/docs" className="hover:msp-text-foreground msp-transition-colors">
              Docs
            </Link>
            <Link to="/editor" className="hover:msp-text-foreground msp-transition-colors">
              Editor
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;