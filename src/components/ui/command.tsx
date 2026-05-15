import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn('msp-flex msp-h-full msp-w-full msp-flex-col msp-overflow-hidden msp-rounded-md msp-bg-popover msp-text-popover-foreground', className)}
      {...props}
    />
  )
);
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="msp-overflow-hidden msp-p-0 msp-shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:msp-px-2 [&_[cmdk-group-heading]]:msp-font-medium [&_[cmdk-group-heading]]:msp-text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:msp-pt-0 [&_[cmdk-group]]:msp-px-2 [&_[cmdk-input-wrapper]_svg]:msp-h-5 [&_[cmdk-input-wrapper]_svg]:msp-w-5 [&_[cmdk-input]]:msp-h-12 [&_[cmdk-item]]:msp-px-2 [&_[cmdk-item]]:msp-py-3 [&_[cmdk-item]_svg]:msp-h-5 [&_[cmdk-item]_svg]:msp-w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="msp-flex msp-items-center msp-border-b msp-px-3" cmdk-input-wrapper="">
    <Search className="msp-mr-2 msp-h-4 msp-w-4 msp-shrink-0 msp-opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'msp-flex msp-h-11 msp-w-full msp-rounded-md msp-bg-transparent msp-py-3 msp-text-sm msp-outline-none placeholder:msp-text-muted-foreground disabled:msp-cursor-not-allowed disabled:msp-opacity-50',
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List ref={ref} className={cn('msp-max-h-[300px] msp-overflow-y-auto msp-overflow-x-hidden', className)} {...props} />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => <CommandPrimitive.Empty ref={ref} className="msp-py-6 msp-text-center msp-text-sm" {...props} />);

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'msp-overflow-hidden msp-p-1 msp-text-foreground [&_[cmdk-group-heading]]:msp-px-2 [&_[cmdk-group-heading]]:msp-py-1.5 [&_[cmdk-group-heading]]:msp-text-xs [&_[cmdk-group-heading]]:msp-font-medium [&_[cmdk-group-heading]]:msp-text-muted-foreground',
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => <CommandPrimitive.Separator ref={ref} className={cn('-msp-mx-1 msp-h-px msp-bg-border', className)} {...props} />);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "msp-relative msp-flex msp-cursor-default msp-select-none msp-items-center msp-rounded-sm msp-px-2 msp-py-1.5 msp-text-sm msp-outline-none data-[disabled=true]:msp-pointer-events-none data-[selected='true']:msp-bg-accent data-[selected=true]:msp-text-accent-foreground data-[disabled=true]:msp-opacity-50",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('msp-ml-auto msp-text-xs msp-tracking-widest msp-text-muted-foreground', className)} {...props} />;
};
CommandShortcut.displayName = 'CommandShortcut';

export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator };
