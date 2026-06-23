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
