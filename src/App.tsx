import { useState } from 'react';
import { Cloud, Cpu, Layers, Sparkles } from 'lucide-react';
import { BulkBatchStudio } from './components/BulkBatchStudio';
import { Header } from './components/Header';
import { MonetizationSlot } from './components/MonetizationSlot';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SeoLandingSection } from './components/SeoLandingSection';
import { SingleStudioEditor } from './components/SingleStudioEditor';
import { useTranslation } from './i18n/useTranslation';
import type { EngineId, StudioMode } from './types/studio';

export default function App() {
  const { lang, setLanguage, t, isRtl } = useTranslation();
  const [studioMode, setStudioMode] = useState<StudioMode>('single');
  const [selectedEngine, setSelectedEngine] = useState<EngineId>('rmbg');
  const [uploadTrigger, setUploadTrigger] = useState(0);

  const engines: Array<{
    id: EngineId;
    name: string;
    desc: string;
    Icon: typeof Cpu;
  }> = [
    { id: 'rmbg', name: t.engineRmbgName, desc: t.engineRmbgDesc, Icon: Cpu },
    { id: 'imgly', name: t.engineImglyName, desc: t.engineImglyDesc, Icon: Sparkles },
    { id: 'cloud', name: t.engineCloudName, desc: t.engineCloudDesc, Icon: Cloud },
  ];

  const handleHeaderUploadClick = () => {
    setStudioMode('single');
    setUploadTrigger((c) => c + 1);
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F9FAFB] text-[#111827]"
    >
      <Header
        lang={lang}
        onChangeLang={setLanguage}
        t={t}
        onSelectMode={setStudioMode}
        onTriggerUpload={handleHeaderUploadClick}
      />

      <main id="studio-workspace" className="mx-auto max-w-[1440px] px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        {/* Clean Hero Lead & Workspace Controls */}
        <section className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] text-balance">
              {t.heroTitle}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Single vs Bulk Mode Switcher */}
          <div
            role="group"
            aria-label="Workspace mode"
            className="inline-flex self-start rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] p-1 shrink-0"
          >
            <button
              type="button"
              onClick={() => setStudioMode('single')}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                studioMode === 'single'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
              <span>{t.modeSingle}</span>
            </button>
            <button
              type="button"
              onClick={() => setStudioMode('batch')}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                studioMode === 'batch'
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
              <span>{t.modeBatch}</span>
            </button>
          </div>
        </section>

        {/* Triple-Engine Selector Bar */}
        <section
          aria-label={t.engineLabel}
          className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {engines.map(({ id, name, desc, Icon }) => {
            const active = selectedEngine === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedEngine(id)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-start transition-colors cursor-pointer ${
                  active
                    ? 'border-[#0D9488] bg-white ring-1 ring-[#0D9488]/25'
                    : 'border-[#E5E7EB] bg-white/80 hover:bg-white'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    active ? 'bg-[#0D9488] text-white' : 'bg-[#F3F4F6] text-[#4B5563]'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#111827] truncate">{name}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#4B5563] line-clamp-2">
                    {desc}
                  </p>
                </div>
              </button>
            );
          })}
        </section>

        <MonetizationSlot slotKey="studioTopBanner" label={t.adSlotLabel} compact />

        {/* Active Studio Workspace */}
        {studioMode === 'single' ? (
          <SingleStudioEditor
            t={t}
            isRtl={isRtl}
            selectedEngine={selectedEngine}
            externalFileTrigger={uploadTrigger}
          />
        ) : (
          <BulkBatchStudio t={t} selectedEngine={selectedEngine} />
        )}
      </main>

      <MonetizationSlot slotKey="landingMidBanner" label={t.adSlotLabel} />

      <SeoLandingSection t={t} lang={lang} />

      <OfflineIndicator t={t} />
    </div>
  );
}
