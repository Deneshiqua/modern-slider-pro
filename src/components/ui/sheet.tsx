import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'msp-fixed msp-inset-0 msp-z-50 msp-bg-black/80  data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'msp-fixed msp-z-50 msp-gap-4 msp-bg-background msp-p-6 msp-shadow-lg msp-transition msp-ease-in-out data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-duration-300 data-[state=open]:msp-duration-500',
  {
    variants: {
      side: {
        top: 'msp-inset-x-0 msp-top-0 msp-border-b data-[state=closed]:msp-slide-out-to-top data-[state=open]:msp-slide-in-from-top',
        bottom: 'msp-inset-x-0 msp-bottom-0 msp-border-t data-[state=closed]:msp-slide-out-to-bottom data-[state=open]:msp-slide-in-from-bottom',
        left: 'msp-inset-y-0 msp-left-0 msp-h-full msp-w-3/4 msp-border-r data-[state=closed]:msp-slide-out-to-left data-[state=open]:msp-slide-in-from-left sm:msp-max-w-sm',
        right:
          'msp-inset-y-0 msp-right-0 msp-h-full msp-w-3/4  msp-border-l data-[state=closed]:msp-slide-out-to-right data-[state=open]:msp-slide-in-from-right sm:msp-max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>, VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        <SheetPrimitive.Close className="msp-absolute msp-right-4 msp-top-4 msp-rounded-sm msp-opacity-70 msp-ring-offset-background msp-transition-opacity hover:msp-opacity-100 focus:msp-outline-none focus:msp-ring-2 focus:msp-ring-ring focus:msp-ring-offset-2 disabled:msp-pointer-events-none data-[state=open]:msp-bg-secondary">
          <X className="msp-h-4 msp-w-4" />
          <span className="msp-sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('msp-flex msp-flex-col msp-space-y-2 msp-text-center sm:msp-text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('msp-flex msp-flex-col-reverse sm:msp-flex-row sm:msp-justify-end sm:msp-space-x-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn('msp-text-lg msp-font-semibold msp-text-foreground', className)} {...props} />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description ref={ref} className={cn('msp-text-sm msp-text-muted-foreground', className)} {...props} />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
