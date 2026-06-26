import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import PropertyField from '@/components/editor/PropertyField';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/context/LanguageContext';
import {
  FONT_LETTER_SPACING_RANGE,
  FONT_LINE_HEIGHT_RANGE,
  FONT_REM_SIZE_RANGE,
  FONT_SIZE_RANGE,
  FONT_WEIGHT_RANGE,
} from '@/lib/constants';
import {
  formatFontSizeValue,
  parseFontSize,
  toggleFontSizeUnit,
} from '@/lib/fontSizeUnits';
import {
  fetchGoogleFontsCatalog,
  loadGoogleFont,
  searchGoogleFonts,
  type GoogleFontEntry,
} from '@/lib/googleFonts';
import { cn } from '@/lib/utils';

function clampRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatLineHeight(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function formatLetterSpacingInput(value: number): string {
  return String(value);
}

function snapFontWeight(value: number): number {
  const snapped = Math.round(value / FONT_WEIGHT_RANGE.step) * FONT_WEIGHT_RANGE.step;
  return clampRange(snapped, FONT_WEIGHT_RANGE.min, FONT_WEIGHT_RANGE.max);
}

type FontRangeControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
};

const FontRangeControl = ({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  onChange,
}: FontRangeControlProps) => (
  <PropertyField label={label}>
    <div className="msp-flex msp-items-center msp-gap-2">
      <Slider
        className="msp-min-w-0 msp-flex-1"
        size="sm"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(clampRange(next, min, max))}
      />
      <span className="msp-w-10 msp-shrink-0 msp-text-right msp-text-xs msp-tabular-nums msp-text-muted-foreground">
        {formatValue(value)}
      </span>
    </div>
  </PropertyField>
);

type FontSliderInputProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  inputSuffix?: string;
  onSuffixClick?: () => void;
  suffixTitle?: string;
  formatInputValue: (value: number) => string;
  parseInputValue: (raw: string) => number | null;
  onChange: (value: number) => void;
  onReset?: () => void;
  resetLabel?: string;
};

const FontSliderInput = ({
  label,
  value,
  min,
  max,
  step,
  inputSuffix,
  onSuffixClick,
  suffixTitle,
  formatInputValue,
  parseInputValue,
  onChange,
  onReset,
  resetLabel,
}: FontSliderInputProps) => {
  const [draft, setDraft] = useState(formatInputValue(value));

  useEffect(() => {
    setDraft(formatInputValue(value));
  }, [value, formatInputValue]);

  const commitDraft = () => {
    const parsed = parseInputValue(draft);
    if (parsed === null) {
      setDraft(formatInputValue(value));
      return;
    }
    onChange(clampRange(parsed, min, max));
  };

  return (
    <PropertyField label={label}>
      <div className="msp-flex msp-min-w-0 msp-items-center msp-gap-1">
        <Slider
          className="msp-min-w-0 msp-flex-1"
          size="sm"
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([next]) => onChange(clampRange(next, min, max))}
        />
        <div
          className={cn(
            'msp-relative msp-shrink-0',
            inputSuffix ? 'msp-w-[4.5rem]' : 'msp-w-[4.25rem]',
          )}
        >
          <Input
            className={cn(
              'msp-h-7 msp-w-full msp-text-xs msp-tabular-nums',
              inputSuffix ? 'msp-pl-2 msp-pr-7' : 'msp-px-2',
            )}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
          />
          {inputSuffix ? (
            onSuffixClick ? (
              <button
                type="button"
                className="msp-absolute msp-right-1.5 msp-top-1/2 -msp-translate-y-1/2 msp-rounded msp-px-0.5 msp-text-[10px] msp-text-muted-foreground msp-transition-colors hover:msp-text-foreground"
                title={suffixTitle}
                aria-label={suffixTitle}
                onClick={onSuffixClick}
              >
                {inputSuffix}
              </button>
            ) : (
              <span className="msp-pointer-events-none msp-absolute msp-right-2 msp-top-1/2 -msp-translate-y-1/2 msp-text-[10px] msp-text-muted-foreground">
                {inputSuffix}
              </span>
            )
          ) : null}
        </div>
        {onReset && resetLabel ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="msp-h-7 msp-w-7 msp-shrink-0"
            title={resetLabel}
            aria-label={resetLabel}
            onClick={onReset}
          >
            <RotateCcw className="msp-h-3.5 msp-w-3.5" />
          </Button>
        ) : null}
      </div>
    </PropertyField>
  );
};

