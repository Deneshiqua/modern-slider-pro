import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type CanvasViewportActions = {
  centerView: () => void;
  fitToViewport: () => void;
};

type CanvasViewportContextValue = {
  register: (actions: CanvasViewportActions | null) => void;
  centerView: () => void;
  fitToViewport: () => void;
  isReady: boolean;
};

const CanvasViewportContext = createContext<CanvasViewportContextValue | null>(null);

export const CanvasViewportProvider = ({ children }: { children: React.ReactNode }) => {
  const actionsRef = useRef<CanvasViewportActions | null>(null);
  const [isReady, setIsReady] = useState(false);

  const register = useCallback((actions: CanvasViewportActions | null) => {
    actionsRef.current = actions;
    setIsReady(actions != null);
  }, []);

  const centerView = useCallback(() => {
    actionsRef.current?.centerView();
  }, []);

  const fitToViewport = useCallback(() => {
    actionsRef.current?.fitToViewport();
  }, []);

  const value = useMemo(
    () => ({ register, centerView, fitToViewport, isReady }),
    [register, centerView, fitToViewport, isReady],
  );

  return (
    <CanvasViewportContext.Provider value={value}>
      {children}
    </CanvasViewportContext.Provider>
  );
};

export const useCanvasViewport = () => {
  const ctx = useContext(CanvasViewportContext);
  if (!ctx) {
    throw new Error('useCanvasViewport must be used within CanvasViewportProvider');
  }
  return ctx;
};
