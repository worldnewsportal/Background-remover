import type { CutoutResult, EngineId, EngineProgress } from '../types/studio';
import { computeInferenceDimensions, MAX_INFERENCE_EDGE_PX } from '../utils/imageLimits';

// Un-bundled native dynamic import helper to prevent Vite/Rollup from mangling WASM/WebGPU exports
const importModule = new Function('url', 'return import(url)') as (url: string) => Promise<any>;

const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3';
const IMGLY_CDN = 'https://esm.sh/@imgly/background-removal@1.5.5';
const IMGLY_ASSETS_CDN = 'https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/';
const GRADIO_CDN = 'https://cdn.jsdelivr.net/npm/@gradio/client/+esm';
const CLOUD_TIMEOUT_MS = 25000;

interface CachedTransformers {
  mod: any;
  model: any;
  processor: any;
  modelId: string;
}

let cachedTransformers: CachedTransformers | null = null;
let cachedImgly: any = null;
let cachedGradio: any = null;

export function isModelCached(engine: EngineId): boolean {
  if (engine === 'rmbg') return cachedTransformers !== null;
  if (engine === 'imgly') return cachedImgly !== null;
  return cachedGradio !== null;
}

function disposeCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Encodes the image for intermediate AI inference.
 * Caps only the neural input side at 2048px so high-res phone cameras (12MP–48MP)
 * never cause mobile OOM while final masks are upscaled back to 100% original resolution.
 */
async function imageElementToInferenceBlob(img: HTMLImageElement): Promise<Blob> {
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;
  const { width, height } = computeInferenceDimensions(origW, origH, MAX_INFERENCE_EDGE_PX);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  try {
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode image blob'))),
        'image/png'
      );
    });
  } finally {
    disposeCanvas(canvas);
  }
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load processed image'));
    img.src = url;
  });
}

function extractAlphaMaskFromImage(
  processedImg: HTMLImageElement,
  targetW: number,
  targetH: number
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  try {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(processedImg, 0, 0, targetW, targetH);
    const rgba = ctx.getImageData(0, 0, targetW, targetH);
    const data = rgba.data;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = alpha;
    }
    return rgba;
  } finally {
    disposeCanvas(canvas);
  }
}

async function verifyWebGpuSafe(): Promise<boolean> {
  try {
    const nav = navigator as Navigator & { gpu?: { requestAdapter?: () => Promise<any> } };
    if (!nav.gpu || typeof nav.gpu.requestAdapter !== 'function') return false;
    const adapter = await nav.gpu.requestAdapter();
    return Boolean(adapter);
  } catch {
    return false;
  }
}

function buildProcessorConfig(modelId: string) {
  if (modelId === 'Xenova/modnet') {
    return {
      do_normalize: true,
      do_pad: false,
      do_rescale: true,
      do_resize: true,
      image_mean: [0.5, 0.5, 0.5],
      image_std: [0.5, 0.5, 0.5],
      resample: 2,
      rescale_factor: 0.00392156862745098,
      size: { width: 512, height: 512 },
    };
  }
  return {
    do_normalize: true,
    do_pad: false,
    do_rescale: true,
    do_resize: true,
    image_mean: [0.5, 0.5, 0.5],
    image_std: [1, 1, 1],
    resample: 2,
    rescale_factor: 0.00392156862745098,
    size: { width: 1024, height: 1024 },
  };
}

