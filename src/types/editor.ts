import { Target, TargetAndTransition, Transition, VariantLabels } from 'framer-motion';

export type ElementType = 'text' | 'image' | 'button' | 'box' | 'video';

export interface AnimationConfig {
  initial: boolean | Target | VariantLabels;
  animate: boolean | TargetAndTransition | VariantLabels;
  transition: Transition;
  name: string;
}

export type ViewMode = 'desktop' | 'tablet' | 'mobile';
export type ResponsivePropertyMode = 'default' | ViewMode;

export type ElementStyle = React.CSSProperties & {
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
};

export type ElementHoverColors = Partial<
  Pick<
    ElementStyle,
    | 'backgroundColor'
    | 'color'
    | 'borderTopColor'
    | 'borderRightColor'
    | 'borderBottomColor'
    | 'borderLeftColor'
  >
>;

export interface ResponsiveElementProperties {
  x?: number;
  y?: number;
  rotation?: number;
  style?: Partial<ElementStyle>;
  hoverStyle?: ElementHoverColors;
}

/** Element visibility on the slide timeline (seconds). Drives Framer Motion `delay` / `duration` on playback. */
export interface ElementTimelineClip {
  start: number;
  end: number;
}

export interface SlideTimelineSettings {
  /** Total timeline length for the active slide (seconds). */
  duration: number;
}

export interface EditorElement {
  id: string;
  type: ElementType;
  name?: string;
  isLocked?: boolean;
  isVisible?: boolean;
  content: string; // For text: text content, For image/video: URL
  x: number;
  y: number;
  rotation?: number; // degrees 0-360
  style: ElementStyle;
  hoverStyle?: ElementHoverColors;
  responsive?: Partial<Record<ViewMode, ResponsiveElementProperties>>;
  animation?: AnimationConfig;
  /** When set, overrides animation timing for entrance playback (Rev Slider–style timeline). */
  timelineClip?: ElementTimelineClip;
  children?: EditorElement[]; // For nested elements (Box)
  /** True when this box was created via "Group selection" (children are not independently draggable). */
  isGroup?: boolean;
}

export interface Slide {
  id: string;
  // Store separate values for each background type
  backgroundColor: string;
  backgroundImage: string;
  backgroundVideo: string;
  // Current active type
  backgroundType: 'color' | 'image' | 'video';
  // Legacy field for backward compatibility (optional, or can be removed if we migrate fully)
  background: string;
  elements: EditorElement[];
  timeline?: SlideTimelineSettings;
}

export interface SliderSettings {
  autoPlay: boolean;
  interval: number; // seconds
  loop: boolean;
  showArrows: boolean;
  showDots: boolean;
}

export interface SliderProject {
  version: 1;
  slides: Slide[];
  settings: SliderSettings;
  canvasSettings: CanvasSettings;
}

export type SliderEditorSavePayload = SliderProject;

export interface CanvasSettings {
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToElements: boolean;
  /** Editor-only: draw vertical + horizontal lines at canvas center (+). */
  showCenterGuides: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export interface EditorState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementId: string | null;
  viewMode: ViewMode;
  isPlaying: boolean;
}