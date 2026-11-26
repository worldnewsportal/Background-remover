import { useCallback, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  Archive,
  CheckCircle2,
  Download,
  Loader2,
  Play,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { SAMPLE_PHOTOS } from '../config';
import type { TranslationDictionary } from '../i18n/translations';
import { removeBackgroundWithEngine } from '../services/aiBgEngine';
import type { AspectPresetId, BatchItem, EngineId, ExportFormat } from '../types/studio';
import { computeContainFit, computeTargetDimensions } from '../utils/canvasMath';
import { saveBlobToDevice } from '../utils/mobileDownload';

interface BulkBatchStudioProps {
  t: TranslationDictionary;
  selectedEngine: EngineId;
  onExportComplete?: (entry: {
    filename: string;
    blob: Blob;
    format: ExportFormat;
    width: number;
    height: number;
  }) => void;
}

type GlobalBgMode = 'transparent' | '#FFFFFF' | '#F3F4F6' | '#111827';

export function BulkBatchStudio({ t, selectedEngine, onExportComplete }: BulkBatchStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [globalBg, setGlobalBg] = useState<GlobalBgMode>('transparent');
  const [globalRatio, setGlobalRatio] = useState<AspectPresetId>('original');
  const [watermarkText, setWatermarkText] = useState('');

  const appendFiles = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
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
  }, []);

  const addSampleBatch = useCallback(async () => {
    const loadedFiles: File[] = [];
    for (const sample of SAMPLE_PHOTOS) {
      try {
        const res = await fetch(sample.url);
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
    }
  }, [appendFiles]);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target?.resultCutoutUrl) URL.revokeObjectURL(target.resultCutoutUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    items.forEach((i) => {
      if (i.originalUrl) URL.revokeObjectURL(i.originalUrl);
      if (i.resultCutoutUrl) URL.revokeObjectURL(i.resultCutoutUrl);
    });
    setItems([]);
  };

  const renderBatchOutputBlob = async (
    origImg: HTMLImageElement,
    maskData: ImageData
  ): Promise<Blob> => {
    const origW = origImg.naturalWidth || origImg.width;
    const origH = origImg.naturalHeight || origImg.height;

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = origW;
    maskCanvas.height = origH;
    maskCanvas.getContext('2d')?.putImageData(maskData, 0, 0);

    const subjectCanvas = document.createElement('canvas');
    subjectCanvas.width = origW;
    subjectCanvas.height = origH;
    const sctx = subjectCanvas.getContext('2d')!;
    sctx.drawImage(origImg, 0, 0, origW, origH);
    sctx.globalCompositeOperation = 'destination-in';
    sctx.drawImage(maskCanvas, 0, 0, origW, origH);
    sctx.globalCompositeOperation = 'source-over';

    const dims = computeTargetDimensions(origW, origH, globalRatio);
    const outCanvas = document.createElement('canvas');
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

    if (watermarkText.trim()) {
      const fontPx = Math.max(18, Math.round(dims.height * 0.036));
      octx.save();
      octx.font = `700 ${fontPx}px "Cairo", "Plus Jakarta Sans", sans-serif`;
      octx.fillStyle =
        globalBg === '#111827' ? 'rgba(255,255,255,0.45)' : 'rgba(17,24,39,0.35)';
      octx.textAlign = 'end';
      octx.textBaseline = 'bottom';
      octx.fillText(watermarkText.trim(), dims.width - fontPx, dims.height - fontPx * 0.75);
      octx.restore();
    }

    return new Promise<Blob>((resolve, reject) => {
      outCanvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('PNG encode failed'))),
        'image/png'
      );
    });
  };

  const processQueue = async () => {
    if (isProcessing) return;
    const pendingIds = items
      .filter((i) => i.status === 'queued' || i.status === 'error')
      .map((i) => i.id);
    if (pendingIds.length === 0) return;

    setIsProcessing(true);

    // Sequential loop protects browser RAM even for 50+ 4K images
    for (const id of pendingIds) {
      const item = items.find((i) => i.id === id);
      if (!item) continue;

      setItems((prev) =>
        prev.map((x) =>
          x.id === id ? { ...x, status: 'processing', progress: 10, errorMessage: undefined } : x
        )
      );

      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Invalid image file'));
          el.src = item.originalUrl;
        });

        const cutout = await removeBackgroundWithEngine(img, selectedEngine, (p) => {
          setItems((prev) =>
            prev.map((x) => (x.id === id ? { ...x, progress: Math.round(p.progress) } : x))
          );
        });

        const outBlob = await renderBatchOutputBlob(img, cutout.maskData);
        const resultCutoutUrl = URL.createObjectURL(outBlob);

        setItems((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status: 'done',
                  progress: 100,
                  engineUsed: cutout.engineUsed,
                  usedFallback: cutout.usedFallback,
                  resultCutoutUrl,
                  originalWidth: cutout.width,
                  originalHeight: cutout.height,
                }
              : x
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status: 'error',
                  progress: 0,
                  errorMessage: err instanceof Error ? err.message : 'Processing failed',
                }
              : x
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const downloadSingle = async (item: BatchItem) => {
    if (!item.resultCutoutUrl) return;
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
  };

  const downloadAllZip = async () => {
    const completed = items.filter((i) => i.status === 'done' && i.resultCutoutUrl);
    if (completed.length === 0 || isZipping) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
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
        onExportComplete?.({
          filename: entryName,
          blob,
          format: 'png',
          width: dims.width,
          height: dims.height,
        });
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      await saveBlobToDevice(zipBlob, `noorcut-batch-${completed.length}.zip`);
    } finally {
      setIsZipping(false);
    }
  };

  const doneCount = items.filter((i) => i.status === 'done').length;
  const queuedCount = items.filter((i) => i.status === 'queued' || i.status === 'error').length;

  return (
    <div className="space-y-5">
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
                onClick={processQueue}
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
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="absolute top-2 end-2 flex h-7 w-7 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white/90 text-[#4B5563] hover:text-red-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#111827]">{item.name}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-[#4B5563] tabular-nums">
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
                      <span className="text-red-600">{t.batchStatusError}</span>
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
