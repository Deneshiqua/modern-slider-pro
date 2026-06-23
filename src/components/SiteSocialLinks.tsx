import { Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SITE_GITHUB_URL, SITE_NPM_URL } from '@/lib/siteLinks';
import { cn } from '@/lib/utils';

const NpmIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      fill="currentColor"
      d="M1.763 0C.787 0 0 .787 0 1.763v20.474C0 23.213.787 24 1.763 24h20.474c.976 0 1.763-.787 1.763-1.763V1.763C24 .787 23.213 0 22.237 0H1.763zm19.447 19.447H14.89V9.83h-5.78v9.617H4.553V4.553h16.657v14.894z"
    />
  </svg>
);

type SiteSocialLinksProps = {
  githubLabel: string;
  npmLabel: string;
  className?: string;
  iconClassName?: string;
};

const SiteSocialLinks = ({
  githubLabel,
  npmLabel,
  className,
  iconClassName = 'msp-h-4 msp-w-4',
}: SiteSocialLinksProps) => (
  <div className={cn('msp-flex msp-items-center msp-gap-0.5', className)}>
    <Button variant="ghost" size="icon" className="msp-h-8 msp-w-8" asChild>
      <a href={SITE_GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label={githubLabel}>
        <Github className={iconClassName} />
      </a>
    </Button>
    <Button variant="ghost" size="icon" className="msp-h-8 msp-w-8" asChild>
      <a href={SITE_NPM_URL} target="_blank" rel="noopener noreferrer" aria-label={npmLabel}>
        <NpmIcon className={iconClassName} />
      </a>
    </Button>
  </div>
);

export default SiteSocialLinks;
