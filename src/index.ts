// Styles — consumers should import this once in their app entry:
// import 'modern-slider-pro/style.css';

import './lib.css';

// Main components
export { default as SliderEditor } from './components/editor/EditorLayout';
export { default as SliderRunner } from './components/SliderRunner';
export type { SliderEditorProps } from './components/editor/EditorLayout';

// Context & hooks (for advanced usage)
export { EditorProvider, useEditor } from './context/EditorContext';
export type { EditorProviderProps } from './context/EditorContext';
export { LanguageProvider, useLanguage } from './context/LanguageContext';
export type {
    LanguageContextType,
    LanguageProviderProps,
    TranslationDictionary,
    TranslationKey,
} from './context/LanguageContext';
export { ThemeProvider, useTheme } from './context/ThemeContext';
export type { Theme, ThemeContextType, ThemeProviderProps } from './context/ThemeContext';
export { PublishedSlidesProvider, usePublishedSlides } from './context/PublishedSlidesContext';
export type {
    PublishedSlidesContextType,
    PublishedSlidesProviderProps,
} from './context/PublishedSlidesContext';

// Types
export type {
    Slide,
    EditorElement,
    ElementType,
    ElementStyle,
    ResponsiveElementProperties,
    ResponsivePropertyMode,
    SliderProject,
    SliderEditorSavePayload,
    SliderSettings,
    SlideTransitionType,
    CanvasSettings,
    AnimationConfig,
    ViewMode,
    ElementHoverColors,
} from './types/editor';
export type { Language } from './lib/translations';
export {
    getElementPropertiesForMode,
    mergeResponsiveElementUpdates,
    resolveElementProperties,
} from './lib/responsive';

// Constants (useful for consumers building custom UIs)
export {
    DEFAULT_SLIDE,
    DEFAULT_SLIDER_SETTINGS,
    DEFAULT_CANVAS_SETTINGS,
    VIEWPORT_SIZE,
    ANIMATION_PRESETS,
} from './lib/constants';
export {
    SLIDE_TRANSITION_OPTIONS,
    normalizeSliderSettings,
    resolveSlideTransitionMotion,
} from './lib/slideTransitions';
export type { SlideTransitionDirection } from './lib/slideTransitions';
