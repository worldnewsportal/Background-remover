export const MAX_IMAGE_EDGE_PX = 12000;
export const MAX_IMAGE_PIXELS = 64_000_000; // 64 MP cap protects browser/mobile RAM
export const MAX_INFERENCE_EDGE_PX = 2048;

const SUPPORTED_EXTENSIONS = /\.(jpe?g|png|webp|avif|bmp|gif)$/i;

export function isSupportedImageFile(file: { name?: string; type?: string }): boolean {
  const mime = (file.type || '').trim().toLowerCase();
  if (mime.startsWith('image/')) {
    return mime !== 'image/svg+xml';
  }
  // Android Chrome / Google Drive pickers sometimes emit empty MIME type
  if (mime === '' && file.name) {
    return SUPPORTED_EXTENSIONS.test(file.name);
  }
  return false;
}

export function validateImageDimensions(
  width: number,
  height: number
): { valid: true } | { valid: false; reason: 'invalid' | 'too_large' } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { valid: false, reason: 'invalid' };
  }
  if (
    width > MAX_IMAGE_EDGE_PX ||
    height > MAX_IMAGE_EDGE_PX ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    return { valid: false, reason: 'too_large' };
  }
  return { valid: true };
}

export function computeInferenceDimensions(
  width: number,
  height: number,
  maxEdge = MAX_INFERENCE_EDGE_PX
): { width: number; height: number; scaled: boolean } {
  const safeW = Math.max(1, Math.round(width));
  const safeH = Math.max(1, Math.round(height));
  const longest = Math.max(safeW, safeH);
  if (longest <= maxEdge) {
    return { width: safeW, height: safeH, scaled: false };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(safeW * scale)),
    height: Math.max(1, Math.round(safeH * scale)),
    scaled: true,
  };
}

export function containsArabicScript(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}
