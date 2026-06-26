/** True when focus is inside a field where typing/backspace should not move/delete canvas elements. */
export function isEditorTextInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (target.isContentEditable) return true;
  if (['input', 'textarea', 'select'].includes(tagName)) return true;

  return Boolean(
    target.closest(
      '.trumbowyg-editor, .trumbowyg-textarea, .trumbowyg-modal-box, .msp-trumbowyg-wrap, .monaco-editor',
    ),
  );
}

/** True when the user has highlighted text (browser copy/cut should win over canvas shortcuts). */
export function hasActiveTextSelection(): boolean {
  if (typeof window === 'undefined') return false;

  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return false;

  return selection.toString().length > 0;
}
