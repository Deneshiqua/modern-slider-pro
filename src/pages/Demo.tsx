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
                                Open Editor <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-3">Live Demo</h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        This slider was built using the{' '}
                        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">SliderRunner</code> component
                        with sample slides defined in code.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3 mb-6">
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditorOpen(true)}
                    >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                    </Button>
                </div>

                {/* Slider */}
                <div className="rounded-xl overflow-hidden shadow-2xl border">
                    <SliderRunner
                        slides={slides}
                        autoPlay={autoPlay}
                        interval={4000}
                        height="420px"
                        onSlideChange={setActiveSlide}
                    />
                </div>

                {/* JSON viewer */}
                <div className="mt-8 rounded-xl border bg-muted/40 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/60">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Code2 className="h-4 w-4 text-primary" />
                            Slide {activeSlide + 1} — JSON
                        </div>
                        <div className="flex items-center gap-2">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveSlide(i)}
                                    className={`h-2 w-2 rounded-full transition-colors ${i === activeSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                                        }`}
                                />
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs ml-2"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <><Check className="h-3.5 w-3.5 mr-1 text-green-500" /> Copied</>
                                ) : (
                                    <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>
                                )}
                            </Button>
                        </div>
                    </div>
                    <pre className="p-4 text-xs font-mono overflow-x-auto max-h-80 text-muted-foreground leading-relaxed">
                        {JSON.stringify(slides[activeSlide], null, 2)}
                    </pre>
                </div>
            </section>

            {/* Features */}
            <section className="border-t bg-muted/30">
                <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Visual Editor</h3>
                        <p className="text-sm text-muted-foreground">
                            Drag-and-drop canvas with text, image, button, and box elements. Full style controls per element.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Play className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Frame-perfect Animations</h3>
                        <p className="text-sm text-muted-foreground">
                            Every element has its own entrance animation, powered by Framer Motion presets.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Code2 className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Developer Friendly</h3>
                        <p className="text-sm text-muted-foreground">
                            Export your slides as JSON, embed with{' '}
                            <code className="text-xs bg-muted px-1 rounded">{'<SliderRunner />'}</code> — zero config.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-6xl mx-auto px-6 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to build your slider?</h2>
                <div className="flex justify-center gap-3">
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
                <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] p-0 overflow-hidden [&>button]:hidden">
                    <DialogTitle className="sr-only">Slider Editor</DialogTitle>
                    <div className="h-full w-full">
                        <EditorLayout onDemoSave={() => setEditorOpen(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DemoPage;
