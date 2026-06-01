import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type SnapGuides = { x: number[]; y: number[] };

const EMPTY_GUIDES: SnapGuides = { x: [], y: [] };

const SnapGuidesStateContext = createContext<SnapGuides>(EMPTY_GUIDES);
const SnapGuidesDispatchContext = createContext<(guides: SnapGuides) => void>(() => {});

function snapGuidesEqual(a: SnapGuides, b: SnapGuides): boolean {
  if (a.x.length !== b.x.length || a.y.length !== b.y.length) return false;
  for (let i = 0; i < a.x.length; i++) {
    if (a.x[i] !== b.x[i]) return false;
  }
  for (let i = 0; i < a.y.length; i++) {
    if (a.y[i] !== b.y[i]) return false;
  }
  return true;
}

export const SnapGuidesProvider = ({ children }: { children: ReactNode }) => {
  const [snapGuides, setSnapGuidesState] = useState<SnapGuides>(EMPTY_GUIDES);

  const setSnapGuides = useCallback((next: SnapGuides) => {
    setSnapGuidesState((prev) => (snapGuidesEqual(prev, next) ? prev : next));
  }, []);

  return (
    <SnapGuidesDispatchContext.Provider value={setSnapGuides}>
      <SnapGuidesStateContext.Provider value={snapGuides}>{children}</SnapGuidesStateContext.Provider>
    </SnapGuidesDispatchContext.Provider>
  );
};

/** Canvas overlay — re-renders when guide lines change. */
export const useSnapGuides = () => useContext(SnapGuidesStateContext);

/** Draggable elements — stable setter, does not subscribe to guide state. */
export const useSetSnapGuides = () => useContext(SnapGuidesDispatchContext);
