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
  /** Optional URL used when this element type is `button`. */
  buttonLink?: string;
  /** Link target used when this element type is `button`. */
  buttonLinkTarget?: '_self' | '_blank';
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

/** Image/video background sizing: cover (fill crop), contain (fit), fill (stretch), none (natural). */
export type SlideBackgroundFit = 'cover' | 'contain' | 'fill' | 'none';

export interface Slide {
  id: string;
  // Store separate values for each background type
  backgroundColor: string;
  backgroundImage: string;
  backgroundVideo: string;
  /** How image/video backgrounds fill the slide. Defaults to `cover`. */
  backgroundFit?: SlideBackgroundFit;
  /** Tint layer over the background (below slide elements). */
  overlayEnabled?: boolean;
  overlayColor?: string;
  /** 0–1 */
  overlayOpacity?: number;
  // Current active type
  backgroundType: 'color' | 'image' | 'video';
  // Legacy field for backward compatibility (optional, or can be removed if we migrate fully)
  background: string;
  elements: EditorElement[];
  timeline?: SlideTimelineSettings;
}

export type SlideTransitionType = 'none' | 'fade' | 'slide' | 'slideUp' | 'zoom';

/** `perSlide`: bar refills for each slide. `allSlides`: one continuous bar across the deck. */
export type ProgressBarScope = 'perSlide' | 'allSlides';

export interface SliderSettings {
  autoPlay: boolean;
  interval: number; // seconds
  loop: boolean;
  showArrows: boolean;
  showDots: boolean;
  /** Thin progress bar along the bottom edge of the slider. */
  showProgressBar: boolean;
  progressBarColor: string;
  /** Fill opacity (0–1). */
  progressBarOpacity: number;
  /** Track background opacity (0–1). */
  progressBarTrackOpacity: number;
  /** Per-slide refill vs cumulative progress across all slides. */
  progressBarScope: ProgressBarScope;
  /** Bar height in pixels (1–5). */
  progressBarHeight: number;
  /** When false, slides change instantly (no transition). */
  slideTransitionEnabled: boolean;
  /** Transition when changing slides (preview + SliderRunner). */
  slideTransition: SlideTransitionType;
  /** Transition length in seconds. */
  slideTransitionDuration: number;
}

export interface SliderProject {
  version: 1;
  slides: Slide[];
  settings: SliderSettings;
  canvasSettings: CanvasSettings;
}

export type SliderEditorSavePayload = SliderProject;

/** How SliderRunner derives its outer height from `canvasHeight`. */
export type CanvasHeightMode = 'fixed' | 'responsive' | 'fitBackground';

export interface CanvasSettings {
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToElements: boolean;
  /** Editor-only: draw vertical + horizontal lines at canvas center (+). */
  showCenterGuides: boolean;
  /** Editor-only: show slide animation timeline panel below the canvas. */
  showTimeline: boolean;
  canvasWidth: number;
  /** Design / max height in px. Used as fixed height or upper cap depending on `canvasHeightMode`. */
  canvasHeight: number;
  /**
   * - fixed: always `canvasHeight`
   * - responsive: width 100%, aspect-ratio from canvas, `max-height: canvasHeight` (shrinks on narrow viewports)
   * - fitBackground: when slide background uses contain, height follows image aspect ratio up to `canvasHeight`
   */
  canvasHeightMode?: CanvasHeightMode;
}

export interface EditorState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementId: string | null;
  viewMode: ViewMode;
  isPlaying: boolean;
}