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

const MODAL_ACTION_BUTTONS = ['mspSave', 'mspClose'] as const;

export type TrumbowygModalActions = {
  saveLabel: string;
  closeLabel: string;
  onSave: (html: string) => void;
  onClose: () => void;
};

export type TrumbowygTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  modalActions?: TrumbowygModalActions;
};

const TrumbowygTextEditor = ({ value, onChange, className, modalActions }: TrumbowygTextEditorProps) => {
  const { theme } = useTheme();
  const reactId = useId();
  const editorId = `msp-trumbowyg-${reactId.replace(/:/g, '')}`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const modalActionsRef = useRef(modalActions);
  modalActionsRef.current = modalActions;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let disposed = false;
    let $el: JQuery | null = null;

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
        const actions = modalActionsRef.current;
        const btns = actions
          ? [...TRUMBOWYG_BUTTONS, [...MODAL_ACTION_BUTTONS]]
          : TRUMBOWYG_BUTTONS;

        const svgPath = actions
          ? await import('@/lib/trumbowygMspIcons').then((m) => m.getExtendedTrumbowygSvgPath())
          : trumbowygIcons;

        $el.trumbowyg({
          btns,
          btnsDef: actions
            ? {
                mspSave: {
                  ico: 'msp-save',
                  title: actions.saveLabel,
                  class: 'trumbowyg-not-disable msp-trumbowyg-action-save',
                  fn: function mspSave() {
                    flushPending();
                    const html = $el?.trumbowyg('html') ?? '';
                    modalActionsRef.current?.onSave(html);
                  },
                },
                mspClose: {
                  ico: 'close',
                  title: actions.closeLabel,
                  class: 'trumbowyg-not-disable msp-trumbowyg-action-close',
                  fn: function mspClose() {
                    modalActionsRef.current?.onClose();
                  },
                },
              }
            : undefined,
          semantic: false,
          autogrow: true,
          resetCss: false,
          removeformatPasted: true,
          svgPath,
        });

        $el.trumbowyg('html', value);
        $el.on('tbwchange', handleChange);
        $el.on('tbwblur', flushPending);
        $el.on('tbwinit', () => {
          if (disposed) return;
          setReady(true);
          setLoadError(null);
        });
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
        $el.off('tbwinit');
        $el.trumbowyg('destroy');
        $el = null;
      }
      setReady(false);
    };
    // Parent remounts via key when switching elements.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial value only
  }, [editorId]);

  const isModal = className?.includes('msp-trumbowyg-modal');

  return (
    <div
      className={cn(
        'msp-trumbowyg-wrap msp-overflow-visible msp-rounded-md msp-border msp-border-border',
        !isModal && 'msp-min-h-[180px]',
        ready && 'msp-trumbowyg-ready',
        theme === 'dark' ? 'trumbowyg-dark msp-dark dark' : 'msp-light',
        className,
      )}
    >
      {loadError ? (
        <p className="msp-p-3 msp-text-xs msp-text-destructive">{loadError}</p>
      ) : null}
      {!ready && !loadError ? (
        <div
          className={cn(
            'msp-flex msp-items-center msp-justify-center msp-text-xs msp-text-muted-foreground',
            isModal ? 'msp-min-h-[300px]' : 'msp-min-h-[160px]',
          )}
        >
          …
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        id={editorId}
        defaultValue={value}
        className="msp-hidden"
        tabIndex={-1}
        aria-label="Text content editor"
      />
    </div>
  );
};

export default TrumbowygTextEditor;
