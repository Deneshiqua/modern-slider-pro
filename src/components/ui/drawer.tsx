import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';

type AsChildProps = { asChild?: boolean };

type DrawerTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  AsChildProps &
  React.RefAttributes<HTMLButtonElement>;
type DrawerCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  AsChildProps &
  React.RefAttributes<HTMLButtonElement>;
type DrawerOverlayProps = React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>;
type DrawerContentProps = React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>;
type DrawerTitleProps = React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>;
type DrawerDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> &
  React.RefAttributes<HTMLParagraphElement>;

const Drawer = ({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger: React.ForwardRefExoticComponent<DrawerTriggerProps> =
  DrawerPrimitive.Trigger as unknown as React.ForwardRefExoticComponent<DrawerTriggerProps>;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose: React.ForwardRefExoticComponent<DrawerCloseProps> =
  DrawerPrimitive.Close as unknown as React.ForwardRefExoticComponent<DrawerCloseProps>;

const DrawerOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn('msp-fixed msp-inset-0 msp-z-overlay-dialog msp-bg-black/80', className)}
      {...(props as React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>)}
    />
  ),
) as React.ForwardRefExoticComponent<DrawerOverlayProps>;
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          'msp-fixed msp-inset-x-0 msp-bottom-0 msp-z-overlay-dialog msp-mt-24 msp-flex msp-h-auto msp-flex-col msp-rounded-t-[10px] msp-border msp-bg-background',
          className,
        )}
        {...(props as React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>)}
      >
        <div className="msp-mx-auto msp-mt-4 msp-h-2 msp-w-[100px] msp-rounded-full msp-bg-muted" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  ),
) as React.ForwardRefExoticComponent<DrawerContentProps>;
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('msp-grid msp-gap-1.5 msp-p-4 msp-text-center sm:msp-text-left', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('msp-mt-auto msp-flex msp-flex-col msp-gap-2 msp-p-4', className)} {...props} />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Title
      ref={ref}
      className={cn('msp-text-lg msp-font-semibold msp-leading-none msp-tracking-tight', className)}
      {...(props as React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>)}
    />
  ),
) as React.ForwardRefExoticComponent<DrawerTitleProps>;
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Description
      ref={ref}
      className={cn('msp-text-sm msp-text-muted-foreground', className)}
      {...(props as React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>)}
    />
  ),
) as React.ForwardRefExoticComponent<DrawerDescriptionProps>;
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
