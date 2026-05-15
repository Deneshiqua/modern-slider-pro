import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'msp-flex msp-h-10 msp-w-full msp-rounded-md msp-border msp-border-input msp-bg-background msp-px-3 msp-py-2 msp-text-base msp-ring-offset-background file:msp-border-0 file:msp-bg-transparent file:msp-text-sm file:msp-font-medium file:msp-text-foreground placeholder:msp-text-muted-foreground focus-visible:msp-outline-none focus-visible:msp-ring-2 focus-visible:msp-ring-ring focus-visible:msp-ring-offset-2 disabled:msp-cursor-not-allowed disabled:msp-opacity-50 md:msp-text-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
