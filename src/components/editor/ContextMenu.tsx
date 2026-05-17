import React from 'react';
import { ContextMenu as UIContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { Trash2, Copy, BringToFront, SendToBack, ArrowUp, ArrowDown, Maximize, Group, Ungroup } from 'lucide-react';

interface ContextMenuProps {
  children: React.ReactNode;
  elementId?: string;
}

const ContextMenu = ({ children, elementId }: ContextMenuProps) => {
  const {
    removeElement,
    removeSelectedElements,
    addElement,
    slides,
    currentSlideIndex,
    selectedElementIds,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    updateElement,
    groupSelectedElements,
    ungroupElement,
  } = useEditor();
  const { t } = useLanguage();

  const rootElement = elementId
    ? slides[currentSlideIndex]?.elements.find(e => e.id === elementId)
    : undefined;
  const canGroup =
    Boolean(elementId) &&
    selectedElementIds.length > 1 &&
    selectedElementIds.includes(elementId);
  const canUngroup =
    Boolean(elementId) &&
    rootElement?.type === 'box' &&
    Boolean(rootElement.children?.length);

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

  const handleDelete = () => {
    if (!elementId) return;

    const hasMultiSelection =
      selectedElementIds.length > 1 && selectedElementIds.includes(elementId);

    if (hasMultiSelection) {
      removeSelectedElements();
      return;
    }

    removeElement(elementId);
  };

  if (!elementId) {
    return <>{children}</>;
  }

  return (
    <UIContextMenu>
      <ContextMenuTrigger>
        {/* Wrapper to ensure ref is passed correctly and events are captured */}
        <span className="msp-block" style={{ display: 'contents' }}>
          {children}
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent className="msp-w-64">
        {canGroup && (
          <ContextMenuItem onClick={groupSelectedElements}>
            <Group className="msp-mr-2 msp-h-4 msp-w-4" />
            {t('editor.contextMenu.group')}
          </ContextMenuItem>
        )}
        {canUngroup && (
          <ContextMenuItem onClick={() => ungroupElement(elementId)}>
            <Ungroup className="msp-mr-2 msp-h-4 msp-w-4" />
            {t('editor.contextMenu.ungroup')}
          </ContextMenuItem>
        )}
        {(canGroup || canUngroup) && <ContextMenuSeparator />}
        <ContextMenuItem onClick={() => bringToFront(elementId)}>
          <BringToFront className="msp-mr-2 msp-h-4 msp-w-4" />
          {t('editor.contextMenu.bringToFront')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => bringForward(elementId)}>
          <ArrowUp className="msp-mr-2 msp-h-4 msp-w-4" />
          {t('editor.contextMenu.bringForward')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => sendBackward(elementId)}>
          <ArrowDown className="msp-mr-2 msp-h-4 msp-w-4" />
          {t('editor.contextMenu.sendBackward')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => sendToBack(elementId)}>
          <SendToBack className="msp-mr-2 msp-h-4 msp-w-4" />
          {t('editor.contextMenu.sendToBack')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleFit}>
          <Maximize className="msp-mr-2 msp-h-4 msp-w-4" />
          {t('editor.contextMenu.fit')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="msp-mr-2 msp-h-4 msp-w-4" />
          {t('editor.contextMenu.duplicate')}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="msp-text-red-600">
          <Trash2 className="msp-mr-2 msp-h-4 msp-w-4" />
          {t('editor.contextMenu.delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </UIContextMenu>
  );
};

export default ContextMenu;