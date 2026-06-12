import React, { useState } from 'react';

import { SettingsPanelDivider } from '@/components/editor/SettingsPanelDivider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { normalizeCanvasHeightMode } from '@/lib/canvasHeight';
import type { CanvasHeightMode } from '@/types/editor';

const CANVAS_SIZE_PRESETS = [
  { w: 1280, h: 720 },
  { w: 1024, h: 768 },
  { w: 800, h: 800 },
  { w: 720, h: 1280 },
] as const;

const GRID_PRESETS = [10, 20, 25, 50, 100];

const CanvasSettingsPanel = () => {
  const { canvasSettings, updateCanvasSettings, showBorders, setShowBorders } = useEditor();
  const { t } = useLanguage();
  const [showCustomGrid, setShowCustomGrid] = useState(false);
  const [explicitCanvasCustomSize, setExplicitCanvasCustomSize] = useState(false);

  const canvasSizePresetHit = CANVAS_SIZE_PRESETS.find(
    (preset) => preset.w === canvasSettings.canvasWidth && preset.h === canvasSettings.canvasHeight,
  );
  const showCanvasDimensionInputs = explicitCanvasCustomSize || canvasSizePresetHit === undefined;

  return (
    <div className="msp-flex msp-h-full msp-min-h-0 msp-flex-col msp-overflow-hidden">
      <div className="msp-shrink-0 msp-border-b msp-px-3 msp-py-2">
        <p className="msp-text-xs msp-font-semibold">{t('editor.canvas.settingsTitle')}</p>
        <p className="msp-mt-0.5 msp-text-[11px] msp-leading-snug msp-text-muted-foreground">
          {t('editor.canvas.settingsDesc')}
        </p>
      </div>
      <div className="msp-min-h-0 msp-flex-1 msp-overflow-y-auto msp-p-3">
        <div className="msp-space-y-2">
          <Label className="msp-text-xs">{t('editor.canvas.size')}</Label>
          <div className="msp-flex msp-flex-wrap msp-gap-1.5">
            {CANVAS_SIZE_PRESETS.map(({ w, h }) => {
              const label = `${w}×${h}px`;
              const isHit = canvasSizePresetHit?.w === w && canvasSizePresetHit?.h === h;
              const selected = Boolean(isHit && !explicitCanvasCustomSize);

              return (
                <Button
                  key={`${w}x${h}`}
                  variant={selected ? 'default' : 'outline'}
                  size="sm"
                  className="msp-h-7 msp-px-2.5 msp-text-xs"
                  onClick={() => {
                    updateCanvasSettings({ canvasWidth: w, canvasHeight: h });
                    setExplicitCanvasCustomSize(false);
                  }}
                >
                  {label}
                </Button>
              );
            })}
            <Button
              variant={explicitCanvasCustomSize || !canvasSizePresetHit ? 'default' : 'outline'}
              size="sm"
              className="msp-h-7 msp-px-2.5 msp-text-xs"
              onClick={() => setExplicitCanvasCustomSize(true)}
            >
              {t('editor.canvas.custom')}
            </Button>
          </div>
          {showCanvasDimensionInputs && (
            <div className="msp-grid msp-grid-cols-2 msp-gap-2 msp-pt-1">
              <div className="msp-space-y-1">
                <Label className="msp-text-xs msp-text-muted-foreground">{t('editor.canvas.width')}</Label>
                <Input
                  type="number"
                  className="msp-h-7 msp-text-xs"
                  value={canvasSettings.canvasWidth}
                  min={100}
                  max={3840}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(val) && val >= 100) updateCanvasSettings({ canvasWidth: val });
                  }}
                />
              </div>
              <div className="msp-space-y-1">
                <Label className="msp-text-xs msp-text-muted-foreground">{t('editor.canvas.height')}</Label>
                <Input
                  type="number"
                  className="msp-h-7 msp-text-xs"
                  value={canvasSettings.canvasHeight}
                  min={100}
                  max={2160}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(val) && val >= 100) updateCanvasSettings({ canvasHeight: val });
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <SettingsPanelDivider />

        <div className="msp-space-y-2">
          <div>
            <Label className="msp-text-xs">{t('editor.canvas.heightMode')}</Label>
            <p className="msp-mt-0.5 msp-text-[11px] msp-leading-snug msp-text-muted-foreground">
              {t('editor.canvas.heightModeHint')}
            </p>
          </div>
          <Select
            value={normalizeCanvasHeightMode(canvasSettings.canvasHeightMode)}
            onValueChange={(value) =>
              updateCanvasSettings({ canvasHeightMode: value as CanvasHeightMode })
            }
          >
            <SelectTrigger className="msp-h-8 msp-text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">{t('editor.canvas.heightModeFixed')}</SelectItem>
              <SelectItem value="responsive">{t('editor.canvas.heightModeResponsive')}</SelectItem>
              <SelectItem value="fitBackground">{t('editor.canvas.heightModeFitBackground')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="msp-text-[11px] msp-leading-snug msp-text-muted-foreground">
            {t('editor.canvas.heightMaxHint')}
          </p>
        </div>

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between">
          <Label htmlFor="csp-show-borders">{t('editor.toolbar.showBorders')}</Label>
          <Switch id="csp-show-borders" checked={showBorders} onCheckedChange={setShowBorders} />
        </div>

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between msp-gap-2">
          <div className="msp-min-w-0">
            <Label htmlFor="csp-show-rulers">{t('editor.toolbar.showRulers')}</Label>
            <p className="msp-mt-0.5 msp-text-[11px] msp-text-muted-foreground">
              {t('editor.toolbar.showRulersHint')}
            </p>
          </div>
          <Switch
            id="csp-show-rulers"
            checked={canvasSettings.showRulers}
            onCheckedChange={(checked) => updateCanvasSettings({ showRulers: checked })}
          />
        </div>

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between">
          <Label htmlFor="csp-showGrid">{t('editor.canvas.showGrid')}</Label>
          <Switch
            id="csp-showGrid"
            checked={canvasSettings.showGrid}
            onCheckedChange={(checked) => updateCanvasSettings({ showGrid: checked })}
          />
        </div>

        {canvasSettings.showGrid && (
          <>
            <SettingsPanelDivider />
            <div className="msp-space-y-2">
              <Label className="msp-text-xs">{t('editor.canvas.gridSize')}</Label>
              <div className="msp-flex msp-flex-wrap msp-gap-1.5">
                {GRID_PRESETS.map((size) => (
                  <Button
                    key={size}
                    variant={canvasSettings.gridSize === size && !showCustomGrid ? 'default' : 'outline'}
                    size="sm"
                    className="msp-h-7 msp-px-2.5 msp-text-xs"
                    onClick={() => {
                      updateCanvasSettings({ gridSize: size });
                      setShowCustomGrid(false);
                    }}
                  >
                    {size}px
                  </Button>
                ))}
                <Button
                  variant={showCustomGrid ? 'default' : 'outline'}
                  size="sm"
                  className="msp-h-7 msp-px-2.5 msp-text-xs"
                  onClick={() => setShowCustomGrid((v) => !v)}
                >
                  {t('editor.canvas.custom')}
                </Button>
              </div>
              {showCustomGrid && (
                <div className="msp-flex msp-items-center msp-gap-2 msp-pt-1">
                  <Input
                    type="number"
                    className="msp-h-7 msp-text-xs"
                    placeholder="px"
                    defaultValue={canvasSettings.gridSize}
                    min={5}
                    max={500}
                    autoFocus
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value, 10);
                      if (!Number.isNaN(val) && val >= 5) updateCanvasSettings({ gridSize: val });
                    }}
                  />
                  <span className="msp-text-xs msp-text-muted-foreground">px</span>
                </div>
              )}
            </div>
          </>
        )}

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between msp-gap-2">
          <div className="msp-min-w-0">
            <Label htmlFor="csp-snapGuides">{t('editor.canvas.snapGuides')}</Label>
            <p className="msp-mt-0.5 msp-text-[11px] msp-text-muted-foreground">
              {t('editor.canvas.snapGuidesHint')}
            </p>
          </div>
          <Switch
            id="csp-snapGuides"
            checked={canvasSettings.snapToElements}
            onCheckedChange={(checked) => updateCanvasSettings({ snapToElements: checked })}
          />
        </div>

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between msp-gap-2">
          <div className="msp-min-w-0">
            <Label htmlFor="csp-centerGuides">{t('editor.toolbar.centerGuides')}</Label>
            <p className="msp-mt-0.5 msp-text-[11px] msp-text-muted-foreground">
              {t('editor.toolbar.centerGuidesHint')}
            </p>
          </div>
          <Switch
            id="csp-centerGuides"
            checked={canvasSettings.showCenterGuides}
            onCheckedChange={(checked) => updateCanvasSettings({ showCenterGuides: checked })}
          />
        </div>

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between msp-gap-2">
          <div className="msp-min-w-0">
            <Label htmlFor="csp-show-timeline">{t('editor.toolbar.showTimeline')}</Label>
            <p className="msp-mt-0.5 msp-text-[11px] msp-text-muted-foreground">
              {t('editor.toolbar.showTimelineHint')}
            </p>
          </div>
          <Switch
            id="csp-show-timeline"
            checked={canvasSettings.showTimeline !== false}
            onCheckedChange={(checked) => updateCanvasSettings({ showTimeline: checked })}
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasSettingsPanel;
