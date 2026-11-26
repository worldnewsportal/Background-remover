import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Columns2,
  Eye,
  Loader2,
  Redo2,
  RefreshCw,
  Undo2,
  UploadCloud,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { MESH_GRADIENT_PRESETS, SAMPLE_PHOTOS } from '../config';
import type { TranslationDictionary } from '../i18n/translations';
import { isModelCached, removeBackgroundWithEngine } from '../services/aiBgEngine';
import type {
  BackgroundSettings,
  BrushMode,
  ColorAdjustments,
  EngineId,
  EngineProgress,
  ExportFormat,
  ExportSettings,
  StickerShadowSettings,
  TextLayer,
  ToolTab,
} from '../types/studio';
import {
  applyBrushStrokeToMask,
  buildSubjectCanvasFromMask,
  exportStudioCompositionBlob,
  renderStudioComposition,
  type StudioCompositeState,
} from '../utils/canvasCompositor';
import {
  computeTargetDimensions,
  DEFAULT_ADJUSTMENTS,
  estimateExportSizeBytes,
  hitTestTextLayer,
  pushMaskHistory,
} from '../utils/canvasMath';
import { saveBlobToDevice } from '../utils/mobileDownload';
import { BeforeAfterCurtain } from './BeforeAfterCurtain';
import { ToolSidebar } from './ToolSidebar';

interface SingleStudioEditorProps {
  t: TranslationDictionary;
  isRtl: boolean;
  selectedEngine: EngineId;
  externalFileTrigger: number;
  onExportComplete?: (entry: {
    filename: string;
    blob: Blob;
    format: ExportFormat;
    width: number;
    height: number;
  }) => void;
}

