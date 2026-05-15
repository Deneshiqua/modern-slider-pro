import { GripVertical } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '@/lib/utils';

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn('msp-flex msp-h-full msp-w-full data-[panel-group-direction=vertical]:msp-flex-col', className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'msp-relative msp-flex msp-w-px msp-items-center msp-justify-center msp-bg-border after:msp-absolute after:msp-inset-y-0 after:msp-left-1/2 after:msp-w-1 after:-msp-translate-x-1/2 focus-visible:msp-outline-none focus-visible:msp-ring-1 focus-visible:msp-ring-ring focus-visible:msp-ring-offset-1 data-[panel-group-direction=vertical]:msp-h-px data-[panel-group-direction=vertical]:msp-w-full data-[panel-group-direction=vertical]:after:msp-left-0 data-[panel-group-direction=vertical]:after:msp-h-1 data-[panel-group-direction=vertical]:after:msp-w-full data-[panel-group-direction=vertical]:after:-msp-translate-y-1/2 data-[panel-group-direction=vertical]:after:msp-translate-x-0 [&[data-panel-group-direction=vertical]>div]:msp-rotate-90',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="msp-z-10 msp-flex msp-h-4 msp-w-3 msp-items-center msp-justify-center msp-rounded-sm msp-border msp-bg-border">
        <GripVertical className="msp-h-2.5 msp-w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
