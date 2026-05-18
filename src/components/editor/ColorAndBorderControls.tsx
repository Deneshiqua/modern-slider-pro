import { BORDER_RADII } from '@/lib/constants';
import ColorPicker from '@/components/editor/ColorPicker';
import type { LengthUnit } from '@/components/editor/SpacingControls';
import {
  formatBoxValue,
  parseLengthToken,
  pickDominantUnit,
  splitSides,
  tokenFromStyle,
} from '@/components/editor/SpacingControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { EditorElement, ElementHoverColors, ElementStyle, ResponsivePropertyMode } from '@/types/editor';

import React, { useEffect, useMemo, useState } from 'react';

type Quadruple = [number, number, number, number];

const SIDE_ORDER = [0, 1, 2, 3] as const;

const BORDER_WIDTH_KEYS = [
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
] as const satisfies readonly (keyof ElementStyle)[];

const BORDER_STYLE_KEYS = [
  'borderTopStyle',
  'borderRightStyle',
  'borderBottomStyle',
  'borderLeftStyle',
] as const satisfies readonly (keyof ElementStyle)[];

const BORDER_COLOR_KEYS = [
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
] as const satisfies readonly (keyof ElementStyle)[];

function clearBorderShorthandPatch(): Partial<ElementStyle> {
  return {
    border: undefined,
    borderWidth: undefined,
    borderStyle: undefined,
    borderColor: undefined,
  };
}

function thicknessMax(unit: LengthUnit): number {
  switch (unit) {
    case '%':
      return 50;
    case 'rem':
      return 6;
    default:
      return 48;
  }
}

function thicknessSliderStep(unit: LengthUnit): number {
  return unit === 'rem' ? 0.0625 : 1;
}

function readBorderWidths(style: Partial<ElementStyle> | undefined): { nums: Quadruple; unit: LengthUnit } {
  if (!style) return { nums: [0, 0, 0, 0], unit: 'px' };

  const longhandUsed = BORDER_WIDTH_KEYS.some(
    k => style[k as keyof ElementStyle] != null && style[k as keyof ElementStyle] !== '',
  );

  let tokens: [string, string, string, string];

  if (longhandUsed) {
    tokens = BORDER_WIDTH_KEYS.map(k => tokenFromStyle(style[k] as string | number | undefined)) as [
      string,
      string,
      string,
      string,
    ];
  }
  else {
    const sh = style.borderWidth;

    if (typeof sh === 'number' && Number.isFinite(sh)) {
      const s = String(sh);

      tokens = [s, s, s, s];
    }
    else if (typeof sh === 'string' && sh.trim() !== '') {
      tokens = splitSides(sh);
    }
    else return { nums: [0, 0, 0, 0], unit: 'px' };
  }

  const parsed = tokens.map(parseLengthToken);
  const unit = pickDominantUnit(parsed);

  const nums: Quadruple = [
    parsed[0]?.num ?? 0,
    parsed[1]?.num ?? 0,
    parsed[2]?.num ?? 0,
    parsed[3]?.num ?? 0,
  ];

  return { nums, unit };
}

function borderWidthsPatch(nums: Quadruple, unit: LengthUnit): Partial<ElementStyle> {
  const out: Partial<ElementStyle> = { ...clearBorderShorthandPatch() };

  for (let i = 0; i < BORDER_WIDTH_KEYS.length; i++) {
    const key = BORDER_WIDTH_KEYS[i];
    const n = nums[i];

    if (key !== undefined && n !== undefined) out[key] = formatBoxValue(n, unit);
  }

  return out;
}

/** Non-zero border on any side. */
function borderWidthsActive(style: Partial<ElementStyle> | undefined): boolean {
  return readBorderWidths(style).nums.some(n => n !== 0);
}

