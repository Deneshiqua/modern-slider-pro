import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'msp-inline-flex msp-items-center msp-justify-center msp-rounded-md msp-text-sm msp-font-medium msp-ring-offset-background msp-transition-colors hover:msp-bg-muted hover:msp-text-muted-foreground focus-visible:msp-outline-none focus-visible:msp-ring-2 focus-visible:msp-ring-ring focus-visible:msp-ring-offset-2 disabled:msp-pointer-events-none disabled:msp-opacity-50 data-[state=on]:msp-bg-accent data-[state=on]:msp-text-accent-foreground',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'msp-border msp-border-input msp-bg-transparent hover:msp-bg-accent hover:msp-text-accent-foreground',
      },
      size: {
        default: 'msp-h-10 msp-px-3',
        sm: 'msp-h-9 msp-px-2.5',
        lg: 'msp-h-11 msp-px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
