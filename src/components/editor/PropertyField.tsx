import React from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const propertyFieldGridClass =
  'msp-grid msp-grid-cols-[minmax(0,36%)_minmax(0,1fr)] msp-items-center msp-gap-x-2 msp-gap-y-1';

type PropertyFieldProps = {
  label: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  controlClassName?: string;
  /** Ustte label, altta tam genislik kontrol (textarea vb.) */
  stacked?: boolean;
  align?: 'center' | 'start';
};

const PropertyField = ({
  label,
  htmlFor,
  children,
  className,
  labelClassName,
  controlClassName,
  stacked = false,
  align = 'center',
}: PropertyFieldProps) => {
  if (stacked) {
    return (
      <div className={cn('msp-space-y-1.5', className)}>
        <Label htmlFor={htmlFor} className={cn('msp-text-xs msp-leading-tight', labelClassName)}>
          {label}
        </Label>
        <div className={cn('msp-min-w-0', controlClassName)}>{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        propertyFieldGridClass,
        align === 'start' && 'msp-items-start',
        className,
      )}
    >
      <Label
        htmlFor={htmlFor}
        className={cn(
          'msp-text-xs msp-leading-tight msp-text-muted-foreground msp-pr-0.5',
          align === 'start' && 'msp-pt-1.5',
          labelClassName,
        )}
      >
        {label}
      </Label>
      <div className={cn('msp-min-w-0', controlClassName)}>{children}</div>
    </div>
  );
};

export default PropertyField;
