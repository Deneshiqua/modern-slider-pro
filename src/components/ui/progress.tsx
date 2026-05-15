import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn('msp-relative msp-h-4 msp-w-full msp-overflow-hidden msp-rounded-full msp-bg-secondary', className)} {...props}>
    <ProgressPrimitive.Indicator
      className="msp-h-full msp-w-full msp-flex-1 msp-bg-primary msp-transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