function readUnifiedBorderStyle(style: Partial<ElementStyle> | undefined): string {
  if (!style) return 'solid';

  const fromLonghands = (): string => {
    for (const key of BORDER_STYLE_KEYS) {
      const raw = style[key];
      const s = raw != null ? String(raw).trim() : '';
      if (!s || s === 'none') continue;
      return s;
    }
    return '';
  };

  const lh = fromLonghands();
  if (lh) return lh;

  const sh = style.borderStyle;
  if (typeof sh === 'string') {
    const s = sh.trim();

    return s === 'none' || s === '' ? 'solid' : s;
  }

  return 'solid';
}

function borderStylesPatch(styleKind: string): Partial<ElementStyle> {
  const out: Partial<ElementStyle> = {

    ...clearBorderShorthandPatch(),
  };

  for (const key of BORDER_STYLE_KEYS) {
    out[key] = styleKind;
  }

  return out;
}

function readUnifiedBorderColor(style: Partial<ElementStyle> | undefined): string {
  if (!style) return '';

  for (const key of BORDER_COLOR_KEYS) {
    const raw = style[key];
    if (raw === undefined || raw === '') continue;
    const s = String(raw).trim();

    if (s && s.toLowerCase() !== 'transparent') return s;
  }

  const sh = style.borderColor;
  if (sh === undefined || sh === '') return '';
  const s = String(sh).trim();

  return s && s.toLowerCase() !== 'transparent' ? s : '';
}

function readUnifiedHoverBorderColor(hover?: ElementHoverColors): string {
  if (!hover) return '';

  for (const key of BORDER_COLOR_KEYS) {
    const raw = hover[key as keyof ElementHoverColors];

    if (raw === undefined || raw === '') continue;

    const s = String(raw).trim();

    if (s.length > 0 && s.toLowerCase() !== 'transparent') return s;
  }

  return '';
}

function hoverBorderColorsPatch(cssColor: string): ElementHoverColors {
  const trimmed = cssColor.trim();
  const transparent = trimmed === '' || trimmed.toLowerCase() === 'transparent';

  const c = transparent ? 'transparent' : trimmed;

  return {
    borderTopColor: c,
    borderRightColor: c,
    borderBottomColor: c,
    borderLeftColor: c,
  };
}

function borderColorsPatch(cssColor: string): Partial<ElementStyle> {
  const c = cssColor.trim() === '' || cssColor.trim().toLowerCase() === 'transparent' ? 'transparent' : cssColor.trim();
  const out: Partial<ElementStyle> = {

    ...clearBorderShorthandPatch(),
  };

  for (const key of BORDER_COLOR_KEYS) {
    out[key] = c;
  }

  return out;
}

function clearedBorderEverything(): Partial<ElementStyle> {
  const out: Partial<ElementStyle> = {

    ...clearBorderShorthandPatch(),
  };

  for (let i = 0; i < BORDER_WIDTH_KEYS.length; i++) {
    const kw = BORDER_WIDTH_KEYS[i];

    const ks = BORDER_STYLE_KEYS[i];
    const kc = BORDER_COLOR_KEYS[i];

    if (kw) out[kw] = formatBoxValue(0, 'px');
    if (ks) out[ks] = 'none';
    if (kc) out[kc] = 'transparent';
  }

  return out;
}

function enabledBorderBaseline(): Partial<ElementStyle> {
  return {
    ...clearBorderShorthandPatch(),
    ...borderStylesPatch('solid'),
    ...borderColorsPatch('transparent'),
    ...borderWidthsPatch([0, 0, 0, 0], 'px'),
  };
}

export type ColorAndBorderControlsProps = {
  elementId: string;
  editableElement: EditorElement;
  propertyMode: ResponsivePropertyMode;
};

const BORDER_STYLE_VALUES = ['solid', 'dashed', 'dotted', 'double'] as const;

function normalizeSelectableBorderKind(v: string): (typeof BORDER_STYLE_VALUES)[number] {
  return (BORDER_STYLE_VALUES as readonly string[]).includes(v) ? (v as (typeof BORDER_STYLE_VALUES)[number]) : 'solid';
}

