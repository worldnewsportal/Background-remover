export const DEFAULT_BATCH_DELAY_MS = 500;
export const MIN_BATCH_DELAY_MS = 0;
export const MAX_BATCH_DELAY_MS = 5000;
export const BATCH_DELAY_PRESETS_MS = [0, 250, 500, 1000, 2000] as const;

export function clampBatchDelayMs(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BATCH_DELAY_MS;
  return Math.max(MIN_BATCH_DELAY_MS, Math.min(MAX_BATCH_DELAY_MS, Math.round(value)));
}

export function shouldPauseBetweenBatchItems(
  currentIndex: number,
  totalItems: number,
  delayMs: number
): boolean {
  if (totalItems <= 1) return false;
  if (currentIndex < 0 || currentIndex >= totalItems - 1) return false;
  return clampBatchDelayMs(delayMs) > 0;
}

export function waitForBatchCooldown(delayMs: number): Promise<void> {
  const clamped = clampBatchDelayMs(delayMs);
  if (clamped <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, clamped);
  });
}
