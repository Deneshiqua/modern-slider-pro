import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * Radix portals attach to document.body outside `.msp-slider-pro`, where `lib.css` defines
 * shadcn theme variables — without this, `--primary`, `--input`, `--background`, etc. are unset
 * and controls like `<Switch>` or outline `<Button>` can look invisible against the popover.
 */
export function useMspPortalThemeClasses(): string {
  const { theme } = useTheme();

  return cn('msp-slider-pro', theme === 'dark' ? 'msp-dark dark' : 'msp-light');
}
