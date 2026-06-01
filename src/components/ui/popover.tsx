import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { useMspPortalThemeClasses } from '@/hooks/useMspPortalThemeClasses';
import { swallowInteractOutsideForNestedFloatingPortals } from '@/lib/radixInteractOutsideNestedFloating';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(
  ({ className, align = 'center', sideOffset = 4, onInteractOutside: onInteractOutsideProp, ...props }, ref) => {
    const portalTheme = useMspPortalThemeClasses();

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            portalTheme,
            'msp-z-overlay-popover msp-w-72 msp-rounded-md msp-border msp-bg-popover msp-p-4 msp-text-popover-foreground msp-shadow-md msp-outline-none data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0 data-[state=closed]:msp-zoom-out-95 data-[state=open]:msp-zoom-in-95 data-[side=bottom]:msp-slide-in-from-top-2 data-[side=left]:msp-slide-in-from-right-2 data-[side=right]:msp-slide-in-from-left-2 data-[side=top]:msp-slide-in-from-bottom-2',
            className,
          )}
          onInteractOutside={(event) => {
            swallowInteractOutsideForNestedFloatingPortals(event);
            onInteractOutsideProp?.(event);
          }}
          {...props}
        />
      </PopoverPrimitive.Portal>
    );
  },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
