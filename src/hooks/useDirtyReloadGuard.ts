import type { TranslationKey } from '@/context/LanguageContext';
import React from 'react';
import { toast } from 'sonner';

export const UNSAVED_RELOAD_TOAST_MS = 5000;

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
};

const isReloadShortcut = (event: KeyboardEvent) => {
  if (event.key === 'F5') return true;
  const key = event.key.toLowerCase();
  return (event.ctrlKey || event.metaKey) && key === 'r';
};

/**
 * When the editor has unsaved changes, blocks keyboard reload shortcuts and shows a Sonner toast instead
 * of the native beforeunload dialog. After {@link UNSAVED_RELOAD_TOAST_MS}, the toast closes and the page reloads
 * unless the user cancelled or confirmed earlier.
 *
 * Note: The browser's own Reload button cannot be intercepted; only this shortcut flow uses the toast.
 */
export function useDirtyReloadGuard(
  isDirty: boolean,
  t: (key: TranslationKey) => string,
) {
  const reloadToastIdRef = React.useRef<string | number | null>(null);
  const userCancelledRef = React.useRef(false);

  React.useEffect(() => {
    if (!isDirty || globalThis.window === undefined) return;

    const dismissReloadToast = () => {
      if (reloadToastIdRef.current != null) {
        toast.dismiss(reloadToastIdRef.current);
        reloadToastIdRef.current = null;
      }
    };

    const showReloadToast = () => {
      userCancelledRef.current = false;
      dismissReloadToast();

      const id = toast.warning(t('editor.unsaved.reloadTitle'), {
        id: `dirty-reload-${Date.now()}`,
        description: t('editor.unsaved.reloadDescription'),
        duration: UNSAVED_RELOAD_TOAST_MS,
        closeButton: true,
        action: {
          label: t('editor.unsaved.reloadConfirm'),
          onClick: () => {
            globalThis.window?.location.reload();
          },
        },
        cancel: {
          label: t('editor.unsaved.reloadCancel'),
          onClick: () => {
            userCancelledRef.current = true;
            toast.dismiss(id);
          },
        },
        onAutoClose: () => {
          if (!userCancelledRef.current) {
            globalThis.window?.location.reload();
          }
        },
        onDismiss: () => {
          reloadToastIdRef.current = null;
        },
      });

      reloadToastIdRef.current = id;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isReloadShortcut(event)) return;
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      showReloadToast();
    };

    globalThis.window.addEventListener('keydown', onKeyDown, true);
    return () => {
      globalThis.window.removeEventListener('keydown', onKeyDown, true);
      dismissReloadToast();
    };
  }, [isDirty, t]);
}
