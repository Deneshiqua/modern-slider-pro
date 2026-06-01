import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { useMspPortalThemeClasses } from '@/hooks/useMspPortalThemeClasses';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'msp-flex msp-h-10 msp-w-full msp-items-center msp-justify-between msp-rounded-md msp-border msp-border-input msp-bg-background msp-px-3 msp-py-2 msp-text-sm msp-ring-offset-background placeholder:msp-text-muted-foreground focus:msp-outline-none focus:msp-ring-2 focus:msp-ring-ring focus:msp-ring-offset-2 disabled:msp-cursor-not-allowed disabled:msp-opacity-50 [&>span]:msp-line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="msp-h-4 msp-w-4 msp-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton ref={ref} className={cn('msp-flex msp-cursor-default msp-items-center msp-justify-center msp-py-1', className)} {...props}>
    <ChevronUp className="msp-h-4 msp-w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton ref={ref} className={cn('msp-flex msp-cursor-default msp-items-center msp-justify-center msp-py-1', className)} {...props}>
    <ChevronDown className="msp-h-4 msp-w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  const portalTheme = useMspPortalThemeClasses();

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          portalTheme,
          'msp-relative msp-z-overlay-select msp-max-h-96 msp-min-w-[8rem] msp-overflow-hidden msp-rounded-md msp-border msp-bg-popover msp-text-popover-foreground msp-shadow-md data-[state=open]:msp-animate-in data-[state=closed]:msp-animate-out data-[state=closed]:msp-fade-out-0 data-[state=open]:msp-fade-in-0 data-[state=closed]:msp-zoom-out-95 data-[state=open]:msp-zoom-in-95 data-[side=bottom]:msp-slide-in-from-top-2 data-[side=left]:msp-slide-in-from-right-2 data-[side=right]:msp-slide-in-from-left-2 data-[side=top]:msp-slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:msp-translate-y-1 data-[side=left]:-msp-translate-x-1 data-[side=right]:msp-translate-x-1 data-[side=top]:-msp-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'msp-p-1',
            position === 'popper' && 'msp-h-[var(--radix-select-trigger-height)] msp-w-full msp-min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn('msp-py-1.5 msp-pl-8 msp-pr-2 msp-text-sm msp-font-semibold', className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'msp-relative msp-flex msp-w-full msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-py-1.5 msp-pl-8 msp-pr-2 msp-text-sm msp-outline-none focus:msp-bg-accent focus:msp-text-accent-foreground data-[disabled]:msp-pointer-events-none data-[disabled]:msp-opacity-50',
      className
    )}
    {...props}
  >
    <span className="msp-absolute msp-left-2 msp-flex msp-h-3.5 msp-w-3.5 msp-items-center msp-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="msp-h-4 msp-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('-msp-mx-1 msp-my-1 msp-h-px msp-bg-muted', className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
