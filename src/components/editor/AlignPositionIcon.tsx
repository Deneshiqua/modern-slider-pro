import React from 'react';
import type { AlignmentAnchor } from '@/lib/alignment';
import { cn } from '@/lib/utils';

const ANCHOR_DOT_CLASS: Record<AlignmentAnchor, string> = {
  'top-left': 'msp-left-0.5 msp-top-0.5',
  'top-center': 'msp-left-1/2 -msp-translate-x-1/2 msp-top-0.5',
  'top-right': 'msp-right-0.5 msp-top-0.5',
  'middle-left': 'msp-left-0.5 msp-top-1/2 -msp-translate-y-1/2',
  'middle-center': 'msp-left-1/2 msp-top-1/2 -msp-translate-x-1/2 -msp-translate-y-1/2',
  'middle-right': 'msp-right-0.5 msp-top-1/2 -msp-translate-y-1/2',
  'bottom-left': 'msp-left-0.5 msp-bottom-0.5',
  'bottom-center': 'msp-left-1/2 -msp-translate-x-1/2 msp-bottom-0.5',
  'bottom-right': 'msp-right-0.5 msp-bottom-0.5',
};

export function AlignPositionIcon({ anchor }: { anchor: AlignmentAnchor }) {
  return (
    <span className="msp-relative msp-block msp-h-4 msp-w-4 msp-rounded-sm msp-border msp-border-current">
      <span className={cn('msp-absolute msp-h-1 msp-w-1 msp-rounded-full msp-bg-current', ANCHOR_DOT_CLASS[anchor])} />
    </span>
  );
}
