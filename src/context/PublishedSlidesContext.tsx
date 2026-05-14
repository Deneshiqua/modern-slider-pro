import React, { ReactNode, createContext, useContext, useState } from 'react';

import { DEMO_SLIDES } from '@/lib/demoSlides';
import { Slide } from '@/types/editor';

interface PublishedSlidesContextType {
    publishedSlides: Slide[];
    publishSlides: (slides: Slide[]) => void;
}

const PublishedSlidesContext = createContext<PublishedSlidesContextType | null>(null);

export const PublishedSlidesProvider = ({ children }: { children: ReactNode }) => {
    // In-memory only — resets to DEMO_SLIDES on page refresh
    const [publishedSlides, setPublishedSlides] = useState<Slide[]>(DEMO_SLIDES);

    return (
        <PublishedSlidesContext.Provider value={{ publishedSlides, publishSlides: setPublishedSlides }}>
            {children}
        </PublishedSlidesContext.Provider>
    );
};

export const usePublishedSlides = () => {
    const ctx = useContext(PublishedSlidesContext);
    if (!ctx) throw new Error('usePublishedSlides must be used within PublishedSlidesProvider');
    return ctx;
};