export function SingleStudioEditor({
  t,
  isRtl,
  selectedEngine,
  externalFileTrigger,
  onExportComplete,
}: SingleStudioEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Source & Mask offscreen canvases
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const initialAiMaskRef = useRef<ImageData | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const subjectCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const customBgImageRef = useRef<HTMLImageElement | null>(null);

  // Undo/Redo Mask History
  const maskHistoryRef = useRef<ImageData[]>([]);
  const maskHistoryIndexRef = useRef<number>(-1);
  const [historyMeta, setHistoryMeta] = useState({ index: -1, length: 0 });

  // Active Image State
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState<string>('studio-design');
  const [origDims, setOrigDims] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 900,
  });

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<EngineProgress | null>(null);
  const [hasCutout, setHasCutout] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{
    type: 'info' | 'warning' | 'error';
    message: string;
  } | null>(null);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);

  // Viewport & Comparison State
  const [viewMode, setViewMode] = useState<'studio' | 'split'>('studio');
  const [splitPreviewUrl, setSplitPreviewUrl] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tool & Layer State
  const [activeTab, setActiveTab] = useState<ToolTab>('background');
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>({
    type: 'transparent',
    solidColor: '#FFFFFF',
    gradientCss: MESH_GRADIENT_PRESETS[0].css,
    gradientStops: MESH_GRADIENT_PRESETS[0].stops,
    customImageUrl: null,
    bokehBlur: 18,
  });
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [effects, setEffects] = useState<StickerShadowSettings>({
    strokeWidth: 0,
    strokeColor: '#FFFFFF',
    shadowX: 0,
    shadowY: 16,
    shadowBlur: 28,
    shadowOpacity: 0.22,
    shadowColor: '#111827',
  });
  const [brushMode, setBrushMode] = useState<BrushMode>('erase');
  const [brushSize, setBrushSize] = useState<number>(28);
  const [subjectAdjust, setSubjectAdjust] = useState<ColorAdjustments>({
    ...DEFAULT_ADJUSTMENTS,
  });
  const [bgAdjust, setBgAdjust] = useState<ColorAdjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    quality: 0.92,
    aspectPreset: 'original',
  });

  // Interaction Refs (Canvas Drag / Brush)
  const dragStateRef = useRef<{
    kind: 'none' | 'brush' | 'text' | 'pan';
    textId?: string;
    lastNormX: number | null;
    lastNormY: number | null;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
    startTextX: number;
    startTextY: number;
  }>({
    kind: 'none',
    lastNormX: null,
    lastNormY: null,
    startClientX: 0,
    startClientY: 0,
    startPanX: 0,
    startPanY: 0,
    startTextX: 0,
    startTextY: 0,
  });

  const [brushCursor, setBrushCursor] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  // Trigger upload dialog from Header primary CTA
  const lastTriggerRef = useRef(externalFileTrigger);
  useEffect(() => {
    if (externalFileTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = externalFileTrigger;
      fileInputRef.current?.click();
    }
  }, [externalFileTrigger]);

  const compositeState = useMemo<StudioCompositeState | null>(() => {
    if (!originalImageRef.current || !maskCanvasRef.current) return null;
    return {
      originalImage: originalImageRef.current,
      maskCanvas: maskCanvasRef.current,
      bgSettings,
      customBgImage: customBgImageRef.current,
      textLayers,
      subjectAdjust,
      bgAdjust,
      effects,
      aspectPreset: exportSettings.aspectPreset,
    };
  }, [
    bgSettings,
    textLayers,
    subjectAdjust,
    bgAdjust,
    effects,
    exportSettings.aspectPreset,
    hasCutout,
  ]);

  const redrawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const origImg = originalImageRef.current;
    const maskCanvas = maskCanvasRef.current;
    const subjectCanvas = subjectCanvasRef.current;
    if (!canvas || !origImg || !maskCanvas || !subjectCanvas) return;

    const state: StudioCompositeState = {
      originalImage: origImg,
      maskCanvas,
      bgSettings,
      customBgImage: customBgImageRef.current,
      textLayers,
      subjectAdjust,
      bgAdjust,
      effects,
      aspectPreset: exportSettings.aspectPreset,
    };

    const isNarrowMobile =
      typeof window !== 'undefined' && window.innerWidth < 768;
    renderStudioComposition(canvas, state, subjectCanvas, {
      maxPreviewDimension: isNarrowMobile ? 1024 : 1400,
      forExport: false,
    });

    if (viewMode === 'split') {
      try {
        setSplitPreviewUrl(canvas.toDataURL('image/png'));
      } catch {
        // Ignore if tainted
      }
    }
  }, [
    bgSettings,
    textLayers,
    subjectAdjust,
    bgAdjust,
    effects,
    exportSettings.aspectPreset,
    viewMode,
  ]);

  useEffect(() => {
    if (hasCutout) {
      redrawPreview();
    }
  }, [hasCutout, redrawPreview]);

  const syncHistoryMeta = () => {
    setHistoryMeta({
      index: maskHistoryIndexRef.current,
      length: maskHistoryRef.current.length,
    });
  };

  const applyMaskDataToCanvases = useCallback(
    (maskData: ImageData, resetHistory: boolean) => {
      const origImg = originalImageRef.current;
      if (!origImg) return;
      const w = maskData.width;
      const h = maskData.height;

      const maskCanvas = maskCanvasRef.current || document.createElement('canvas');
      maskCanvas.width = w;
      maskCanvas.height = h;
      const mctx = maskCanvas.getContext('2d');
      if (!mctx) return;
      mctx.putImageData(maskData, 0, 0);
      maskCanvasRef.current = maskCanvas;

      subjectCanvasRef.current = buildSubjectCanvasFromMask(
        origImg,
        maskCanvas,
        subjectCanvasRef.current || undefined
      );

      if (resetHistory) {
        const clone = new ImageData(
          new Uint8ClampedArray(maskData.data),
          maskData.width,
          maskData.height
        );
        maskHistoryRef.current = [clone];
        maskHistoryIndexRef.current = 0;
        syncHistoryMeta();
      }
      setHasCutout(true);
      redrawPreview();
    },
    [redrawPreview]
  );

  const runCutoutForImage = useCallback(
    async (img: HTMLImageElement, engine: EngineId) => {
      setIsProcessing(true);
      setStatusNotice(null);
      setProgress({
        stage: 'loading_module',
        progress: 5,
        message: !isModelCached(engine) && engine !== 'cloud' ? t.aiInitializingFirstTime : t.aiProcessing,
      });

      try {
        const result = await removeBackgroundWithEngine(img, engine, (p) => {
          setProgress({
            ...p,
            message:
              p.stage === 'downloading_model' && !isModelCached(engine)
                ? t.aiInitializingFirstTime
                : t.aiProcessing,
          });
        });

        initialAiMaskRef.current = new ImageData(
          new Uint8ClampedArray(result.maskData.data),
          result.maskData.width,
          result.maskData.height
        );
        applyMaskDataToCanvases(result.maskData, true);
        setLastDurationMs(result.durationMs);

        if (result.usedFallback) {
          setStatusNotice({
            type: 'warning',
            message:
              result.fallbackReason === 'cloud_busy'
                ? t.aiCloudTimeoutNotice
                : t.aiFallbackNotice,
          });
        }
      } catch (err) {
        setStatusNotice({
          type: 'error',
          message: err instanceof Error ? err.message : 'Background removal failed',
        });
      } finally {
        setIsProcessing(false);
        setProgress(null);
      }
    },
    [applyMaskDataToCanvases, t]
  );

  const loadImageSource = useCallback(
    (srcUrl: string, fileName: string, isBlobUrl: boolean) => {
      const img = new Image();
      if (!isBlobUrl) img.crossOrigin = 'anonymous';
      img.onload = () => {
        originalImageRef.current = img;
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setOrigDims({ width: w, height: h });
        setOriginalUrl(srcUrl);
        setOriginalName(fileName.replace(/\.[^.]+$/, '') || 'studio-design');
        setHasCutout(false);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setViewMode('studio');
        runCutoutForImage(img, selectedEngine);
      };
      img.onerror = () => {
        setStatusNotice({ type: 'error', message: 'Could not decode image file.' });
      };
      img.src = srcUrl;
    },
    [runCutoutForImage, selectedEngine]
  );

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const blobUrl = URL.createObjectURL(file);
    loadImageSource(blobUrl, file.name, true);
  };

  const handleSampleClick = (url: string, id: string) => {
    loadImageSource(url, `${id}-sample`, false);
  };

  const handleUndo = useCallback(() => {
    if (maskHistoryIndexRef.current <= 0) return;
    maskHistoryIndexRef.current -= 1;
    const snapshot = maskHistoryRef.current[maskHistoryIndexRef.current];
    if (snapshot) {
      applyMaskDataToCanvases(snapshot, false);
      syncHistoryMeta();
    }
  }, [applyMaskDataToCanvases]);

  const handleRedo = useCallback(() => {
    if (maskHistoryIndexRef.current >= maskHistoryRef.current.length - 1) return;
    maskHistoryIndexRef.current += 1;
    const snapshot = maskHistoryRef.current[maskHistoryIndexRef.current];
    if (snapshot) {
      applyMaskDataToCanvases(snapshot, false);
      syncHistoryMeta();
    }
  }, [applyMaskDataToCanvases]);

  // Keyboard shortcuts Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  const handleResetMask = () => {
    if (!initialAiMaskRef.current) return;
    const clone = new ImageData(
      new Uint8ClampedArray(initialAiMaskRef.current.data),
      initialAiMaskRef.current.width,
      initialAiMaskRef.current.height
    );
    applyMaskDataToCanvases(clone, true);
  };

  const handleUploadBgImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      customBgImageRef.current = img;
      setBgSettings((prev) => ({ ...prev, type: 'image', customImageUrl: url }));
    };
    img.src = url;
  };

  const handleAddText = () => {
    const newLayer: TextLayer = {
      id: `txt-${Date.now()}`,
      text: t.defaultTextContent,
      x: 0.5,
      y: 0.34,
      fontSize: 150,
      fontFamily: isRtl ? 'Cairo' : 'Anton',
      color: '#111827',
      strokeColor: '#FFFFFF',
      strokeWidth: 4,
      shadowBlur: 12,
      shadowColor: 'rgba(17,24,39,0.28)',
      rotation: 0,
      placement: 'behind',
      opacity: 1,
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedTextId(newLayer.id);
    setViewMode('studio');
  };

  const handleUpdateText = (id: string, patch: Partial<TextLayer>) => {
    setTextLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const handleDeleteText = (id: string) => {
    setTextLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const getNormalizedCanvasPoint = (clientX: number, clientY: number) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const normX = (clientX - rect.left) / rect.width;
    const normY = (clientY - rect.top) / rect.height;
    return { normX, normY };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!hasCutout || !previewCanvasRef.current) return;
    const pt = getNormalizedCanvasPoint(e.clientX, e.clientY);
    if (!pt) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    if (activeTab === 'brush' && maskCanvasRef.current && originalImageRef.current) {
      dragStateRef.current = {
        kind: 'brush',
        lastNormX: pt.normX,
        lastNormY: pt.normY,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
        startTextX: 0,
        startTextY: 0,
      };
      applyBrushStrokeToMask(
        maskCanvasRef.current,
        pt.normX,
        pt.normY,
        null,
        null,
        brushSize,
        brushMode
      );
      subjectCanvasRef.current = buildSubjectCanvasFromMask(
        originalImageRef.current,
        maskCanvasRef.current,
        subjectCanvasRef.current || undefined
      );
      redrawPreview();
      return;
    }

    const canvasW = previewCanvasRef.current.width;
    const canvasH = previewCanvasRef.current.height;
    const hit = hitTestTextLayer(textLayers, pt.normX, pt.normY, canvasW, canvasH);
    if (hit) {
      setSelectedTextId(hit.id);
      setActiveTab('text');
      dragStateRef.current = {
        kind: 'text',
        textId: hit.id,
        lastNormX: pt.normX,
        lastNormY: pt.normY,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
        startTextX: hit.x,
        startTextY: hit.y,
      };
      return;
    }

    if (zoom > 1) {
      dragStateRef.current = {
        kind: 'pan',
        lastNormX: null,
        lastNormY: null,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
        startTextX: 0,
        startTextY: 0,
      };
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (canvas && activeTab === 'brush') {
      const rect = canvas.getBoundingClientRect();
      setBrushCursor({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else if (brushCursor.visible) {
      setBrushCursor((p) => ({ ...p, visible: false }));
    }

    const drag = dragStateRef.current;
    if (drag.kind === 'none') return;

    if (drag.kind === 'brush' && maskCanvasRef.current && originalImageRef.current) {
      const pt = getNormalizedCanvasPoint(e.clientX, e.clientY);
      if (!pt) return;
      applyBrushStrokeToMask(
        maskCanvasRef.current,
        pt.normX,
        pt.normY,
        drag.lastNormX,
        drag.lastNormY,
        brushSize,
        brushMode
      );
      drag.lastNormX = pt.normX;
      drag.lastNormY = pt.normY;
      subjectCanvasRef.current = buildSubjectCanvasFromMask(
        originalImageRef.current,
        maskCanvasRef.current,
        subjectCanvasRef.current || undefined
      );
      redrawPreview();
      return;
    }

    if (drag.kind === 'text' && drag.textId && canvas) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const dxNorm = (e.clientX - drag.startClientX) / rect.width;
      const dyNorm = (e.clientY - drag.startClientY) / rect.height;
      handleUpdateText(drag.textId, {
        x: Math.max(0.02, Math.min(0.98, drag.startTextX + dxNorm)),
        y: Math.max(0.02, Math.min(0.98, drag.startTextY + dyNorm)),
      });
      return;
    }

    if (drag.kind === 'pan') {
      setPan({
        x: drag.startPanX + (e.clientX - drag.startClientX),
        y: drag.startPanY + (e.clientY - drag.startClientY),
      });
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragStateRef.current;
    if (drag.kind === 'brush' && maskCanvasRef.current) {
      const mctx = maskCanvasRef.current.getContext('2d');
      if (mctx) {
        const snapshot = mctx.getImageData(
          0,
          0,
          maskCanvasRef.current.width,
          maskCanvasRef.current.height
        );
        const next = pushMaskHistory(
          maskHistoryRef.current,
          maskHistoryIndexRef.current,
          snapshot,
          25
        );
        maskHistoryRef.current = next.history;
        maskHistoryIndexRef.current = next.index;
        syncHistoryMeta();
      }
    }
    dragStateRef.current.kind = 'none';
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const targetDimensions = useMemo(
    () => computeTargetDimensions(origDims.width, origDims.height, exportSettings.aspectPreset),
    [origDims.width, origDims.height, exportSettings.aspectPreset]
  );

  const estimatedBytes = useMemo(
    () =>
      estimateExportSizeBytes(
        targetDimensions.width,
        targetDimensions.height,
        exportSettings.format,
        exportSettings.quality
      ),
    [targetDimensions, exportSettings.format, exportSettings.quality]
  );

  const handleDownload = async () => {
    if (!compositeState || !subjectCanvasRef.current) return;
    const blob = await exportStudioCompositionBlob(
      compositeState,
      subjectCanvasRef.current,
      exportSettings.format,
      exportSettings.quality
    );
    const ext = exportSettings.format === 'jpeg' ? 'jpg' : exportSettings.format;
    const filename = `${originalName}-noorcut.${ext}`;
    await saveBlobToDevice(blob, filename);
    onExportComplete?.({
      filename,
      blob,
      format: exportSettings.format,
      width: targetDimensions.width,
      height: targetDimensions.height,
    });
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
          e.target.value = '';
        }}
      />

      {/* Non-blocking Status / Fallback / Timing Banner */}
      {statusNotice && (
        <div
          role="status"
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            statusNotice.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{statusNotice.message}</span>
        </div>
      )}

      {/* Main Studio Split Layout: Canvas Stage + Frosted Tool Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Canvas Stage */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
          {/* Canvas Top Action Bar */}
          {originalUrl && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-lg border border-[#E5E7EB] bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('studio')}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      viewMode === 'studio'
                        ? 'bg-[#1E293B] text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.compareModeEdited}</span>
                  </button>
                  <button
                    type="button"
                    disabled={!hasCutout}
                    onClick={() => {
                      if (previewCanvasRef.current) {
                        try {
                          setSplitPreviewUrl(previewCanvasRef.current.toDataURL('image/png'));
                        } catch {
                          // ignore
                        }
                      }
                      setViewMode('split');
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer ${
                      viewMode === 'split'
                        ? 'bg-[#0D9488] text-white'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.compareModeSplit}</span>
                  </button>
                </div>

                {lastDurationMs !== null && !isProcessing && hasCutout && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#0D9488] px-2 tabular-nums">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {t.aiCompletedIn} {(lastDurationMs / 1000).toFixed(2)}s
                    </span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label={t.undoLabel}
                  disabled={historyMeta.index <= 0}
                  onClick={handleUndo}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-35 cursor-pointer"
                >
                  <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={t.redoLabel}
                  disabled={historyMeta.index >= historyMeta.length - 1}
                  onClick={handleRedo}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-35 cursor-pointer"
                >
                  <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <div className="mx-1 h-4 w-px bg-[#E5E7EB]" />

                <button
                  type="button"
                  aria-label={t.zoomOut}
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
                >
                  <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="min-w-[44px] text-center font-mono text-xs font-semibold tabular-nums text-[#111827]">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  aria-label={t.zoomIn}
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={t.zoomReset}
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <div className="mx-1 h-4 w-px bg-[#E5E7EB]" />

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    originalImageRef.current &&
                    runCutoutForImage(originalImageRef.current, selectedEngine)
                  }
                  title={t.reprocessCutout}
                  aria-label={t.reprocessCutout}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6] disabled:opacity-40 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden xl:inline">{t.reprocessCutout}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D9488] hover:bg-[#0D9488]/5 cursor-pointer"
                >
                  {t.replaceImage}
                </button>
              </div>
            </div>
          )}

          {/* Canvas Viewport / Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileSelected(file);
            }}
            className="relative flex min-h-[340px] sm:min-h-[540px] items-center justify-center overflow-hidden bg-[#F3F4F6] p-3 sm:p-6"
          >
            {!originalUrl ? (
              <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-white px-6 py-12 transition-colors hover:border-[#0D9488] cursor-pointer"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#0D9488]">
                    <UploadCloud className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <span className="text-base font-bold text-[#111827]">{t.dropzoneTitle}</span>
                  <span className="mt-1.5 text-xs text-[#4B5563]">{t.dropzoneHint}</span>
                </button>

                <div className="mt-6 w-full">
                  <p className="text-xs font-semibold text-[#4B5563]">{t.chooseSample}</p>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {SAMPLE_PHOTOS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSampleClick(sample.url, sample.id)}
                        className="group overflow-hidden rounded-xl border border-[#E5E7EB] bg-white text-start transition-colors hover:border-[#0D9488] cursor-pointer"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3F4F6]">
                          <img
                            src={sample.url}
                            alt={t[sample.labelKey]}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                        <span className="block truncate px-2.5 py-2 text-xs font-semibold text-[#111827]">
                          {t[sample.labelKey]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative flex w-full items-center justify-center">
                {viewMode === 'split' && splitPreviewUrl ? (
                  <BeforeAfterCurtain
                    originalUrl={originalUrl}
                    editedCanvasUrl={splitPreviewUrl}
                    width={targetDimensions.width}
                    height={targetDimensions.height}
                    beforeLabel={t.beforeLabel}
                    afterLabel={t.afterLabel}
                    isRtl={isRtl}
                  />
                ) : (
                  <div
                    className="relative overflow-hidden rounded-xl border border-[#E5E7EB] checkerboard-bg shadow-xs"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    <canvas
                      ref={previewCanvasRef}
                      data-testid="studio-canvas"
                      onPointerDown={handleCanvasPointerDown}
                      onPointerMove={handleCanvasPointerMove}
                      onPointerUp={handleCanvasPointerUp}
                      onPointerLeave={() =>
                        setBrushCursor((p) => ({ ...p, visible: false }))
                      }
                      className={`block max-h-[540px] max-w-full object-contain touch-none ${
                        activeTab === 'brush'
                          ? 'cursor-crosshair'
                          : textLayers.length > 0
                          ? 'cursor-grab active:cursor-grabbing'
                          : 'cursor-default'
                      }`}
                    />
                    {activeTab === 'brush' && brushCursor.visible && (
                      <div
                        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0D9488] bg-[#0D9488]/10"
                        style={{
                          left: brushCursor.x,
                          top: brushCursor.y,
                          width: brushSize * 1.4,
                          height: brushSize * 1.4,
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Frosted AI Progress Overlay */}
                {isProcessing && progress && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-md p-6">
                    <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Loader2
                          className="h-5 w-5 animate-spin text-[#0D9488] shrink-0"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-semibold text-[#111827]">
                          {progress.message || t.aiProcessing}
                        </p>
                      </div>
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                        <div
                          className="h-full rounded-full bg-[#0D9488] transition-all duration-200"
                          style={{ width: `${Math.max(6, progress.progress)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs font-mono tabular-nums text-[#4B5563]">
                        <span>{Math.round(progress.progress)}%</span>
                        {typeof progress.loadedMB === 'number' &&
                          typeof progress.totalMB === 'number' &&
                          progress.totalMB > 0 && (
                            <span>
                              {progress.loadedMB} MB / {progress.totalMB} MB
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Sample Switcher Strip when image is loaded */}
          {originalUrl && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] bg-white px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#4B5563]">{t.chooseSample}</span>
                {SAMPLE_PHOTOS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSampleClick(sample.url, sample.id)}
                    className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs font-medium text-[#111827] hover:border-[#0D9488] transition-colors cursor-pointer"
                  >
                    {t[sample.labelKey]}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[11px] tabular-nums text-[#6B7280]">
                {origDims.width} × {origDims.height} px
              </span>
            </div>
          )}
        </div>

        {/* Frosted Alabaster Tool Sidebar */}
        <div className="lg:col-span-4">
          <ToolSidebar
            t={t}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            bgSettings={bgSettings}
            onChangeBg={setBgSettings}
            onUploadBgImage={handleUploadBgImage}
            textLayers={textLayers}
            selectedTextId={selectedTextId}
            onSelectText={setSelectedTextId}
            onAddText={handleAddText}
            onUpdateText={handleUpdateText}
            onDeleteText={handleDeleteText}
            effects={effects}
            onChangeEffects={setEffects}
            brushMode={brushMode}
            onChangeBrushMode={setBrushMode}
            brushSize={brushSize}
            onChangeBrushSize={setBrushSize}
            onResetMask={handleResetMask}
            subjectAdjust={subjectAdjust}
            bgAdjust={bgAdjust}
            onChangeSubjectAdjust={setSubjectAdjust}
            onChangeBgAdjust={setBgAdjust}
            exportSettings={exportSettings}
            onChangeExport={setExportSettings}
            estimatedBytes={estimatedBytes}
            targetDimensions={targetDimensions}
            onDownload={handleDownload}
            hasCutout={hasCutout}
          />
        </div>
      </div>
    </div>
  );
}
