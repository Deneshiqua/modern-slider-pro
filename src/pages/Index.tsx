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
import React, { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SiteLayout from '@/components/SiteLayout';
import { SITE_CONTAINER_CLASS } from '@/components/siteContainer';
import { APP_VERSION } from '@/lib/appVersion';
import { DEMO_SLIDES } from '@/lib/demoSlides';
import { Link } from 'react-router-dom';
import SliderRunner from '@/components/SliderRunner';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const FEATURE_KEYS = [
  { icon: MousePointerClick, titleKey: 'home.features.dragDrop.title', descKey: 'home.features.dragDrop.desc' },
  { icon: Sparkles, titleKey: 'home.features.animations.title', descKey: 'home.features.animations.desc' },
  { icon: Layers, titleKey: 'home.features.multiSlide.title', descKey: 'home.features.multiSlide.desc' },
  { icon: Code2, titleKey: 'home.features.export.title', descKey: 'home.features.export.desc' },
  { icon: Package, titleKey: 'home.features.npm.title', descKey: 'home.features.npm.desc' },
  { icon: Zap, titleKey: 'home.features.runtime.title', descKey: 'home.features.runtime.desc' },
] as const;

const QUICK_START_STEPS = [
  {
    step: '01',
    titleKey: 'home.quickStart.step1.title',
    code: 'npm install modern-slider-pro',
  },
  {
    step: '02',
    titleKey: 'home.quickStart.step2.title',
    code: `import { SliderEditor } from 'modern-slider-pro';
import 'modern-slider-pro/style.css';

<SliderEditor />`,
  },
  {
    step: '03',
    titleKey: 'home.quickStart.step3.title',
    code: `import { SliderRunner } from 'modern-slider-pro';

<SliderRunner slides={slides} autoPlay />`,
  },
] as const;

const Index = () => {
  const [autoPlay, setAutoPlay] = useState(true);
  const { t } = useLanguage();

  const features = useMemo(
    () => FEATURE_KEYS.map((feature) => ({
      ...feature,
      title: t(feature.titleKey),
      description: t(feature.descKey),
    })),
    [t],
  );

  return (
    <SiteLayout>
      {/* Hero */}
      <section className={cn(SITE_CONTAINER_CLASS, 'msp-pt-20 msp-pb-16 msp-text-center')}>
        <Badge variant="secondary" className="msp-mb-5 msp-text-xs msp-px-3 msp-py-1">
          {t('home.badge').replace('{version}', APP_VERSION)}
        </Badge>
        <h1 className="msp-text-5xl sm:msp-text-6xl msp-font-extrabold msp-tracking-tight msp-mb-5 msp-leading-tight">
          {t('home.hero.title')}{' '}
          <span className="msp-text-primary">{t('home.hero.titleAccent')}</span>
        </h1>
        <p className="msp-text-muted-foreground msp-text-xl msp-max-w-2xl msp-mx-auto msp-mb-8">
          {t('home.hero.subtitle').split('SliderRunner').map((part, index, parts) => (
            <React.Fragment key={`hero-${index}-${part.slice(0, 8)}`}>
              {part}
              {index < parts.length - 1 && (
                <code className="msp-text-sm msp-bg-muted msp-px-1.5 msp-py-0.5 msp-rounded msp-font-mono">
                  SliderRunner
                </code>
              )}
            </React.Fragment>
          ))}
        </p>
        <div className="msp-flex msp-flex-wrap msp-items-center msp-justify-center msp-gap-3">
          <Button size="lg" asChild>
            <Link to="/editor">
              {t('home.cta.editor')} <ArrowRight className="msp-ml-2 msp-h-4 msp-w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/docs">{t('home.cta.docs')}</Link>
          </Button>
        </div>

        <div className="msp-mt-8 msp-inline-flex msp-items-center msp-gap-3 msp-bg-muted msp-rounded-lg msp-px-5 msp-py-3 msp-font-mono msp-text-sm">
          <span className="msp-text-muted-foreground msp-select-none">$</span>
          <span>npm install modern-slider-pro</span>
        </div>
      </section>

      {/* Live Preview */}
      <section className={SITE_CONTAINER_CLASS + ' msp-pb-20'}>
        <div className="msp-text-center msp-mb-8">
          <h2 className="msp-text-2xl msp-font-bold msp-mb-2">{t('home.preview.title')}</h2>
          <p className="msp-text-muted-foreground">{t('home.preview.subtitle')}</p>
        </div>

        <div className="msp-flex msp-justify-center msp-gap-3 msp-mb-5">
          <Button
            variant={autoPlay ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoPlay(true)}
          >
            <Play className="msp-h-3.5 msp-w-3.5 msp-mr-1.5" />
            {t('home.preview.autoPlay')}
          </Button>
          <Button
            variant={!autoPlay ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoPlay(false)}
          >
            {t('home.preview.manual')}
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
              {t('home.preview.fullDemo')} <ArrowRight className="msp-ml-1 msp-h-3.5 msp-w-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="msp-border-t msp-bg-muted/30">
        <div className={cn(SITE_CONTAINER_CLASS, 'msp-py-20')}>
          <div className="msp-text-center msp-mb-12">
            <h2 className="msp-text-3xl msp-font-bold msp-mb-3">{t('home.features.title')}</h2>
            <p className="msp-text-muted-foreground msp-text-lg msp-max-w-xl msp-mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>
          <div className="msp-grid sm:msp-grid-cols-2 lg:msp-grid-cols-3 msp-gap-6">
            {features.map(({ icon: Icon, title, description }) => (
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
      <section className={SITE_CONTAINER_CLASS + ' msp-py-20'}>
        <div className="msp-text-center msp-mb-10">
          <h2 className="msp-text-3xl msp-font-bold msp-mb-3">{t('home.quickStart.title')}</h2>
          <p className="msp-text-muted-foreground">{t('home.quickStart.subtitle')}</p>
        </div>
        <div className="msp-grid md:msp-grid-cols-3 msp-gap-6">
          {QUICK_START_STEPS.map(({ step, titleKey, code }) => (
            <div
              key={step}
              className="msp-rounded-xl msp-border msp-bg-background msp-p-6 msp-flex msp-flex-col msp-gap-3"
            >
              <span className="msp-text-4xl msp-font-black msp-text-primary/20 msp-leading-none">
                {step}
              </span>
              <h3 className="msp-font-semibold">{t(titleKey)}</h3>
              <pre className="msp-bg-muted msp-rounded-md msp-p-3 msp-text-xs msp-font-mono msp-overflow-x-auto msp-whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          ))}
        </div>
        <div className="msp-text-center msp-mt-8">
          <Button asChild>
            <Link to="/docs">
              {t('home.quickStart.fullDocs')} <ArrowRight className="msp-ml-2 msp-h-4 msp-w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="msp-border-t">
        <div className={cn(SITE_CONTAINER_CLASS, 'msp-py-20 msp-text-center')}>
          <h2 className="msp-text-3xl msp-font-bold msp-mb-4">{t('home.cta.title')}</h2>
          <p className="msp-text-muted-foreground msp-text-lg msp-mb-8 msp-max-w-lg msp-mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <Button size="lg" asChild>
            <Link to="/editor">
              {t('home.cta.launch')} <ArrowRight className="msp-ml-2 msp-h-4 msp-w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
