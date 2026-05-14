import { CanvasSettings, EditorElement, EditorState, ElementType, Slide, SliderSettings, ViewMode } from '@/types/editor';
import React, { ReactNode, createContext, useContext, useState } from 'react';

import { DEFAULT_CANVAS_SETTINGS, DEFAULT_SLIDER_SETTINGS } from '@/lib/constants';
import { DEMO_SLIDES } from '@/lib/demoSlides';
import { v4 as uuidv4 } from 'uuid';

interface EditorContextType extends EditorState {
  settings: SliderSettings;
  updateSettings: (settings: Partial<SliderSettings>) => void;
  addSlide: () => void;
  removeSlide: (id: string) => void;
  setCurrentSlide: (index: number) => void;
  addElement: (type: ElementType, options?: { content?: string }) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  togglePlay: () => void;
  updateSlideBackground: (value: string, type: 'color' | 'image' | 'video') => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  reorderElements: (elementIds: string[]) => void;
  showBorders: boolean;
  setShowBorders: (show: boolean) => void;
  loadSlides: (newSlides: Slide[]) => void;
  canvasSettings: CanvasSettings;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  snapGuides: { x: number[]; y: number[] };
  setSnapGuides: (guides: { x: number[]; y: number[] }) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

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

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [slides, setSlides] = useState<Slide[]>(DEMO_SLIDES);

  const [settings, setSettings] = useState<SliderSettings>(DEFAULT_SLIDER_SETTINGS);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBorders, setShowBorders] = useState(false);
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS);
  const [snapGuides, setSnapGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const updateCanvasSettings = (settings: Partial<CanvasSettings>) => {
    setCanvasSettings(prev => ({ ...prev, ...settings }));
  };

  const updateSettings = (newSettings: Partial<SliderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addSlide = () => {
    const newSlide = createNewSlide();
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter(s => s.id !== id);
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

        setSlides(updatedSlides);
        setSelectedElementId(newElement.id);
        return;
      }
    }

    // Default: Add to root level
    newElement.style.zIndex = currentSlide.elements.length + 1;
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement]
    };

    setSlides(updatedSlides);
    setSelectedElementId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const updateRecursive = (elements: EditorElement[]): EditorElement[] => {
      return elements.map(el => {
        if (el.id === id) {
          return {
            ...el,
            ...updates,
            style: {
              ...el.style,
              ...(updates.style || {})
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

    setSlides(updatedSlides);
  };

  const removeElement = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];

    const removeRecursive = (elements: EditorElement[]): EditorElement[] => {
      return elements.filter(el => el.id !== id).map(el => {
        if (el.children) {
          return { ...el, children: removeRecursive(el.children) };
        }
        return el;
      });
    };

    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: removeRecursive(currentSlide.elements)
    };

    setSlides(updatedSlides);
    setSelectedElementId(null);
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
    setSlides(updatedSlides);
  };

  // Helper to normalize Z-indices to be sequential (1, 2, 3...)
  const normalizeZIndices = (elements: EditorElement[]) => {
    return elements
      .sort((a, b) => (Number(a.style.zIndex) || 0) - (Number(b.style.zIndex) || 0))
      .map((el, index) => ({
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

    setSlides(updatedSlides);
  };

  const loadSlides = (newSlides: Slide[]) => {
    setSlides(newSlides);
    setCurrentSlideIndex(0);
    setSelectedElementId(null);
  };

  return (
    <EditorContext.Provider value={{
      slides,
      settings,
      updateSettings,
      currentSlideIndex,
      selectedElementId,
      viewMode,
      isPlaying,
      addSlide,
      removeSlide,
      setCurrentSlide: setCurrentSlideIndex,
      addElement,
      updateElement,
      removeElement,
      selectElement: setSelectedElementId,
      setViewMode,
      togglePlay: () => setIsPlaying(!isPlaying),
      updateSlideBackground,
      bringToFront,
      sendToBack,
      bringForward,
      sendBackward,
      reorderElements,
      showBorders,
      setShowBorders,
      loadSlides,
      canvasSettings,
      updateCanvasSettings,
      snapGuides,
      setSnapGuides,
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};