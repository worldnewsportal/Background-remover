import { useCallback, useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Download,
  Loader2,
  Play,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { SAMPLE_PHOTOS } from '../config';
import type { TranslationDictionary } from '../i18n/translations';
import { removeBackgroundWithEngine } from '../services/aiBgEngine';
import type { AspectPresetId, BatchItem, EngineId, ExportFormat } from '../types/studio';
import { computeContainFit, computeTargetDimensions } from '../utils/canvasMath';
import {
  BATCH_DELAY_PRESETS_MS,
  clampBatchDelayMs,
  DEFAULT_BATCH_DELAY_MS,
  shouldPauseBetweenBatchItems,
  waitForBatchCooldown,
} from '../utils/batchQueue';
import {
  containsArabicScript,
  isSupportedImageFile,
  validateImageDimensions,
} from '../utils/imageLimits';
import { saveBlobToDevice } from '../utils/mobileDownload';

interface BulkBatchStudioProps {
  t: TranslationDictionary;
  selectedEngine: EngineId;
  defaultDelayMs?: number;
  externalExportTrigger?: number;
  onExportReadyChange?: (ready: boolean) => void;
  onExportComplete?: (entry: {
    filename: string;
    blob: Blob;
    format: ExportFormat;
    width: number;
    height: number;
  }) => void;
}

type GlobalBgMode = 'transparent' | '#FFFFFF' | '#F3F4F6' | '#111827';

export function BulkBatchStudio({
  t,
  selectedEngine,
  defaultDelayMs = DEFAULT_BATCH_DELAY_MS,
  externalExportTrigger = 0,
  onExportReadyChange,
  onExportComplete,
}: BulkBatchStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const itemsRef = useRef<BatchItem[]>(items);
  itemsRef.current = items;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [globalBg, setGlobalBg] = useState<GlobalBgMode>('transparent');
  const [globalRatio, setGlobalRatio] = useState<AspectPresetId>('original');
  const [watermarkText, setWatermarkText] = useState('');
  const [batchDelayMs, setBatchDelayMs] = useState<number>(() =>
    clampBatchDelayMs(defaultDelayMs)
  );
  const batchDelayRef = useRef<number>(batchDelayMs);
  batchDelayRef.current = batchDelayMs;
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      itemsRef.current.forEach((i) => {
        if (i.originalUrl) URL.revokeObjectURL(i.originalUrl);
        if (i.resultCutoutUrl) URL.revokeObjectURL(i.resultCutoutUrl);
      });
    };
  }, []);

  const appendFiles = useCallback(
    (files: FileList | File[]) => {
      const allFiles = Array.from(files);
      const valid = allFiles.filter((f) => isSupportedImageFile(f));
      if (valid.length < allFiles.length) {
        setBatchError(t.errUnsupportedFormat);
      } else {
        setBatchError(null);
      }
      if (valid.length === 0) return;

      const newItems: BatchItem[] = valid.map((file, idx) => ({
        id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        originalUrl: URL.createObjectURL(file),
        status: 'queued',
        progress: 0,
      }));
      setItems((prev) => [...prev, ...newItems]);
    },
    [t.errUnsupportedFormat]
  );

  const addSampleBatch = useCallback(async () => {
    setBatchError(null);
    const loadedFiles: File[] = [];
    for (const sample of SAMPLE_PHOTOS) {
      try {
        const res = await fetch(sample.url);
        if (!res.ok) continue;
        const blob = await res.blob();
        loadedFiles.push(
          new File([blob], `${sample.id}-studio.jpg`, { type: blob.type || 'image/jpeg' })
        );
      } catch {
        // Ignore single sample fetch failure
      }
    }
    if (loadedFiles.length > 0) {
      appendFiles(loadedFiles);
    } else {
      setBatchError(t.errSampleLoadFailed);
    }
  }, [appendFiles, t.errSampleLoadFailed]);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.status === 'processing') return prev;
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target?.resultCutoutUrl) URL.revokeObjectURL(target.resultCutoutUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    if (isProcessing) return;
    items.forEach((i) => {
      if (i.originalUrl) URL.revokeObjectURL(i.originalUrl);
      if (i.resultCutoutUrl) URL.revokeObjectURL(i.resultCutoutUrl);
    });
    setItems([]);
    setBatchError(null);
  };

  const renderBatchOutputBlob = async (
    origImg: HTMLImageElement,
    maskData: ImageData
  ): Promise<Blob> => {
    const origW = origImg.naturalWidth || origImg.width;
    const origH = origImg.naturalHeight || origImg.height;

    const maskCanvas = document.createElement('canvas');
    const subjectCanvas = document.createElement('canvas');
    const outCanvas = document.createElement('canvas');

    try {
      maskCanvas.width = origW;
      maskCanvas.height = origH;
      maskCanvas.getContext('2d')?.putImageData(maskData, 0, 0);

      subjectCanvas.width = origW;
      subjectCanvas.height = origH;
      const sctx = subjectCanvas.getContext('2d')!;
      sctx.drawImage(origImg, 0, 0, origW, origH);
      sctx.globalCompositeOperation = 'destination-in';
      sctx.drawImage(maskCanvas, 0, 0, origW, origH);
      sctx.globalCompositeOperation = 'source-over';

      const dims = computeTargetDimensions(origW, origH, globalRatio);
      outCanvas.width = dims.width;
      outCanvas.height = dims.height;
      const octx = outCanvas.getContext('2d')!;

      if (globalBg !== 'transparent') {
        octx.fillStyle = globalBg;
        octx.fillRect(0, 0, dims.width, dims.height);
      }

      const fit =
        globalRatio === 'original'
          ? { x: 0, y: 0, width: dims.width, height: dims.height }
          : computeContainFit(origW, origH, dims.width, dims.height, 0.05);

      octx.drawImage(subjectCanvas, fit.x, fit.y, fit.width, fit.height);

      const wm = watermarkText.trim();
      if (wm) {
        const fontPx = Math.max(18, Math.round(dims.height * 0.036));
        octx.save();
        octx.direction = containsArabicScript(wm) ? 'rtl' : 'ltr';
        octx.font = `700 ${fontPx}px "Cairo", "Plus Jakarta Sans", sans-serif`;
        octx.fillStyle =
          globalBg === '#111827' ? 'rgba(255,255,255,0.45)' : 'rgba(17,24,39,0.35)';
        octx.textAlign = 'end';
        octx.textBaseline = 'bottom';
        octx.fillText(wm, dims.width - fontPx, dims.height - fontPx * 0.75);
        octx.restore();
      }

      return await new Promise<Blob>((resolve, reject) => {
        outCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('PNG encode failed'))),
          'image/png'
        );
      });
    } finally {
      maskCanvas.width = 0;
      maskCanvas.height = 0;
      subjectCanvas.width = 0;
      subjectCanvas.height = 0;
      outCanvas.width = 0;
      outCanvas.height = 0;
    }
  };

  const processSingleItemById = async (id: string) => {
    const item = itemsRef.current.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: 'processing', progress: 10, errorMessage: undefined } : x
      )
    );

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error(t.errDecodeFailed));
        el.src = item.originalUrl;
      });

      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const dimCheck = validateImageDimensions(w, h);
      if (!dimCheck.valid) {
        throw new Error(dimCheck.reason === 'too_large' ? t.errImageTooLarge : t.errDecodeFailed);
      }

      const cutout = await removeBackgroundWithEngine(img, selectedEngine, (p) => {
        if (!isMountedRef.current) return;
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...x, progress: Math.round(p.progress) } : x))
        );
      });

      const outBlob = await renderBatchOutputBlob(img, cutout.maskData);
      const resultCutoutUrl = URL.createObjectURL(outBlob);

      if (!isMountedRef.current || !itemsRef.current.some((x) => x.id === id)) {
        URL.revokeObjectURL(resultCutoutUrl);
        return;
      }

      setItems((prev) =>
        prev.map((x) => {
          if (x.id !== id) return x;
          if (x.resultCutoutUrl) URL.revokeObjectURL(x.resultCutoutUrl);
          return {
            ...x,
            status: 'done',
            progress: 100,
            engineUsed: cutout.engineUsed,
            usedFallback: cutout.usedFallback,
            resultCutoutUrl,
            originalWidth: cutout.width,
            originalHeight: cutout.height,
          };
        })
      );
    } catch (err) {
      if (!isMountedRef.current) return;
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: 'error',
                progress: 0,
                errorMessage: err instanceof Error ? err.message : t.errDecodeFailed,
              }
            : x
        )
      );
    }
  };

  const processQueue = async (onlyIds?: string[]) => {
    if (isProcessing) return;
    const pendingIds = onlyIds
      ? onlyIds
      : itemsRef.current
          .filter((i) => i.status === 'queued' || i.status === 'error')
          .map((i) => i.id);
    if (pendingIds.length === 0) return;

    setIsProcessing(true);
    setBatchError(null);

    try {
      // Sequential loop with configurable inter-image delay protects RAM and prevents UI freezing
      for (let idx = 0; idx < pendingIds.length; idx++) {
        if (!isMountedRef.current) break;
        const id = pendingIds[idx];
        await processSingleItemById(id);

        const activeDelay = clampBatchDelayMs(batchDelayRef.current);
        if (shouldPauseBetweenBatchItems(idx, pendingIds.length, activeDelay)) {
          await waitForBatchCooldown(activeDelay);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const downloadSingle = async (item: BatchItem) => {
    if (!item.resultCutoutUrl) return;
    try {
      const res = await fetch(item.resultCutoutUrl);
      const blob = await res.blob();
      const baseName = item.name.replace(/\.[^.]+$/, '');
      const filename = `${baseName}-cutout.png`;
      await saveBlobToDevice(blob, filename);
      const dims = computeTargetDimensions(
        item.originalWidth || 1200,
        item.originalHeight || 900,
        globalRatio
      );
      onExportComplete?.({
        filename,
        blob,
        format: 'png',
        width: dims.width,
        height: dims.height,
      });
    } catch {
      setBatchError(t.errExportFailed);
    }
  };

  const downloadAllZip = async () => {
    const completed = itemsRef.current.filter((i) => i.status === 'done' && i.resultCutoutUrl);
    if (completed.length === 0 || isZipping) return;
    setIsZipping(true);
    setBatchError(null);
    try {
      const zip = new JSZip();
      const recentCandidates: Array<{
        filename: string;
        blob: Blob;
        format: ExportFormat;
        width: number;
        height: number;
      }> = [];

      for (let i = 0; i < completed.length; i++) {
        const item = completed[i];
        const res = await fetch(item.resultCutoutUrl!);
        const blob = await res.blob();
        const baseName = item.name.replace(/\.[^.]+$/, '');
        const entryName = `${baseName}-cutout.png`;
        zip.file(`${String(i + 1).padStart(2, '0')}-${entryName}`, blob);
        const dims = computeTargetDimensions(
          item.originalWidth || 1200,
          item.originalHeight || 900,
          globalRatio
        );
        recentCandidates.push({
          filename: entryName,
          blob,
          format: 'png',
          width: dims.width,
          height: dims.height,
        });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      await saveBlobToDevice(zipBlob, `noorcut-batch-${completed.length}.zip`);
      recentCandidates.slice(-5).forEach((entry) => onExportComplete?.(entry));
    } catch {
      setBatchError(t.errZipFailed);
    } finally {
      if (isMountedRef.current) {
        setIsZipping(false);
      }
    }
  };

  const doneCount = items.filter((i) => i.status === 'done').length;
  const queuedCount = items.filter((i) => i.status === 'queued' || i.status === 'error').length;

  useEffect(() => {
    onExportReadyChange?.(doneCount > 0 && !isZipping);
  }, [doneCount, isZipping, onExportReadyChange]);

  const lastExportTriggerRef = useRef(externalExportTrigger);
  const downloadAllZipRef = useRef(downloadAllZip);
  downloadAllZipRef.current = downloadAllZip;
  useEffect(() => {
    if (externalExportTrigger !== lastExportTriggerRef.current) {
      lastExportTriggerRef.current = externalExportTrigger;
      void downloadAllZipRef.current();
    }
  }, [externalExportTrigger]);

  return (
    <div className="space-y-5">
      {batchError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-800"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{batchError}</span>
          </div>
          <button
            type="button"
            onClick={() => setBatchError(null)}
            aria-label={t.closeLabel}
            className="rounded-lg p-1 text-red-700 hover:bg-red-100 cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Global Batch Settings & Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) appendFiles(e.dataTransfer.files);
          }}
          className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-white p-8 text-center transition-colors hover:border-[#0D9488]"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) appendFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#0D9488]">
            <UploadCloud className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-[#111827]">{t.batchDropTitle}</h2>
          <p className="mt-1 text-xs text-[#4B5563]">{t.batchDropHint}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-[#0D9488] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0F766E] transition-colors cursor-pointer"
            >
              {t.ctaUpload}
            </button>
            <button
              type="button"
              onClick={addSampleBatch}
              className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              {t.batchAddSamples}
            </button>
          </div>
        </div>

        {/* Global Batch Styling Panel */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-4">
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#111827]">
              {t.batchGlobalBgLabel}
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'transparent', label: t.bgTypeTransparent },
                  { id: '#FFFFFF', label: t.presetAmazonWhite },
                  { id: '#F3F4F6', label: t.presetStudioGray },
                  { id: '#111827', label: t.presetObsidian },
                ] as const
              ).map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setGlobalBg(bg.id)}
                  className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition-colors cursor-pointer truncate ${
                    globalBg === bg.id
                      ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                      : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#111827]">
                {t.batchGlobalRatioLabel}
              </label>
              <select
                value={globalRatio}
                onChange={(e) => setGlobalRatio(e.target.value as AspectPresetId)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs font-medium text-[#111827]"
              >
                <option value="original">{t.aspectOriginal}</option>
                <option value="square">{t.aspectSquare}</option>
                <option value="youtube">{t.aspectYoutube}</option>
                <option value="reels">{t.aspectReels}</option>
                <option value="passport">{t.aspectPassport}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#111827]">
                {t.batchWatermarkLabel}
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder={t.batchWatermarkPlaceholder}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#111827]"
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="batch-delay-input"
                className="text-xs font-semibold text-[#111827]"
              >
                {t.batchDelayLabel}
              </label>
              <div className="flex items-center gap-1.5" dir="ltr">
                <input
                  id="batch-delay-input"
                  type="number"
                  min={0}
                  max={5000}
                  step={50}
                  value={batchDelayMs}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    setBatchDelayMs(Number.isNaN(parsed) ? 0 : clampBatchDelayMs(parsed));
                  }}
                  className="w-20 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1 text-end font-mono text-xs font-semibold text-[#111827] tabular-nums focus:border-[#0D9488] focus:outline-none"
                />
                <span className="text-[11px] font-medium text-[#4B5563]">ms</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
              {BATCH_DELAY_PRESETS_MS.map((presetMs) => {
                const active = batchDelayMs === presetMs;
                return (
                  <button
                    key={presetMs}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setBatchDelayMs(presetMs)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold tabular-nums transition-colors cursor-pointer ${
                      active
                        ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488]'
                        : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {presetMs} ms
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] pt-3">
            <span className="text-xs font-medium text-[#4B5563] tabular-nums">
              {items.length} {t.batchCountLabel}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#E5E7EB] px-3 py-2 text-xs font-semibold text-[#4B5563] hover:text-[#111827] disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.batchClearBtn}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => void processQueue()}
                disabled={isProcessing || queuedCount === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E293B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F172A] disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{isProcessing ? t.batchProcessingBtn : t.batchStartBtn}</span>
              </button>

              {doneCount > 0 && (
                <button
                  type="button"
                  onClick={downloadAllZip}
                  disabled={isZipping}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0F766E] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.batchDownloadZipBtn}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Queue Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
            >
              <div className="relative aspect-square w-full overflow-hidden checkerboard-sm border-b border-[#E5E7EB]">
                <img
                  src={item.resultCutoutUrl || item.originalUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain p-2"
                />
                <button
                  type="button"
                  disabled={item.status === 'processing'}
                  onClick={() => removeItem(item.id)}
                  aria-label={`${t.deleteLayer} ${item.name}`}
                  className="absolute top-2 end-2 flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white/90 text-[#4B5563] hover:text-red-600 disabled:opacity-35 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#111827]">{item.name}</p>
                  <p
                    title={item.errorMessage}
                    className="mt-0.5 text-[11px] font-medium text-[#4B5563] tabular-nums truncate"
                  >
                    {item.status === 'queued' && t.batchStatusQueued}
                    {item.status === 'processing' &&
                      `${t.batchStatusProcessing} · ${item.progress}%`}
                    {item.status === 'done' && (
                      <span className="inline-flex items-center gap-1 text-[#0D9488]">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        <span>{t.batchStatusDone}</span>
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="text-red-600">
                        {t.batchStatusError}
                        {item.errorMessage ? `: ${item.errorMessage}` : ''}
                      </span>
                    )}
                  </p>
                </div>

                {item.status === 'done' && (
                  <button
                    type="button"
                    onClick={() => downloadSingle(item)}
                    aria-label={`${t.batchDownloadSingle} ${item.name}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 text-[11px] font-semibold text-[#111827] hover:bg-[#F3F4F6] cursor-pointer shrink-0"
                  >
                    <Download className="h-3 w-3" aria-hidden="true" />
                    <span>{t.batchDownloadSingle}</span>
                  </button>
                )}

                {item.status === 'error' && !isProcessing && (
                  <button
                    type="button"
                    onClick={() => void processQueue([item.id])}
                    aria-label={`${t.retryBtn} ${item.name}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    <span>{t.retryBtn}</span>
                  </button>
                )}
              </div>

              {item.status === 'processing' && (
                <div className="h-1 w-full bg-[#F3F4F6]">
                  <div
                    className="h-full bg-[#0D9488] transition-all duration-200"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
