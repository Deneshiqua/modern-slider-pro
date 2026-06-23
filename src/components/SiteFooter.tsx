import { Link } from 'react-router-dom';

import { SITE_CONTAINER_CLASS } from '@/components/siteContainer';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const SiteFooter = () => {
  const { t } = useLanguage();

  return (
    <footer className="msp-border-t msp-mt-auto">
      <div
        className={cn(
          SITE_CONTAINER_CLASS,
          'msp-h-14 msp-flex msp-items-center msp-justify-between msp-text-sm msp-text-muted-foreground',
        )}
      >
        <span>{t('site.footer.brand')}</span>
        <nav className="msp-flex msp-items-center msp-gap-4">
          <Link to="/demo" className="hover:msp-text-foreground msp-transition-colors">
            {t('site.footer.demo')}
          </Link>
          <Link to="/docs" className="hover:msp-text-foreground msp-transition-colors">
            {t('site.footer.docs')}
          </Link>
          <Link to="/editor" className="hover:msp-text-foreground msp-transition-colors">
            {t('site.footer.editor')}
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;
