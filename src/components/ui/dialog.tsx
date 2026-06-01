import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { useMspPortalThemeClasses } from '@/hooks/useMspPortalThemeClasses';
import { swallowInteractOutsideForNestedFloatingPortals } from '@/lib/radixInteractOutsideNestedFloating';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'msp-fixed msp-inset-0 msp-z-overlay-dialog msp-bg-black/80  data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, onInteractOutside: onInteractOutsideProp, ...props }, ref) => {
  const portalTheme = useMspPortalThemeClasses();

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          portalTheme,
          'msp-fixed msp-left-[50%] msp-top-[50%] msp-z-overlay-dialog msp-grid msp-w-full msp-max-w-lg msp-translate-x-[-50%] msp-translate-y-[-50%] msp-gap-4 msp-border msp-bg-background msp-p-6 msp-shadow-lg msp-duration-200 data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0 data-[state=closed]:msp-zoom-out-95 data-[state=open]:msp-zoom-in-95 data-[state=closed]:msp-slide-out-to-left-1/2 data-[state=closed]:msp-slide-out-to-top-[48%] data-[state=open]:msp-slide-in-from-left-1/2 data-[state=open]:msp-slide-in-from-top-[48%] sm:msp-rounded-lg',
          className
        )}
        onInteractOutside={(event) => {
          swallowInteractOutsideForNestedFloatingPortals(event);
          onInteractOutsideProp?.(event);
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="msp-absolute msp-right-4 msp-top-4 msp-rounded-sm msp-opacity-70 msp-ring-offset-background msp-transition-opacity hover:msp-opacity-100 focus:msp-outline-none focus:msp-ring-2 focus:msp-ring-ring focus:msp-ring-offset-2 disabled:msp-pointer-events-none data-[state=open]:msp-bg-accent data-[state=open]:msp-text-muted-foreground">
          <X className="msp-h-4 msp-w-4" />
          <span className="msp-sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('msp-flex msp-flex-col msp-space-y-1.5 msp-text-center sm:msp-text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('msp-flex msp-flex-col-reverse sm:msp-flex-row sm:msp-justify-end sm:msp-space-x-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('msp-text-lg msp-font-semibold msp-leading-none msp-tracking-tight', className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('msp-text-sm msp-text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
