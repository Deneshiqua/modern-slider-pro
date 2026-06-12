import {
  CanvasSettings,
  EditorElement,
  EditorState,
  ElementType,
  ResponsivePropertyMode,
  Slide,
  SlideBackgroundFit,
  SliderSettings,
  ViewMode,
} from '@/types/editor';
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  CANVAS_ZOOM_DEFAULT,
  CANVAS_ZOOM_MAX,
  CANVAS_ZOOM_MIN,
  CANVAS_ZOOM_STEP,
  DEFAULT_CANVAS_SETTINGS,
  DEFAULT_SLIDER_SETTINGS,
} from '@/lib/constants';
import { DEMO_SLIDES } from '@/lib/demoSlides';
import { normalizeSliderSettings } from '@/lib/slideTransitions';
import { getSlideSpaceOuterRect } from '@/lib/groupBounds';
import { elementSubtreeContainsSlide } from '@/lib/elementSubtree';
import { mergeResponsiveElementUpdates, resolveElementProperties } from '@/lib/responsive';
import { v4 as uuidv4 } from 'uuid';

interface EditorContextType extends EditorState {
  settings: SliderSettings;
  updateSettings: (settings: Partial<SliderSettings>) => void;
  isDirty: boolean;
  markDirty: () => void;
  markSaved: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canResetSlide: boolean;
  undo: () => void;
  redo: () => void;
  /** Revert the active slide to its state before the first edit in this session (redo can restore). */
  resetActiveSlide: () => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  setCurrentSlide: (index: number) => void;
  addElement: (type: ElementType, options?: { content?: string }) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  updateElementForMode: (id: string, updates: Partial<EditorElement>, mode?: ResponsivePropertyMode) => void;
  updateElementsForMode: (
    updatesById: Record<string, Partial<EditorElement>>,
    mode?: ResponsivePropertyMode,
    options?: { skipHistory?: boolean },
  ) => void;
  removeElement: (id: string) => void;
  removeSelectedElements: () => void;
  selectElement: (id: string | null) => void;
  selectedElementIds: string[];
  selectElements: (ids: string[]) => void;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;
  /** Ctrl+A / ⌘A: select every root-layer element on the active slide (matches layer panel roots). */
  selectAllRootElements: () => void;
  setViewMode: (mode: ViewMode) => void;
  propertyMode: ResponsivePropertyMode;
  setPropertyMode: (mode: ResponsivePropertyMode) => void;
  /** Canvas viewport + properties panel mode (desktop / tablet / mobile). */
  setResponsiveViewport: (mode: ViewMode) => void;
  togglePlay: () => void;
  /** Slide timeline preview (canvas entrance animations); separate from toolbar slider preview. */
  isSlideTimelinePlaying: boolean;
  slideTimelinePlayToken: number;
  startSlideTimelinePreview: () => void;
  stopSlideTimelinePreview: () => void;
  updateSlideBackground: (value: string, type: 'color' | 'image' | 'video') => void;
  updateSlideBackgroundFit: (fit: SlideBackgroundFit) => void;
  updateSlideOverlay: (
    patch: Partial<Pick<Slide, 'overlayEnabled' | 'overlayColor' | 'overlayOpacity'>>,
  ) => void;
  updateSlideTimelineDuration: (durationSeconds: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  reorderElements: (elementIds: string[]) => void;
  /** When set, the layers panel lists only direct children of this element (nested group drill-through). */
  layersDrillParentId: string | null;
  enterLayersDrill: (parentElementId: string) => void;
  exitLayersDrill: () => void;
  reorderGroupChildren: (parentElementId: string, orderedChildIds: string[]) => void;
  groupSelectedElements: () => void;
  ungroupElement: (id: string) => void;
  showBorders: boolean;
  setShowBorders: (show: boolean) => void;
  loadSlides: (newSlides: Slide[]) => void;
  canvasSettings: CanvasSettings;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  canvasZoom: number;
  setCanvasZoom: (zoom: number) => void;
  zoomCanvasIn: () => void;
  zoomCanvasOut: () => void;
  resetCanvasZoom: () => void;
  copySelectionToClipboard: () => number;
  cutSelectionToClipboard: () => number;
  pasteClipboardElements: () => number;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

type EditorSnapshot = Pick<EditorContextType, 'slides' | 'settings' | 'canvasSettings'>;

const HISTORY_LIMIT = 50;

type SlideUndoStacks = Record<string, { past: Slide[]; future: Slide[] }>;

const cloneSlide = (slide: Slide): Slide => structuredClone(slide);

const emptySlideStack = (): { past: Slide[]; future: Slide[] } => ({ past: [], future: [] });

const getSlideStack = (stacks: SlideUndoStacks, slideId: string) =>
  stacks[slideId] ?? emptySlideStack();

/** Module-scope tree lookup (usable from undo before inner `findElementById`). */
const findElementInTree = (elements: EditorElement[], id: string): EditorElement | null => {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children?.length) {
      const found = findElementInTree(el.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findAncestorChain = (elements: EditorElement[], targetId: string): EditorElement[] | null => {
  for (const el of elements) {
    if (el.id === targetId) return [el];
    if (el.children?.length) {
      const nested = findAncestorChain(el.children, targetId);
      if (nested) return [el, ...nested];
    }
  }
  return null;
};

/** When multi-select spans a parent + child, paste only ancestors (full subtrees once). */
const pruneToNonDescendantIds = (selectedIds: string[], slideElements: EditorElement[]): string[] => {
  const uniq = [...new Set(selectedIds.filter(Boolean))];
  return uniq.filter((id) => {
    const chain = findAncestorChain(slideElements, id);
    if (!chain?.length) return false;
    const ancestors = chain.slice(0, -1);
    return !ancestors.some((a) => uniq.includes(a.id));
  });
};

/** Keep selection for undo/redo: drop missing ids, prune parent+child pairs. */
const filterSelectionToSlideTree = (slide: Slide, prevIds: string[], prevSingle: string | null): string[] => {
  const roots = slide.elements;
  const raw = prevIds.length > 0 ? prevIds : prevSingle ? [prevSingle] : [];
  return pruneToNonDescendantIds(raw, roots).filter((id) => findElementInTree(roots, id) != null);
};

/** Drill stays active while every selected id is the drill root or inside its subtree. */
const selectionFitsLayersDrill = (
  drillParentId: string,
  slideRoots: EditorElement[],
  selectedIds: string[],
): boolean =>
  selectedIds.length > 0 &&
  selectedIds.every((sid) => elementSubtreeContainsSlide(slideRoots, drillParentId, sid));

const cloneSubtreeWithNewIds = (el: EditorElement): EditorElement => ({
  ...el,
  id: uuidv4(),
  style: { ...el.style },
  hoverStyle: el.hoverStyle ? { ...el.hoverStyle } : undefined,
  responsive: el.responsive ? structuredClone(el.responsive) : undefined,
  animation: el.animation ? { ...el.animation } : undefined,
  children: el.children?.map(cloneSubtreeWithNewIds),
});

/** Deep copy preserving ids (stored in-memory clipboard until paste assigns new ids). */
const freezeElementSubtree = (el: EditorElement): EditorElement => ({
  ...el,
  style: { ...el.style },
  hoverStyle: el.hoverStyle ? { ...el.hoverStyle } : undefined,
  responsive: el.responsive ? structuredClone(el.responsive) : undefined,
  animation: el.animation ? { ...el.animation } : undefined,
  children: el.children?.map(freezeElementSubtree),
});

// Helper to ensure new slide structure
const createNewSlide = (): Slide => ({
  id: uuidv4(),
  background: '#ffffff', // Legacy/Current active value
  backgroundColor: '#ffffff',
  backgroundImage: '',
  backgroundVideo: '',
  backgroundFit: 'cover',
  overlayEnabled: false,
  overlayColor: '#000000',
  overlayOpacity: 0.4,
  backgroundType: 'color',
  elements: []
});

export type EditorProviderProps = {
  children: ReactNode;
  initialSlides?: Slide[];
  initialSettings?: SliderSettings;
  initialCanvasSettings?: CanvasSettings;
};

export const EditorProvider = ({
  children,
  initialSlides = DEMO_SLIDES,
  initialSettings = DEFAULT_SLIDER_SETTINGS,
  initialCanvasSettings = DEFAULT_CANVAS_SETTINGS,
}: EditorProviderProps) => {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);

  const [settings, setSettings] = useState<SliderSettings>(() => normalizeSliderSettings(initialSettings));
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [propertyMode, setPropertyMode] = useState<ResponsivePropertyMode>('default');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlideTimelinePlaying, setSlideTimelinePlaying] = useState(false);
  const [slideTimelinePlayToken, setSlideTimelinePlayToken] = useState(0);
  const [showBorders, setShowBorders] = useState(false);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(() => ({
    ...DEFAULT_CANVAS_SETTINGS,
    ...initialCanvasSettings,
  }));
  const [canvasZoom, setCanvasZoomState] = useState(CANVAS_ZOOM_DEFAULT);
  const [layersDrillParentId, setLayersDrillParentId] = useState<string | null>(null);

  const clampCanvasZoom = (zoom: number) =>
    Math.min(CANVAS_ZOOM_MAX, Math.max(CANVAS_ZOOM_MIN, Math.round(zoom * 100) / 100));

  const setCanvasZoom = (zoom: number) => {
    setCanvasZoomState(clampCanvasZoom(zoom));
  };

  const zoomCanvasIn = () => {
    setCanvasZoomState((current) => clampCanvasZoom(current + CANVAS_ZOOM_STEP));
  };

  const zoomCanvasOut = () => {
    setCanvasZoomState((current) => clampCanvasZoom(current - CANVAS_ZOOM_STEP));
  };

  const resetCanvasZoom = () => {
    setCanvasZoomState(CANVAS_ZOOM_DEFAULT);
  };

  const startSlideTimelinePreview = useCallback(() => {
    setSlideTimelinePlayToken((t) => t + 1);
    setSlideTimelinePlaying(true);
  }, []);

  const stopSlideTimelinePreview = useCallback(() => {
    setSlideTimelinePlaying(false);
  }, []);
  const [isDirty, setIsDirty] = useState(false);
  /** Full-project snapshots for settings, canvas, add/remove slide, loadSlides, etc. */
  const [globalPastSnapshots, setGlobalPastSnapshots] = useState<EditorSnapshot[]>([]);
  const [globalFutureSnapshots, setGlobalFutureSnapshots] = useState<EditorSnapshot[]>([]);
  /** Per-slide undo/redo for element + slide background (scoped by slide id). */
  const [slideUndoStacks, setSlideUndoStacks] = useState<SlideUndoStacks>({});

  /** In-session clipboard for Ctrl+C / Ctrl+X / Ctrl+V (full element subtrees). */
  const elementClipboardRef = useRef<EditorElement[] | null>(null);

  const markDirty = () => setIsDirty(true);
  const markSaved = () => setIsDirty(false);
  const createSnapshot = (): EditorSnapshot => ({ slides, settings, canvasSettings });

  const recordSlideScopedChange = (slideId: string) => {
    const slide = slides.find((s) => s.id === slideId);
    if (!slide) return;
    setSlideUndoStacks((prev) => {
      const cur = getSlideStack(prev, slideId);
      return {
        ...prev,
        [slideId]: {
          past: [...cur.past.slice(-(HISTORY_LIMIT - 1)), cloneSlide(slide)],
          future: [],
        },
      };
    });
    markDirty();
  };

  const recordGlobalChange = () => {
    setGlobalPastSnapshots((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), createSnapshot()]);
    setGlobalFutureSnapshots([]);
    markDirty();
  };

  const navigateToSlide = (indexOrUpdater: number | ((previous: number) => number)) => {
    setLayersDrillParentId(null);
    setCurrentSlideIndex(indexOrUpdater);
  };

  const applyGlobalSnapshot = (snapshot: EditorSnapshot) => {
    const prevDrill = layersDrillParentId;
    const nextIndex = Math.min(currentSlideIndex, Math.max(snapshot.slides.length - 1, 0));
    const nextSlide = snapshot.slides[nextIndex];

    setSlides(snapshot.slides);
    setSettings(snapshot.settings);
    setCanvasSettings({ ...DEFAULT_CANVAS_SETTINGS, ...snapshot.canvasSettings });
    navigateToSlide((index) => Math.min(index, Math.max(snapshot.slides.length - 1, 0)));

    const nextIds = nextSlide
      ? filterSelectionToSlideTree(nextSlide, selectedElementIds, selectedElementId)
      : [];
    setSelectedElementIds(nextIds);
    setSelectedElementId(nextIds.length === 1 ? nextIds[0] : null);

    const resolvedDrill =
      prevDrill &&
      nextSlide &&
      nextIds.length > 0 &&
      selectionFitsLayersDrill(prevDrill, nextSlide.elements, nextIds)
        ? prevDrill
        : null;
    setLayersDrillParentId(resolvedDrill);

    setSlideUndoStacks({});
  };

  const selectElement = (id: string | null) => {
    const slide = slides[currentSlideIndex];
    const roots = slide?.elements ?? [];

    setLayersDrillParentId((drill) => {
      if (!drill) return null;
      if (id === null) return null;
      return selectionFitsLayersDrill(drill, roots, [id]) ? drill : null;
    });

    setSelectedElementId(id);
    setSelectedElementIds(id ? [id] : []);
  };

  const selectElements = (ids: string[]) => {
    const uniqueIds = [...new Set(ids)];
    const slide = slides[currentSlideIndex];
    const roots = slide?.elements ?? [];

    setLayersDrillParentId((drill) => {
      if (!drill) return null;
      return selectionFitsLayersDrill(drill, roots, uniqueIds) ? drill : null;
    });

    setSelectedElementIds(uniqueIds);
    setSelectedElementId(uniqueIds.length === 1 ? uniqueIds[0] : null);
  };

  const toggleElementSelection = (id: string) => {
    setSelectedElementIds((prev) => {
      const nextIds = prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id];

      const slide = slides[currentSlideIndex];
      const roots = slide?.elements ?? [];
      setLayersDrillParentId((drill) => {
        if (!drill) return null;
        return selectionFitsLayersDrill(drill, roots, nextIds) ? drill : null;
      });

      setSelectedElementId(nextIds.length === 1 ? nextIds[0] : null);

      return nextIds;
    });
  };

