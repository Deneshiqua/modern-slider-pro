import React, { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { htmlToPlainText } from '@/lib/htmlContent';
import TrumbowygTextEditor from './TrumbowygTextEditor';

type TextContentEditorModalProps = {
  elementId: string;
  value: string;
  onChange: (html: string) => void;
};

const TextContentEditorModal = ({ elementId, value, onChange }: TextContentEditorModalProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const previewText = htmlToPlainText(value).trim();

  const handleOpen = () => {
    setDraft(value);
    setOpen(true);
  };

  const handleSave = (html: string) => {
    onChange(html);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOpen(false);
      return;
    }
    handleOpen();
  };

  return (
    <>
      <div className="msp-space-y-2">
        <div className="msp-min-h-[52px] msp-rounded-md msp-border msp-border-border msp-bg-muted/30 msp-px-2.5 msp-py-2">
          <p className="msp-line-clamp-3 msp-text-xs msp-leading-relaxed msp-text-muted-foreground">
            {previewText || t('editor.properties.textContentPreviewEmpty')}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="msp-h-8 msp-w-full msp-gap-1.5 msp-text-xs"
          onClick={handleOpen}
        >
          <Pencil className="msp-h-3.5 msp-w-3.5" />
          {t('editor.properties.openTextEditor')}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          hideCloseButton
          className="msp-gap-0 msp-overflow-hidden msp-p-3 sm:msp-max-w-[min(920px,96vw)]"
        >
          {open ? (
            <TrumbowygTextEditor
              key={elementId}
              value={draft}
              onChange={setDraft}
              className="msp-trumbowyg-modal"
              modalActions={{
                saveLabel: t('editor.properties.textEditorSave'),
                closeLabel: t('editor.properties.textEditorClose'),
                onSave: handleSave,
                onClose: handleClose,
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TextContentEditorModal;
