import React from 'react';

import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { cn } from '@/lib/utils';

type SiteLayoutProps = {
  children: React.ReactNode;
  mainClassName?: string;
};

const SiteLayout = ({ children, mainClassName }: SiteLayoutProps) => (
  <div className="msp-min-h-screen msp-flex msp-flex-col msp-bg-background msp-text-foreground">
    <SiteHeader />
    <main className={cn('msp-flex-1', mainClassName)}>{children}</main>
    <SiteFooter />
  </div>
);

export default SiteLayout;
