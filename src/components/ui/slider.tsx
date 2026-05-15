import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SliderPrimitive.Root ref={ref} className={cn('msp-relative msp-flex msp-w-full msp-touch-none msp-select-none msp-items-center', className)} {...props}>
      <SliderPrimitive.Track className="msp-relative msp-h-2 msp-w-full msp-grow msp-overflow-hidden msp-rounded-full msp-bg-secondary">
        <SliderPrimitive.Range className="msp-absolute msp-h-full msp-bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="msp-block msp-h-5 msp-w-5 msp-rounded-full msp-border-2 msp-border-primary msp-bg-background msp-ring-offset-background msp-transition-colors focus-visible:msp-outline-none focus-visible:msp-ring-2 focus-visible:msp-ring-ring focus-visible:msp-ring-offset-2 disabled:msp-pointer-events-none disabled:msp-opacity-50" />
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
