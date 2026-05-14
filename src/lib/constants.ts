import { AnimationConfig, CanvasSettings, Slide, SliderSettings } from '@/types/editor';

export const DEFAULT_SLIDE: Omit<Slide, 'id'> = {
  backgroundColor: '#ffffff',
  backgroundImage: '',
  backgroundVideo: '',
  backgroundType: 'color',
  background: '#ffffff',
  elements: [],
};

export const DEFAULT_SLIDER_SETTINGS: SliderSettings = {
  autoPlay: false,
  interval: 5,
  loop: true,
  showArrows: true,
  showDots: true,
};

export const VIEWPORT_SIZE = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  gridSize: 50,
  showGrid: true,
  snapToElements: true,
  canvasWidth: 1280,
  canvasHeight: 720,
};

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 64, 72, 96];
export const BORDER_RADII = [0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 9999]; // 9999 for full rounded/circle

export const ANIMATION_PRESETS: Record<string, AnimationConfig> = {
  FADE_IN: {
    name: 'Fade In',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  SLIDE_UP: {
    name: 'Slide Up',
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  SLIDE_DOWN: {
    name: 'Slide Down',
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  SLIDE_LEFT: {
    name: 'Slide Left',
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  },
  SLIDE_RIGHT: {
    name: 'Slide Right',
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5 }
  },
  SCALE_UP: {
    name: 'Scale Up',
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  },
  BOUNCE: {
    name: 'Bounce',
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  }
};