const ColorAndBorderControls = ({ elementId, editableElement, propertyMode }: ColorAndBorderControlsProps) => {
  const { updateElementForMode } = useEditor();
  const { t } = useLanguage();
  const { style } = editableElement;

  const read0 = readBorderWidths(style);

  const [borderEnabled, setBorderEnabled] = useState(() => borderWidthsActive(style));
  const [bdUnit, setBdUnit] = useState<LengthUnit>(() => read0.unit);
  const [bdVals, setBdVals] = useState<Quadruple>(() => read0.nums);
  const [linkBdX, setLinkBdX] = useState(false);
  const [linkBdY, setLinkBdY] = useState(false);

  const applyStyleMerge = (patch: Partial<ElementStyle>) => {
    updateElementForMode(elementId, { style: patch }, propertyMode);
  };

  const commitWidths = (nextVals: Quadruple, unit: LengthUnit = bdUnit) => {
    const patch: Partial<ElementStyle> = borderWidthsPatch(nextVals, unit);

    if (nextVals.some(n => n !== 0)) {
      const kind = normalizeSelectableBorderKind(readUnifiedBorderStyle(style));

      Object.assign(patch, borderStylesPatch(kind));
    }

    applyStyleMerge(patch);
    setBdVals(nextVals);
  };

  const bdMax = thicknessMax(bdUnit);
  const bdStep = thicknessSliderStep(bdUnit);

  const SIDE_LABEL_KEYS = useMemo(
    () =>
      [
        'editor.properties.spacingSideTop',
        'editor.properties.spacingSideRight',
        'editor.properties.spacingSideBottom',
        'editor.properties.spacingSideLeft',
      ] as const,
    [],
  );

  useEffect(() => {
    const r = readBorderWidths(style);

    setBdVals(r.nums);
    setBdUnit(r.unit);
  }, [
    elementId,
    propertyMode,
    style.borderWidth,
    style.borderTopWidth,
    style.borderRightWidth,
    style.borderBottomWidth,
    style.borderLeftWidth,
  ]);

  useEffect(() => {
    setBorderEnabled(borderWidthsActive(style));
  }, [elementId, propertyMode]);

  const spacingUnitButtons = (
    unit: LengthUnit,
    onPick: (u: LengthUnit) => void,
  ) => (
    <div className="msp-grid msp-grid-cols-3 msp-gap-1.5">
      <Button
        type="button"
        variant={unit === 'px' ? 'default' : 'outline'}
        size="sm"
        className="msp-h-7 msp-text-xs"
        onClick={() => onPick('px')}
      >
        {t('editor.properties.spacingUnitPx')}
      </Button>
      <Button
        type="button"
        variant={unit === '%' ? 'default' : 'outline'}
        size="sm"
        className="msp-h-7 msp-text-xs"
        onClick={() => onPick('%')}
      >
        {t('editor.properties.spacingUnitPercent')}
      </Button>
      <Button
        type="button"
        variant={unit === 'rem' ? 'default' : 'outline'}
        size="sm"
        className="msp-h-7 msp-text-xs"
        onClick={() => onPick('rem')}
      >
        {t('editor.properties.spacingUnitRem')}
      </Button>
    </div>
  );

  const updateBdSide = (index: 0 | 1 | 2 | 3, raw: number) => {
    const v = Number.isFinite(raw) ? Math.min(bdMax, Math.max(0, raw)) : 0;

    if (linkBdX && linkBdY) {
      commitWidths([v, v, v, v]);
      return;
    }

    const next = [...bdVals] as Quadruple;

    next[index] = v;
    if (linkBdY && (index === 0 || index === 2)) {
      next[0] = v;
      next[2] = v;
    }
    if (linkBdX && (index === 1 || index === 3)) {
      next[1] = v;
      next[3] = v;
    }
    commitWidths(next);
  };

  /** 2-column grid — Üst · Sağ / Alt · Sol */
  const quadrantGrid = (
    prefix: string,
    vals: Quadruple,
    maxVal: number,
    stepVal: number,
    updateSide: (i: 0 | 1 | 2 | 3, v: number) => void,
  ) => (
    <div className="msp-grid msp-grid-cols-2 msp-gap-x-3 msp-gap-y-4">
      {SIDE_ORDER.map(i => (
        <div key={`${prefix}-${i}`} className="msp-space-y-1 msp-min-w-0">
          <Label className="msp-text-[11px]">{t(SIDE_LABEL_KEYS[i])}</Label>
          <div className="msp-flex msp-items-center msp-gap-2">
            <Slider
              className="msp-flex-1"
              value={[vals[i]]}
              max={maxVal}
              step={stepVal}
              onValueChange={([val]) => updateSide(i, val)}
            />
            <Input
              className="msp-h-7 msp-w-[3.75rem] msp-text-xs msp-shrink-0 msp-tabular-nums"
              type="number"
              min={0}
              max={maxVal}
              step={stepVal}
              value={vals[i]}
              onChange={e => updateSide(i, Number.parseFloat(e.target.value))}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const borderStyleSelectValue = readUnifiedBorderStyle(style);
  const borderColorValue = readUnifiedBorderColor(style);

  const handleStyleChange = (key: keyof ElementStyle, value: string | number) => {
    applyStyleMerge({ [key]: value } as Partial<ElementStyle>);
  };

  const applyHoverStylePatch = (patch: ElementHoverColors) => {
    updateElementForMode(elementId, { hoverStyle: patch }, propertyMode);
  };

  const hoverBg = editableElement.hoverStyle?.backgroundColor;
  const hoverFg = editableElement.hoverStyle?.color;
  const hoverBorderPickerValue = readUnifiedHoverBorderColor(editableElement.hoverStyle);
  const handleBorderStyleChange = (kind: string) => {
    applyStyleMerge({
      ...borderStylesPatch(kind),

      ...borderWidthsPatch(bdVals, bdUnit),
    });
  };

  const handleBorderColorChangeWrapped = (color: string) => {
    const c = color.trim();
    const isClear = !c || c.toLowerCase() === 'transparent';

    if (isClear) {
      applyStyleMerge(borderColorsPatch(color));
      return;
    }

    const hasWidth = bdVals.some(n => n !== 0);
    if (!hasWidth) {
      const next = [1, 1, 1, 1] as Quadruple;

      applyStyleMerge({
        ...borderColorsPatch(color),

        ...borderWidthsPatch(next, bdUnit),

        ...borderStylesPatch(normalizeSelectableBorderKind(readUnifiedBorderStyle(style))),
      });
      setBdVals(next);

      return;
    }

    applyStyleMerge(borderColorsPatch(color));
  };

  const handleHoverBorderColor = (color: string) => {
    applyHoverStylePatch(hoverBorderColorsPatch(color));
  };

  return (
    <Tabs defaultValue="normal" className="msp-w-full">
      <TabsList className="msp-grid msp-w-full msp-grid-cols-2 msp-h-8">
        <TabsTrigger value="normal" className="msp-text-xs">
          {t('editor.properties.colorTabNormal')}
        </TabsTrigger>
        <TabsTrigger value="hover" className="msp-text-xs">
          {t('editor.properties.colorTabHover')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="normal" className="msp-space-y-3 msp-mt-3">
        <div className="msp-space-y-1">
          <ColorPicker
            label={t('editor.properties.backgroundColor')}
            value={String(style.backgroundColor ?? '')}
            onChange={c => handleStyleChange('backgroundColor', c)}
          />
        </div>

        <div className="msp-space-y-1">
          <ColorPicker
            label={t('editor.properties.textColor')}
            value={String(style.color ?? '')}
            onChange={c => handleStyleChange('color', c)}
          />
        </div>

        <div className="msp-rounded-md msp-border msp-border-border msp-bg-muted/20 msp-overflow-hidden">
          <div className="msp-flex msp-items-center msp-justify-between msp-gap-2 msp-px-3 msp-py-2.5 msp-bg-muted/30">
            <Label htmlFor="color-bd-on" className="msp-text-xs msp-leading-tight msp-font-medium">
              {t('editor.properties.borderEnabled')}
            </Label>
            <Switch
              id="color-bd-on"
              checked={borderEnabled}
              onCheckedChange={on => {
                setBorderEnabled(on);

                if (on) applyStyleMerge(enabledBorderBaseline());
                else applyStyleMerge(clearedBorderEverything());
              }}
            />
          </div>

          {borderEnabled && (
            <div className="msp-space-y-3 msp-p-3">
              <div className="msp-space-y-1">
                <Label className="msp-text-xs">{t('editor.properties.borderType')}</Label>
                <Select value={normalizeSelectableBorderKind(borderStyleSelectValue)} onValueChange={handleBorderStyleChange}>
                  <SelectTrigger className="msp-h-7 msp-text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">{t('editor.properties.borderStyleSolid')}</SelectItem>
                    <SelectItem value="dashed">{t('editor.properties.borderStyleDashed')}</SelectItem>
                    <SelectItem value="dotted">{t('editor.properties.borderStyleDotted')}</SelectItem>
                    <SelectItem value="double">{t('editor.properties.borderStyleDouble')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="msp-space-y-1">
                <ColorPicker label={t('editor.properties.borderColor')} value={borderColorValue} onChange={handleBorderColorChangeWrapped} />
              </div>

              <Label className="msp-text-xs msp-font-medium">{t('editor.properties.borderSize')}</Label>

              {spacingUnitButtons(bdUnit, u => {
                setBdUnit(u);
                commitWidths(bdVals, u);
              })}

              {quadrantGrid('bd', bdVals, bdMax, bdStep, updateBdSide)}

              <div className="msp-space-y-2 msp-border-t msp-border-border msp-pt-3">
                <div className="msp-flex msp-items-center msp-justify-between">
                  <Label htmlFor="link-bdx" className="msp-text-[11px] msp-font-normal">
                    {t('editor.properties.spacingLinkBorderX')}
                  </Label>
                  <Switch id="link-bdx" checked={linkBdX} onCheckedChange={setLinkBdX} />
                </div>
                <div className="msp-flex msp-items-center msp-justify-between">
                  <Label htmlFor="link-bdy" className="msp-text-[11px] msp-font-normal">
                    {t('editor.properties.spacingLinkBorderY')}
                  </Label>
                  <Switch id="link-bdy" checked={linkBdY} onCheckedChange={setLinkBdY} />
                </div>
              </div>

              <div className="msp-space-y-1">
                <Label className="msp-text-xs">{t('editor.properties.borderRadius')}</Label>
                <Select
                  value={String(style.borderRadius ?? 0)}
                  onValueChange={val => handleStyleChange('borderRadius', Number(val))}
                >
                  <SelectTrigger className="msp-h-7 msp-text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BORDER_RADII.map(radius => (
                      <SelectItem key={radius} value={String(radius)}>
                        {radius === 9999 ? 'Circle' : `${radius}px`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="hover" className="msp-space-y-3 msp-mt-3">
        <p className="msp-text-muted-foreground msp-text-[11px]">{t('editor.properties.colorHoverHint')}</p>
        <div className="msp-space-y-3 msp-rounded-md msp-border msp-border-border msp-bg-muted/15 msp-p-3">
          <div className="msp-space-y-1">
            <ColorPicker
              label={t('editor.properties.hoverBackgroundColor')}
              value={String(hoverBg ?? '')}
              onChange={c => applyHoverStylePatch({ backgroundColor: c })}
            />
          </div>
          <div className="msp-space-y-1">
            <ColorPicker
              label={t('editor.properties.hoverTextColor')}
              value={String(hoverFg ?? '')}
              onChange={c => applyHoverStylePatch({ color: c })}
            />
          </div>
          <div className="msp-space-y-1">
            <ColorPicker label={t('editor.properties.hoverBorderColor')} value={hoverBorderPickerValue} onChange={handleHoverBorderColor} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ColorAndBorderControls;
