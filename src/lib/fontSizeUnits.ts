export type FontSizeUnit = 'px' | 'rem';

const ROOT_FONT_PX = 16;

export function parseFontSize(value: string | number | undefined): {
  amount: number;
  unit: FontSizeUnit;
} {
  if (value === undefined || value === '') {
    return { amount: 16, unit: 'px' };
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return { amount: value, unit: 'px' };
  }

  const raw = String(value).trim().toLowerCase();
  const remMatch = /^([\d.]+)rem$/.exec(raw);
  if (remMatch?.[1] != null) {
    const amount = Number.parseFloat(remMatch[1]);
    return { amount: Number.isFinite(amount) ? amount : 1, unit: 'rem' };
  }

  const pxMatch = /^([\d.]+)px$/.exec(raw);
  if (pxMatch?.[1] != null) {
    const amount = Number.parseFloat(pxMatch[1]);
    return { amount: Number.isFinite(amount) ? amount : 16, unit: 'px' };
  }

  const numeric = Number.parseFloat(raw);
  return { amount: Number.isFinite(numeric) ? numeric : 16, unit: 'px' };
}

export function fontSizeToPx(value: string | number | undefined): number {
  const { amount, unit } = parseFontSize(value);
  return unit === 'rem' ? amount * ROOT_FONT_PX : amount;
}

export function formatFontSizeValue(amount: number, unit: FontSizeUnit): string | number {
  if (unit === 'px') {
    return Math.round(amount);
  }
  const rounded = Math.round(amount * 1000) / 1000;
  return `${rounded}rem`;
}

export function toggleFontSizeUnit(value: string | number | undefined): string | number {
  const { amount, unit } = parseFontSize(value);
  if (unit === 'px') {
    return formatFontSizeValue(amount / ROOT_FONT_PX, 'rem');
  }
  return formatFontSizeValue(amount * ROOT_FONT_PX, 'px');
}
