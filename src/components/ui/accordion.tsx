import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => <AccordionPrimitive.Item ref={ref} className={cn('border-b', className)} {...props} />);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="msp-flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'msp-flex msp-flex-1 msp-items-center msp-justify-between msp-py-4 msp-font-medium msp-transition-all hover:msp-underline [&[data-state=open]>svg]:msp-rotate-180',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="msp-h-4 msp-w-4 msp-shrink-0 msp-transition-transform msp-duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="msp-overflow-hidden msp-text-sm msp-transition-all data-[state=closed]:msp-animate-accordion-up data-[state=open]:msp-animate-accordion-down"
    {...props}
  >
    <div className={cn('msp-pb-4 msp-pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
