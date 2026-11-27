import { useRef, useState } from 'react';
import {
  Download,
  Eraser,
  Image as ImageIcon,
  Layers,
  Paintbrush,
  RotateCcw,
  Sliders,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react';
import {
  CANVAS_FONT_FAMILIES,
  MESH_GRADIENT_PRESETS,
  SOLID_COLOR_PRESETS,
} from '../config';
import type { TranslationDictionary } from '../i18n/translations';
import type {
  AspectPresetId,
  BackgroundSettings,
  BrushMode,
  ColorAdjustments,
  ExportSettings,
  StickerShadowSettings,
  TextLayer,
  ToolTab,
} from '../types/studio';
import {
  ASPECT_PRESETS,
  DEFAULT_ADJUSTMENTS,
  formatBytes,
} from '../utils/canvasMath';

interface ToolSidebarProps {
  t: TranslationDictionary;
  activeTab: ToolTab;
  onChangeTab: (tab: ToolTab) => void;
  bgSettings: BackgroundSettings;
  onChangeBg: (next: BackgroundSettings) => void;
  onUploadBgImage: (file: File) => void;
  textLayers: TextLayer[];
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onAddText: () => void;
  onUpdateText: (id: string, patch: Partial<TextLayer>) => void;
  onDeleteText: (id: string) => void;
  effects: StickerShadowSettings;
  onChangeEffects: (next: StickerShadowSettings) => void;
  brushMode: BrushMode;
  onChangeBrushMode: (mode: BrushMode) => void;
  brushSize: number;
  onChangeBrushSize: (size: number) => void;
  onResetMask: () => void;
  subjectAdjust: ColorAdjustments;
  bgAdjust: ColorAdjustments;
  onChangeSubjectAdjust: (next: ColorAdjustments) => void;
  onChangeBgAdjust: (next: ColorAdjustments) => void;
  exportSettings: ExportSettings;
  onChangeExport: (next: ExportSettings) => void;
  exportFilename: string;
  exportFilenamePlaceholder: string;
  onChangeExportFilename: (value: string) => void;
  estimatedBytes: number;
  targetDimensions: { width: number; height: number };
  onDownload: () => void;
  hasCutout: boolean;
}

export function ToolSidebar({
  t,
  activeTab,
  onChangeTab,
  bgSettings,
  onChangeBg,
  onUploadBgImage,
  textLayers,
  selectedTextId,
  onSelectText,
  onAddText,
  onUpdateText,
  onDeleteText,
  effects,
  onChangeEffects,
  brushMode,
  onChangeBrushMode,
  brushSize,
  onChangeBrushSize,
  onResetMask,
  subjectAdjust,
  bgAdjust,
  onChangeSubjectAdjust,
  onChangeBgAdjust,
  exportSettings,
  onChangeExport,
  exportFilename,
  exportFilenamePlaceholder,
  onChangeExportFilename,
  estimatedBytes,
  targetDimensions,
  onDownload,
  hasCutout,
}: ToolSidebarProps) {
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [adjustTarget, setAdjustTarget] = useState<'subject' | 'bg'>('subject');

  const tabs: Array<{ id: ToolTab; label: string; Icon: typeof Layers }> = [
    { id: 'background', label: t.tabBackground, Icon: ImageIcon },
    { id: 'text', label: t.tabText, Icon: Type },
    { id: 'effects', label: t.tabEffects, Icon: Layers },
    { id: 'brush', label: t.tabBrush, Icon: Paintbrush },
    { id: 'adjust', label: t.tabAdjust, Icon: Sliders },
    { id: 'export', label: t.tabExport, Icon: Download },
  ];

  const selectedLayer =
    textLayers.find((l) => l.id === selectedTextId) || textLayers[textLayers.length - 1] || null;

  const activeAdjust = adjustTarget === 'subject' ? subjectAdjust : bgAdjust;
  const setActiveAdjust =
    adjustTarget === 'subject' ? onChangeSubjectAdjust : onChangeBgAdjust;

  return (
    <aside className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
      {/* Compact Tab Rail */}
      <div
        role="tablist"
        aria-label="Studio tools"
        className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-1 border-b border-[#E5E7EB] bg-[#F9FAFB] p-1.5"
      >
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChangeTab(id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white text-[#0D9488] shadow-xs border border-[#E5E7EB]'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-white/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="flex-1 space-y-5 p-4 sm:p-5 overflow-y-auto max-h-[600px]">
        {/* 1. BACKGROUND STUDIO */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5 rounded-xl bg-[#F3F4F6] p-1">
              {(
                [
                  { id: 'transparent', label: t.bgTypeTransparent },
                  { id: 'solid', label: t.bgTypeSolid },
                  { id: 'gradient', label: t.bgTypeGradient },
                  { id: 'bokeh', label: t.bgTypeBokeh },
                  { id: 'image', label: t.bgTypeImage },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeBg({ ...bgSettings, type: item.id })}
                  className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    bgSettings.type === item.id
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {bgSettings.type === 'solid' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {SOLID_COLOR_PRESETS.map((preset) => {
                    const selected =
                      bgSettings.solidColor.toLowerCase() === preset.color.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          onChangeBg({ ...bgSettings, type: 'solid', solidColor: preset.color })
                        }
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-[11px] font-medium transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#0D9488] bg-[#0D9488]/5 text-[#0D9488]'
                            : 'border-[#E5E7EB] text-[#4B5563] hover:border-[#9CA3AF]'
                        }`}
                      >
                        <span
                          className="h-6 w-full rounded-md border border-[#E5E7EB]"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="truncate w-full text-center">{t[preset.labelKey]}</span>
                      </button>
                    );
                  })}
                </div>

                <label className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-xs font-medium text-[#111827]">
                  <span>{t.customColorLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#6B7280] uppercase tabular-nums">
                      {bgSettings.solidColor}
                    </span>
                    <input
                      type="color"
                      value={bgSettings.solidColor}
                      onChange={(e) =>
                        onChangeBg({ ...bgSettings, type: 'solid', solidColor: e.target.value })
                      }
                      className="h-7 w-9 cursor-pointer rounded border border-[#E5E7EB] bg-transparent p-0.5"
                    />
                  </div>
                </label>
              </div>
            )}

            {bgSettings.type === 'gradient' && (
              <div className="grid grid-cols-2 gap-2.5">
                {MESH_GRADIENT_PRESETS.map((grad) => {
                  const selected = bgSettings.gradientCss === grad.css;
                  return (
                    <button
                      key={grad.id}
                      type="button"
                      aria-label={grad.id}
                      onClick={() =>
                        onChangeBg({
                          ...bgSettings,
                          type: 'gradient',
                          gradientCss: grad.css,
                          gradientStops: grad.stops,
                        })
                      }
                      className={`h-14 rounded-xl border transition-transform cursor-pointer ${
                        selected
                          ? 'border-[#0D9488] ring-2 ring-[#0D9488]/25'
                          : 'border-[#E5E7EB] hover:scale-[1.02]'
                      }`}
                      style={{ background: grad.css }}
                    />
                  );
                })}
              </div>
            )}

            {bgSettings.type === 'bokeh' && (
              <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                  <span>{t.bokehIntensity}</span>
                  <span className="font-mono tabular-nums text-[#0D9488]">
                    {bgSettings.bokehBlur}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  value={bgSettings.bokehBlur}
                  onChange={(e) =>
                    onChangeBg({
                      ...bgSettings,
                      type: 'bokeh',
                      bokehBlur: Number(e.target.value),
                    })
                  }
                  className="studio-slider w-full"
                />
                <p className="text-xs leading-relaxed text-[#4B5563]">{t.bokehHint}</p>
              </div>
            )}

            {bgSettings.type === 'image' && (
              <div className="space-y-3">
                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadBgImage(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#0D9488] bg-[#0D9488]/5 px-4 py-3.5 text-xs font-semibold text-[#0D9488] hover:bg-[#0D9488]/10 transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4" aria-hidden="true" />
                  <span>{t.uploadBgImage}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. TEXT BEHIND SUBJECT & TYPOGRAPHY */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={onAddText}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0F172A] transition-colors cursor-pointer"
            >
              <Type className="h-4 w-4" aria-hidden="true" />
              <span>{t.addTextBtn}</span>
            </button>

            {textLayers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {textLayers.map((layer, idx) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => onSelectText(layer.id)}
                    className={`max-w-[140px] truncate rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      selectedLayer?.id === layer.id
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                        : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]'
                    }`}
                  >
                    {idx + 1}. {layer.text || t.defaultTextContent}
                  </button>
                ))}
              </div>
            )}

            {selectedLayer && (
              <div className="space-y-3.5 border-t border-[#E5E7EB] pt-3.5">
                {/* 1-Click Behind vs Front Toggle */}
                <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#F3F4F6] p-1">
                  <button
                    type="button"
                    onClick={() => onUpdateText(selectedLayer.id, { placement: 'behind' })}
                    className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      selectedLayer.placement === 'behind'
                        ? 'bg-[#0D9488] text-white shadow-xs'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {t.textPlacementBehind}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateText(selectedLayer.id, { placement: 'front' })}
                    className={`rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      selectedLayer.placement === 'front'
                        ? 'bg-[#1E293B] text-white shadow-xs'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {t.textPlacementFront}
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#4B5563]">
                    {t.textContentLabel}
                  </label>
                  <input
                    type="text"
                    value={selectedLayer.text}
                    onChange={(e) => onUpdateText(selectedLayer.id, { text: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#0D9488] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#4B5563]">
                    {t.textFontLabel}
                  </label>
                  <select
                    value={selectedLayer.fontFamily}
                    onChange={(e) =>
                      onUpdateText(selectedLayer.id, { fontFamily: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs font-medium text-[#111827] focus:border-[#0D9488] focus:bg-white focus:outline-none"
                  >
                    {CANVAS_FONT_FAMILIES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#4B5563]">
                    <span>{t.textColorLabel}</span>
                    <input
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) => onUpdateText(selectedLayer.id, { color: e.target.value })}
                      className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#4B5563]">
                    <span>{t.textStrokeColorLabel}</span>
                    <input
                      type="color"
                      value={selectedLayer.strokeColor}
                      onChange={(e) =>
                        onUpdateText(selectedLayer.id, { strokeColor: e.target.value })
                      }
                      className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent"
                    />
                  </label>
                </div>

                <SliderRow
                  label={t.textSizeLabel}
                  value={selectedLayer.fontSize}
                  unit="px"
                  min={28}
                  max={420}
                  onChange={(v) => onUpdateText(selectedLayer.id, { fontSize: v })}
                />
                <SliderRow
                  label={t.textStrokeWidthLabel}
                  value={selectedLayer.strokeWidth}
                  unit="px"
                  min={0}
                  max={24}
                  onChange={(v) => onUpdateText(selectedLayer.id, { strokeWidth: v })}
                />
                <SliderRow
                  label={t.textRotationLabel}
                  value={selectedLayer.rotation}
                  unit="°"
                  min={-45}
                  max={45}
                  onChange={(v) => onUpdateText(selectedLayer.id, { rotation: v })}
                />
                <SliderRow
                  label={t.textOpacityLabel}
                  value={Math.round(selectedLayer.opacity * 100)}
                  unit="%"
                  min={10}
                  max={100}
                  onChange={(v) => onUpdateText(selectedLayer.id, { opacity: v / 100 })}
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-[#6B7280]">{t.dragTextHint}</span>
                  <button
                    type="button"
                    onClick={() => onDeleteText(selectedLayer.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.deleteLayer}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. STICKER BORDER & DROP SHADOW */}
        {activeTab === 'effects' && (
          <div className="space-y-5">
            <div className="space-y-3 rounded-xl border border-[#E5E7EB] p-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#111827]">{t.stickerBorderTitle}</h3>
                <input
                  type="color"
                  aria-label={t.stickerColorLabel}
                  value={effects.strokeColor}
                  onChange={(e) =>
                    onChangeEffects({ ...effects, strokeColor: e.target.value })
                  }
                  className="h-6 w-8 cursor-pointer rounded border border-[#E5E7EB] bg-transparent"
                />
              </div>
              <SliderRow
                label={t.stickerWidthLabel}
                value={effects.strokeWidth}
                unit="px"
                min={0}
                max={36}
                onChange={(v) => onChangeEffects({ ...effects, strokeWidth: v })}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-[#E5E7EB] p-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#111827]">{t.dropShadowTitle}</h3>
                <input
                  type="color"
                  aria-label={t.shadowColorLabel}
                  value={effects.shadowColor}
                  onChange={(e) =>
                    onChangeEffects({ ...effects, shadowColor: e.target.value })
                  }
                  className="h-6 w-8 cursor-pointer rounded border border-[#E5E7EB] bg-transparent"
                />
              </div>
              <SliderRow
                label={t.shadowOpacityLabel}
                value={Math.round(effects.shadowOpacity * 100)}
                unit="%"
                min={0}
                max={100}
                onChange={(v) => onChangeEffects({ ...effects, shadowOpacity: v / 100 })}
              />
              <SliderRow
                label={t.shadowBlurLabel}
                value={effects.shadowBlur}
                unit="px"
                min={0}
                max={70}
                onChange={(v) => onChangeEffects({ ...effects, shadowBlur: v })}
              />
              <SliderRow
                label={t.shadowXLabel}
                value={effects.shadowX}
                unit="px"
                min={-50}
                max={50}
                onChange={(v) => onChangeEffects({ ...effects, shadowX: v })}
              />
              <SliderRow
                label={t.shadowYLabel}
                value={effects.shadowY}
                unit="px"
                min={-50}
                max={50}
                onChange={(v) => onChangeEffects({ ...effects, shadowY: v })}
              />
            </div>
          </div>
        )}

        {/* 4. MAGIC BRUSH */}
        {activeTab === 'brush' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#F3F4F6] p-1">
              <button
                type="button"
                onClick={() => onChangeBrushMode('erase')}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  brushMode === 'erase'
                    ? 'bg-[#1E293B] text-white shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.brushModeErase}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeBrushMode('restore')}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  brushMode === 'restore'
                    ? 'bg-[#0D9488] text-white shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.brushModeRestore}</span>
              </button>
            </div>

            <SliderRow
              label={t.brushSizeLabel}
              value={brushSize}
              unit="px"
              min={6}
              max={120}
              onChange={onChangeBrushSize}
            />

            <p className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs leading-relaxed text-[#4B5563]">
              {t.brushHint}
            </p>

            <button
              type="button"
              onClick={onResetMask}
              disabled={!hasCutout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.resetMaskBtn}</span>
            </button>
          </div>
        )}

        {/* 5. INDEPENDENT COLOR ADJUSTMENTS */}
        {activeTab === 'adjust' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#F3F4F6] p-1">
              <button
                type="button"
                onClick={() => setAdjustTarget('subject')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  adjustTarget === 'subject'
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                {t.adjustTargetSubject}
              </button>
              <button
                type="button"
                onClick={() => setAdjustTarget('bg')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  adjustTarget === 'bg'
                    ? 'bg-white text-[#111827] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                {t.adjustTargetBg}
              </button>
            </div>

            <SliderRow
              label={t.brightnessLabel}
              value={activeAdjust.brightness}
              unit="%"
              min={50}
              max={150}
              onChange={(v) => setActiveAdjust({ ...activeAdjust, brightness: v })}
            />
            <SliderRow
              label={t.contrastLabel}
              value={activeAdjust.contrast}
              unit="%"
              min={50}
              max={150}
              onChange={(v) => setActiveAdjust({ ...activeAdjust, contrast: v })}
            />
            <SliderRow
              label={t.saturationLabel}
              value={activeAdjust.saturation}
              unit="%"
              min={0}
              max={200}
              onChange={(v) => setActiveAdjust({ ...activeAdjust, saturation: v })}
            />
            <SliderRow
              label={t.warmthLabel}
              value={activeAdjust.warmth}
              unit=""
              min={-50}
              max={50}
              onChange={(v) => setActiveAdjust({ ...activeAdjust, warmth: v })}
            />

            <button
              type="button"
              onClick={() => setActiveAdjust({ ...DEFAULT_ADJUSTMENTS })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.resetAdjustments}</span>
            </button>
          </div>
        )}

        {/* 6. ASPECT RATIO & SMART EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <span>{t.aspectRatioLabel}</span>
                <span className="font-mono text-[11px] tabular-nums text-[#6B7280]">
                  {targetDimensions.width} × {targetDimensions.height}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {(
                  [
                    { id: 'original', label: t.aspectOriginal },
                    { id: 'square', label: t.aspectSquare },
                    { id: 'youtube', label: t.aspectYoutube },
                    { id: 'reels', label: t.aspectReels },
                    { id: 'passport', label: t.aspectPassport },
                  ] as Array<{ id: AspectPresetId; label: string }>
                ).map((preset) => {
                  const active = exportSettings.aspectPreset === preset.id;
                  const spec = ASPECT_PRESETS[preset.id];
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        onChangeExport({ ...exportSettings, aspectPreset: preset.id })
                      }
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'border-[#0D9488] bg-[#0D9488]/8 text-[#0D9488]'
                          : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span className="font-mono text-[11px] tabular-nums text-[#6B7280]">
                        {spec.ratioLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#111827]">
                {t.exportFormatLabel}
              </span>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#F3F4F6] p-1">
                {(['png', 'webp', 'jpeg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => onChangeExport({ ...exportSettings, format: fmt })}
                    className={`rounded-lg py-2 text-xs font-bold uppercase transition-colors cursor-pointer ${
                      exportSettings.format === fmt
                        ? 'bg-white text-[#111827] shadow-xs'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {fmt === 'jpeg' ? 'JPG' : fmt}
                  </button>
                ))}
              </div>
            </div>

            {exportSettings.format !== 'png' && (
              <SliderRow
                label={t.exportQualityLabel}
                value={Math.round(exportSettings.quality * 100)}
                unit="%"
                min={20}
                max={100}
                onChange={(v) =>
                  onChangeExport({ ...exportSettings, quality: v / 100 })
                }
              />
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="export-filename-input"
                className="block text-xs font-semibold text-[#111827]"
              >
                {t.exportFilenameLabel}
              </label>
              <div
                dir="ltr"
                className="flex items-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] focus-within:border-[#0D9488] focus-within:bg-white transition-colors"
              >
                <input
                  id="export-filename-input"
                  type="text"
                  value={exportFilename}
                  onChange={(e) => onChangeExportFilename(e.target.value)}
                  placeholder={exportFilenamePlaceholder || t.exportFilenamePlaceholder}
                  disabled={!hasCutout}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none disabled:opacity-50"
                />
                <span className="border-l border-[#E5E7EB] bg-[#F3F4F6] px-2.5 py-2 font-mono text-xs font-semibold text-[#4B5563]">
                  .{exportSettings.format === 'jpeg' ? 'jpg' : exportSettings.format}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-xs">
              <span className="text-[#4B5563]">{t.estimatedSizeLabel}</span>
              <span className="font-mono font-semibold tabular-nums text-[#111827]">
                ~{formatBytes(estimatedBytes)}
              </span>
            </div>

            <button
              type="button"
              onClick={onDownload}
              disabled={!hasCutout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0F766E] disabled:opacity-45 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>{t.downloadImageBtn}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function SliderRow({ label, value, unit, min, max, onChange }: SliderRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#374151]">{label}</span>
        <span className="font-mono font-semibold tabular-nums text-[#111827]">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="studio-slider w-full"
      />
    </div>
  );
}
