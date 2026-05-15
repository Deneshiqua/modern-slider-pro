import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'msp-peer msp-h-4 msp-w-4 msp-shrink-0 msp-rounded-sm msp-border msp-border-primary msp-ring-offset-background focus-visible:msp-outline-none focus-visible:msp-ring-2 focus-visible:msp-ring-ring focus-visible:msp-ring-offset-2 disabled:msp-cursor-not-allowed disabled:msp-opacity-50 data-[state=checked]:msp-bg-primary data-[state=checked]:msp-text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('msp-flex msp-items-center msp-justify-center msp-text-current')}>
      <Check className="msp-h-4 msp-w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
