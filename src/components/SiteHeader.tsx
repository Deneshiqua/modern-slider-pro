import { ArrowRight, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import SiteSocialLinks from '@/components/SiteSocialLinks';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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

type SiteHeaderProps = {
  onNavigate?: () => void;
  navClassName?: string;
  editorButtonClassName?: string;
};

const SiteNavLinks = ({
  onNavigate,
  navClassName,
  editorButtonClassName,
}: SiteHeaderProps) => {
  const { t } = useLanguage();

  return (
    <nav className={cn('msp-flex msp-items-center msp-gap-2', navClassName)}>
      <Button variant="ghost" size="sm" asChild className="msp-justify-start">
        <Link to="/demo" onClick={onNavigate}>
          {t('site.nav.demo')}
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className="msp-justify-start">
        <Link to="/docs" onClick={onNavigate}>
          {t('site.nav.docs')}
        </Link>
      </Button>
      <Button size="sm" asChild className={editorButtonClassName}>
        <Link to="/editor" onClick={onNavigate}>
          {t('site.nav.editor')}
          <ArrowRight className="msp-ml-1 msp-h-4 msp-w-4" />
        </Link>
      </Button>
    </nav>
  );
};

const SiteLocaleControls = ({ className }: { className?: string }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={cn('msp-flex msp-items-center msp-gap-2', className)}>
      <div className="msp-flex msp-items-center msp-gap-1.5">
        {LANGUAGE_OPTIONS.map(({ code, label }) => (
          <Button
            key={code}
            type="button"
            variant={language === code ? 'default' : 'outline'}
            size="sm"
            className="msp-h-8 msp-w-9 msp-px-0 msp-text-xs"
            onClick={() => setLanguage(code)}
            aria-label={label}
          >
            {label}
          </Button>
        ))}
      </div>
      <div
        className="msp-flex msp-items-center msp-gap-1.5"
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
    </div>
  );
};

const SiteHeader = () => {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="msp-border-b msp-sticky msp-top-0 msp-z-10 msp-bg-background/80 msp-backdrop-blur supports-[backdrop-filter]:msp-bg-background/60">
      <div
        className={cn(
          SITE_CONTAINER_CLASS,
          'msp-flex msp-min-h-14 msp-items-center msp-justify-between msp-gap-2 msp-py-2 md:msp-py-0',
        )}
      >
        <Link
          to="/"
          className="msp-min-w-0 msp-font-bold msp-text-base sm:msp-text-lg msp-tracking-tight msp-shrink"
        >
          <span className="msp-truncate msp-block">modern-slider-pro</span>
        </Link>

        {/* Desktop */}
        <div className="msp-hidden md:msp-flex msp-items-center msp-gap-1 lg:msp-gap-2 msp-min-w-0">
          <SiteSocialLinks githubLabel={t('site.nav.github')} npmLabel={t('site.nav.npm')} />
          <SiteLocaleControls className="msp-mx-1" />
          <SiteNavLinks />
        </div>

        {/* Mobile */}
        <div className="msp-flex md:msp-hidden msp-items-center msp-gap-0.5 msp-shrink-0">
          <SiteSocialLinks githubLabel={t('site.nav.github')} npmLabel={t('site.nav.npm')} />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="msp-h-9 msp-w-9"
                aria-label={t('site.nav.menu')}
              >
                <Menu className="msp-h-5 msp-w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="msp-w-[min(100vw-2rem,20rem)]">
              <SheetHeader className="msp-text-left">
                <SheetTitle>{t('site.nav.menu')}</SheetTitle>
              </SheetHeader>
              <div className="msp-mt-6 msp-flex msp-flex-col msp-gap-6">
                <SiteNavLinks
                  onNavigate={closeMenu}
                  navClassName="msp-flex-col msp-items-stretch msp-gap-1"
                  editorButtonClassName="msp-w-full msp-justify-center"
                />
                <SiteLocaleControls className="msp-flex-wrap msp-justify-between" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
