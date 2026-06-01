/**
 * Radix overlays (popover, dialog) dismiss on "outside" interactions. Portaled primitives
 * (Select listbox, Dropdown menu, other poppers) attach to document.body alongside the host
 * overlay, so clicks on them are wrongly treated as outside — the parent closes before the
 * selection applies. Inspect composedPath/originalEvent to avoid that dismissal.
 *
 * Roles used by Radix: select content → `[role="listbox"]`; menus → `[role="menu"]`.
 */
const NESTED_FLOATING_SELECTOR = '[role="listbox"],[role="menu"]';

function pathTouchesNestedFloating(originalEvent?: Event): boolean {
  if (!originalEvent) return false;

  try {
    for (const node of originalEvent.composedPath()) {
      if (node instanceof Element && node.closest(NESTED_FLOATING_SELECTOR)) return true;
    }
  } catch {
    /* ignore */
  }

  const t = 'target' in originalEvent ? originalEvent.target : null;
  return t instanceof Element && Boolean(t.closest(NESTED_FLOATING_SELECTOR));
}

export function swallowInteractOutsideForNestedFloatingPortals(ev: unknown) {
  if (!ev || typeof ev !== 'object' || !('preventDefault' in ev)) return;

  const e = ev as CustomEvent<{ originalEvent?: Event }>;
  const orig = typeof e.detail === 'object' ? e.detail?.originalEvent : undefined;
  if (pathTouchesNestedFloating(orig)) (ev as Event).preventDefault();
}
