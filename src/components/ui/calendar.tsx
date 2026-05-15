import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'msp-flex msp-flex-col sm:msp-flex-row msp-space-y-4 sm:msp-space-x-4 sm:msp-space-y-0',
        month: 'space-y-4',
        caption: 'msp-flex msp-justify-center msp-pt-1 msp-relative msp-items-center',
        caption_label: 'msp-text-sm msp-font-medium',
        nav: 'msp-space-x-1 msp-flex msp-items-center',
        nav_button: cn(buttonVariants({ variant: 'outline' }), 'msp-h-7 msp-w-7 msp-bg-transparent msp-p-0 msp-opacity-50 hover:msp-opacity-100'),
        nav_button_previous: 'msp-absolute msp-left-1',
        nav_button_next: 'msp-absolute msp-right-1',
        table: 'msp-w-full msp-border-collapse msp-space-y-1',
        head_row: 'flex',
        head_cell: 'msp-text-muted-foreground msp-rounded-md msp-w-9 msp-font-normal msp-text-[0.8rem]',
        row: 'msp-flex msp-w-full msp-mt-2',
        cell: 'msp-h-9 msp-w-9 msp-text-center msp-text-sm msp-p-0 msp-relative [&:has([aria-selected].day-range-end)]:msp-rounded-r-md [&:has([aria-selected].day-outside)]:msp-bg-accent/50 [&:has([aria-selected])]:msp-bg-accent first:[&:has([aria-selected])]:msp-rounded-l-md last:[&:has([aria-selected])]:msp-rounded-r-md focus-within:msp-relative focus-within:msp-z-20',
        day: cn(buttonVariants({ variant: 'ghost' }), 'msp-h-9 msp-w-9 msp-p-0 msp-font-normal aria-selected:msp-opacity-100'),
        day_range_end: 'day-range-end',
        day_selected:
          'msp-bg-primary msp-text-primary-foreground hover:msp-bg-primary hover:msp-text-primary-foreground focus:msp-bg-primary focus:msp-text-primary-foreground',
        day_today: 'msp-bg-accent msp-text-accent-foreground',
        day_outside:
          'msp-day-outside msp-text-muted-foreground msp-opacity-50 aria-selected:msp-bg-accent/50 aria-selected:msp-text-muted-foreground aria-selected:msp-opacity-30',
        day_disabled: 'msp-text-muted-foreground msp-opacity-50',
        day_range_middle: 'aria-selected:msp-bg-accent aria-selected:msp-text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (
          orientation === 'left'
            ? <ChevronLeft className="msp-h-4 msp-w-4" />
            : <ChevronRight className="msp-h-4 msp-w-4" />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
