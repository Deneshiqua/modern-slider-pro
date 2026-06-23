import React, { useId, useLayoutEffect, useRef, useState } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

import './TrumbowygTextEditor.css';

import trumbowygIcons from 'trumbowyg/dist/ui/icons.svg?url';

const TRUMBOWYG_BUTTONS: Array<string | string[]> = [
  ['viewHTML'],
  ['formatting'],
  ['strong', 'em', 'del'],
  ['link'],
  ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
  ['unorderedList', 'orderedList'],
  ['horizontalRule'],
  ['removeformat'],
];

export type TrumbowygTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
};

const TrumbowygTextEditor = ({ value, onChange, className }: TrumbowygTextEditorProps) => {
  const { theme } = useTheme();
  const reactId = useId();
  const editorId = `msp-trumbowyg-${reactId.replaceAll(':', '')}`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let disposed = false;
    let $el: ReturnType<typeof import('@/lib/trumbowygEnv').jQuery> | null = null;

    const handleChange = () => {
      if (!$el) return;
      const html = $el.trumbowyg('html');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChangeRef.current(html);
      }, 200);
    };

    const flushPending = () => {
      if (!$el) return;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      onChangeRef.current($el.trumbowyg('html'));
    };

    const init = async () => {
      try {
        const { ensureTrumbowyg } = await import('@/lib/trumbowygEnv');
        const jQuery = await ensureTrumbowyg();
        if (disposed || !textareaRef.current) return;

        $el = jQuery(textareaRef.current);
        $el.trumbowyg({
          btns: TRUMBOWYG_BUTTONS,
          semantic: false,
          autogrow: true,
          resetCss: false,
          removeformatPasted: true,
          svgPath: trumbowygIcons,
        });

        $el.trumbowyg('html', value);
        $el.on('tbwchange', handleChange);
        $el.on('tbwblur', flushPending);
        setReady(true);
        setLoadError(null);
      } catch (error) {
        if (!disposed) {
          setLoadError(error instanceof Error ? error.message : 'Trumbowyg yüklenemedi');
        }
      }
    };

    const initTimer = globalThis.setTimeout(() => {
      void init();
    }, 0);

    return () => {
      disposed = true;
      globalThis.clearTimeout(initTimer);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if ($el) {
        flushPending();
        $el.off('tbwchange', handleChange);
        $el.off('tbwblur', flushPending);
        $el.trumbowyg('destroy');
        $el = null;
      }
      setReady(false);
    };
    // Parent remounts via key when switching elements.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial value only
  }, [editorId]);

  return (
    <div
      className={cn(
        'msp-trumbowyg-wrap msp-min-h-[180px] msp-overflow-visible msp-rounded-md msp-border msp-border-border',
        theme === 'dark' ? 'trumbowyg-dark msp-dark dark' : 'msp-light',
        className,
      )}
    >
      {loadError ? (
        <p className="msp-p-3 msp-text-xs msp-text-destructive">{loadError}</p>
      ) : null}
      {!ready && !loadError ? (
        <div className="msp-flex msp-min-h-[160px] msp-items-center msp-justify-center msp-text-xs msp-text-muted-foreground">
          …
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        id={editorId}
        defaultValue={value}
        className={cn(ready ? 'msp-sr-only' : 'msp-hidden')}
        tabIndex={ready ? -1 : 0}
        aria-label="Text content editor"
      />
    </div>
  );
};

export default TrumbowygTextEditor;
