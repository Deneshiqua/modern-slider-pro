import { Link } from 'react-router-dom';

import SiteSocialLinks from '@/components/SiteSocialLinks';
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
          'msp-py-4 sm:msp-py-0 sm:msp-h-14 msp-flex msp-flex-col sm:msp-flex-row msp-items-center msp-justify-between msp-gap-4 msp-text-sm msp-text-muted-foreground',
        )}
      >
        <span className="msp-text-center sm:msp-text-left">{t('site.footer.brand')}</span>
        <div className="msp-flex msp-flex-col sm:msp-flex-row msp-items-center msp-gap-4">
          <SiteSocialLinks
            githubLabel={t('site.nav.github')}
            npmLabel={t('site.nav.npm')}
          />
          <nav className="msp-flex msp-flex-wrap msp-items-center msp-justify-center msp-gap-x-4 msp-gap-y-2">
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
      </div>
    </footer>
  );
};

export default SiteFooter;
