import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'msp-peer msp-inline-flex msp-h-6 msp-w-11 msp-shrink-0 msp-cursor-pointer msp-items-center msp-rounded-full msp-border-2 msp-border-transparent msp-transition-colors focus-visible:msp-outline-none focus-visible:msp-ring-2 focus-visible:msp-ring-ring focus-visible:msp-ring-offset-2 focus-visible:msp-ring-offset-background disabled:msp-cursor-not-allowed disabled:msp-opacity-50 data-[state=checked]:msp-bg-primary data-[state=unchecked]:msp-bg-input',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'msp-pointer-events-none msp-block msp-h-5 msp-w-5 msp-rounded-full msp-bg-background msp-shadow-lg msp-ring-0 msp-transition-transform data-[state=checked]:msp-translate-x-5 data-[state=unchecked]:msp-translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
