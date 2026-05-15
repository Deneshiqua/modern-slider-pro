import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'msp-relative msp-w-full msp-rounded-lg msp-border msp-p-4 [&>svg~*]:msp-pl-7 [&>svg+div]:msp-translate-y-[-3px] [&>svg]:msp-absolute [&>svg]:msp-left-4 [&>svg]:msp-top-4 [&>svg]:msp-text-foreground',
  {
    variants: {
      variant: {
        default: 'msp-bg-background msp-text-foreground',
        destructive: 'msp-border-destructive/50 msp-text-destructive dark:msp-border-destructive [&>svg]:msp-text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(
  ({ className, variant, ...props }, ref) => <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('msp-mb-1 msp-font-medium msp-leading-none msp-tracking-tight', className)} {...props} />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('msp-text-sm [&_p]:msp-leading-relaxed', className)} {...props} />
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
