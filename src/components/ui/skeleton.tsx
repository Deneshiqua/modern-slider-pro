import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('msp-animate-pulse msp-rounded-md msp-bg-muted', className)} {...props} />;
}

export { Skeleton };
