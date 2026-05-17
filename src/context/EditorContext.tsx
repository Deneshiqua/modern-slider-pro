import { CanvasSettings, EditorElement, EditorState, ElementType, ResponsivePropertyMode, Slide, SliderSettings, ViewMode } from '@/types/editor';
import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react';

import {
  CANVAS_ZOOM_DEFAULT,
  CANVAS_ZOOM_MAX,
  CANVAS_ZOOM_MIN,
  CANVAS_ZOOM_STEP,
  DEFAULT_CANVAS_SETTINGS,
  DEFAULT_SLIDER_SETTINGS,
} from '@/lib/constants';
import { DEMO_SLIDES } from '@/lib/demoSlides';
import { getSlideSpaceOuterRect } from '@/lib/groupBounds';
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
  undo: () => void;
  redo: () => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  setCurrentSlide: (index: number) => void;
  addElement: (type: ElementType, options?: { content?: string }) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  updateElementForMode: (id: string, updates: Partial<EditorElement>, mode?: ResponsivePropertyMode) => void;
  updateElementsForMode: (updatesById: Record<string, Partial<EditorElement>>, mode?: ResponsivePropertyMode) => void;
  removeElement: (id: string) => void;
  removeSelectedElements: () => void;
  selectElement: (id: string | null) => void;
  selectedElementIds: string[];
  selectElements: (ids: string[]) => void;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  propertyMode: ResponsivePropertyMode;
  setPropertyMode: (mode: ResponsivePropertyMode) => void;
  togglePlay: () => void;
  updateSlideBackground: (value: string, type: 'color' | 'image' | 'video') => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  reorderElements: (elementIds: string[]) => void;
  groupSelectedElements: () => void;
  ungroupElement: (id: string) => void;
  showBorders: boolean;
  setShowBorders: (show: boolean) => void;
  loadSlides: (newSlides: Slide[]) => void;
  canvasSettings: CanvasSettings;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  snapGuides: { x: number[]; y: number[] };
  setSnapGuides: (guides: { x: number[]; y: number[] }) => void;
  canvasZoom: number;
  setCanvasZoom: (zoom: number) => void;
  zoomCanvasIn: () => void;
  zoomCanvasOut: () => void;
  resetCanvasZoom: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

type EditorSnapshot = Pick<EditorContextType, 'slides' | 'settings' | 'canvasSettings'>;

const HISTORY_LIMIT = 50;

// Helper to ensure new slide structure
const createNewSlide = (): Slide => ({
  id: uuidv4(),
  background: '#ffffff', // Legacy/Current active value
  backgroundColor: '#ffffff',
  backgroundImage: '',
  backgroundVideo: '',
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

  const [settings, setSettings] = useState<SliderSettings>(initialSettings);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [propertyMode, setPropertyMode] = useState<ResponsivePropertyMode>('default');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBorders, setShowBorders] = useState(false);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(initialCanvasSettings);
  const [snapGuides, setSnapGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [canvasZoom, setCanvasZoomState] = useState(CANVAS_ZOOM_DEFAULT);

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
  const [isDirty, setIsDirty] = useState(false);
  const [pastSnapshots, setPastSnapshots] = useState<EditorSnapshot[]>([]);
  const [futureSnapshots, setFutureSnapshots] = useState<EditorSnapshot[]>([]);

  const markDirty = () => setIsDirty(true);
  const markSaved = () => setIsDirty(false);
  const createSnapshot = (): EditorSnapshot => ({ slides, settings, canvasSettings });
  const recordChange = () => {
    setPastSnapshots(prev => [...prev.slice(-(HISTORY_LIMIT - 1)), createSnapshot()]);
    setFutureSnapshots([]);
    markDirty();
  };

  const restoreSnapshot = (snapshot: EditorSnapshot) => {
    setSlides(snapshot.slides);
    setSettings(snapshot.settings);
    setCanvasSettings(snapshot.canvasSettings);
    setCurrentSlideIndex(index => Math.min(index, Math.max(snapshot.slides.length - 1, 0)));
    setSelectedElementId(null);
    setSelectedElementIds([]);
  };

  const selectElement = (id: string | null) => {
    setSelectedElementId(id);
    setSelectedElementIds(id ? [id] : []);
  };

  const selectElements = (ids: string[]) => {
    const uniqueIds = [...new Set(ids)];
    setSelectedElementIds(uniqueIds);
    setSelectedElementId(uniqueIds.length === 1 ? uniqueIds[0] : null);
  };

  const toggleElementSelection = (id: string) => {
    setSelectedElementIds(prev => {
      const nextIds = prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id];

      setSelectedElementId(nextIds.length === 1 ? nextIds[0] : null);

      return nextIds;
    });
  };

  const clearSelection = () => {
    setSelectedElementId(null);
    setSelectedElementIds([]);
  };

  const undo = () => {
    const previousSnapshot = pastSnapshots[pastSnapshots.length - 1];
    if (!previousSnapshot) return;

    setPastSnapshots(prev => prev.slice(0, -1));
    setFutureSnapshots(prev => [createSnapshot(), ...prev].slice(0, HISTORY_LIMIT));
    restoreSnapshot(previousSnapshot);
    markDirty();
  };

  const redo = () => {
    const nextSnapshot = futureSnapshots[0];
    if (!nextSnapshot) return;

    setFutureSnapshots(prev => prev.slice(1));
    setPastSnapshots(prev => [...prev.slice(-(HISTORY_LIMIT - 1)), createSnapshot()]);
    restoreSnapshot(nextSnapshot);
    markDirty();
  };

  const updateCanvasSettings = (settings: Partial<CanvasSettings>) => {
    recordChange();
    setCanvasSettings(prev => ({ ...prev, ...settings }));
  };

  const updateSettings = (newSettings: Partial<SliderSettings>) => {
    recordChange();
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addSlide = () => {
    const newSlide = createNewSlide();
    recordChange();
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter(s => s.id !== id);
    recordChange();
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
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

  const addElement = (type: ElementType, options?: { content?: string }) => {
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

        recordChange();
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

    recordChange();
    setSlides(updatedSlides);
    selectElement(newElement.id);
  };

  const updateElementsForMode = (
    updatesById: Record<string, Partial<EditorElement>>,
    mode: ResponsivePropertyMode = 'default',
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

    recordChange();
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

    recordChange();
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

    recordChange();
    setSlides(updatedSlides);
    clearSelection();
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
    recordChange();
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
      recordChange();
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
      recordChange();
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
        recordChange();
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
        recordChange();
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

    recordChange();
    setSlides(updatedSlides);
  };

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

    recordChange();
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

    recordChange();
    setSlides(updatedSlides);
    selectElements(ungroupedElements.map(element => element.id));
  };

  const loadSlides = (newSlides: Slide[]) => {
    recordChange();
    setSlides(newSlides);
    setCurrentSlideIndex(0);
    clearSelection();
  };

  const contextValue = useMemo<EditorContextType>(() => ({
    slides,
    settings,
    updateSettings,
    isDirty,
    markDirty,
    markSaved,
    canUndo: pastSnapshots.length > 0,
    canRedo: futureSnapshots.length > 0,
    undo,
    redo,
    currentSlideIndex,
    selectedElementId,
    selectedElementIds,
    viewMode,
    isPlaying,
    addSlide,
    removeSlide,
    setCurrentSlide: setCurrentSlideIndex,
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
    setViewMode,
    propertyMode,
    setPropertyMode,
    togglePlay: () => setIsPlaying(!isPlaying),
    updateSlideBackground,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    reorderElements,
    groupSelectedElements,
    ungroupElement,
    showBorders,
    setShowBorders,
    loadSlides,
    canvasSettings,
    updateCanvasSettings,
    snapGuides,
    setSnapGuides,
    canvasZoom,
    setCanvasZoom,
    zoomCanvasIn,
    zoomCanvasOut,
    resetCanvasZoom,
  }), [
    slides,
    settings,
    currentSlideIndex,
    selectedElementId,
    selectedElementIds,
    viewMode,
    propertyMode,
    isPlaying,
    showBorders,
    canvasSettings,
    snapGuides,
    canvasZoom,
    isDirty,
    pastSnapshots,
    futureSnapshots,
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
      snapGuides: { x: [], y: [] },
      settings: DEFAULT_SLIDER_SETTINGS,
      canvasSettings: DEFAULT_CANVAS_SETTINGS,
      isDirty: false,
      markDirty: () => { },
      markSaved: () => { },
      canUndo: false,
      canRedo: false,
      undo: () => { },
      redo: () => { },
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
      setViewMode: () => { },
      propertyMode: 'default',
      setPropertyMode: () => { },
      togglePlay: () => { },
      updateSlideBackground: () => { },
      bringToFront: () => { },
      sendToBack: () => { },
      bringForward: () => { },
      sendBackward: () => { },
      reorderElements: () => { },
      groupSelectedElements: () => { },
      ungroupElement: () => { },
      setShowBorders: () => { },
      loadSlides: () => { },
      updateCanvasSettings: () => { },
      setSnapGuides: () => { },
      canvasZoom: CANVAS_ZOOM_DEFAULT,
      setCanvasZoom: () => { },
      zoomCanvasIn: () => { },
      zoomCanvasOut: () => { },
      resetCanvasZoom: () => { },
    } as EditorContextType;
  }
  return context;
};