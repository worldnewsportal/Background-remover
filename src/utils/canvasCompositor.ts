import type {
  AspectPresetId,
  BackgroundSettings,
  BrushMode,
  ColorAdjustments,
  ExportFormat,
  StickerShadowSettings,
  TextLayer,
} from '../types/studio';
import {
  buildCssFilterString,
  computeContainFit,
  computeCoverFit,
  computeTargetDimensions,
} from './canvasMath';

export interface StudioCompositeState {
  originalImage: HTMLImageElement;
  maskCanvas: HTMLCanvasElement;
  bgSettings: BackgroundSettings;
  customBgImage: HTMLImageElement | null;
  textLayers: TextLayer[];
  subjectAdjust: ColorAdjustments;
  bgAdjust: ColorAdjustments;
  effects: StickerShadowSettings;
  aspectPreset: AspectPresetId;
}

export function buildSubjectCanvasFromMask(
  originalImage: HTMLImageElement,
  maskCanvas: HTMLCanvasElement,
  targetCanvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const w = originalImage.naturalWidth || originalImage.width;
  const h = originalImage.naturalHeight || originalImage.height;
  const canvas = targetCanvas || document.createElement('canvas');
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(originalImage, 0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  return canvas;
}

export function applyBrushStrokeToMask(
  maskCanvas: HTMLCanvasElement,
  normX: number,
  normY: number,
  prevNormX: number | null,
  prevNormY: number | null,
  brushRadiusPx: number,
  mode: BrushMode
): void {
  const ctx = maskCanvas.getContext('2d');
  if (!ctx) return;

  const w = maskCanvas.width;
  const h = maskCanvas.height;
  const x = normX * w;
  const y = normY * h;
  const px = prevNormX !== null ? prevNormX * w : x;
  const py = prevNormY !== null ? prevNormY * h : y;

  // Scale brush proportionally to natural resolution vs 1080px reference
  const scaledRadius = Math.max(2, brushRadiusPx * (Math.max(w, h) / 1080));

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = scaledRadius * 2;
  ctx.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';

  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, scaledRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasW: number,
  canvasH: number
): void {
  if (!layer.text.trim()) return;
  const scaleFactor = canvasH / 1080;
  const fontPx = Math.max(12, Math.round(layer.fontSize * scaleFactor));

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));
  ctx.translate(layer.x * canvasW, layer.y * canvasH);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.font = `800 ${fontPx}px "${layer.fontFamily}", "Cairo", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (layer.shadowBlur > 0) {
    ctx.shadowColor = layer.shadowColor;
    ctx.shadowBlur = layer.shadowBlur * scaleFactor;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4 * scaleFactor;
  }

  if (layer.strokeWidth > 0) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = layer.strokeWidth * 2 * scaleFactor;
    ctx.strokeStyle = layer.strokeColor;
    ctx.strokeText(layer.text, 0, 0);
  }

  ctx.fillStyle = layer.color;
  ctx.fillText(layer.text, 0, 0);
  ctx.restore();
}

function createStickerOutlineCanvas(
  subjectCanvas: HTMLCanvasElement,
  strokeWidth: number,
  strokeColor: string,
  drawW: number,
  drawH: number
): HTMLCanvasElement {
  const pad = Math.ceil(strokeWidth + 4);
  const outCanvas = document.createElement('canvas');
  outCanvas.width = Math.max(1, Math.round(drawW + pad * 2));
  outCanvas.height = Math.max(1, Math.round(drawH + pad * 2));
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return outCanvas;

  // Radial multi-stamp dilation produces a smooth rounded sticker border
  const steps = Math.max(16, Math.min(36, Math.round(strokeWidth * 1.5)));
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const dx = Math.cos(angle) * strokeWidth;
    const dy = Math.sin(angle) * strokeWidth;
    ctx.drawImage(subjectCanvas, pad + dx, pad + dy, drawW, drawH);
  }
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = strokeColor;
  ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
  ctx.globalCompositeOperation = 'source-over';
  return outCanvas;
}

export function renderStudioComposition(
  targetCanvas: HTMLCanvasElement,
  state: StudioCompositeState,
  subjectCanvas: HTMLCanvasElement,
  options?: { maxPreviewDimension?: number; forExport?: boolean }
): void {
  const origW = state.originalImage.naturalWidth || state.originalImage.width;
  const origH = state.originalImage.naturalHeight || state.originalImage.height;

  const fullDims = computeTargetDimensions(origW, origH, state.aspectPreset);
  let outW = fullDims.width;
  let outH = fullDims.height;

  if (!options?.forExport && options?.maxPreviewDimension) {
    const maxDim = Math.max(outW, outH);
    if (maxDim > options.maxPreviewDimension) {
      const ratio = options.maxPreviewDimension / maxDim;
      outW = Math.max(1, Math.round(outW * ratio));
      outH = Math.max(1, Math.round(outH * ratio));
    }
  }

  if (targetCanvas.width !== outW || targetCanvas.height !== outH) {
    targetCanvas.width = outW;
    targetCanvas.height = outH;
  }

  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, outW, outH);

  // 1. BACKGROUND LAYER
  ctx.save();
  ctx.filter = buildCssFilterString(state.bgAdjust);

  if (state.bgSettings.type === 'solid') {
    ctx.fillStyle = state.bgSettings.solidColor;
    ctx.fillRect(0, 0, outW, outH);
  } else if (state.bgSettings.type === 'gradient') {
    const [c1, c2, c3] = state.bgSettings.gradientStops;
    const grad = ctx.createLinearGradient(0, 0, outW, outH);
    grad.addColorStop(0, c1);
    grad.addColorStop(0.52, c2);
    grad.addColorStop(1, c3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, outW, outH);
  } else if (state.bgSettings.type === 'image' && state.customBgImage) {
    const cover = computeCoverFit(
      state.customBgImage.naturalWidth || state.customBgImage.width,
      state.customBgImage.naturalHeight || state.customBgImage.height,
      outW,
      outH
    );
    ctx.drawImage(state.customBgImage, cover.x, cover.y, cover.width, cover.height);
  } else if (state.bgSettings.type === 'bokeh') {
    const blurPx = Math.max(0, state.bgSettings.bokehBlur * (outH / 1080));
    const cover = computeCoverFit(origW, origH, outW, outH);
    ctx.filter = `${buildCssFilterString(state.bgAdjust)} blur(${blurPx.toFixed(1)}px)`;
    // Slight overscan prevents transparent blur vignette on edges
    const overscan = blurPx * 2;
    ctx.drawImage(
      state.originalImage,
      cover.x - overscan,
      cover.y - overscan,
      cover.width + overscan * 2,
      cover.height + overscan * 2
    );
  }
  ctx.restore();

  // 2. TEXT BEHIND SUBJECT LAYER
  for (const layer of state.textLayers) {
    if (layer.placement === 'behind') {
      drawTextLayer(ctx, layer, outW, outH);
    }
  }

  // Compute Subject Fit inside target aspect ratio
  const fit =
    state.aspectPreset === 'original'
      ? { x: 0, y: 0, width: outW, height: outH }
      : computeContainFit(origW, origH, outW, outH, 0.04);

  const scaleToCanvas = outH / 1080;

  // 3. SHADOW & STICKER STROKE LAYER
  const { strokeWidth, strokeColor, shadowX, shadowY, shadowBlur, shadowOpacity, shadowColor } =
    state.effects;

  const hasShadow = shadowOpacity > 0 && (shadowBlur > 0 || shadowX !== 0 || shadowY !== 0);
  const scaledStroke = strokeWidth * scaleToCanvas;

  if (scaledStroke > 0.5) {
    const outlineCanvas = createStickerOutlineCanvas(
      subjectCanvas,
      scaledStroke,
      strokeColor,
      fit.width,
      fit.height
    );
    const pad = Math.ceil(scaledStroke + 4);

    ctx.save();
    if (hasShadow) {
      ctx.shadowColor = hexToRgba(shadowColor, shadowOpacity);
      ctx.shadowBlur = shadowBlur * scaleToCanvas;
      ctx.shadowOffsetX = shadowX * scaleToCanvas;
      ctx.shadowOffsetY = shadowY * scaleToCanvas;
    }
    ctx.drawImage(outlineCanvas, fit.x - pad, fit.y - pad);
    ctx.restore();
  } else if (hasShadow) {
    ctx.save();
    ctx.shadowColor = hexToRgba(shadowColor, shadowOpacity);
    ctx.shadowBlur = shadowBlur * scaleToCanvas;
    ctx.shadowOffsetX = shadowX * scaleToCanvas;
    ctx.shadowOffsetY = shadowY * scaleToCanvas;
    ctx.drawImage(subjectCanvas, fit.x, fit.y, fit.width, fit.height);
    ctx.restore();
  }

  // 4. SUBJECT CUTOUT LAYER
  ctx.save();
  ctx.filter = buildCssFilterString(state.subjectAdjust);
  ctx.drawImage(subjectCanvas, fit.x, fit.y, fit.width, fit.height);
  ctx.restore();

  // 5. FOREGROUND TEXT & WATERMARK LAYER
  for (const layer of state.textLayers) {
    if (layer.placement === 'front') {
      drawTextLayer(ctx, layer, outW, outH);
    }
  }
}

export async function exportStudioCompositionBlob(
  state: StudioCompositeState,
  subjectCanvas: HTMLCanvasElement,
  format: ExportFormat,
  quality: number
): Promise<Blob> {
  const exportCanvas = document.createElement('canvas');
  renderStudioComposition(exportCanvas, state, subjectCanvas, { forExport: true });

  // JPEG has no alpha channel — composite on white if transparent background selected
  if (format === 'jpeg' && state.bgSettings.type === 'transparent') {
    const opaqueCanvas = document.createElement('canvas');
    opaqueCanvas.width = exportCanvas.width;
    opaqueCanvas.height = exportCanvas.height;
    const octx = opaqueCanvas.getContext('2d');
    if (octx) {
      octx.fillStyle = '#FFFFFF';
      octx.fillRect(0, 0, opaqueCanvas.width, opaqueCanvas.height);
      octx.drawImage(exportCanvas, 0, 0);
      return canvasToBlob(opaqueCanvas, format, quality);
    }
  }

  return canvasToBlob(exportCanvas, format, quality);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality: number
): Promise<Blob> {
  const mime =
    format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export encoding failed'))),
      mime,
      format === 'png' ? undefined : Math.max(0.1, Math.min(1, quality))
    );
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(17, 24, 39, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
