import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  storageKey?: string;
  useSystemTheme?: boolean;
  /**
   * When true, sets `dark` and `color-scheme` on `document.documentElement` so Radix portals
   * (dialogs, menus, selects) use the same palette as the themed editor shell.
   */
  attachThemeClassToHtml?: boolean;
};

const getSystemTheme = (): Theme => {
  if (globalThis.window === undefined) return 'light';
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = (defaultTheme: Theme, storageKey?: string, useSystemTheme?: boolean): Theme => {
  if (globalThis.window === undefined) return defaultTheme;

  if (storageKey) {
    const savedTheme = globalThis.localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  }

  if (useSystemTheme) {
    return getSystemTheme();
  }

  return defaultTheme;
};

const hasStoredTheme = (storageKey?: string): boolean => {
  if (!storageKey || globalThis.window === undefined) return false;
  const saved = globalThis.localStorage.getItem(storageKey);
  return saved === 'light' || saved === 'dark';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  theme: controlledTheme,
  onThemeChange,
  storageKey,
  useSystemTheme = false,
  attachThemeClassToHtml = false,
}) => {
  const [uncontrolledTheme, setUncontrolledTheme] = useState<Theme>(() => getInitialTheme(defaultTheme, storageKey, useSystemTheme));
  const [localThemeOverride, setLocalThemeOverride] = useState<Theme | undefined>();
  const theme = localThemeOverride ?? controlledTheme ?? uncontrolledTheme;
  const userSetThemeRef = useRef(hasStoredTheme(storageKey));

  /** Snapshot of the host document before we touch `<html>` (e.g. next-themes). Restored on unmount. */
  const hostHtmlSnapshotRef = useRef<{ hadDark: boolean; colorScheme: string } | null>(null);

  useEffect(() => {
    setLocalThemeOverride(undefined);
  }, [controlledTheme]);

  // Capture host theme once while attached; restore on detach so embedders (next-themes) are not left broken.
  useEffect(() => {
    if (!attachThemeClassToHtml || globalThis.window === undefined) return undefined;

    const root = globalThis.window.document.documentElement;
    hostHtmlSnapshotRef.current = {
      hadDark: root.classList.contains('dark'),
      colorScheme: root.style.colorScheme || '',
    };

    return () => {
      const snap = hostHtmlSnapshotRef.current;
      hostHtmlSnapshotRef.current = null;
      if (!snap || globalThis.window === undefined) return;
      const r = globalThis.window.document.documentElement;
      r.classList.toggle('dark', snap.hadDark);
      if (snap.colorScheme) {
        r.style.colorScheme = snap.colorScheme;
      } else {
        r.style.removeProperty('color-scheme');
      }
    };
  }, [attachThemeClassToHtml]);

  useEffect(() => {
    if (!attachThemeClassToHtml || globalThis.window === undefined) return;

    const root = globalThis.window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  }, [attachThemeClassToHtml, theme]);

  useEffect(() => {
    if (!useSystemTheme || userSetThemeRef.current || controlledTheme !== undefined) return undefined;
    if (globalThis.window === undefined) return undefined;

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (userSetThemeRef.current) return;
      setUncontrolledTheme(getSystemTheme());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [controlledTheme, useSystemTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    if (controlledTheme === undefined) {
      setUncontrolledTheme(nextTheme);
    } else {
      setLocalThemeOverride(nextTheme);
    }
    userSetThemeRef.current = true;
    if (globalThis.window !== undefined && storageKey) {
      globalThis.localStorage.setItem(storageKey, nextTheme);
    }
    onThemeChange?.(nextTheme);
  }, [controlledTheme, onThemeChange, storageKey]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.warn('useTheme: ThemeProvider not found. Using default light theme. Wrap your app with <ThemeProvider> for full functionality.');
    return { theme: 'light' as const, setTheme: () => { }, toggleTheme: () => { } };
  }
  return context;
};