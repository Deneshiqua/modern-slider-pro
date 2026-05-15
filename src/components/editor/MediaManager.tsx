import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageIcon, Trash2, Upload } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { FileItem } from '@/lib/localMediaAdapter';
import { LocalMediaAdapter } from '@/lib/localMediaAdapter';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import { useLanguage } from '@/context/LanguageContext';

const adapter = new LocalMediaAdapter();
const UPLOADS_PATH = '/uploads';

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const MediaManager = ({ isOpen, onClose, onSelect }: MediaManagerProps) => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadFiles = useCallback(async () => {
    try {
      const items = await adapter.listFiles(UPLOADS_PATH);
      setFiles(items.filter((f) => !f.isDirectory));
    } catch {
      setFiles([]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
      setSelected(null);
    }
  }, [isOpen, loadFiles]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setUploading(true);
      await adapter.uploadFiles(UPLOADS_PATH, acceptedFiles);
      await loadFiles();
      setUploading(false);
    },
    [loadFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  const handleDelete = async (e: React.MouseEvent, file: FileItem) => {
    e.stopPropagation();
    await adapter.deleteItems([file.path]);
    if (selected?.path === file.path) setSelected(null);
    await loadFiles();
  };

  const handleConfirm = () => {
    if (!selected) return;
    const url = adapter.getPreviewUrl(selected.path);
    onSelect(url);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:msp-max-w-[860px] msp-h-[80vh] msp-flex msp-flex-col msp-overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('mediaManager.title')}</DialogTitle>
        </DialogHeader>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={cn(
            'msp-border-2 msp-border-dashed msp-rounded-md msp-p-4 msp-text-center msp-cursor-pointer msp-transition-colors msp-text-sm',
            isDragActive ? 'msp-border-primary msp-bg-primary/5' : 'msp-border-muted-foreground/30 hover:msp-border-primary/60',
          )}
        >
          <input {...getInputProps()} />
          <Upload className="msp-mx-auto msp-mb-1 msp-h-5 msp-w-5 msp-text-muted-foreground" />
          <span className="msp-text-muted-foreground">
            {uploading ? 'Uploading…' : isDragActive ? 'Drop files here' : t('mediaManager.upload')}
          </span>
        </div>

        {/* File grid */}
        <div className="msp-flex-1 msp-overflow-y-auto">
          {files.length === 0 ? (
            <div className="msp-flex msp-flex-col msp-items-center msp-justify-center msp-h-full msp-text-muted-foreground msp-gap-2">
              <ImageIcon className="msp-h-10 msp-w-10 msp-opacity-30" />
              <span className="msp-text-sm">{t('mediaManager.noImages')}</span>
            </div>
          ) : (
            <div className="msp-grid msp-grid-cols-4 msp-gap-3 msp-p-1">
              {files.map((file) => {
                const previewUrl = adapter.getPreviewUrl(file.path);
                const isSelected = selected?.path === file.path;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelected(isSelected ? null : file)}
                    className={cn(
                      'msp-group msp-relative msp-rounded-md msp-border-2 msp-overflow-hidden msp-cursor-pointer msp-aspect-square msp-bg-muted msp-transition-colors',
                      isSelected ? 'border-primary' : 'msp-border-transparent hover:msp-border-muted-foreground/40',
                    )}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="msp-w-full msp-h-full msp-object-cover"
                      />
                    ) : (
                      <div className="msp-flex msp-items-center msp-justify-center msp-h-full">
                        <ImageIcon className="msp-h-8 msp-w-8 msp-text-muted-foreground/40" />
                      </div>
                    )}

                    <button
                      onClick={(e) => handleDelete(e, file)}
                      className="msp-absolute msp-top-1 msp-right-1 msp-hidden group-hover:msp-flex msp-items-center msp-justify-center msp-w-6 msp-h-6 msp-rounded-full msp-bg-destructive msp-text-destructive-foreground msp-shadow"
                    >
                      <Trash2 className="msp-h-3 msp-w-3" />
                    </button>

                    <div className="msp-absolute msp-bottom-0 msp-left-0 msp-right-0 msp-bg-black/50 msp-text-white msp-text-xs msp-px-1 msp-py-0.5 msp-truncate msp-opacity-0 group-hover:msp-opacity-100 msp-transition-opacity">
                      {file.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="msp-flex msp-justify-end msp-gap-2 msp-pt-2 msp-border-t">
          <Button variant="outline" onClick={onClose}>
            {t('mediaManager.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selected}>
            {t('mediaManager.select')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaManager;