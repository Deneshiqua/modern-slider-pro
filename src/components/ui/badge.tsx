import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'msp-inline-flex msp-items-center msp-rounded-full msp-border msp-px-2.5 msp-py-0.5 msp-text-xs msp-font-semibold msp-transition-colors focus:msp-outline-none focus:msp-ring-2 focus:msp-ring-ring focus:msp-ring-offset-2',
  {
    variants: {
      variant: {
        default: 'msp-border-transparent msp-bg-primary msp-text-primary-foreground hover:msp-bg-primary/80',
        secondary: 'msp-border-transparent msp-bg-secondary msp-text-secondary-foreground hover:msp-bg-secondary/80',
        destructive: 'msp-border-transparent msp-bg-destructive msp-text-destructive-foreground hover:msp-bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
