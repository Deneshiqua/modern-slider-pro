import trumbowygIconsUrl from 'trumbowyg/dist/ui/icons.svg?url';

const MSP_SAVE_SYMBOL = `<symbol id="trumbowyg-msp-save" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></symbol>`;

let extendedSvgPath: string | null = null;
let extendedSvgPromise: Promise<string> | null = null;

/** Trumbowyg sprite + MSP save icon (Kaydet). */
export function getExtendedTrumbowygSvgPath(): Promise<string> {
  if (extendedSvgPath) {
    return Promise.resolve(extendedSvgPath);
  }

  extendedSvgPromise ??= fetch(trumbowygIconsUrl)
    .then((response) => response.text())
    .then((raw) => {
      const extended = raw.includes('id="trumbowyg-msp-save"')
        ? raw
        : raw.replace('</svg>', `${MSP_SAVE_SYMBOL}</svg>`);
      const blob = new Blob([extended], { type: 'image/svg+xml' });
      extendedSvgPath = URL.createObjectURL(blob);
      return extendedSvgPath;
    });

  return extendedSvgPromise;
}
