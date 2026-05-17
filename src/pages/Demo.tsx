import { Check, ChevronRight, Code2, Copy, Layers, Pencil, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import EditorLayout from '@/components/editor/EditorLayout';
import { Link } from 'react-router-dom';
import SliderRunner from '@/components/SliderRunner';
import { usePublishedSlides } from '@/context/PublishedSlidesContext';

const DemoPage = () => {
    const [autoPlay, setAutoPlay] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const [copied, setCopied] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const { publishedSlides } = usePublishedSlides();
    const slides = publishedSlides;

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(slides[activeSlide], null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                                Open Editor <ChevronRight className="msp-ml-1 msp-h-4 msp-w-4" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-py-16">
                <div className="msp-text-center msp-mb-10">
                    <h1 className="msp-text-4xl msp-font-bold msp-mb-3">Live Demo</h1>
                    <p className="msp-text-muted-foreground msp-text-lg msp-max-w-xl msp-mx-auto">
                        This slider was built using the{' '}
                        <code className="msp-text-sm msp-bg-muted msp-px-1.5 msp-py-0.5 msp-rounded">SliderRunner</code> component
                        with sample slides defined in code.
                    </p>
                </div>

                {/* Controls */}
                <div className="msp-flex msp-justify-center msp-gap-3 msp-mb-6">
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditorOpen(true)}
                    >
                        <Pencil className="msp-h-3.5 msp-w-3.5 msp-mr-1.5" />
                        Edit
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
                    <div className="msp-flex msp-items-center msp-justify-between msp-px-4 msp-py-2.5 msp-border-b msp-bg-muted/60">
                        <div className="msp-flex msp-items-center msp-gap-2 msp-text-sm msp-font-medium">
                            <Code2 className="msp-h-4 msp-w-4 msp-text-primary" />
                            Slide {activeSlide + 1} — JSON
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
                                    <><Check className="msp-h-3.5 msp-w-3.5 msp-mr-1 msp-text-green-500" /> Copied</>
                                ) : (
                                    <><Copy className="msp-h-3.5 msp-w-3.5 msp-mr-1" /> Copy</>
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
                <div className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-py-16 msp-grid msp-grid-cols-1 md:msp-grid-cols-3 msp-gap-8">
                    <div className="msp-space-y-2">
                        <div className="msp-h-9 msp-w-9 msp-rounded-lg msp-bg-primary/10 msp-flex msp-items-center msp-justify-center">
                            <Layers className="msp-h-5 msp-w-5 msp-text-primary" />
                        </div>
                        <h3 className="msp-font-semibold">Visual Editor</h3>
                        <p className="msp-text-sm msp-text-muted-foreground">
                            Drag-and-drop canvas with text, image, button, and box elements. Full style controls per element.
                        </p>
                    </div>
                    <div className="msp-space-y-2">
                        <div className="msp-h-9 msp-w-9 msp-rounded-lg msp-bg-primary/10 msp-flex msp-items-center msp-justify-center">
                            <Play className="msp-h-5 msp-w-5 msp-text-primary" />
                        </div>
                        <h3 className="msp-font-semibold">Frame-perfect Animations</h3>
                        <p className="msp-text-sm msp-text-muted-foreground">
                            Every element has its own entrance animation, powered by Framer Motion presets.
                        </p>
                    </div>
                    <div className="msp-space-y-2">
                        <div className="msp-h-9 msp-w-9 msp-rounded-lg msp-bg-primary/10 msp-flex msp-items-center msp-justify-center">
                            <Code2 className="msp-h-5 msp-w-5 msp-text-primary" />
                        </div>
                        <h3 className="msp-font-semibold">Developer Friendly</h3>
                        <p className="msp-text-sm msp-text-muted-foreground">
                            Export your slides as JSON, embed with{' '}
                            <code className="msp-text-xs msp-bg-muted msp-px-1 msp-rounded">{'<SliderRunner />'}</code> — zero config.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="msp-max-w-6xl msp-mx-auto msp-px-6 msp-py-16 msp-text-center">
                <h2 className="msp-text-2xl msp-font-bold msp-mb-4">Ready to build your slider?</h2>
                <div className="msp-flex msp-justify-center msp-gap-3">
                    <Button asChild>
                        <Link to="/editor">Open Editor</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/docs">Read the Docs</Link>
                    </Button>
                </div>
            </section>

            {/* Editor Modal */}
            <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                <DialogContent className="!msp-flex msp-flex-col msp-max-w-[98vw] msp-w-[98vw] msp-h-[95vh] msp-max-h-[95vh] msp-p-0 msp-overflow-hidden [&>button]:msp-hidden">
                    <DialogTitle className="msp-sr-only">Slider Editor</DialogTitle>
                    <div className="msp-flex-1 msp-min-h-0 msp-w-full msp-overflow-hidden">
                        <EditorLayout onDemoSave={() => setEditorOpen(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DemoPage;
