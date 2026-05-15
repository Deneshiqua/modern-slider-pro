import React, { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { DEMO_SLIDES } from '@/lib/demoSlides';
import { Slide } from '@/types/editor';

export interface PublishedSlidesContextType {
    publishedSlides: Slide[];
    publishSlides: (slides: Slide[]) => void;
}

const PublishedSlidesContext = createContext<PublishedSlidesContextType | null>(null);

export type PublishedSlidesProviderProps = {
    children: ReactNode;
    initialSlides?: Slide[];
    onPublishSlides?: (slides: Slide[]) => void;
};

export const PublishedSlidesProvider = ({ children, initialSlides = DEMO_SLIDES, onPublishSlides }: PublishedSlidesProviderProps) => {
    // In-memory only — resets to DEMO_SLIDES on page refresh
    const [publishedSlides, setPublishedSlides] = useState<Slide[]>(initialSlides);

    const publishSlides = useCallback((slides: Slide[]) => {
        setPublishedSlides(slides);
        onPublishSlides?.(slides);
    }, [onPublishSlides]);

    const value = useMemo(
        () => ({ publishedSlides, publishSlides }),
        [publishedSlides, publishSlides],
    );

    return (
        <PublishedSlidesContext.Provider value={value}>
            {children}
        </PublishedSlidesContext.Provider>
    );
};

export const usePublishedSlides = () => {
    const ctx = useContext(PublishedSlidesContext);
    if (!ctx) {
        console.warn('usePublishedSlides: PublishedSlidesProvider not found. Using dummy implementation. Wrap your app with <PublishedSlidesProvider> for full functionality.');
        return { publishedSlides: DEMO_SLIDES, publishSlides: () => { } };
    }
    return ctx;
};