async function loadTransformersEngine(
  onProgress?: (p: EngineProgress) => void
): Promise<CachedTransformers> {
  if (cachedTransformers) return cachedTransformers;

  onProgress?.({ stage: 'loading_module', progress: 8 });
  const mod = await importModule(TRANSFORMERS_CDN);
  const { AutoModel, AutoProcessor, env } = mod;

  env.allowLocalModels = false;
  env.useBrowserCache = true;
  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.wasmPaths = `${TRANSFORMERS_CDN}/dist/`;
    env.backends.onnx.wasm.numThreads =
      typeof window !== 'undefined' && window.crossOriginIsolated
        ? Math.min(navigator.hardwareConcurrency || 4, 4)
        : 1;
  }

  // Safely default to quantized WASM; prepend WebGPU FP16 only when adapter is verified
  const hasWebGpu = await verifyWebGpuSafe();
  const deviceCandidates: Array<{ modelId: string; device: 'wasm' | 'webgpu'; dtype: string }> = [
    { modelId: 'briaai/RMBG-1.4', device: 'wasm', dtype: 'q8' },
    { modelId: 'briaai/RMBG-1.4', device: 'wasm', dtype: 'fp32' },
    { modelId: 'Xenova/modnet', device: 'wasm', dtype: 'q8' },
  ];
  if (hasWebGpu) {
    deviceCandidates.unshift({ modelId: 'briaai/RMBG-1.4', device: 'webgpu', dtype: 'fp16' });
  }

  const fileProgressMap = new Map<string, { loaded: number; total: number }>();

  const handleProgress = (info: any) => {
    if (!info) return;
    if (info.file && typeof info.loaded === 'number' && typeof info.total === 'number' && info.total > 0) {
      fileProgressMap.set(info.file, { loaded: info.loaded, total: info.total });
      let loadedSum = 0;
      let totalSum = 0;
      fileProgressMap.forEach((v) => {
        loadedSum += v.loaded;
        totalSum += v.total;
      });
      const pct = totalSum > 0 ? Math.min(92, Math.max(12, Math.round((loadedSum / totalSum) * 80 + 12))) : 25;
      onProgress?.({
        stage: 'downloading_model',
        progress: pct,
        loadedMB: Number((loadedSum / (1024 * 1024)).toFixed(1)),
        totalMB: Number((totalSum / (1024 * 1024)).toFixed(1)),
      });
    } else if (typeof info.progress === 'number') {
      onProgress?.({
        stage: 'downloading_model',
        progress: Math.min(92, Math.max(12, Math.round(info.progress * 0.8 + 12))),
      });
    }
  };

  let lastError: unknown = null;
  for (const candidate of deviceCandidates) {
    try {
      const model = await AutoModel.from_pretrained(candidate.modelId, {
        device: candidate.device,
        dtype: candidate.dtype,
        progress_callback: handleProgress,
      });
      const processor = await AutoProcessor.from_pretrained(candidate.modelId, {
        config: buildProcessorConfig(candidate.modelId),
      });
      cachedTransformers = { mod, model, processor, modelId: candidate.modelId };
      return cachedTransformers;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to load RMBG/ModNet model');
}

async function runEngine1Rmbg(
  img: HTMLImageElement,
  onProgress?: (p: EngineProgress) => void
): Promise<ImageData> {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const { mod, model, processor } = await loadTransformersEngine(onProgress);
  onProgress?.({ stage: 'inferring', progress: 93 });

  const blob = await imageElementToInferenceBlob(img);
  const objectUrl = URL.createObjectURL(blob);
  const smallCanvas = document.createElement('canvas');
  const outCanvas = document.createElement('canvas');

  try {
    const rawImage = await mod.RawImage.fromURL(objectUrl);
    const { pixel_values } = await processor(rawImage);
    const outputs = await model({ input: pixel_values });
    const outputTensor = outputs.output || Object.values(outputs)[0];

    onProgress?.({ stage: 'postprocessing', progress: 97 });

    const maskTensor = outputTensor[0];
    const dims = maskTensor.dims as number[];
    const maskH = dims[dims.length - 2];
    const maskW = dims[dims.length - 1];
    const rawData = maskTensor.data as Float32Array | number[];

    // Check value range to normalize cleanly whether logits or 0..1 probabilities
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < rawData.length; i++) {
      const v = rawData[i];
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }
    const needsNorm = maxVal > 1.05 || minVal < -0.05;
    const range = maxVal - minVal || 1;

    smallCanvas.width = maskW;
    smallCanvas.height = maskH;
    const smallCtx = smallCanvas.getContext('2d');
    if (!smallCtx) throw new Error('Canvas 2D context unavailable');

    const smallImgData = smallCtx.createImageData(maskW, maskH);
    const pixels = smallImgData.data;
    for (let i = 0; i < maskW * maskH; i++) {
      let val = rawData[i];
      if (needsNorm) {
        val = (val - minVal) / range;
      }
      const alpha = Math.max(0, Math.min(255, Math.round(val * 255)));
      const idx = i * 4;
      pixels[idx] = 255;
      pixels[idx + 1] = 255;
      pixels[idx + 2] = 255;
      pixels[idx + 3] = alpha;
    }
    smallCtx.putImageData(smallImgData, 0, 0);

    // Bilinearly upscale mask back to exact original resolution
    outCanvas.width = width;
    outCanvas.height = height;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) throw new Error('Canvas 2D context unavailable');
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';
    outCtx.drawImage(smallCanvas, 0, 0, width, height);

    return outCtx.getImageData(0, 0, width, height);
  } finally {
    URL.revokeObjectURL(objectUrl);
    disposeCanvas(smallCanvas);
    disposeCanvas(outCanvas);
  }
}

