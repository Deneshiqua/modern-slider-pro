import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import Canvas from './Canvas';
import { EditorProvider } from '@/context/EditorContext';
import LayerPanel from './LayerPanel';
import PropertiesPanel from './PropertiesPanel';
import React from 'react';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';

const EditorLayout = ({ onDemoSave }: { onDemoSave?: () => void }) => {
  return (
    <EditorProvider>
      <div className="flex flex-col h-full w-full bg-background text-foreground">
        <Toolbar onDemoSave={onDemoSave} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Canvas />

          {/* Right Sidebar with Resizable Panels */}
          <div className="w-80 border-l bg-card flex flex-col">
            <ResizablePanelGroup direction="vertical">

              {/* Layer Panel (Top) */}
              <ResizablePanel defaultSize={35} minSize={10}>
                <LayerPanel />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Properties Panel (Bottom) */}
              <ResizablePanel defaultSize={65} minSize={20}>
                <PropertiesPanel />
              </ResizablePanel>

            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </EditorProvider>
  );
};

export default EditorLayout;