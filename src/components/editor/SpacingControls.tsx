import { Button } from '@/components/ui/button';
import PropertyField from '@/components/editor/PropertyField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { EditorElement, ElementStyle, ResponsivePropertyMode } from '@/types/editor';
import React, { useEffect, useMemo, useState } from 'react';

type BoxKind = 'padding' | 'margin';

export type LengthUnit = 'px' | '%' | 'rem';

type Quadruple = [number, number, number, number];

const PADDING_KEYS = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const satisfies readonly (keyof ElementStyle)[];

const MARGIN_KEYS = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'] as const satisfies readonly (keyof ElementStyle)[];

const KEYS: Record<BoxKind, readonly (keyof ElementStyle)[]> = {
  padding: PADDING_KEYS,
  margin: MARGIN_KEYS,
};

const SHORT: Record<BoxKind, keyof ElementStyle> = {
  padding: 'padding',
  margin: 'margin',
};

const SIDE_ORDER = [0, 1, 2, 3] as const;

export function splitSides(raw: string): [string, string, string, string] {
  const p = raw.trim().split(/\s+/).filter(Boolean);
  const a = p[0] ?? '0';
  const b = p[1] ?? '0';
  const c = p[2] ?? '0';
  const d = p[3] ?? '0';

  if (p.length === 0) return ['0', '0', '0', '0'];
  if (p.length === 1) return [a, a, a, a];
  if (p.length === 2) return [a, b, a, b];
  if (p.length === 3) return [a, b, c, b];

  return [a, b, c, d];
}

export function parseLengthToken(token: string): { num: number; unit: LengthUnit } {
  const trimmed = token.trim();

  if (trimmed === 'auto') return { num: 0, unit: 'px' };
  const m = /^(-?[\d.]+)(px|%|rem)?$/.exec(trimmed);
  if (!m) return { num: 0, unit: 'px' };

  const g1 = m[1];
  if (g1 === undefined) return { num: 0, unit: 'px' };

  const num = Number.parseFloat(g1);
  const suf = m[2];
  const unit = suf === '%' ? '%' : suf === 'rem' ? 'rem' : 'px';

  return { num: Number.isFinite(num) ? num : 0, unit };
}

export function tokenFromStyle(val: string | number | undefined): string {
  if (val === undefined || val === '') return '0';
  return typeof val === 'number' ? `${val}px` : String(val);
}

export function pickDominantUnit(parsed: ReturnType<typeof parseLengthToken>[]): LengthUnit {
  if (parsed.some(p => p.unit === '%')) return '%';

  if (parsed.some(p => p.unit === 'rem')) return 'rem';

  return 'px';
}

export function formatBoxValue(n: number, unit: LengthUnit): string | number {
  const roundedRem = Math.round(n * 1000) / 1000;

  if (unit === '%') return `${roundedRem}%`;
  if (unit === 'rem') return `${roundedRem}rem`;

  return Math.round(n * 100) / 100;
}