async function runEngine2Imgly(
  img: HTMLImageElement,
  onProgress?: (p: EngineProgress) => void
): Promise<ImageData> {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  onProgress?.({ stage: 'loading_module', progress: 10 });
  if (!cachedImgly) {
    cachedImgly = await importModule(IMGLY_CDN);
  }
  const removeBackground = cachedImgly.removeBackground || cachedImgly.default;
  if (typeof removeBackground !== 'function') {
    throw new Error('IMG.LY removeBackground export unavailable');
  }

  const inputBlob = await imageElementToInferenceBlob(img);
  const resultBlob: Blob = await removeBackground(inputBlob, {
    publicPath: IMGLY_ASSETS_CDN,
    device: 'cpu',
    model: 'isnet_fp16',
    output: { format: 'image/png', quality: 1 },
    progress: (key: string, current: number, total: number) => {
      if (total > 0) {
        const pct = Math.min(95, Math.max(15, Math.round((current / total) * 80 + 15)));
        onProgress?.({
          stage: key.includes('fetch') ? 'downloading_model' : 'inferring',
          progress: pct,
          loadedMB: Number((current / (1024 * 1024)).toFixed(1)),
          totalMB: Number((total / (1024 * 1024)).toFixed(1)),
        });
      }
    },
  });

  onProgress?.({ stage: 'postprocessing', progress: 98 });
  const resultUrl = URL.createObjectURL(resultBlob);
  try {
    const outImg = await loadImageFromUrl(resultUrl);
    return extractAlphaMaskFromImage(outImg, width, height);
  } finally {
    URL.revokeObjectURL(resultUrl);
  }
}

async function runEngine3Cloud(
  img: HTMLImageElement,
  onProgress?: (p: EngineProgress) => void
): Promise<ImageData> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('CLOUD_OFFLINE');
  }

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  onProgress?.({ stage: 'loading_module', progress: 15 });
  if (!cachedGradio) {
    cachedGradio = await importModule(GRADIO_CDN);
  }
  const { Client, handle_file } = cachedGradio;
  const inputBlob = await imageElementToInferenceBlob(img);

  const cloudTask = async (): Promise<ImageData> => {
    onProgress?.({ stage: 'inferring', progress: 45 });
    const client = await Client.connect('not-lain/background-removal');
    const payload = typeof handle_file === 'function' ? handle_file(inputBlob) : inputBlob;

    let result: any;
    try {
      result = await client.predict('/png', [payload]);
    } catch {
      result = await client.predict('/image', [payload]);
    }

    onProgress?.({ stage: 'postprocessing', progress: 90 });
    const item = Array.isArray(result?.data) ? result.data[0] : result?.data;
    const outputUrl =
      typeof item === 'string'
        ? item
        : item?.url || (Array.isArray(item) ? item[1]?.url || item[0]?.url : null);

    if (!outputUrl) {
      throw new Error('Cloud endpoint returned no image output');
    }

    const outImg = await loadImageFromUrl(outputUrl);
    return extractAlphaMaskFromImage(outImg, width, height);
  };

  let timerId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => reject(new Error('CLOUD_TIMEOUT')), CLOUD_TIMEOUT_MS);
  });

  try {
    return await Promise.race([cloudTask(), timeoutPromise]);
  } finally {
    if (timerId !== null) clearTimeout(timerId);
  }
}

export async function removeBackgroundWithEngine(
  img: HTMLImageElement,
  preferredEngine: EngineId,
  onProgress?: (p: EngineProgress) => void
): Promise<CutoutResult> {
  const start = performance.now();
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  if (preferredEngine === 'rmbg') {
    const maskData = await runEngine1Rmbg(img, onProgress);
    onProgress?.({ stage: 'postprocessing', progress: 100 });
    return {
      maskData,
      width,
      height,
      engineUsed: 'rmbg',
      usedFallback: false,
      durationMs: Math.round(performance.now() - start),
    };
  }

  if (preferredEngine === 'imgly') {
    try {
      const maskData = await runEngine2Imgly(img, onProgress);
      onProgress?.({ stage: 'postprocessing', progress: 100 });
      return {
        maskData,
        width,
        height,
        engineUsed: 'imgly',
        usedFallback: false,
        durationMs: Math.round(performance.now() - start),
      };
    } catch {
      // Seamless fallback to Engine 1
      const maskData = await runEngine1Rmbg(img, onProgress);
      onProgress?.({ stage: 'postprocessing', progress: 100 });
      return {
        maskData,
        width,
        height,
        engineUsed: 'rmbg',
        usedFallback: true,
        fallbackReason: 'imgly_error',
        durationMs: Math.round(performance.now() - start),
      };
    }
  }

  // Engine 3: Cloud not-lain ZeroGPU with 25s timeout & seamless fallback to Engine 1
  try {
    const maskData = await runEngine3Cloud(img, onProgress);
    onProgress?.({ stage: 'postprocessing', progress: 100 });
    return {
      maskData,
      width,
      height,
      engineUsed: 'cloud',
      usedFallback: false,
      durationMs: Math.round(performance.now() - start),
    };
  } catch (err) {
    const reason =
      err instanceof Error && err.message === 'CLOUD_OFFLINE' ? 'cloud_offline' : 'cloud_busy';
    const maskData = await runEngine1Rmbg(img, onProgress);
    onProgress?.({ stage: 'postprocessing', progress: 100 });
    return {
      maskData,
      width,
      height,
      engineUsed: 'rmbg',
      usedFallback: true,
      fallbackReason: reason,
      durationMs: Math.round(performance.now() - start),
    };
  }
}
