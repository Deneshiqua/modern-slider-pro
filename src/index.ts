// Styles — consumers should import this once in their app entry:
// import 'modern-slider-pro/style.css';

import './index.css';

// Main components
export { default as SliderEditor } from './components/editor/EditorLayout';
export { default as SliderRunner } from './components/SliderRunner';

// Context & hooks (for advanced usage)
export { EditorProvider, useEditor } from './context/EditorContext';

// Types
export type {
    Slide,
    EditorElement,
    ElementType,
    SliderSettings,
    CanvasSettings,
    AnimationConfig,
    ViewMode,
} from './types/editor';

// Constants (useful for consumers building custom UIs)
export {
    DEFAULT_SLIDE,
    DEFAULT_SLIDER_SETTINGS,
    DEFAULT_CANVAS_SETTINGS,
    VIEWPORT_SIZE,
    ANIMATION_PRESETS,
} from './lib/constants';
