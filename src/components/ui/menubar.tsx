import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { Check, ChevronRight, Circle } from 'lucide-react';

import { cn } from '@/lib/utils';

const MenubarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu;

const MenubarGroup: typeof MenubarPrimitive.Group = MenubarPrimitive.Group;

const MenubarPortal: typeof MenubarPrimitive.Portal = MenubarPrimitive.Portal;

const MenubarSub: typeof MenubarPrimitive.Sub = MenubarPrimitive.Sub;

const MenubarRadioGroup: typeof MenubarPrimitive.RadioGroup = MenubarPrimitive.RadioGroup;

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn('msp-flex msp-h-10 msp-items-center msp-space-x-1 msp-rounded-md msp-border msp-bg-background msp-p-1', className)}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      'msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-px-3 msp-py-1.5 msp-text-sm msp-font-medium msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[state=open]:msp-bg-accent data-[state=open]:msp-text-accent-foreground',
      className
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-px-2 msp-py-1.5 msp-text-sm msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[state=open]:msp-bg-accent data-[state=open]:msp-text-accent-foreground',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="msp-ml-auto msp-h-4 msp-w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      'msp-z-overlay-select msp-min-w-[8rem] msp-overflow-hidden msp-rounded-md msp-border msp-bg-popover msp-p-1 msp-text-popover-foreground data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0 data-[state=closed]:msp-zoom-out-95 data-[state=open]:msp-zoom-in-95 data-[side=bottom]:msp-slide-in-from-top-2 data-[side=left]:msp-slide-in-from-right-2 data-[side=right]:msp-slide-in-from-left-2 data-[side=top]:msp-slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = 'start', alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        'msp-z-overlay-select msp-min-w-[12rem] msp-overflow-hidden msp-rounded-md msp-border msp-bg-popover msp-p-1 msp-text-popover-foreground msp-shadow-md data-[state=open]:msp-animate-in data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0 data-[state=closed]:msp-zoom-out-95 data-[state=open]:msp-zoom-in-95 data-[side=bottom]:msp-slide-in-from-top-2 data-[side=left]:msp-slide-in-from-right-2 data-[side=right]:msp-slide-in-from-left-2 data-[side=top]:msp-slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      'msp-relative msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-px-2 msp-py-1.5 msp-text-sm msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[disabled]:msp-pointer-events-none data-[disabled]:msp-opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'msp-relative msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-py-1.5 msp-pl-8 msp-pr-2 msp-text-sm msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[disabled]:msp-pointer-events-none data-[disabled]:msp-opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="msp-absolute msp-left-2 msp-flex msp-h-3.5 msp-w-3.5 msp-items-center msp-justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="msp-h-4 msp-w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'msp-relative msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-py-1.5 msp-pl-8 msp-pr-2 msp-text-sm msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[disabled]:msp-pointer-events-none data-[disabled]:msp-opacity-50',
      className
    )}
    {...props}
  >
    <span className="msp-absolute msp-left-2 msp-flex msp-h-3.5 msp-w-3.5 msp-items-center msp-justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="msp-h-2 msp-w-2 msp-fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label ref={ref} className={cn('msp-px-2 msp-py-1.5 msp-text-sm msp-font-semibold', inset && 'pl-8', className)} {...props} />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator ref={ref} className={cn('-msp-mx-1 msp-my-1 msp-h-px msp-bg-muted', className)} {...props} />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('msp-ml-auto msp-text-xs msp-tracking-widest msp-text-muted-foreground', className)} {...props} />;
};
MenubarShortcut.displayname = 'MenubarShortcut';

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
