import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn('msp-relative msp-z-10 msp-flex msp-max-w-max msp-flex-1 msp-items-center msp-justify-center', className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn('msp-group msp-flex msp-flex-1 msp-list-none msp-items-center msp-justify-center msp-space-x-1', className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  'msp-group msp-inline-flex msp-h-10 msp-w-max msp-items-center msp-justify-center msp-rounded-md msp-bg-background msp-px-4 msp-py-2 msp-text-sm msp-font-medium msp-transition-colors hover:msp-bg-accent hover:msp-text-accent-foreground focus:msp-bg-accent focus:msp-text-accent-foreground focus:msp-outline-none disabled:msp-pointer-events-none disabled:msp-opacity-50 data-[active]:msp-bg-accent/50 data-[state=open]:msp-bg-accent/50'
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger ref={ref} className={cn(navigationMenuTriggerStyle(), 'group', className)} {...props}>
    {children}{' '}
    <ChevronDown
      className="msp-relative msp-top-[1px] msp-ml-1 msp-h-3 msp-w-3 msp-transition msp-duration-200 group-data-[state=open]:msp-rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      'msp-left-0 msp-top-0 msp-w-full data-[motion^=from-]:msp-animate-in data-[motion^=to-]:msp-animate-out data-[motion^=from-]:msp-fade-in data-[motion^=to-]:msp-fade-out data-[motion=from-end]:msp-slide-in-from-right-52 data-[motion=from-start]:msp-slide-in-from-left-52 data-[motion=to-end]:msp-slide-out-to-right-52 data-[motion=to-start]:msp-slide-out-to-left-52 md:msp-absolute md:msp-w-auto ',
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn('msp-absolute msp-left-0 msp-top-full msp-flex msp-justify-center')}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      'msp-top-full msp-z-[1] msp-flex msp-h-1.5 msp-items-end msp-justify-center msp-overflow-hidden data-[state=visible]:msp-animate-in data-[state=hidden]:msp-animate-out data-[state=hidden]:msp-fade-out data-[state=visible]:msp-fade-in',
      className
    )}
    {...props}
  >
    <div className="msp-relative msp-top-[60%] msp-h-2 msp-w-2 msp-rotate-45 msp-rounded-tl-sm msp-bg-border msp-shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
