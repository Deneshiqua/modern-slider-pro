import type { Slide } from '@/types/editor';
import { getSlideOverlayStyle } from '@/lib/slideOverlay';

type SlideOverlayLayerProps = {
  slide: Slide;
  className?: string;
};

/** Semi-transparent layer above slide background, below elements. */
export function SlideOverlayLayer({ slide, className }: SlideOverlayLayerProps) {
  const style = getSlideOverlayStyle(slide);
  if (!style) return null;

  return (
    <div
      className={className ?? 'msp-pointer-events-none msp-absolute msp-inset-0 msp-z-[5]'}
      style={style}
      aria-hidden
    />
  );
}
