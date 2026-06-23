import { ArrowRight, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SITE_CONTAINER_CLASS } from '@/components/siteContainer';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Language } from '@/lib/translations';
import { cn } from '@/lib/utils';

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
];

const SiteHeader = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="msp-border-b msp-sticky msp-top-0 msp-z-10 msp-bg-background/80 msp-backdrop-blur">
      <div
        className={cn(
          SITE_CONTAINER_CLASS,
          'msp-h-14 msp-flex msp-items-center msp-justify-between msp-gap-4',
        )}
      >
        <Link to="/" className="msp-font-bold msp-text-lg msp-tracking-tight msp-shrink-0">
          modern-slider-pro
        </Link>
        <div className="msp-flex msp-items-center msp-gap-2 msp-flex-wrap msp-justify-end">
          <div className="msp-flex msp-items-center msp-gap-1.5 msp-mr-1">
            {LANGUAGE_OPTIONS.map(({ code, label }) => (
              <Button
                key={code}
                type="button"
                variant={language === code ? 'default' : 'outline'}
                size="sm"
                className="msp-h-7 msp-w-9 msp-px-0 msp-text-xs"
                onClick={() => setLanguage(code)}
                aria-label={label}
              >
                {label}
              </Button>
            ))}
          </div>
          <div
            className="msp-flex msp-items-center msp-gap-1.5 msp-mr-2"
            title={theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
          >
            <Sun className="msp-h-3.5 msp-w-3.5 msp-text-muted-foreground" aria-hidden />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label={t('settings.theme')}
            />
            <Moon className="msp-h-3.5 msp-w-3.5 msp-text-muted-foreground" aria-hidden />
          </div>
          <nav className="msp-flex msp-items-center msp-gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/demo">{t('site.nav.demo')}</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/docs">{t('site.nav.docs')}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/editor">
                {t('site.nav.editor')} <ArrowRight className="msp-ml-1 msp-h-4 msp-w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
