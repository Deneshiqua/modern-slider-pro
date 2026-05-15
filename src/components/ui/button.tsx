import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'msp-inline-flex msp-items-center msp-justify-center msp-gap-2 msp-whitespace-nowrap msp-rounded-md msp-text-sm msp-font-medium msp-ring-offset-background msp-transition-colors focus-visible:msp-outline-none focus-visible:msp-ring-2 focus-visible:msp-ring-ring focus-visible:msp-ring-offset-2 disabled:msp-pointer-events-none disabled:msp-opacity-50 [&_svg]:msp-pointer-events-none [&_svg]:msp-size-4 [&_svg]:msp-shrink-0',
  {
    variants: {
      variant: {
        default: 'msp-bg-primary msp-text-primary-foreground hover:msp-bg-primary/90',
        destructive: 'msp-bg-destructive msp-text-destructive-foreground hover:msp-bg-destructive/90',
        outline: 'msp-border msp-border-input hover:msp-bg-accent hover:msp-text-accent-foreground',
        secondary: 'msp-bg-secondary msp-text-secondary-foreground hover:msp-bg-secondary/80',
        ghost: 'hover:msp-bg-accent hover:msp-text-accent-foreground',
        link: 'msp-text-primary msp-underline-offset-4 hover:msp-underline',
      },
      size: {
        default: 'msp-h-10 msp-px-4 msp-py-2',
        sm: 'msp-h-9 msp-rounded-md msp-px-3',
        lg: 'msp-h-11 msp-rounded-md msp-px-8',
        icon: 'msp-h-10 msp-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
