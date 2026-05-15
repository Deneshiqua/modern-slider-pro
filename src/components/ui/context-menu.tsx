import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';

import { cn } from '@/lib/utils';

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
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
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'msp-z-50 msp-min-w-[8rem] msp-overflow-hidden msp-rounded-md msp-border msp-bg-popover msp-p-1 msp-text-popover-foreground msp-shadow-md data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0 data-[state=closed]:msp-zoom-out-95 data-[state=open]:msp-zoom-in-95 data-[side=bottom]:msp-slide-in-from-top-2 data-[side=left]:msp-slide-in-from-right-2 data-[side=right]:msp-slide-in-from-left-2 data-[side=top]:msp-slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        'msp-z-50 msp-min-w-[8rem] msp-overflow-hidden msp-rounded-md msp-border msp-bg-popover msp-p-1 msp-text-popover-foreground msp-shadow-md msp-animate-in msp-fade-in-80 data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0 data-[state=closed]:msp-zoom-out-95 data-[state=open]:msp-zoom-in-95 data-[side=bottom]:msp-slide-in-from-top-2 data-[side=left]:msp-slide-in-from-right-2 data-[side=right]:msp-slide-in-from-left-2 data-[side=top]:msp-slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      'msp-relative msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-px-2 msp-py-1.5 msp-text-sm msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[disabled]:msp-pointer-events-none data-[disabled]:msp-opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'msp-relative msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-py-1.5 msp-pl-8 msp-pr-2 msp-text-sm msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[disabled]:msp-pointer-events-none data-[disabled]:msp-opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="msp-absolute msp-left-2 msp-flex msp-h-3.5 msp-w-3.5 msp-items-center msp-justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="msp-h-4 msp-w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'msp-relative msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-py-1.5 msp-pl-8 msp-pr-2 msp-text-sm msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[disabled]:msp-pointer-events-none data-[disabled]:msp-opacity-50',
      className
    )}
    {...props}
  >
    <span className="msp-absolute msp-left-2 msp-flex msp-h-3.5 msp-w-3.5 msp-items-center msp-justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="msp-h-2 msp-w-2 msp-fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn('msp-px-2 msp-py-1.5 msp-text-sm msp-font-semibold msp-text-foreground', inset && 'pl-8', className)}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator ref={ref} className={cn('-msp-mx-1 msp-my-1 msp-h-px msp-bg-border', className)} {...props} />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('msp-ml-auto msp-text-xs msp-tracking-widest msp-text-muted-foreground', className)} {...props} />;
};
ContextMenuShortcut.displayName = 'ContextMenuShortcut';

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
