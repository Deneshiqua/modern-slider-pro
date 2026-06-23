import React from 'react';

import { isHtmlContent } from '@/lib/htmlContent';
import { cn } from '@/lib/utils';

type TextElementContentProps = {
  content: string;
  className?: string;
};

const TextElementContent = ({ content, className }: TextElementContentProps) => {
  if (isHtmlContent(content)) {
    return (
      <div
        className={cn(
          'msp-rich-text msp-m-0 msp-block msp-min-w-0 msp-w-full msp-p-0 msp-indent-0',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <p
      className={cn(
        'msp-m-0 msp-block msp-min-w-0 msp-w-full msp-p-0 msp-whitespace-pre-wrap msp-indent-0',
        className,
      )}
    >
      {content}
    </p>
  );
};

export default TextElementContent;
