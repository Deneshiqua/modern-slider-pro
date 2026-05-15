import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Dot } from 'lucide-react';

import { cn } from '@/lib/utils';

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn('msp-flex msp-items-center msp-gap-2 has-[:disabled]:msp-opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
);
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('msp-flex msp-items-center', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'> & { index: number }>(
  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

    return (
      <div
        ref={ref}
        className={cn(
          'msp-relative msp-flex msp-h-10 msp-w-10 msp-items-center msp-justify-center msp-border-y msp-border-r msp-border-input msp-text-sm msp-transition-all first:msp-rounded-l-md first:msp-border-l last:msp-rounded-r-md',
          isActive && 'msp-z-10 msp-ring-2 msp-ring-ring msp-ring-offset-background',
          className
        )}
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className="msp-pointer-events-none msp-absolute msp-inset-0 msp-flex msp-items-center msp-justify-center">
            <div className="msp-h-4 msp-w-px msp-animate-caret-blink msp-bg-foreground msp-duration-1000" />
          </div>
        )}
      </div>
    );
  }
);
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'>>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
