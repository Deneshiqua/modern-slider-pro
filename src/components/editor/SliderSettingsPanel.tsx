import React from 'react';

import ColorPicker from './ColorPicker';
import { SettingsPanelDivider } from '@/components/editor/SettingsPanelDivider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider as SliderInput } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useEditor } from '@/context/EditorContext';
import { useLanguage } from '@/context/LanguageContext';
import { SLIDE_TRANSITION_STYLE_OPTIONS } from '@/lib/slideTransitions';
import type { SlideTransitionType } from '@/types/editor';

const SliderSettingsPanel = () => {
  const { settings, updateSettings } = useEditor();
  const { t } = useLanguage();

  return (
    <div className="msp-flex msp-h-full msp-min-h-0 msp-flex-col msp-overflow-hidden">
      <div className="msp-shrink-0 msp-border-b msp-px-3 msp-py-2">
        <p className="msp-text-xs msp-font-semibold">{t('editor.properties.sliderSettings')}</p>
        <p className="msp-mt-0.5 msp-text-[11px] msp-leading-snug msp-text-muted-foreground">
          {t('editor.properties.sliderSettingsDesc')}
        </p>
      </div>
      <div className="msp-min-h-0 msp-flex-1 msp-overflow-y-auto msp-p-3">
        <div className="msp-flex msp-items-center msp-justify-between">
          <Label htmlFor="ssp-autoPlay">{t('editor.properties.autoPlay')}</Label>
          <Switch
            id="ssp-autoPlay"
            checked={settings.autoPlay}
            onCheckedChange={(checked) => updateSettings({ autoPlay: checked })}
          />
        </div>

        {settings.autoPlay && (
          <>
            <SettingsPanelDivider />
            <div className="msp-space-y-2">
              <Label className="msp-text-xs">{t('editor.properties.interval')}</Label>
              <div className="msp-flex msp-items-center msp-gap-3">
                <SliderInput
                  value={[settings.interval]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={([val]) => updateSettings({ interval: val })}
                  className="msp-flex-1"
                />
                <span className="msp-w-8 msp-text-right msp-text-xs msp-tabular-nums">{settings.interval}s</span>
              </div>
            </div>
          </>
        )}

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between">
          <Label htmlFor="ssp-loop">{t('editor.properties.loop')}</Label>
          <Switch
            id="ssp-loop"
            checked={settings.loop}
            onCheckedChange={(checked) => updateSettings({ loop: checked })}
          />
        </div>

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between">
          <Label htmlFor="ssp-showArrows">{t('editor.properties.showArrows')}</Label>
          <Switch
            id="ssp-showArrows"
            checked={settings.showArrows}
            onCheckedChange={(checked) => updateSettings({ showArrows: checked })}
          />
        </div>

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between">
          <Label htmlFor="ssp-showDots">{t('editor.properties.showDots')}</Label>
          <Switch
            id="ssp-showDots"
            checked={settings.showDots}
            onCheckedChange={(checked) => updateSettings({ showDots: checked })}
          />
        </div>

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between msp-gap-2">
          <div className="msp-min-w-0">
            <Label htmlFor="ssp-showProgressBar">{t('editor.properties.showProgressBar')}</Label>
            <p className="msp-mt-0.5 msp-text-[11px] msp-text-muted-foreground">
              {t('editor.properties.showProgressBarHint')}
            </p>
          </div>
          <Switch
            id="ssp-showProgressBar"
            checked={settings.showProgressBar}
            onCheckedChange={(checked) => updateSettings({ showProgressBar: checked })}
          />
        </div>

        {settings.showProgressBar && (
          <>
            <SettingsPanelDivider />
            <div className="msp-space-y-1.5">
              <Label className="msp-text-xs">{t('editor.properties.progressBarScope')}</Label>
              <Select
                value={settings.progressBarScope}
                onValueChange={(value) =>
                  updateSettings({
                    progressBarScope: value === 'allSlides' ? 'allSlides' : 'perSlide',
                  })
                }
              >
                <SelectTrigger className="msp-h-8 msp-text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perSlide">
                    {t('editor.properties.progressBarScopePerSlide')}
                  </SelectItem>
                  <SelectItem value="allSlides">
                    {t('editor.properties.progressBarScopeAllSlides')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="msp-text-[11px] msp-text-muted-foreground">
                {settings.progressBarScope === 'allSlides'
                  ? t('editor.properties.progressBarScopeAllSlidesHint')
                  : t('editor.properties.progressBarScopePerSlideHint')}
              </p>
            </div>

            <SettingsPanelDivider />

            <div className="msp-space-y-1.5">
              <Label className="msp-text-xs">{t('editor.properties.progressBarHeight')}</Label>
              <div className="msp-flex msp-items-center msp-gap-3">
                <SliderInput
                  value={[settings.progressBarHeight]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={([val]) => updateSettings({ progressBarHeight: val })}
                  className="msp-flex-1"
                />
                <span className="msp-w-10 msp-text-right msp-text-xs msp-tabular-nums">
                  {settings.progressBarHeight}px
                </span>
              </div>
            </div>

            <SettingsPanelDivider />

            <ColorPicker
              label={t('editor.properties.progressBarColor')}
              value={settings.progressBarColor}
              onChange={(progressBarColor) => updateSettings({ progressBarColor })}
            />

            <SettingsPanelDivider />

            <div className="msp-space-y-1.5">
              <Label className="msp-text-xs">{t('editor.properties.progressBarOpacity')}</Label>
              <div className="msp-flex msp-items-center msp-gap-3">
                <SliderInput
                  value={[Math.round(settings.progressBarOpacity * 100)]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={([val]) => updateSettings({ progressBarOpacity: val / 100 })}
                  className="msp-flex-1"
                />
                <span className="msp-w-10 msp-text-right msp-text-xs msp-tabular-nums">
                  {Math.round(settings.progressBarOpacity * 100)}%
                </span>
              </div>
            </div>

            <SettingsPanelDivider />

            <div className="msp-space-y-1.5">
              <Label className="msp-text-xs">{t('editor.properties.progressBarTrackOpacity')}</Label>
              <div className="msp-flex msp-items-center msp-gap-3">
                <SliderInput
                  value={[Math.round(settings.progressBarTrackOpacity * 100)]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={([val]) => updateSettings({ progressBarTrackOpacity: val / 100 })}
                  className="msp-flex-1"
                />
                <span className="msp-w-10 msp-text-right msp-text-xs msp-tabular-nums">
                  {Math.round(settings.progressBarTrackOpacity * 100)}%
                </span>
              </div>
            </div>
          </>
        )}

        <SettingsPanelDivider />

        <div className="msp-flex msp-items-center msp-justify-between msp-gap-2">
          <div className="msp-min-w-0">
            <Label htmlFor="ssp-slideTransitionEnabled">{t('editor.slideTransition.enable')}</Label>
            <p className="msp-mt-0.5 msp-text-[11px] msp-text-muted-foreground">
              {t('editor.slideTransition.enableHint')}
            </p>
          </div>
          <Switch
            id="ssp-slideTransitionEnabled"
            checked={settings.slideTransitionEnabled}
            onCheckedChange={(checked) =>
              updateSettings({
                slideTransitionEnabled: checked,
                ...(checked && settings.slideTransition === 'none'
                  ? { slideTransition: 'fade' as SlideTransitionType }
                  : {}),
              })
            }
          />
        </div>

        {settings.slideTransitionEnabled && (
          <>
            <SettingsPanelDivider />
            <div className="msp-space-y-2">
              <Label className="msp-text-xs">{t('editor.slideTransition.label')}</Label>
              <Select
                value={settings.slideTransition === 'none' ? 'fade' : settings.slideTransition}
                onValueChange={(value) =>
                  updateSettings({ slideTransition: value as SlideTransitionType })
                }
              >
                <SelectTrigger id="ssp-slideTransition" className="msp-h-8 msp-text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLIDE_TRANSITION_STYLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="msp-text-xs">
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SettingsPanelDivider />

            <div className="msp-space-y-1.5">
              <Label className="msp-text-xs">{t('editor.slideTransition.duration')}</Label>
              <div className="msp-flex msp-items-center msp-gap-3">
                <SliderInput
                  value={[settings.slideTransitionDuration]}
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={([val]) => updateSettings({ slideTransitionDuration: val })}
                  className="msp-flex-1"
                />
                <span className="msp-w-10 msp-text-right msp-text-xs msp-tabular-nums">
                  {settings.slideTransitionDuration.toFixed(1)}s
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SliderSettingsPanel;