  const clearSelection = () => {
    setLayersDrillParentId(null);
    setSelectedElementId(null);
    setSelectedElementIds([]);
  };

  const selectAllRootElements = () => {
    const slide = slides[currentSlideIndex];
    if (!slide?.elements?.length) {
      clearSelection();
      return;
    }
    selectElements(slide.elements.map((element) => element.id));
  };

  const undo = () => {
    const sid = slides[currentSlideIndex]?.id;
    if (sid) {
      const st = getSlideStack(slideUndoStacks, sid);
      if (st.past.length > 0) {
        const previousSlide = st.past[st.past.length - 1];
        const currentSlide = slides.find((s) => s.id === sid);
        if (!currentSlide) return;
        setSlideUndoStacks((prev) => ({
          ...prev,
          [sid]: {
            past: st.past.slice(0, -1),
            future: [cloneSlide(currentSlide), ...st.future].slice(0, HISTORY_LIMIT),
          },
        }));
        setSlides((prev) => prev.map((s) => (s.id === sid ? cloneSlide(previousSlide) : s)));
        const nextIds = filterSelectionToSlideTree(previousSlide, selectedElementIds, selectedElementId);
        setSelectedElementIds(nextIds);
        setSelectedElementId(nextIds.length === 1 ? nextIds[0] : null);
        setLayersDrillParentId((drill) => {
          if (!drill || nextIds.length === 0) return null;
          return selectionFitsLayersDrill(drill, previousSlide.elements, nextIds) ? drill : null;
        });
        markDirty();
        return;
      }
    }

    const previousSnapshot = globalPastSnapshots[globalPastSnapshots.length - 1];
    if (!previousSnapshot) return;

    setGlobalPastSnapshots((prev) => prev.slice(0, -1));
    setGlobalFutureSnapshots((prev) => [createSnapshot(), ...prev].slice(0, HISTORY_LIMIT));
    applyGlobalSnapshot(previousSnapshot);
    markDirty();
  };

