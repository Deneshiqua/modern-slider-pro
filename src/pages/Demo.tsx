import { Check, Code2, Copy, Layers, Pencil, Play, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import EditorLayout from '@/components/editor/EditorLayout';
import SiteLayout from '@/components/SiteLayout';
import { SITE_CONTAINER_CLASS } from '@/components/siteContainer';
import { Link } from 'react-router-dom';
import SliderRunner from '@/components/SliderRunner';
import { useLanguage } from '@/context/LanguageContext';
import { usePublishedSlides } from '@/context/PublishedSlidesContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import type { Slide } from '@/types/editor';

const DemoPage = () => {
    const [autoPlay, setAutoPlay] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const [copied, setCopied] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const { publishedSlides, publishSlides } = usePublishedSlides();
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const slides = publishedSlides;

    useEffect(() => {
        if (!editorOpen) return undefined;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setEditorOpen(false);
        };
        globalThis.addEventListener('keydown', onKeyDown);
        return () => globalThis.removeEventListener('keydown', onKeyDown);
    }, [editorOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(slides[activeSlide], null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDemoSave = (savedSlides: Slide[]) => {
        publishSlides(structuredClone(savedSlides));
        setEditorOpen(false);
    };

    return (
        <SiteLayout>
            {/* Hero */}
            <section className={cn(SITE_CONTAINER_CLASS, 'msp-py-10 sm:msp-py-16')}>
                <div className="msp-text-center msp-mb-8 sm:msp-mb-10">
                    <h1 className="msp-text-3xl sm:msp-text-4xl msp-font-bold msp-mb-3">{t('demo.hero.title')}</h1>
                    <p className="msp-text-muted-foreground msp-text-base sm:msp-text-lg msp-max-w-xl msp-mx-auto msp-px-1">
                        {t('demo.hero.subtitle').split('SliderRunner').map((part, index, parts) => (
                            <React.Fragment key={index}>
                                {part}
                                {index < parts.length - 1 && (
                                    <code className="msp-text-sm msp-bg-muted msp-px-1.5 msp-py-0.5 msp-rounded">SliderRunner</code>
                                )}
                            </React.Fragment>
                        ))}
                    </p>
                </div>

                {/* Controls */}
                <div className="msp-flex msp-flex-wrap msp-justify-center msp-gap-2 sm:msp-gap-3 msp-mb-6">
                    <Button
                        variant={autoPlay ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAutoPlay(true)}
                    >
                        <Play className="msp-h-3.5 msp-w-3.5 msp-mr-1.5" />
                        {t('demo.controls.autoPlay')}
                    </Button>
                    <Button
                        variant={!autoPlay ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAutoPlay(false)}
                    >
                        {t('demo.controls.manual')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditorOpen(true)}
                    >
                        <Pencil className="msp-h-3.5 msp-w-3.5 msp-mr-1.5" />
                        {t('demo.controls.edit')}
                    </Button>
                </div>

                {/* Slider */}
                <div className="msp-rounded-xl msp-overflow-hidden msp-shadow-2xl msp-border">
                    <SliderRunner
                        slides={slides}
                        autoPlay={autoPlay}
                        interval={4000}
                        height="420px"
                        onSlideChange={setActiveSlide}
                    />
                </div>

                {/* JSON viewer */}
                <div className="msp-mt-8 msp-rounded-xl msp-border msp-bg-muted/40 msp-overflow-hidden">
                    <div className="msp-flex msp-flex-wrap msp-items-center msp-justify-between msp-gap-2 msp-px-4 msp-py-2.5 msp-border-b msp-bg-muted/60">
                        <div className="msp-flex msp-items-center msp-gap-2 msp-text-sm msp-font-medium">
                            <Code2 className="msp-h-4 msp-w-4 msp-text-primary" />
                            {t('demo.json.slideTitle').replace(/\{n\}/g, String(activeSlide + 1))}
                        </div>
                        <div className="msp-flex msp-items-center msp-gap-2">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveSlide(i)}
                                    className={`msp-h-2 msp-w-2 msp-rounded-full msp-transition-colors ${i === activeSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                                        }`}
                                />
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="msp-h-7 msp-px-2 msp-text-xs msp-ml-2"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <><Check className="msp-h-3.5 msp-w-3.5 msp-mr-1 msp-text-green-500" /> {t('demo.json.copied')}</>
                                ) : (
                                    <><Copy className="msp-h-3.5 msp-w-3.5 msp-mr-1" /> {t('demo.json.copy')}</>
                                )}
                            </Button>
                        </div>
                    </div>
                    <pre className="msp-p-4 msp-text-xs msp-font-mono msp-overflow-x-auto msp-max-h-80 msp-text-muted-foreground msp-leading-relaxed">
                        {JSON.stringify(slides[activeSlide], null, 2)}
                    </pre>
                </div>
            </section>

            {/* Features */}
            <section className="msp-border-t msp-bg-muted/30">
                <div className={cn(SITE_CONTAINER_CLASS, 'msp-py-16 msp-grid msp-grid-cols-1 md:msp-grid-cols-3 msp-gap-8')}>
                    <div className="msp-space-y-2">
                        <div className="msp-h-9 msp-w-9 msp-rounded-lg msp-bg-primary/10 msp-flex msp-items-center msp-justify-center">
                            <Layers className="msp-h-5 msp-w-5 msp-text-primary" />
                        </div>
                        <h3 className="msp-font-semibold">{t('demo.features.visual.title')}</h3>
                        <p className="msp-text-sm msp-text-muted-foreground">
                            {t('demo.features.visual.desc')}
                        </p>
                    </div>
                    <div className="msp-space-y-2">
                        <div className="msp-h-9 msp-w-9 msp-rounded-lg msp-bg-primary/10 msp-flex msp-items-center msp-justify-center">
                            <Play className="msp-h-5 msp-w-5 msp-text-primary" />
                        </div>
                        <h3 className="msp-font-semibold">{t('demo.features.animations.title')}</h3>
                        <p className="msp-text-sm msp-text-muted-foreground">
                            {t('demo.features.animations.desc')}
                        </p>
                    </div>
                    <div className="msp-space-y-2">
                        <div className="msp-h-9 msp-w-9 msp-rounded-lg msp-bg-primary/10 msp-flex msp-items-center msp-justify-center">
                            <Code2 className="msp-h-5 msp-w-5 msp-text-primary" />
                        </div>
                        <h3 className="msp-font-semibold">{t('demo.features.dev.title')}</h3>
                        <p className="msp-text-sm msp-text-muted-foreground">
                            {t('demo.features.dev.desc').split('<SliderRunner />').map((part, index, parts) => (
                                <React.Fragment key={index}>
                                    {part}
                                    {index < parts.length - 1 && (
                                        <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">{'<SliderRunner />'}</code>
                                    )}
                                </React.Fragment>
                            ))}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={cn(SITE_CONTAINER_CLASS, 'msp-py-16 msp-text-center')}>
                <h2 className="msp-text-2xl msp-font-bold msp-mb-4">{t('demo.cta.title')}</h2>
                <div className="msp-flex msp-justify-center msp-gap-3">
                    <Button asChild>
                        <Link to="/editor">{t('demo.cta.editor')}</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/docs">{t('demo.cta.docs')}</Link>
                    </Button>
                </div>
            </section>

            {/* Editor overlay — fullscreen shell avoids Radix Dialog modal trapping portaled menus/dialogs */}
            {editorOpen && (
                <div
                    className="msp-fixed msp-inset-0 msp-z-overlay-dialog msp-flex msp-flex-col msp-bg-background msp-overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('demo.editorDialogTitle')}
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="msp-absolute msp-right-3 msp-top-3 msp-z-10"
                        onClick={() => setEditorOpen(false)}
                        aria-label={t('demo.editorClose')}
                    >
                        <X className="msp-h-5 msp-w-5" />
                    </Button>
                    <div className="msp-flex-1 msp-min-h-0 msp-w-full msp-overflow-hidden">
                        <EditorLayout
                            initialSlides={publishedSlides}
                            onDemoSave={handleDemoSave}
                            theme={theme}
                            onThemeChange={setTheme}
                            language={language}
                            onLanguageChange={setLanguage}
                            themeStorageKey="msp-theme"
                            showToaster={false}
                        />
                    </div>
                </div>
            )}
        </SiteLayout>
    );
};

export default DemoPage;
