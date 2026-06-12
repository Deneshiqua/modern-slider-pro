import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import MediaManager from '@/components/editor/MediaManager';
import type { MediaPickerHandler, MediaPickerRequest } from '@/types/mediaPicker';

type MediaPickerContextValue = {
  openMediaPicker: (request: MediaPickerRequest) => void;
};

const MediaPickerContext = createContext<MediaPickerContextValue | null>(null);

export type MediaPickerProviderProps = {
  onOpenMediaPicker?: MediaPickerHandler;
  children: React.ReactNode;
};

export function MediaPickerProvider({ onOpenMediaPicker, children }: MediaPickerProviderProps) {
  const [fallbackRequest, setFallbackRequest] = useState<MediaPickerRequest | null>(null);

  const openMediaPicker = useCallback(
    (request: MediaPickerRequest) => {
      if (onOpenMediaPicker) {
        onOpenMediaPicker(request);
        return;
      }
      setFallbackRequest(request);
    },
    [onOpenMediaPicker],
  );

  const value = useMemo(() => ({ openMediaPicker }), [openMediaPicker]);

  return (
    <MediaPickerContext.Provider value={value}>
      {children}
      {!onOpenMediaPicker && fallbackRequest ? (
        <MediaManager
          isOpen
          onClose={() => {
            fallbackRequest.onCancel?.();
            setFallbackRequest(null);
          }}
          onSelect={(url) => {
            fallbackRequest.onSelect(url);
            setFallbackRequest(null);
          }}
        />
      ) : null}
    </MediaPickerContext.Provider>
  );
}

export function useMediaPicker() {
  const context = useContext(MediaPickerContext);
  if (!context) {
    throw new Error('useMediaPicker must be used within MediaPickerProvider');
  }
  return context;
}