  const redo = () => {
    const sid = slides[currentSlideIndex]?.id;
    if (sid) {
      const st = getSlideStack(slideUndoStacks, sid);
      if (st.future.length > 0) {
        const nextSlide = st.future[0];
        const currentSlide = slides.find((s) => s.id === sid);
        if (!currentSlide) return;
        setSlideUndoStacks((prev) => ({
          ...prev,
          [sid]: {
            past: [...st.past.slice(-(HISTORY_LIMIT - 1)), cloneSlide(currentSlide)],
            future: st.future.slice(1),
          },
        }));
        setSlides((prev) => prev.map((s) => (s.id === sid ? cloneSlide(nextSlide) : s)));
        const nextIds = filterSelectionToSlideTree(nextSlide, selectedElementIds, selectedElementId);
        setSelectedElementIds(nextIds);
        setSelectedElementId(nextIds.length === 1 ? nextIds[0] : null);
        setLayersDrillParentId((drill) => {
          if (!drill || nextIds.length === 0) return null;
          return selectionFitsLayersDrill(drill, nextSlide.elements, nextIds) ? drill : null;
        });
        markDirty();
        return;
      }
    }

    const nextSnapshot = globalFutureSnapshots[0];
    if (!nextSnapshot) return;

    setGlobalFutureSnapshots((prev) => prev.slice(1));
    setGlobalPastSnapshots((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), createSnapshot()]);
    applyGlobalSnapshot(nextSnapshot);
    markDirty();
  };

  const resetActiveSlide = () => {
    const sid = slides[currentSlideIndex]?.id;
    if (!sid) return;
    const st = getSlideStack(slideUndoStacks, sid);
    if (st.past.length === 0) return;
    const baseline = cloneSlide(st.past[0]);
    const currentSlide = slides.find((s) => s.id === sid);
    if (!currentSlide) return;
    setSlides((prev) => prev.map((s) => (s.id === sid ? baseline : s)));
    setSlideUndoStacks((prev) => ({
      ...prev,
      [sid]: {
        past: [],
        future: [cloneSlide(currentSlide), ...getSlideStack(prev, sid).future].slice(0, HISTORY_LIMIT),
      },
    }));
    const nextIds = filterSelectionToSlideTree(baseline, selectedElementIds, selectedElementId);
    setSelectedElementIds(nextIds);
    setSelectedElementId(nextIds.length === 1 ? nextIds[0] : null);
    setLayersDrillParentId((drill) => {
      if (!drill || nextIds.length === 0) return null;
      return selectionFitsLayersDrill(drill, baseline.elements, nextIds) ? drill : null;
    });
    markDirty();
  };

  const updateCanvasSettings = (settings: Partial<CanvasSettings>) => {
    recordGlobalChange();
    setCanvasSettings(prev => ({ ...prev, ...settings }));
  };

  const updateSettings = (newSettings: Partial<SliderSettings>) => {
    recordGlobalChange();
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addSlide = () => {
    const newSlide = createNewSlide();
    recordGlobalChange();
    setSlides([...slides, newSlide]);
    navigateToSlide(slides.length);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter(s => s.id !== id);
    recordGlobalChange();
    setSlides(newSlides);
    setSlideUndoStacks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (currentSlideIndex >= newSlides.length) {
      navigateToSlide(newSlides.length - 1);
    }
  };

  // Recursive helper to find an element by ID
  const findElementById = (elements: EditorElement[], id: string): EditorElement | null => {
    for (const el of elements) {
      if (el.id === id) return el;
      if (el.children) {
        const found = findElementById(el.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!layersDrillParentId) return;
    const slide = slides[currentSlideIndex];
    const node = slide ? findElementById(slide.elements, layersDrillParentId) : null;
    if (!node?.children?.length) setLayersDrillParentId(null);
  }, [slides, currentSlideIndex, layersDrillParentId]);

  const addElement = (type: ElementType, options?: { content?: string }) => {
    const activeSlideId = slides[currentSlideIndex]?.id;
    if (!activeSlideId) return;

    const newElement: EditorElement = {
      id: uuidv4(),
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      isVisible: true,
      isLocked: false,
      content: options?.content || (type === 'text' ? 'New Text' : type === 'button' ? 'Click Me' : type === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : 'https://placehold.co/200x200'),
      x: 50,
      y: 50,
      style: {
        width: type === 'image' || type === 'video' ? 320 : type === 'button' ? 120 : type === 'box' ? 100 : undefined,
        height: type === 'image' ? 200 : type === 'video' ? 180 : type === 'button' ? 40 : type === 'box' ? 50 : undefined,
        fontSize: 16,
        color: '#000000',
        backgroundColor: type === 'button' ? '#3b82f6' : type === 'box' ? '#e5e7eb' : 'transparent',
        zIndex: 1, // Will be normalized later
        textAlign: 'left',
        borderRadius: type === 'button' ? 4 : 0,
        padding: type === 'button' ? 8 : 0,
        objectFit: type === 'image' ? 'contain' : undefined
      },
      children: type === 'box' ? [] : undefined
    };

    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    // Check if currently selected element is a box, if so, add to it
    if (selectedElementId) {
      const targetElement = findElementById(currentSlide.elements, selectedElementId);
      if (targetElement && targetElement.type === 'box') {
        // Add as child of the box
        // We need to update the slide structure recursively
        const updateChildren = (elements: EditorElement[]): EditorElement[] => {
          return elements.map(el => {
            if (el.id === selectedElementId) {
              return {
                ...el,
                children: [...(el.children || []), { ...newElement, x: 10, y: 10, style: { ...newElement.style, zIndex: (el.children?.length || 0) + 1 } }]
              };
            }
            if (el.children) {
              return { ...el, children: updateChildren(el.children) };
            }
            return el;
          });
        };

        updatedSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: updateChildren(currentSlide.elements)
        };

        recordSlideScopedChange(activeSlideId);
        setSlides(updatedSlides);
        selectElement(newElement.id);
        return;
      }
    }

    // Default: Add to root level
    newElement.style.zIndex = currentSlide.elements.length + 1;
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement]
    };

    recordSlideScopedChange(activeSlideId);
    setSlides(updatedSlides);
    selectElement(newElement.id);
  };

  const updateElementsForMode = (
    updatesById: Record<string, Partial<EditorElement>>,
    mode: ResponsivePropertyMode = 'default',
    options?: { skipHistory?: boolean },
  ) => {
    const updateIds = new Set(Object.keys(updatesById));
    if (updateIds.size === 0) return;

    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const updateRecursive = (elements: EditorElement[]): EditorElement[] => {
      return elements.map(el => {
        const updates = updatesById[el.id];

        if (updates) {
          const resolvedUpdates = mergeResponsiveElementUpdates(el, mode, updates);

          return {
            ...el,
            ...resolvedUpdates,
            style: {
              ...el.style,
              ...(mode === 'default' ? updates.style ?? undefined : undefined)
            }
          };
        }
        if (el.children) {
          return { ...el, children: updateRecursive(el.children) };
        }
        return el;
      });
    };

    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: updateRecursive(currentSlide.elements)
    };

    if (!options?.skipHistory) {
      const aid = slides[currentSlideIndex]?.id;
      if (aid) recordSlideScopedChange(aid);
    }
    setSlides(updatedSlides);
  };

  const updateElementForMode = (
    id: string,
    updates: Partial<EditorElement>,
    mode: ResponsivePropertyMode = 'default',
  ) => {
    updateElementsForMode({ [id]: updates }, mode);
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    updateElementForMode(id, updates, 'default');
  };

  const removeElement = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const removeRecursive = (elements: EditorElement[], idsToRemove: Set<string>): EditorElement[] => {
      return elements.filter(el => !idsToRemove.has(el.id)).map(el => {
        if (el.children) {
          return { ...el, children: removeRecursive(el.children, idsToRemove) };
        }
        return el;
      });
    };

    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: removeRecursive(currentSlide.elements, new Set([id]))
    };

    const aid = slides[currentSlideIndex]?.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
    clearSelection();
  };

  const removeSelectedElements = () => {
    const idsToRemove = new Set(selectedElementIds.length ? selectedElementIds : selectedElementId ? [selectedElementId] : []);
    if (idsToRemove.size === 0) return;

    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    const removeRecursive = (elements: EditorElement[]): EditorElement[] => {
      return elements.filter(el => !idsToRemove.has(el.id)).map(el => {
        if (el.children) {
          return { ...el, children: removeRecursive(el.children) };
        }
        return el;
      });
    };

    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: removeRecursive(currentSlide.elements),
    };

    const aid = slides[currentSlideIndex]?.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
    clearSelection();
  };

  const copySelectionToClipboard = (): number => {
    const activeIds =
      selectedElementIds.length > 0 ? selectedElementIds : selectedElementId ? [selectedElementId] : [];
    const slide = slides[currentSlideIndex];
    const rootIds = pruneToNonDescendantIds(activeIds, slide.elements);

    const nodes = rootIds
      .map((id) => findElementById(slide.elements, id))
      .filter((n): n is EditorElement => n != null);

    if (nodes.length === 0) return 0;
    elementClipboardRef.current = nodes.map(freezeElementSubtree);
    return nodes.length;
  };

  const cutSelectionToClipboard = (): number => {
    const n = copySelectionToClipboard();
    if (n === 0) return 0;
    removeSelectedElements();
    return n;
  };

  const pasteClipboardElements = (): number => {
    const source = elementClipboardRef.current;
    if (!source?.length) return 0;

    const updatedSlides = [...slides];
    const slide = updatedSlides[currentSlideIndex];

    let maxZ = slide.elements.reduce((m, el) => Math.max(m, Number(el.style?.zIndex) || 0), 0);

    const pasteOffset = 12;
    const newRoots = source.map((el) => {
      const fresh = cloneSubtreeWithNewIds(el);
      fresh.x = (fresh.x ?? 0) + pasteOffset;
      fresh.y = (fresh.y ?? 0) + pasteOffset;
      maxZ += 1;
      fresh.style = { ...fresh.style, zIndex: maxZ };
      return fresh;
    });

    updatedSlides[currentSlideIndex] = {
      ...slide,
      elements: [...slide.elements, ...newRoots],
    };

    const aid = slides[currentSlideIndex]?.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
    selectElements(newRoots.map((r) => r.id));
    return newRoots.length;
  };

  const updateSlideBackground = (value: string, type: 'color' | 'image' | 'video') => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const updatedSlide = { ...currentSlide };

    // Update the specific field based on type
    if (type === 'color') updatedSlide.backgroundColor = value;
    if (type === 'image') updatedSlide.backgroundImage = value;
    if (type === 'video') updatedSlide.backgroundVideo = value;

    // Always update the active type and the legacy 'background' field
    updatedSlide.backgroundType = type;
    updatedSlide.background = value;

    updatedSlides[currentSlideIndex] = updatedSlide;
    const aid = slides[currentSlideIndex]?.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
  };

  const updateSlideBackgroundFit = (fit: SlideBackgroundFit) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    if (!currentSlide) return;

    updatedSlides[currentSlideIndex] = { ...currentSlide, backgroundFit: fit };
    const aid = currentSlide.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
  };

  const updateSlideOverlay = (
    patch: Partial<Pick<Slide, 'overlayEnabled' | 'overlayColor' | 'overlayOpacity'>>,
  ) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    if (!currentSlide) return;

    updatedSlides[currentSlideIndex] = { ...currentSlide, ...patch };
    const aid = currentSlide.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
  };

  const updateSlideTimelineDuration = (durationSeconds: number) => {
    if (!Number.isFinite(durationSeconds) || durationSeconds < 1) return;
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    if (!currentSlide) return;
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      timeline: { duration: durationSeconds },
    };
    const aid = currentSlide.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
  };

  // Helper to normalize Z-indices to be sequential (1, 2, 3...)
  const normalizeZIndices = (elements: EditorElement[]) => {
    const sortedElements = [...elements].sort((a, b) => (Number(a.style.zIndex) || 0) - (Number(b.style.zIndex) || 0));
    return sortedElements.map((el, index) => ({
      ...el,
      style: { ...el.style, zIndex: index + 1 }
    }));
  };

  // Note: Z-index manipulation for nested elements is complex. 
  // For now, we only support root level z-index manipulation properly.
  const bringToFront = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    // Only works for root elements currently
    const elements = normalizeZIndices(currentSlide.elements);
    const elementIndex = elements.findIndex(e => e.id === id);

    if (elementIndex !== -1) {
      const element = elements[elementIndex];
      const maxZ = elements.length;
      if (Number(element.style.zIndex) === maxZ) return;
      const aid = slides[currentSlideIndex]?.id;
      if (!aid) return;
      recordSlideScopedChange(aid);
      element.style.zIndex = maxZ + 1;
      updatedSlides[currentSlideIndex] = {
        ...currentSlide,
        elements: normalizeZIndices(elements)
      };
      setSlides(updatedSlides);
    }
  };

  const sendToBack = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const elements = normalizeZIndices(currentSlide.elements);
    const elementIndex = elements.findIndex(e => e.id === id);

    if (elementIndex !== -1) {
      const element = elements[elementIndex];
      if (Number(element.style.zIndex) === 1) return;
      const aid = slides[currentSlideIndex]?.id;
      if (!aid) return;
      recordSlideScopedChange(aid);
      element.style.zIndex = 0;
      updatedSlides[currentSlideIndex] = {
        ...currentSlide,
        elements: normalizeZIndices(elements)
      };
      setSlides(updatedSlides);
    }
  };

  const bringForward = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const elements = normalizeZIndices(currentSlide.elements);
    const elementIndex = elements.findIndex(e => e.id === id);

    if (elementIndex !== -1) {
      const element = elements[elementIndex];
      const currentZ = Number(element.style.zIndex) || 0;
      if (currentZ === elements.length) return;

      const elementAbove = elements.find(e => (Number(e.style.zIndex) || 0) === currentZ + 1);
      if (elementAbove) {
        const aid = slides[currentSlideIndex]?.id;
        if (!aid) return;
        recordSlideScopedChange(aid);
        element.style.zIndex = currentZ + 1;
        elementAbove.style.zIndex = currentZ;
        updatedSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: elements
        };
        setSlides(updatedSlides);
      }
    }
  };

  const sendBackward = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const elements = normalizeZIndices(currentSlide.elements);
    const elementIndex = elements.findIndex(e => e.id === id);

    if (elementIndex !== -1) {
      const element = elements[elementIndex];
      const currentZ = Number(element.style.zIndex) || 0;
      if (currentZ === 1) return;

      const elementBelow = elements.find(e => (Number(e.style.zIndex) || 0) === currentZ - 1);
      if (elementBelow) {
        const aid = slides[currentSlideIndex]?.id;
        if (!aid) return;
        recordSlideScopedChange(aid);
        element.style.zIndex = currentZ - 1;
        elementBelow.style.zIndex = currentZ;
        updatedSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: elements
        };
        setSlides(updatedSlides);
      }
    }
  };

  const reorderElements = (elementIds: string[]) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    // Only works for root elements
    const updatedElements = currentSlide.elements.map(e => ({ ...e, style: { ...e.style } }));
    const totalElements = elementIds.length;

    elementIds.forEach((id, index) => {
      const elementIndex = updatedElements.findIndex(e => e.id === id);
      if (elementIndex !== -1) {
        updatedElements[elementIndex].style.zIndex = totalElements - index;
      }
    });

    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: updatedElements
    };

    const aid = slides[currentSlideIndex]?.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
  };

  const reorderGroupChildren = (parentElementId: string, orderedChildIds: string[]) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const applyReorder = (elements: EditorElement[]): EditorElement[] =>
      elements.map((el) => {
        if (el.id === parentElementId && el.children?.length) {
          const children = el.children.map((c) => ({ ...c, style: { ...c.style } }));
          const total = orderedChildIds.length;
          orderedChildIds.forEach((cid, index) => {
            const match = children.find((c) => c.id === cid);
            if (match) match.style.zIndex = total - index;
          });
          return { ...el, children };
        }
        if (el.children?.length) {
          return { ...el, children: applyReorder(el.children) };
        }
        return el;
      });

    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: applyReorder(currentSlide.elements),
    };

    const aid = slides[currentSlideIndex]?.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
  };

  const enterLayersDrill = (parentElementId: string) => {
    const slide = slides[currentSlideIndex];
    const parentEl = slide ? findElementById(slide.elements, parentElementId) : null;
    if (!parentEl?.children?.length) return;
    setLayersDrillParentId(parentElementId);
  };

  const exitLayersDrill = () => setLayersDrillParentId(null);

  const groupSelectedElements = () => {
    if (selectedElementIds.length < 2) return;

    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    const selectedSet = new Set(selectedElementIds);
    const selectedRootElements = currentSlide.elements.filter(el => selectedSet.has(el.id) && !el.isLocked);

    if (selectedRootElements.length < 2) return;

    const bounds = selectedRootElements.reduce(
      (acc, element) => {
        const outer = getSlideSpaceOuterRect(element, viewMode);
        return {
          minX: Math.min(acc.minX, outer.minX),
          minY: Math.min(acc.minY, outer.minY),
          maxX: Math.max(acc.maxX, outer.maxX),
          maxY: Math.max(acc.maxY, outer.maxY),
          maxZ: Math.max(acc.maxZ, Number(element.style.zIndex) || 1),
        };
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: 1 },
    );
    const groupId = uuidv4();
    const groupElement: EditorElement = {
      id: groupId,
      type: 'box',
      name: 'Group',
      isVisible: true,
      isLocked: false,
      isGroup: true,
      content: '',
      x: bounds.minX,
      y: bounds.minY,
      style: {
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        backgroundColor: 'transparent',
        zIndex: bounds.maxZ,
      },
      children: selectedRootElements.map(element => {
        const resolved = resolveElementProperties(element, viewMode);
        return {
          ...element,
          x: resolved.x - bounds.minX,
          y: resolved.y - bounds.minY,
        };
      }),
    };

    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [
        ...currentSlide.elements.filter(el => !selectedSet.has(el.id)),
        groupElement,
      ],
    };

    const aid = slides[currentSlideIndex]?.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
    selectElement(groupId);
  };

  const ungroupElement = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    const groupElement = currentSlide.elements.find(el => el.id === id && el.type === 'box' && el.children?.length);
    if (!groupElement?.children?.length) return;

    const ungroupedElements = groupElement.children.map(child => ({
      ...child,
      x: groupElement.x + child.x,
      y: groupElement.y + child.y,
      style: {
        ...child.style,
        zIndex: child.style.zIndex ?? groupElement.style.zIndex,
      },
    }));

    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [
        ...currentSlide.elements.filter(el => el.id !== id),
        ...ungroupedElements,
      ],
    };

    const aid = slides[currentSlideIndex]?.id;
    if (aid) recordSlideScopedChange(aid);
    setSlides(updatedSlides);
    selectElements(ungroupedElements.map(element => element.id));
  };

  const loadSlides = (newSlides: Slide[]) => {
    recordGlobalChange();
    setSlides(newSlides);
    setSlideUndoStacks({});
    navigateToSlide(0);
    clearSelection();
  };

  const contextValue = useMemo<EditorContextType>(() => {
    const currentId = slides[currentSlideIndex]?.id;
    const slideStack = currentId ? getSlideStack(slideUndoStacks, currentId) : emptySlideStack();

    return {
    slides,
    settings,
    updateSettings,
    isDirty,
    markDirty,
    markSaved,
    canUndo: slideStack.past.length > 0 || globalPastSnapshots.length > 0,
    canRedo: slideStack.future.length > 0 || globalFutureSnapshots.length > 0,
    canResetSlide: slideStack.past.length > 0,
    undo,
    redo,
    resetActiveSlide,
    currentSlideIndex,
    selectedElementId,
    selectedElementIds,
    viewMode,
    isPlaying,
    addSlide,
    removeSlide,
    setCurrentSlide: navigateToSlide,
    addElement,
    updateElement,
    updateElementForMode,
    updateElementsForMode,
    removeElement,
    removeSelectedElements,
    selectElement,
    selectElements,
    toggleElementSelection,
    clearSelection,
    selectAllRootElements,
    setViewMode,
    propertyMode,
    setPropertyMode,
    setResponsiveViewport: (mode: ViewMode) => {
      setViewMode(mode);
      setPropertyMode(mode);
    },
    togglePlay: () => {
      setIsPlaying((prev) => {
        const next = !prev;
        if (!next) {
          setSlideTimelinePlaying(false);
        }
        return next;
      });
    },
    isSlideTimelinePlaying,
    slideTimelinePlayToken,
    startSlideTimelinePreview,
    stopSlideTimelinePreview,
    updateSlideBackground,
    updateSlideBackgroundFit,
    updateSlideOverlay,
    updateSlideTimelineDuration,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    reorderElements,
    layersDrillParentId,
    enterLayersDrill,
    exitLayersDrill,
    reorderGroupChildren,
    groupSelectedElements,
    ungroupElement,
    showBorders,
    setShowBorders,
    loadSlides,
    canvasSettings,
    updateCanvasSettings,
    canvasZoom,
    setCanvasZoom,
    zoomCanvasIn,
    zoomCanvasOut,
    resetCanvasZoom,
    copySelectionToClipboard,
    cutSelectionToClipboard,
    pasteClipboardElements,
    };
  }, [
    slides,
    settings,
    currentSlideIndex,
    selectedElementId,
    selectedElementIds,
    layersDrillParentId,
    viewMode,
    propertyMode,
    isPlaying,
    isSlideTimelinePlaying,
    slideTimelinePlayToken,
    showBorders,
    canvasSettings,
    canvasZoom,
    isDirty,
    slideUndoStacks,
    globalPastSnapshots,
    globalFutureSnapshots,
  ]);

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    console.warn('useEditor: EditorProvider not found. Using dummy implementation. Wrap your component with <EditorProvider> for full functionality.');
    // Return a safe dummy implementation to prevent crashes
    return {
      slides: [],
      currentSlideIndex: 0,
      selectedElementId: null,
      viewMode: 'desktop' as const,
      isPlaying: false,
      showBorders: false,
      settings: DEFAULT_SLIDER_SETTINGS,
      canvasSettings: DEFAULT_CANVAS_SETTINGS,
      isDirty: false,
      markDirty: () => { },
      markSaved: () => { },
      canUndo: false,
      canRedo: false,
      canResetSlide: false,
      undo: () => { },
      redo: () => { },
      resetActiveSlide: () => { },
      updateSettings: () => { },
      addSlide: () => { },
      removeSlide: () => { },
      setCurrentSlide: () => { },
      addElement: () => { },
      updateElement: () => { },
      updateElementForMode: () => { },
      updateElementsForMode: () => { },
      removeElement: () => { },
      removeSelectedElements: () => { },
      selectElement: () => { },
      selectedElementIds: [],
      selectElements: () => { },
      toggleElementSelection: () => { },
      clearSelection: () => { },
      selectAllRootElements: () => { },
      setViewMode: () => { },
      propertyMode: 'default',
      setPropertyMode: () => { },
      setResponsiveViewport: () => { },
      togglePlay: () => { },
      isSlideTimelinePlaying: false,
      slideTimelinePlayToken: 0,
      startSlideTimelinePreview: () => { },
      stopSlideTimelinePreview: () => { },
      updateSlideBackground: () => { },
      updateSlideBackgroundFit: () => { },
      updateSlideOverlay: () => { },
      updateSlideTimelineDuration: () => { },
      bringToFront: () => { },
      sendToBack: () => { },
      bringForward: () => { },
      sendBackward: () => { },
      reorderElements: () => { },
      layersDrillParentId: null,
      enterLayersDrill: () => { },
      exitLayersDrill: () => { },
      reorderGroupChildren: () => { },
      groupSelectedElements: () => { },
      ungroupElement: () => { },
      setShowBorders: () => { },
      loadSlides: () => { },
      updateCanvasSettings: () => { },
      canvasZoom: CANVAS_ZOOM_DEFAULT,
      setCanvasZoom: () => { },
      zoomCanvasIn: () => { },
      zoomCanvasOut: () => { },
      resetCanvasZoom: () => { },
      copySelectionToClipboard: () => 0,
      cutSelectionToClipboard: () => 0,
      pasteClipboardElements: () => 0,
    } as EditorContextType;
  }
  return context;
};