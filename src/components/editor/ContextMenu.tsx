import React, { useEffect, useRef, useState } from 'react';
import { ContextMenu as UIContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { EditorElement } from '@/types/editor';
import {
  Trash2,
  Copy,
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
  Maximize,
  Group,
  Ungroup,
  Pencil,
} from 'lucide-react';

function findSlideElementById(elements: EditorElement[], id: string): EditorElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children?.length) {
      const found = findSlideElementById(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

function elementDefaultLabel(el: EditorElement): string {
  return el.type.charAt(0).toUpperCase() + el.type.slice(1);
}

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

  const renameInputRef = useRef<HTMLInputElement>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');

  const slideRoots = slides[currentSlideIndex]?.elements ?? [];
  const targetElement = elementId ? findSlideElementById(slideRoots, elementId) : undefined;

  const canGroup =
    Boolean(elementId) &&
    selectedElementIds.length > 1 &&
    selectedElementIds.includes(elementId);
  const canUngroup =
    Boolean(elementId) &&
    targetElement?.type === 'box' &&
    Boolean(targetElement.children?.length);

  useEffect(() => {
    if (!renameOpen) return;
    const id = requestAnimationFrame(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [renameOpen]);

  const handleOpenRename = () => {
    if (!elementId || !targetElement) return;
    const label = targetElement.name?.trim() || elementDefaultLabel(targetElement);
    setRenameDraft(label);
    setRenameOpen(true);
  };

  const handleConfirmRename = () => {
    if (!elementId) return;
    const next = renameDraft.trim();
    updateElement(elementId, next ? { name: next } : { name: undefined });
    setRenameOpen(false);
  };

  const handleDuplicate = () => {
    if (!elementId) return;
    const el = findSlideElementById(slideRoots, elementId);
    if (el) {
      addElement(el.type, { content: el.content });
    }
  };

  const handleFit = () => {
    if (!elementId) return;
    updateElement(elementId, {
      style: { width: '100%', height: '100%', left: 0, top: 0 },
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
    <>
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
          <ContextMenuItem
            onSelect={(event) => {
              event.preventDefault();
              handleOpenRename();
            }}
          >
            <Pencil className="msp-mr-2 msp-h-4 msp-w-4" />
            {t('editor.contextMenu.rename')}
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

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="msp-max-w-md" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('editor.contextMenu.renameTitle')}</DialogTitle>
            <DialogDescription>{t('editor.contextMenu.renameDescription')}</DialogDescription>
          </DialogHeader>
          <Input
            ref={renameInputRef}
            value={renameDraft}
            onChange={(event) => setRenameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleConfirmRename();
              }
            }}
          />
          <DialogFooter className="msp-gap-2 sm:msp-gap-0">
            <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
              {t('mediaManager.cancel')}
            </Button>
            <Button type="button" onClick={handleConfirmRename}>
              {t('editor.contextMenu.renameSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContextMenu;