export function readBoxModel(style: Partial<ElementStyle> | undefined, kind: BoxKind): { nums: Quadruple; unit: LengthUnit } {
  if (!style) return { nums: [0, 0, 0, 0], unit: 'px' };

  const keys = KEYS[kind];
  const longhandUsed = keys.some(k => style[k as keyof ElementStyle] != null && style[k as keyof ElementStyle] !== '');

  let tokens: [string, string, string, string];

  if (longhandUsed) {
    tokens = [
      tokenFromStyle(style[keys[0]] as string | number | undefined),
      tokenFromStyle(style[keys[1]] as string | number | undefined),
      tokenFromStyle(style[keys[2]] as string | number | undefined),
      tokenFromStyle(style[keys[3]] as string | number | undefined),
    ];
  }
  else {
    const combined = SHORT[kind];
    const sh = style[combined];

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

function boxWritingPatch(kind: BoxKind, nums: Quadruple, unit: LengthUnit): Partial<ElementStyle> {
  const keysTuple = KEYS[kind];
  const out: Partial<ElementStyle> = { [SHORT[kind]]: undefined };

  for (let i = 0; i < keysTuple.length; i++) {
    const key = keysTuple[i];
    const n = nums[i];

    if (key !== undefined && n !== undefined) {
      Object.assign(out, { [key]: formatBoxValue(n, unit) } as Partial<ElementStyle>);
    }
  }

  return out;
}

export function clearedBox(kind: BoxKind): Partial<ElementStyle> {
  return boxWritingPatch(kind, [0, 0, 0, 0], 'px');
}

function spacingMax(unit: LengthUnit): number {
  switch (unit) {
    case '%':
      return 100;
    case 'rem':
      return 24;
    default:
      return 200;
  }
}

function spacingSliderStep(unit: LengthUnit): number {
  return unit === 'rem' ? 0.125 : 1;
}

/** Whether stored box has non-zero values (opening switch state per element/mode only). */
function boxLooksActive(style: Partial<ElementStyle>, kind: BoxKind): boolean {
  return readBoxModel(style, kind).nums.some(n => n !== 0);
}

export type SpacingControlsProps = {
  elementId: string;
  editableElement: EditorElement;
  propertyMode: ResponsivePropertyMode;
};

const SpacingControls = ({ elementId, editableElement, propertyMode }: SpacingControlsProps) => {
  const { updateElementForMode } = useEditor();
  const { t } = useLanguage();
  const { style } = editableElement;

  const padRead0 = readBoxModel(style, 'padding');
  const marRead0 = readBoxModel(style, 'margin');

  const [padEnabled, setPadEnabled] = useState(() => boxLooksActive(style, 'padding'));
  const [marEnabled, setMarEnabled] = useState(() => boxLooksActive(style, 'margin'));

  const [padUnit, setPadUnit] = useState<LengthUnit>(() => padRead0.unit);
  const [marUnit, setMarUnit] = useState<LengthUnit>(() => marRead0.unit);

  const [padVals, setPadVals] = useState<Quadruple>(() => padRead0.nums);
  const [marVals, setMarVals] = useState<Quadruple>(() => marRead0.nums);

  useEffect(() => {
    const p = readBoxModel(style, 'padding');

    setPadVals(p.nums);
    setPadUnit(p.unit);
  }, [
    elementId,
    propertyMode,
    style.padding,
    style.paddingTop,
    style.paddingRight,
    style.paddingBottom,
    style.paddingLeft,
  ]);

  useEffect(() => {
    const m = readBoxModel(style, 'margin');

    setMarVals(m.nums);
    setMarUnit(m.unit);
  }, [
    elementId,
    propertyMode,
    style.margin,
    style.marginTop,
    style.marginRight,
    style.marginBottom,
    style.marginLeft,
  ]);

  useEffect(() => {
    setPadEnabled(boxLooksActive(style, 'padding'));
  }, [elementId, propertyMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setMarEnabled(boxLooksActive(style, 'margin'));
  }, [elementId, propertyMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const [linkPadX, setLinkPadX] = useState(false);
  const [linkPadY, setLinkPadY] = useState(false);
  const [linkMarX, setLinkMarX] = useState(false);
  const [linkMarY, setLinkMarY] = useState(false);

  const applyStyleMerge = (patch: Partial<ElementStyle>) => {
    updateElementForMode(elementId, { style: patch }, propertyMode);
  };

  const commitPadding = (nextVals: Quadruple, unit: LengthUnit = padUnit) => {
    applyStyleMerge(boxWritingPatch('padding', nextVals, unit));
    setPadVals(nextVals);
  };

  const commitMargin = (nextVals: Quadruple, unit: LengthUnit = marUnit) => {
    applyStyleMerge(boxWritingPatch('margin', nextVals, unit));
    setMarVals(nextVals);
  };

  const paddMax = spacingMax(padUnit);
  const paddStep = spacingSliderStep(padUnit);
  const margMax = spacingMax(marUnit);
  const margStep = spacingSliderStep(marUnit);

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

  const updatePadSide = (index: 0 | 1 | 2 | 3, raw: number) => {
    const v = Number.isFinite(raw) ? Math.min(paddMax, Math.max(0, raw)) : 0;

    if (linkPadX && linkPadY) {
      commitPadding([v, v, v, v]);
      return;
    }

    const next = [...padVals] as Quadruple;

    next[index] = v;
    if (linkPadY && (index === 0 || index === 2)) {
      next[0] = v;
      next[2] = v;
    }
    if (linkPadX && (index === 1 || index === 3)) {
      next[1] = v;
      next[3] = v;
    }
    commitPadding(next);
  };

  const updateMarSide = (index: 0 | 1 | 2 | 3, raw: number) => {
    const v = Number.isFinite(raw) ? Math.min(margMax, Math.max(0, raw)) : 0;

    if (linkMarX && linkMarY) {
      commitMargin([v, v, v, v]);
      return;
    }

    const next = [...marVals] as Quadruple;

    next[index] = v;
    if (linkMarY && (index === 0 || index === 2)) {
      next[0] = v;
      next[2] = v;
    }
    if (linkMarX && (index === 1 || index === 3)) {
      next[1] = v;
      next[3] = v;
    }
    commitMargin(next);
  };

  /** 2-column grid — Üst · Sağ / Alt · Sol */
  const quadrantGrid = (
    prefix: string,
    vals: Quadruple,
    maxVal: number,
    stepVal: number,
    updateSide: (i: 0 | 1 | 2 | 3, v: number) => void,
  ) => (
    <div className="msp-grid msp-grid-cols-1 msp-gap-y-3">
      {SIDE_ORDER.map(i => (
        <PropertyField key={`${prefix}-${i}`} label={t(SIDE_LABEL_KEYS[i])} labelClassName="msp-text-[11px]">
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
        </PropertyField>
      ))}
    </div>
  );

  const paddingBlock = (
    <div className="msp-rounded-md msp-border msp-border-border msp-bg-muted/20 msp-overflow-hidden">
      <div className="msp-flex msp-items-center msp-justify-between msp-gap-2 msp-px-3 msp-py-2.5 msp-bg-muted/30">
        <Label htmlFor="spacing-pad-on" className="msp-text-xs msp-leading-tight msp-font-medium">
          {t('editor.properties.paddingToggle')}
        </Label>
        <Switch
          id="spacing-pad-on"
          checked={padEnabled}
          onCheckedChange={on => {
            setPadEnabled(on);
            if (on) commitPadding([0, 0, 0, 0], padUnit);
            else applyStyleMerge(clearedBox('padding'));
          }}
        />
      </div>

      {padEnabled && (
        <div className="msp-space-y-3 msp-p-3">
          {spacingUnitButtons(padUnit, u => {
            setPadUnit(u);
            commitPadding(padVals, u);
          })}

          {quadrantGrid('p', padVals, paddMax, paddStep, updatePadSide)}

          <div className="msp-space-y-2 msp-border-t msp-border-border msp-pt-3">
            <div className="msp-flex msp-items-center msp-justify-between">
              <Label htmlFor="link-padx" className="msp-text-[11px] msp-font-normal">
                {t('editor.properties.spacingLinkPadX')}
              </Label>
              <Switch id="link-padx" checked={linkPadX} onCheckedChange={setLinkPadX} />
            </div>
            <div className="msp-flex msp-items-center msp-justify-between">
              <Label htmlFor="link-pady" className="msp-text-[11px] msp-font-normal">
                {t('editor.properties.spacingLinkPadY')}
              </Label>
              <Switch id="link-pady" checked={linkPadY} onCheckedChange={setLinkPadY} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const marginBlock = (
    <div className="msp-rounded-md msp-border msp-border-border msp-bg-muted/20 msp-overflow-hidden">
      <div className="msp-flex msp-items-center msp-justify-between msp-gap-2 msp-px-3 msp-py-2.5 msp-bg-muted/30">
        <Label htmlFor="spacing-mar-on" className="msp-text-xs msp-leading-tight msp-font-medium">
          {t('editor.properties.marginToggle')}
        </Label>
        <Switch
          id="spacing-mar-on"
          checked={marEnabled}
          onCheckedChange={on => {
            setMarEnabled(on);
            if (on) commitMargin([0, 0, 0, 0], marUnit);
            else applyStyleMerge(clearedBox('margin'));
          }}
        />
      </div>

      {marEnabled && (
        <div className="msp-space-y-3 msp-p-3">
          {spacingUnitButtons(marUnit, u => {
            setMarUnit(u);
            commitMargin(marVals, u);
          })}

          {quadrantGrid('m', marVals, margMax, margStep, updateMarSide)}

          <div className="msp-space-y-2 msp-border-t msp-border-border msp-pt-3">
            <div className="msp-flex msp-items-center msp-justify-between">
              <Label htmlFor="link-marx" className="msp-text-[11px] msp-font-normal">
                {t('editor.properties.spacingLinkMarX')}
              </Label>
              <Switch id="link-marx" checked={linkMarX} onCheckedChange={setLinkMarX} />
            </div>
            <div className="msp-flex msp-items-center msp-justify-between">
              <Label htmlFor="link-mary" className="msp-text-[11px] msp-font-normal">
                {t('editor.properties.spacingLinkMarY')}
              </Label>
              <Switch id="link-mary" checked={linkMarY} onCheckedChange={setLinkMarY} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="msp-space-y-5">
      {paddingBlock}
      {marginBlock}
    </div>
  );
};

export default SpacingControls;