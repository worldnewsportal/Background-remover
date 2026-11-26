import type {
  AspectPresetId,
  ColorAdjustments,
  ExportFormat,
  TextLayer,
} from '../types/studio';

export interface AspectPresetSpec {
  id: AspectPresetId;
  width: number | null;
  height: number | null;
  ratioLabel: string;
}

export const ASPECT_PRESETS: Record<AspectPresetId, AspectPresetSpec> = {
  original: { id: 'original', width: null, height: null, ratioLabel: 'Auto' },
  square: { id: 'square', width: 1080, height: 1080, ratioLabel: '1:1' },
  youtube: { id: 'youtube', width: 1920, height: 1080, ratioLabel: '16:9' },
  reels: { id: 'reels', width: 1080, height: 1920, ratioLabel: '9:16' },
  passport: { id: 'passport', width: 1050, height: 1350, ratioLabel: '3.5×4.5' },
};

export const DEFAULT_ADJUSTMENTS: ColorAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
};

export function computeTargetDimensions(
  srcW: number,
  srcH: number,
  presetId: AspectPresetId
): { width: number; height: number } {
  const safeW = Math.max(1, Math.round(srcW));
  const safeH = Math.max(1, Math.round(srcH));
  const spec = ASPECT_PRESETS[presetId];
  if (!spec || spec.width === null || spec.height === null) {
    return { width: safeW, height: safeH };
  }
  return { width: spec.width, height: spec.height };
}

export function computeContainFit(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
  paddingRatio = 0.04
): { x: number; y: number; width: number; height: number } {
  const safeSrcW = Math.max(1, srcW);
  const safeSrcH = Math.max(1, srcH);
  const pad = Math.max(0, Math.min(0.4, paddingRatio));
  const availW = dstW * (1 - pad * 2);
  const availH = dstH * (1 - pad * 2);
  const scale = Math.min(availW / safeSrcW, availH / safeSrcH);
  const width = safeSrcW * scale;
  const height = safeSrcH * scale;
  const x = (dstW - width) / 2;
  const y = (dstH - height) / 2;
  return { x, y, width, height };
}

export function computeCoverFit(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): { x: number; y: number; width: number; height: number } {
  const safeSrcW = Math.max(1, srcW);
  const safeSrcH = Math.max(1, srcH);
  const scale = Math.max(dstW / safeSrcW, dstH / safeSrcH);
  const width = safeSrcW * scale;
  const height = safeSrcH * scale;
  const x = (dstW - width) / 2;
  const y = (dstH - height) / 2;
  return { x, y, width, height };
}

export function clampSplitPercent(pct: number): number {
  if (!Number.isFinite(pct)) return 50;
  return Math.max(2, Math.min(98, pct));
}

export function buildCssFilterString(adj: ColorAdjustments): string {
  const b = Math.max(20, Math.min(200, adj.brightness));
  const c = Math.max(20, Math.min(200, adj.contrast));
  const s = Math.max(0, Math.min(250, adj.saturation));
  const warmth = Math.max(-50, Math.min(50, adj.warmth));

  const parts = [`brightness(${b}%)`, `contrast(${c}%)`, `saturate(${s}%)`];
  if (warmth > 0) {
    parts.push(`sepia(${(warmth * 0.65).toFixed(1)}%)`);
  } else if (warmth < 0) {
    parts.push(`hue-rotate(${(warmth * 0.45).toFixed(1)}deg)`);
  }
  return parts.join(' ');
}

export function estimateExportSizeBytes(
  width: number,
  height: number,
  format: ExportFormat,
  quality: number
): number {
  const pixels = Math.max(1, width * height);
  const q = Math.max(0.1, Math.min(1, quality));
  if (format === 'png') {
    // Lossless RGBA PNG compressed heuristic
    return Math.round(pixels * 0.72);
  }
  if (format === 'webp') {
    return Math.round(pixels * (0.07 + q * 0.24));
  }
  // jpeg
  return Math.round(pixels * (0.08 + q * 0.28));
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function hitTestTextLayer(
  layers: TextLayer[],
  normX: number,
  normY: number,
  canvasW: number,
  canvasH: number
): TextLayer | null {
  const px = normX * canvasW;
  const py = normY * canvasH;
  const scaleFactor = canvasH / 1080;

  // Iterate reverse (top-most rendered last)
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    const lx = layer.x * canvasW;
    const ly = layer.y * canvasH;
    const fontPx = Math.max(16, layer.fontSize * scaleFactor);
    const estWidth = Math.max(fontPx * 2, layer.text.length * fontPx * 0.62);
    const estHeight = fontPx * 1.35;

    const dx = px - lx;
    const dy = py - ly;
    const rad = (-layer.rotation * Math.PI) / 180;
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

    if (Math.abs(rx) <= estWidth / 2 + 16 && Math.abs(ry) <= estHeight / 2 + 14) {
      return layer;
    }
  }
  return null;
}

export function pushMaskHistory<T>(
  history: T[],
  currentIndex: number,
  snapshot: T,
  maxSteps = 25
): { history: T[]; index: number } {
  const truncated = history.slice(0, currentIndex + 1);
  const next = [...truncated, snapshot];
  if (next.length > maxSteps) {
    const trimmed = next.slice(next.length - maxSteps);
    return { history: trimmed, index: trimmed.length - 1 };
  }
  return { history: next, index: next.length - 1 };
}
