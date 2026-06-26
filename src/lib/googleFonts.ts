import type { EditorElement, Slide } from '@/types/editor';
import bundledGoogleFontsCatalog from '@/data/googleFontsCatalog.json';

export type GoogleFontEntry = {
  family: string;
  category?: string;
};

let catalogPromise: Promise<GoogleFontEntry[]> | null = null;
const loadedFamilies = new Set<string>();

function normalizeFontFamily(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const unquoted = trimmed.replace(/^['"]|['"]$/g, '');
  if (!unquoted || unquoted.toLowerCase() === 'inherit') return null;
  return unquoted;
}

/** Google Fonts CSS2 URL for a family. */
export function buildGoogleFontStylesheetUrl(family: string): string {
  const encoded = family.trim().replace(/\s+/g, '+');
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
}

/** Inject a Google Font stylesheet once per family. */
export function loadGoogleFont(family: string): void {
  const normalized = normalizeFontFamily(family);
  if (!normalized || typeof document === 'undefined') return;
  if (loadedFamilies.has(normalized)) return;

  const linkId = `msp-gf-${normalized.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;
  if (document.getElementById(linkId)) {
    loadedFamilies.add(normalized);
    return;
  }

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = buildGoogleFontStylesheetUrl(normalized);
  document.head.appendChild(link);
  loadedFamilies.add(normalized);
}

export function loadGoogleFonts(families: Iterable<string>): void {
  for (const family of families) {
    loadGoogleFont(family);
  }
}

/** Load the bundled Google Fonts catalog (avoids browser CORS on metadata API). */
export async function fetchGoogleFontsCatalog(): Promise<GoogleFontEntry[]> {
  catalogPromise ??= Promise.resolve(bundledGoogleFontsCatalog as GoogleFontEntry[]);
  return catalogPromise;
}

export function searchGoogleFonts(
  catalog: GoogleFontEntry[],
  query: string,
  limit = 80,
): GoogleFontEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return catalog.slice(0, limit);
  }

  return catalog
    .filter(
      (entry) =>
        entry.family.toLowerCase().includes(q) ||
        entry.category?.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

function collectFromElement(element: EditorElement, families: Set<string>): void {
  const addFromStyle = (style?: { fontFamily?: string | number }) => {
    const family = normalizeFontFamily(
      typeof style?.fontFamily === 'string' ? style.fontFamily : undefined,
    );
    if (family) families.add(family);
  };

  addFromStyle(element.style);
  if (element.responsive) {
    for (const mode of Object.values(element.responsive)) {
      addFromStyle(mode?.style);
    }
  }

  element.children?.forEach((child) => collectFromElement(child, families));
}

/** Collect unique font families used across all slides. */
export function collectFontFamiliesFromSlides(slides: Slide[]): string[] {
  const families = new Set<string>();
  for (const slide of slides) {
    slide.elements.forEach((element) => collectFromElement(element, families));
  }
  return [...families].sort((a, b) => a.localeCompare(b));
}
