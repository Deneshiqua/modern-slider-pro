import React from 'react';
import { ContextMenu as UIContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { Trash2, Copy, BringToFront, SendToBack, ArrowUp, ArrowDown, Maximize } from 'lucide-react';

interface ContextMenuProps {
  children: React.ReactNode;
  elementId?: string;
}

const ContextMenu = ({ children, elementId }: ContextMenuProps) => {
  const { 
    removeElement, 
    addElement, 
    slides, 
    currentSlideIndex,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    updateElement
  } = useEditor();
  const { t } = useLanguage();

  const handleDuplicate = () => {
    if (!elementId) return;
    const element = slides[currentSlideIndex].elements.find(e => e.id === elementId);
    if (element) {
      addElement(element.type, { content: element.content });
    }
  };

  const handleFit = () => {
    if (!elementId) return;
    updateElement(elementId, {
      style: { width: '100%', height: '100%', left: 0, top: 0 }
    });
  };

  if (!elementId) {
    return <>{children}</>;
  }

  return (
    <UIContextMenu>
      <ContextMenuTrigger>
        {/* Wrapper to ensure ref is passed correctly and events are captured */}
        <span className="block" style={{ display: 'contents' }}>
          {children}
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={() => bringToFront(elementId)}>
          <BringToFront className="mr-2 h-4 w-4" />
          {t('editor.contextMenu.bringToFront')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => bringForward(elementId)}>
          <ArrowUp className="mr-2 h-4 w-4" />
          {t('editor.contextMenu.bringForward')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => sendBackward(elementId)}>
          <ArrowDown className="mr-2 h-4 w-4" />
          {t('editor.contextMenu.sendBackward')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => sendToBack(elementId)}>
          <SendToBack className="mr-2 h-4 w-4" />
          {t('editor.contextMenu.sendToBack')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleFit}>
          <Maximize className="mr-2 h-4 w-4" />
          {t('editor.contextMenu.fit')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          {t('editor.contextMenu.duplicate')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => removeElement(elementId)} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('editor.contextMenu.delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </UIContextMenu>
  );
};

export default ContextMenu;