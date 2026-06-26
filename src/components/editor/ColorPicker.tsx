import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pipette } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import PropertyField from '@/components/editor/PropertyField';

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presetColors?: string[];
};

const PRESET_COLORS = [
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#99f6e4', '#bfdbfe', '#ddd6fe', '#fbcfe8',
  '#991b1b', '#9a3412', '#854d0e', '#166534', '#115e59', '#1e40af', '#5b21b6', '#9d174d',
];

const checkerboardBackground = {
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, white 25%, white 75%, #ccc 75%)',
  backgroundSize: '8px 8px',
  backgroundPosition: '0 0, 4px 4px',
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const clean = hex.replace('#', '');

  if (clean.length === 3) {
    return {
      r: Number.parseInt(clean[0] + clean[0], 16),
      g: Number.parseInt(clean[1] + clean[1], 16),
      b: Number.parseInt(clean[2] + clean[2], 16),
    };
  }

  if (clean.length >= 6) {
    return {
      r: Number.parseInt(clean.slice(0, 2), 16),
      g: Number.parseInt(clean.slice(2, 4), 16),
      b: Number.parseInt(clean.slice(4, 6), 16),
    };
  }

  return null;
};

const parseColorAndOpacity = (color: string): { hex: string; opacity: number } => {
  if (!color) return { hex: '', opacity: 100 };

  const rgbaMatch = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/.exec(color);
  if (rgbaMatch) {
    const r = Number.parseInt(rgbaMatch[1]);
    const g = Number.parseInt(rgbaMatch[2]);
    const b = Number.parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] === undefined ? 1 : Number.parseFloat(rgbaMatch[4]);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return { hex, opacity: Math.round(a * 100) };
  }

  if (color.startsWith('#')) {
    const clean = color.replace('#', '');

    if (clean.length === 8) {
      const hex = `#${clean.slice(0, 6)}`;
      const a = Number.parseInt(clean.slice(6, 8), 16) / 255;

      return { hex, opacity: Math.round(a * 100) };
    }

    return { hex: color, opacity: 100 };
  }

  return { hex: color, opacity: 100 };
};

const buildColorWithOpacity = (hex: string, opacity: number): string => {
  if (!hex) return '';
  if (opacity >= 100) return hex;

  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const alpha = Math.round((opacity / 100) * 100) / 100;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const isValidHex = (value: string) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(value);

const ColorPicker = ({ value, onChange, label, presetColors }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const { hex: parsedHex, opacity: parsedOpacity } = parseColorAndOpacity(value);
  const [inputValue, setInputValue] = useState(parsedHex);
  const [opacity, setOpacity] = useState(parsedOpacity);
  const colors = Array.from(new Set([...(presetColors ?? []), ...PRESET_COLORS]));

  useEffect(() => {
    const { hex, opacity: nextOpacity } = parseColorAndOpacity(value);
    setInputValue(hex);
    setOpacity(nextOpacity);
  }, [value]);

  const applyChange = (hex: string, nextOpacity: number) => {
    onChange(buildColorWithOpacity(hex, nextOpacity));
  };

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);

    if (isValidHex(nextValue) || nextValue === '') {
      applyChange(nextValue, opacity);
    }
  };

  const handleInputBlur = () => {
    if (!inputValue || inputValue.startsWith('#')) return;

    const withHash = `#${inputValue}`;
    if (isValidHex(withHash)) {
      setInputValue(withHash);
      applyChange(withHash, opacity);
    }
  };

  const handleOpacityChange = ([nextOpacity]: number[]) => {
    setOpacity(nextOpacity);
    applyChange(inputValue, nextOpacity);
  };

  const displayPreviewColor = inputValue ? buildColorWithOpacity(inputValue, opacity) : '';

  const pickerControl = (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="msp-w-full msp-h-7 msp-justify-start msp-gap-2 msp-px-2.5 msp-bg-transparent"
        >
          <div
            className="msp-w-4 msp-h-4 msp-rounded msp-border msp-border-border msp-shadow-sm msp-shrink-0"
            style={checkerboardBackground}
          >
            <div
              className="msp-w-full msp-h-full msp-rounded"
              style={{ backgroundColor: displayPreviewColor || 'transparent' }}
            />
          </div>
          <span className="msp-text-xs msp-font-mono msp-flex-1 msp-text-left msp-truncate">
            {value || 'Renk seç'}
          </span>
          <Pipette className="msp-w-3.5 msp-h-3.5 msp-text-muted-foreground msp-shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="msp-w-64 msp-p-3" align="start">
          <div className="msp-space-y-3">
            <div className="msp-flex msp-gap-2">
              <button
                type="button"
                className="msp-w-10 msp-h-10 msp-rounded-lg msp-border msp-border-border msp-cursor-pointer msp-overflow-hidden msp-relative"
                onClick={() => colorInputRef.current?.click()}
              >
                <span
                  className="msp-block msp-w-full msp-h-full"
                  style={{ backgroundColor: inputValue || '#ffffff' }}
                />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={inputValue || '#ffffff'}
                  onChange={(event) => {
                    setInputValue(event.target.value);
                    applyChange(event.target.value, opacity);
                  }}
                  className="msp-absolute msp-inset-0 msp-opacity-0 msp-cursor-pointer"
                />
              </button>
              <Input
                value={inputValue}
                onChange={(event) => handleInputChange(event.target.value)}
                onBlur={handleInputBlur}
                placeholder="#000000"
                className="msp-flex-1 msp-h-10 msp-font-mono msp-text-xs"
              />
            </div>

            <div className="msp-space-y-1.5">
              <div className="msp-flex msp-items-center msp-justify-between">
                <p className="msp-text-[10px] msp-text-muted-foreground">Saydamlık</p>
                <span className="msp-text-[10px] msp-font-mono msp-text-muted-foreground">{opacity}%</span>
              </div>
              <div
                className="msp-relative msp-h-4 msp-rounded-full msp-overflow-hidden"
                style={checkerboardBackground}
              >
                <div
                  className="msp-absolute msp-inset-0 msp-rounded-full"
                  style={{
                    background: inputValue
                      ? `linear-gradient(to right, transparent, ${inputValue})`
                      : 'linear-gradient(to right, transparent, #000000)',
                  }}
                />
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[opacity]}
                onValueChange={handleOpacityChange}
                className="msp-w-full"
              />
            </div>

            <div>
              <p className="msp-text-[10px] msp-text-muted-foreground msp-mb-2">Hazır renkler</p>
              <div className="msp-grid msp-grid-cols-7 msp-gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`msp-w-6 msp-h-6 msp-rounded msp-border msp-transition-all hover:msp-scale-110 ${inputValue === color && opacity === 100
                      ? 'msp-ring-2 msp-ring-primary msp-ring-offset-1'
                      : 'msp-border-border'
                      }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setInputValue(color);
                      applyChange(color, opacity);
                    }}
                  />
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="msp-w-full msp-h-7 msp-text-xs"
              onClick={() => {
                onChange('');
                setInputValue('');
                setOpacity(100);
              }}
            >
              Şeffaf / Kaldır
            </Button>
          </div>
        </PopoverContent>
      </Popover>
  );

  if (!label) {
    return <div className="msp-min-w-0">{pickerControl}</div>;
  }

  return (
    <PropertyField label={label}>
      {pickerControl}
    </PropertyField>
  );
};

export default ColorPicker;
