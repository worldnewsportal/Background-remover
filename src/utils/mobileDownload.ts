declare global {
  interface Window {
    AndroidNativeBridge?: {
      saveBase64File?: (base64Data: string, filename: string, mimeType: string) => boolean;
    };
    Capacitor?: {
      isNativePlatform?: () => boolean;
    };
  }
}

export function isNativeCapacitorApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.Capacitor?.isNativePlatform?.() || window.AndroidNativeBridge?.saveBase64File
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to encode file'));
    reader.readAsDataURL(blob);
  });
}

export async function saveBlobToDevice(blob: Blob, filename: string): Promise<void> {
  // 1. Inside Android Capacitor APK: write directly to Downloads/NoorCut via native bridge
  if (typeof window !== 'undefined' && window.AndroidNativeBridge?.saveBase64File) {
    const base64 = await blobToBase64(blob);
    const saved = window.AndroidNativeBridge.saveBase64File(
      base64,
      filename,
      blob.type || 'application/octet-stream'
    );
    if (saved) return;
  }

  // 2. Standard browser download (Desktop, Android Chrome, iOS Safari)
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function canShareFilesOnMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
}

export async function shareBlobOnMobile(blob: Blob, filename: string): Promise<boolean> {
  if (!canShareFilesOnMobile()) return false;
  try {
    const file = new File([blob], filename, { type: blob.type || 'image/png' });
    if (!navigator.canShare({ files: [file] })) return false;
    await navigator.share({
      files: [file],
      title: filename,
    });
    return true;
  } catch {
    return false;
  }
}
