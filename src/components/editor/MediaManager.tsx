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
      <DialogContent className="sm:max-w-[860px] h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('mediaManager.title')}</DialogTitle>
        </DialogHeader>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors text-sm',
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/60',
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {uploading ? 'Uploading…' : isDragActive ? 'Drop files here' : t('mediaManager.upload')}
          </span>
        </div>

        {/* File grid */}
        <div className="flex-1 overflow-y-auto">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <ImageIcon className="h-10 w-10 opacity-30" />
              <span className="text-sm">{t('mediaManager.noImages')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 p-1">
              {files.map((file) => {
                const previewUrl = adapter.getPreviewUrl(file.path);
                const isSelected = selected?.path === file.path;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelected(isSelected ? null : file)}
                    className={cn(
                      'group relative rounded-md border-2 overflow-hidden cursor-pointer aspect-square bg-muted transition-colors',
                      isSelected ? 'border-primary' : 'border-transparent hover:border-muted-foreground/40',
                    )}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}

                    <button
                      onClick={(e) => handleDelete(e, file)}
                      className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground shadow"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t">
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