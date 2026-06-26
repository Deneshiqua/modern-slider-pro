import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import PropertyField from '@/components/editor/PropertyField';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { FONT_SIZES } from '@/lib/constants';
import {
  fetchGoogleFontsCatalog,
  loadGoogleFont,
  searchGoogleFonts,
  type GoogleFontEntry,
} from '@/lib/googleFonts';
import { cn } from '@/lib/utils';

const FONT_WEIGHT_OPTIONS = [
  { value: '300', labelKey: 'editor.properties.fontWeightLight' },
  { value: '400', labelKey: 'editor.properties.fontWeightRegular' },
  { value: '500', labelKey: 'editor.properties.fontWeightMedium' },
  { value: '600', labelKey: 'editor.properties.fontWeightSemiBold' },
  { value: '700', labelKey: 'editor.properties.fontWeightBold' },
] as const;

type FontPropertiesControlsProps = {
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  onFontFamilyChange: (fontFamily: string) => void;
  onFontSizeChange: (fontSize: number) => void;
  onFontWeightChange: (fontWeight: number) => void;
};

const FontPropertiesControls = ({
  fontFamily,
  fontSize,
  fontWeight,
  onFontFamilyChange,
  onFontSizeChange,
  onFontWeightChange,
}: FontPropertiesControlsProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<GoogleFontEntry[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const selectedFamily = fontFamily?.replace(/^['"]|['"]$/g, '').trim() || '';
  const resolvedFontSize = fontSize ? String(fontSize).replace('px', '') : '16';
  const resolvedFontWeight = fontWeight ? String(fontWeight) : '400';

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
          <p className="msp-text-[11px] msp-leading-snug msp-text-muted-foreground">
            {t('editor.properties.fontFamilyHint')}
          </p>
        </div>
      </PropertyField>

      <PropertyField label={t('editor.properties.fontSize')}>
        <Select value={resolvedFontSize} onValueChange={(val) => onFontSizeChange(Number(val))}>
          <SelectTrigger className="msp-h-7 msp-text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)} className="msp-text-xs">
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PropertyField>

      <PropertyField label={t('editor.properties.fontWeight')}>
        <Select
          value={resolvedFontWeight}
          onValueChange={(val) => onFontWeightChange(Number(val))}
        >
          <SelectTrigger className="msp-h-7 msp-text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_WEIGHT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="msp-text-xs">
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PropertyField>
    </div>
  );
};

export default FontPropertiesControls;
