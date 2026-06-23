import jQuery from 'jquery';

import 'trumbowyg/dist/ui/trumbowyg.min.css';

type WindowWithJQuery = typeof globalThis & {
  jQuery?: typeof jQuery;
  $?: typeof jQuery;
};

function exposeJQueryOnWindow() {
  if (typeof globalThis === 'undefined') return;
  const win = globalThis as WindowWithJQuery;
  win.jQuery = jQuery;
  win.$ = jQuery;
}

exposeJQueryOnWindow();

let trumbowygLoadPromise: Promise<typeof jQuery> | null = null;

/** Trumbowyg's dist file reads global `jQuery` at module top — must load only after exposeJQueryOnWindow(). */
export function ensureTrumbowyg(): Promise<typeof jQuery> {
  if (jQuery.fn.trumbowyg) {
    return Promise.resolve(jQuery);
  }

  trumbowygLoadPromise ??= import('trumbowyg/dist/trumbowyg.js').then(() => {
    if (!jQuery.fn.trumbowyg) {
      throw new Error('Trumbowyg failed to register on jQuery');
    }
    return jQuery;
  });

  return trumbowygLoadPromise;
}

export { jQuery };
