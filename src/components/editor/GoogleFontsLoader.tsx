import { useEffect, useMemo } from 'react';

import { collectFontFamiliesFromSlides, loadGoogleFonts } from '@/lib/googleFonts';
import type { Slide } from '@/types/editor';

type GoogleFontsLoaderProps = {
  slides: Slide[];
};

/** Loads Google Font stylesheets for families referenced in slide elements. */
const GoogleFontsLoader = ({ slides }: GoogleFontsLoaderProps) => {
  const families = useMemo(() => collectFontFamiliesFromSlides(slides), [slides]);

  useEffect(() => {
    loadGoogleFonts(families);
  }, [families]);

  return null;
};

export default GoogleFontsLoader;
