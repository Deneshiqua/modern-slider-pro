import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn('msp-flex msp-flex-wrap msp-items-center msp-gap-1.5 msp-break-words msp-text-sm msp-text-muted-foreground sm:msp-gap-2.5', className)}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('msp-inline-flex msp-items-center msp-gap-1.5', className)} {...props} />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return <Comp ref={ref} className={cn('msp-transition-colors hover:msp-text-foreground', className)} {...props} />;
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('msp-font-normal msp-text-foreground', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<'li'>) => (
  <li role="presentation" aria-hidden="true" className={cn('[&>svg]:size-3.5', className)} {...props}>
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span role="presentation" aria-hidden="true" className={cn('msp-flex msp-h-9 msp-w-9 msp-items-center msp-justify-center', className)} {...props}>
    <MoreHorizontal className="msp-h-4 msp-w-4" />
    <span className="msp-sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis };
