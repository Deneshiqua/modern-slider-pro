import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'msp-flex msp-min-h-[80px] msp-w-full msp-rounded-md msp-border msp-border-input msp-bg-background msp-px-3 msp-py-2 msp-text-sm msp-ring-offset-background placeholder:msp-text-muted-foreground focus-visible:msp-outline-none focus-visible:msp-ring-2 focus-visible:msp-ring-ring focus-visible:msp-ring-offset-2 disabled:msp-cursor-not-allowed disabled:msp-opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
