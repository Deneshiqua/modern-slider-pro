import type { ElementHoverColors } from '@/types/editor';

function isSafeCssToken(value: string): boolean {
  return !/[{};]|\/\*|\\|</.test(value);
}

/** Returns a global CSS snippet for `:hover`; null if nothing defined. */
export function formatElementHoverStyleTag(elementId: string, hover?: ElementHoverColors | null): string | null {
  if (!hover) return null;

  const decls: string[] = [];

  const keys: Array<keyof ElementHoverColors> = [
    'backgroundColor',
    'color',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
  ];

  for (const dataKey of keys) {
    const raw = hover[dataKey];

    if (raw === undefined || raw === '') continue;

    const v = typeof raw === 'number' ? String(raw) : String(raw).trim();

    if (!v.length) continue;

    const cssProp = dataKey.replace(/([A-Z])/g, '-$1').toLowerCase();
    const safeVal = escapeCssAttrValue(v);
    if (!isSafeCssToken(safeVal)) continue;

    decls.push(`${cssProp}:${safeVal}!important`);
  }

  if (decls.length === 0) return null;

  const sel = `[data-msp-el-hover="${escapeAttrSelector(elementId)}"]:hover`;

  return `${sel} { ${decls.join('; ')}; }`;

}

function escapeAttrSelector(id: string): string {
  return id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

}

/** CSS value escaping for suspicious injection (editor-controlled JSON). */

function escapeCssAttrValue(val: string): string {
  const t = val.replace(/[<>'"]|\\/g, '');

  return t.trim();
}