type FontPropertiesControlsProps = {
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  onFontFamilyChange: (fontFamily: string) => void;
  onFontSizeChange: (fontSize: string | number) => void;
  onFontWeightChange: (fontWeight: number) => void;
  onLineHeightChange: (lineHeight: number | '') => void;
  onLetterSpacingChange: (letterSpacing: number | '') => void;
};

const FontPropertiesControls = ({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  onFontFamilyChange,
  onFontSizeChange,
  onFontWeightChange,
  onLineHeightChange,
  onLetterSpacingChange,
}: FontPropertiesControlsProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<GoogleFontEntry[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const selectedFamily = fontFamily?.replace(/^['"]|['"]$/g, '').trim() || '';
  const parsedFontSize = parseFontSize(fontSize);
  const fontSizeRange =
    parsedFontSize.unit === 'rem' ? FONT_REM_SIZE_RANGE : FONT_SIZE_RANGE;
  const resolvedFontSize = clampRange(
    parsedFontSize.amount,
    fontSizeRange.min,
    fontSizeRange.max,
  );
  const resolvedFontWeight = snapFontWeight(Number(fontWeight) || FONT_WEIGHT_RANGE.default);
  const resolvedLineHeight = (() => {
    if (lineHeight === undefined || lineHeight === '' || lineHeight === 'normal') {
      return FONT_LINE_HEIGHT_RANGE.default;
    }
    const numeric = Number(lineHeight);
    if (!Number.isNaN(numeric)) {
      return clampRange(numeric, FONT_LINE_HEIGHT_RANGE.min, FONT_LINE_HEIGHT_RANGE.max);
    }
    return FONT_LINE_HEIGHT_RANGE.default;
  })();
  const resolvedLetterSpacing = (() => {
    if (letterSpacing === undefined || letterSpacing === '' || letterSpacing === 'normal') {
      return FONT_LETTER_SPACING_RANGE.default;
    }
    const numeric = Number(letterSpacing);
    if (!Number.isNaN(numeric)) {
      return clampRange(numeric, FONT_LETTER_SPACING_RANGE.min, FONT_LETTER_SPACING_RANGE.max);
    }
    return FONT_LETTER_SPACING_RANGE.default;
  })();

  useEffect(() => {
    if (!open || catalog.length > 0 || loadingCatalog) return;

    setLoadingCatalog(true);
    void fetchGoogleFontsCatalog()
      .then((entries) => {
        setCatalog(entries);
        setCatalogError(null);
      })
      .catch((error) => {
        setCatalogError(error instanceof Error ? error.message : 'Font listesi yuklenemedi');
      })
      .finally(() => {
        setLoadingCatalog(false);
      });
  }, [open, catalog.length, loadingCatalog]);

  const results = useMemo(() => searchGoogleFonts(catalog, query, 60), [catalog, query]);

  useEffect(() => {
    if (!open) return;
    results.slice(0, 24).forEach((entry) => loadGoogleFont(entry.family));
  }, [open, results]);

  useEffect(() => {
    if (selectedFamily) {
      loadGoogleFont(selectedFamily);
    }
  }, [selectedFamily]);

  const handleSelectFamily = (family: string) => {
    if (!family) {
      onFontFamilyChange('');
      setOpen(false);
      return;
    }
    loadGoogleFont(family);
    onFontFamilyChange(family);
    setOpen(false);
  };

  const handleLineHeightChange = (value: number) => {
    if (Math.abs(value - FONT_LINE_HEIGHT_RANGE.default) < 0.001) {
      onLineHeightChange('');
      return;
    }
    onLineHeightChange(value);
  };

  const handleLetterSpacingChange = (value: number) => {
    if (value === FONT_LETTER_SPACING_RANGE.default) {
      onLetterSpacingChange('');
      return;
    }
    onLetterSpacingChange(value);
  };

  const resetLabel = t('editor.properties.fontValueReset');

  return (
    <div className="msp-space-y-3">
      <PropertyField label={t('editor.properties.fontFamily')} align="start">
        <div className="msp-space-y-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="msp-h-8 msp-w-full msp-justify-between msp-px-2.5 msp-text-xs msp-font-normal"
              >
                <span
                  className="msp-truncate"
                  style={selectedFamily ? { fontFamily: selectedFamily } : undefined}
                >
                  {selectedFamily || t('editor.properties.fontFamilyDefault')}
                </span>
                <ChevronsUpDown className="msp-ml-2 msp-h-3.5 msp-w-3.5 msp-shrink-0 msp-opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="msp-w-[min(320px,var(--radix-popover-trigger-width))] msp-p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={t('editor.properties.fontFamilySearch')}
                  className="msp-h-9 msp-text-xs"
                  value={query}
                  onValueChange={setQuery}
                />
                <CommandList>
                  {loadingCatalog ? (
                    <div className="msp-py-6 msp-text-center msp-text-xs msp-text-muted-foreground">
                      {t('editor.properties.fontFamilyLoading')}
                    </div>
                  ) : catalogError ? (
                    <div className="msp-py-6 msp-px-3 msp-text-center msp-text-xs msp-text-destructive">
                      {catalogError}
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>{t('editor.properties.fontFamilyNoResults')}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__default__"
                          className="msp-text-xs"
                          onSelect={() => handleSelectFamily('')}
                        >
                          <Check
                            className={cn(
                              'msp-mr-2 msp-h-3.5 msp-w-3.5',
                              !selectedFamily ? 'msp-opacity-100' : 'msp-opacity-0',
                            )}
                          />
                          {t('editor.properties.fontFamilyDefault')}
                        </CommandItem>
                        {results.map((entry) => (
                          <CommandItem
                            key={entry.family}
                            value={entry.family}
                            className="msp-text-xs"
                            onSelect={() => handleSelectFamily(entry.family)}
                          >
                            <Check
                              className={cn(
                                'msp-mr-2 msp-h-3.5 msp-w-3.5',
                                selectedFamily === entry.family ? 'msp-opacity-100' : 'msp-opacity-0',
                              )}
                            />
                            <span className="msp-truncate" style={{ fontFamily: entry.family }}>
                              {entry.family}
                            </span>
                            {entry.category ? (
                              <span className="msp-ml-auto msp-pl-2 msp-text-[10px] msp-text-muted-foreground">
                                {entry.category}
                              </span>
                            ) : null}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </PropertyField>

      <FontSliderInput
        label={t('editor.properties.fontSize')}
        value={resolvedFontSize}
        min={fontSizeRange.min}
        max={fontSizeRange.max}
        step={fontSizeRange.step}
        inputSuffix={parsedFontSize.unit}
        onSuffixClick={() => onFontSizeChange(toggleFontSizeUnit(fontSize))}
        suffixTitle={
          parsedFontSize.unit === 'px'
            ? t('editor.properties.fontSizeUnitRem')
            : t('editor.properties.fontSizeUnitPx')
        }
        formatInputValue={(value) =>
          parsedFontSize.unit === 'rem' ? formatLineHeight(value) : String(Math.round(value))
        }
        parseInputValue={(raw) => {
          const cleaned = raw.trim().replace(/(px|rem)$/i, '');
          const parsed =
            parsedFontSize.unit === 'rem'
              ? Number.parseFloat(cleaned)
              : Number.parseInt(cleaned, 10);
          return Number.isFinite(parsed) ? parsed : null;
        }}
        onChange={(value) =>
          onFontSizeChange(formatFontSizeValue(value, parsedFontSize.unit))
        }
      />

      <FontRangeControl
        label={t('editor.properties.fontWeight')}
        value={resolvedFontWeight}
        min={FONT_WEIGHT_RANGE.min}
        max={FONT_WEIGHT_RANGE.max}
        step={FONT_WEIGHT_RANGE.step}
        formatValue={(value) => String(value)}
        onChange={(value) => onFontWeightChange(snapFontWeight(value))}
      />

      <FontSliderInput
        label={t('editor.properties.lineHeight')}
        value={resolvedLineHeight}
        min={FONT_LINE_HEIGHT_RANGE.min}
        max={FONT_LINE_HEIGHT_RANGE.max}
        step={FONT_LINE_HEIGHT_RANGE.step}
        formatInputValue={formatLineHeight}
        parseInputValue={(raw) => {
          const parsed = Number.parseFloat(raw.trim());
          return Number.isFinite(parsed) ? parsed : null;
        }}
        onChange={handleLineHeightChange}
        onReset={() => onLineHeightChange('')}
        resetLabel={resetLabel}
      />

      <FontSliderInput
        label={t('editor.properties.letterSpacing')}
        value={resolvedLetterSpacing}
        min={FONT_LETTER_SPACING_RANGE.min}
        max={FONT_LETTER_SPACING_RANGE.max}
        step={FONT_LETTER_SPACING_RANGE.step}
        inputSuffix="px"
        formatInputValue={formatLetterSpacingInput}
        parseInputValue={(raw) => {
          const parsed = Number.parseFloat(raw.trim().replace(/px$/i, ''));
          return Number.isFinite(parsed) ? parsed : null;
        }}
        onChange={handleLetterSpacingChange}
        onReset={() => onLetterSpacingChange('')}
        resetLabel={resetLabel}
      />
    </div>
  );
};

export default FontPropertiesControls;
