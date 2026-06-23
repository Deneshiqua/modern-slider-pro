import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import SiteLayout from '@/components/SiteLayout';
import { SITE_CONTAINER_CLASS } from '@/components/siteContainer';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <SiteLayout mainClassName="msp-flex msp-items-center msp-justify-center">
      <div className={cn(SITE_CONTAINER_CLASS, 'msp-py-20 msp-text-center')}>
        <div className="msp-space-y-6 msp-max-w-md msp-mx-auto">
          <div className="msp-space-y-3">
            <h1 className="msp-text-8xl msp-font-bold msp-text-primary">404</h1>
            <h2 className="msp-text-2xl msp-font-semibold">{t('site.notFound.title')}</h2>
            <p className="msp-text-muted-foreground">{t('site.notFound.description')}</p>
          </div>

          <div className="msp-flex msp-flex-col sm:msp-flex-row msp-gap-3 msp-justify-center">
            <Button asChild>
              <Link to="/">{t('site.notFound.home')}</Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              {t('site.notFound.back')}
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
