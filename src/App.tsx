import { useCallback, useEffect, useRef, useState } from 'react';
import { Cloud, Cpu, Keyboard, Layers, Sparkles } from 'lucide-react';
import { BulkBatchStudio } from './components/BulkBatchStudio';
import { Header } from './components/Header';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { MonetizationSlot } from './components/MonetizationSlot';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RecentExportsSection } from './components/RecentExportsSection';
import { SeoLandingSection } from './components/SeoLandingSection';
import { SingleStudioEditor } from './components/SingleStudioEditor';
import { useTranslation } from './i18n/useTranslation';
import type { EngineId, ExportFormat, RecentExportItem, StudioMode } from './types/studio';
import { isEditableElement, resolveAppShortcut } from './utils/keyboardShortcuts';
import { saveBlobToDevice } from './utils/mobileDownload';
import { pushRecentExport } from './utils/recentExports';

export default function App() {
  const { lang, setLanguage, t, isRtl } = useTranslation();
  const [studioMode, setStudioMode] = useState<StudioMode>('single');
  const [selectedEngine, setSelectedEngine] = useState<EngineId>('rmbg');
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [exportTrigger, setExportTrigger] = useState(0);
  const [canExport, setCanExport] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [shortcutNotice, setShortcutNotice] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<RecentExportItem[]>([]);
  const recentExportsRef = useRef<RecentExportItem[]>([]);
  const noticeTimeoutRef = useRef<number | null>(null);
  recentExportsRef.current = recentExports;

  useEffect(() => {
    return () => {
      recentExportsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  const handleRecordExport = useCallback(
    (entry: {
      filename: string;
      blob: Blob;
      format: ExportFormat;
      width: number;
      height: number;
    }) => {
      const previewUrl = URL.createObjectURL(entry.blob);
      const nextItem: RecentExportItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        filename: entry.filename,
        previewUrl,
        blob: entry.blob,
        format: entry.format,
        sizeBytes: entry.blob.size,
        width: entry.width,
        height: entry.height,
        createdAt: Date.now(),
      };
      setRecentExports((prev) => {
        const res = pushRecentExport(prev, nextItem);
        res.evicted.forEach((evicted) => URL.revokeObjectURL(evicted.previewUrl));
        return res.items;
      });
    },
    []
  );

  const handleRedownloadExport = useCallback(async (item: RecentExportItem) => {
    await saveBlobToDevice(item.blob, item.filename);
  }, []);

  const handleClearRecentExports = useCallback(() => {
    setRecentExports((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }, []);

  const showShortcutNotice = useCallback((message: string) => {
    setShortcutNotice(message);
    if (noticeTimeoutRef.current !== null) {
      window.clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = window.setTimeout(() => {
      setShortcutNotice(null);
      noticeTimeoutRef.current = null;
    }, 2400);
  }, []);

  const triggerExportAction = useCallback(() => {
    if (!canExport) {
      showShortcutNotice(t.shortcutNoExportReady);
      return;
    }
    setExportTrigger((c) => c + 1);
  }, [canExport, showShortcutNotice, t.shortcutNoExportReady]);

  const triggerToggleMode = useCallback(() => {
    setStudioMode((prev) => (prev === 'single' ? 'batch' : 'single'));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = resolveAppShortcut({
        key: e.key,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        targetIsEditable: isEditableElement(e.target),
        isHelpOpen: isShortcutsOpen,
      });
      if (!action) return;
      e.preventDefault();
      switch (action) {
        case 'export':
          triggerExportAction();
          break;
        case 'clear_recent':
          handleClearRecentExports();
          break;
        case 'toggle_mode':
          triggerToggleMode();
          break;
        case 'toggle_help':
          setIsShortcutsOpen((prev) => !prev);
          break;
        case 'close_help':
          setIsShortcutsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClearRecentExports, isShortcutsOpen, triggerExportAction, triggerToggleMode]);

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

          {/* Single vs Bulk Mode Switcher + Shortcuts Helper */}
          <div className="flex flex-wrap items-center gap-2.5 self-start shrink-0">
            <div
              role="group"
              aria-label="Workspace mode"
              className="inline-flex rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] p-1"
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

            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              aria-expanded={isShortcutsOpen}
              aria-haspopup="dialog"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#374151] transition-colors hover:border-[#0D9488] hover:text-[#111827] whitespace-nowrap cursor-pointer"
            >
              <Keyboard className="h-3.5 w-3.5 text-[#0D9488]" aria-hidden="true" />
              <span>{t.shortcutsBtn}</span>
              <kbd
                dir="ltr"
                className="rounded border border-[#D1D5DB] bg-[#F9FAFB] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#4B5563]"
              >
                ?
              </kbd>
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
            externalExportTrigger={exportTrigger}
            onExportReadyChange={setCanExport}
            onExportComplete={handleRecordExport}
          />
        ) : (
          <BulkBatchStudio
            t={t}
            selectedEngine={selectedEngine}
            externalExportTrigger={exportTrigger}
            onExportReadyChange={setCanExport}
            onExportComplete={handleRecordExport}
          />
        )}

        <RecentExportsSection
          t={t}
          items={recentExports}
          onRedownload={handleRedownloadExport}
          onClearAll={handleClearRecentExports}
        />
      </main>

      <MonetizationSlot slotKey="landingMidBanner" label={t.adSlotLabel} />

      <SeoLandingSection t={t} lang={lang} />

      <OfflineIndicator t={t} />

      <KeyboardShortcutsModal
        t={t}
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        canExport={canExport}
        canClearRecent={recentExports.length > 0}
        onTriggerExport={triggerExportAction}
        onTriggerClearRecent={handleClearRecentExports}
        onTriggerToggleMode={triggerToggleMode}
      />

      {shortcutNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-[#E5E7EB] bg-[#111827] px-4 py-2 text-xs font-semibold text-white shadow-lg"
        >
          {shortcutNotice}
        </div>
      )}
    </div>
  );
}
