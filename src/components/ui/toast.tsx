import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'msp-fixed msp-top-0 msp-z-overlay-toast msp-flex msp-max-h-screen msp-w-full msp-flex-col-reverse msp-p-4 sm:msp-bottom-0 sm:msp-right-0 sm:msp-top-auto sm:msp-flex-col md:msp-max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'msp-group msp-pointer-events-auto msp-relative msp-flex msp-w-full msp-items-center msp-justify-between msp-space-x-4 msp-overflow-hidden msp-rounded-md msp-border msp-p-6 msp-pr-8 msp-shadow-lg msp-transition-all data-[swipe=cancel]:msp-translate-x-0 data-[swipe=end]:msp-translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:msp-translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:msp-transition-none data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[swipe=end]:msp-animate-out data-[state=closed]:msp-fade-out-80 data-[state=closed]:msp-slide-out-to-right-full data-[state=open]:msp-slide-in-from-top-full data-[state=open]:sm:msp-slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'msp-border msp-bg-background msp-text-foreground',
        destructive: 'msp-destructive msp-group msp-border-destructive msp-bg-destructive msp-text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />;
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'msp-inline-flex msp-h-8 msp-shrink-0 msp-items-center msp-justify-center msp-rounded-md msp-border msp-bg-transparent msp-px-3 msp-text-sm msp-font-medium msp-ring-offset-background msp-transition-colors hover:msp-bg-secondary focus:msp-outline-none focus:msp-ring-2 focus:msp-ring-ring focus:msp-ring-offset-2 disabled:msp-pointer-events-none disabled:msp-opacity-50 group-[.destructive]:msp-border-muted/40 group-[.destructive]:hover:msp-border-destructive/30 group-[.destructive]:hover:msp-bg-destructive group-[.destructive]:hover:msp-text-destructive-foreground group-[.destructive]:focus:msp-ring-destructive',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'msp-absolute msp-right-2 msp-top-2 msp-rounded-md msp-p-1 msp-text-foreground/50 msp-opacity-0 msp-transition-opacity hover:msp-text-foreground focus:msp-opacity-100 focus:msp-outline-none focus:msp-ring-2 group-hover:msp-opacity-100 group-[.destructive]:msp-text-red-300 group-[.destructive]:hover:msp-text-red-50 group-[.destructive]:focus:msp-ring-red-400 group-[.destructive]:focus:msp-ring-offset-red-600',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="msp-h-4 msp-w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => <ToastPrimitives.Title ref={ref} className={cn('msp-text-sm msp-font-semibold', className)} {...props} />);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => <ToastPrimitives.Description ref={ref} className={cn('msp-text-sm msp-opacity-90', className)} {...props} />);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
