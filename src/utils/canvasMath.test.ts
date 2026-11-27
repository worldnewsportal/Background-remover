import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCssFilterString,
  buildExportFilename,
  clampSplitPercent,
  computeContainFit,
  computeCoverFit,
  computeTargetDimensions,
  estimateExportSizeBytes,
  formatBytes,
  hitTestTextLayer,
  pushMaskHistory,
  sanitizeExportBaseName,
} from './canvasMath';
import type { TextLayer } from '../types/studio';

test('computeTargetDimensions preserves original or applies preset', () => {
  assert.deepEqual(computeTargetDimensions(4000, 3000, 'original'), {
    width: 4000,
    height: 3000,
  });
  assert.deepEqual(computeTargetDimensions(4000, 3000, 'square'), {
    width: 1080,
    height: 1080,
  });
  assert.deepEqual(computeTargetDimensions(4000, 3000, 'youtube'), {
    width: 1920,
    height: 1080,
  });
  assert.deepEqual(computeTargetDimensions(4000, 3000, 'reels'), {
    width: 1080,
    height: 1920,
  });
  assert.deepEqual(computeTargetDimensions(4000, 3000, 'passport'), {
    width: 1050,
    height: 1350,
  });
});

test('computeContainFit & computeCoverFit keep aspect ratio centered', () => {
  const contain = computeContainFit(1000, 500, 1000, 1000, 0);
  assert.equal(contain.width, 1000);
  assert.equal(contain.height, 500);
  assert.equal(contain.x, 0);
  assert.equal(contain.y, 250);

  const cover = computeCoverFit(1000, 500, 1000, 1000);
  assert.equal(cover.width, 2000);
  assert.equal(cover.height, 1000);
  assert.equal(cover.x, -500);
  assert.equal(cover.y, 0);
});

test('clampSplitPercent clamps out of range and NaN values', () => {
  assert.equal(clampSplitPercent(-10), 2);
  assert.equal(clampSplitPercent(120), 98);
  assert.equal(clampSplitPercent(42), 42);
  assert.equal(clampSplitPercent(Number.NaN), 50);
});

test('buildCssFilterString formats neutral and warm adjustments', () => {
  const neutral = buildCssFilterString({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
  });
  assert.equal(neutral, 'brightness(100%) contrast(100%) saturate(100%)');

  const warm = buildCssFilterString({
    brightness: 110,
    contrast: 105,
    saturation: 120,
    warmth: 20,
  });
  assert.match(warm, /sepia\(13\.0%\)/);
});

test('estimateExportSizeBytes & formatBytes produce sensible output', () => {
  const pngBytes = estimateExportSizeBytes(1080, 1080, 'png', 1);
  const jpgLow = estimateExportSizeBytes(1080, 1080, 'jpeg', 0.2);
  const jpgHigh = estimateExportSizeBytes(1080, 1080, 'jpeg', 0.95);
  assert.ok(pngBytes > jpgHigh);
  assert.ok(jpgHigh > jpgLow);
  assert.equal(formatBytes(512), '512 B');
  assert.match(formatBytes(2048), /2\.0 KB/);
});

test('hitTestTextLayer finds top-most matching rotated or unrotated text layer', () => {
  const layers: TextLayer[] = [
    {
      id: 't1',
      text: 'STUDIO',
      x: 0.5,
      y: 0.5,
      fontSize: 120,
      fontFamily: 'Cairo',
      color: '#111827',
      strokeColor: '#FFFFFF',
      strokeWidth: 0,
      shadowBlur: 0,
      shadowColor: '#000000',
      rotation: 0,
      placement: 'behind',
      opacity: 1,
    },
  ];
  const hit = hitTestTextLayer(layers, 0.5, 0.5, 1080, 1080);
  assert.equal(hit?.id, 't1');
  const miss = hitTestTextLayer(layers, 0.05, 0.05, 1080, 1080);
  assert.equal(miss, null);
});

test('pushMaskHistory truncates redo stack and enforces maxSteps', () => {
  let state = pushMaskHistory<string>([], -1, 'm0', 3);
  state = pushMaskHistory(state.history, state.index, 'm1', 3);
  state = pushMaskHistory(state.history, state.index, 'm2', 3);
  assert.deepEqual(state.history, ['m0', 'm1', 'm2']);
  assert.equal(state.index, 2);

  // Undo once to index 1, then push m3 -> m2 dropped, m3 added
  state = pushMaskHistory(state.history, 1, 'm3', 3);
  assert.deepEqual(state.history, ['m0', 'm1', 'm3']);

  // Push m4 -> exceeds maxSteps=3, m0 dropped
  state = pushMaskHistory(state.history, state.index, 'm4', 3);
  assert.deepEqual(state.history, ['m1', 'm3', 'm4']);
});

test('sanitizeExportBaseName and buildExportFilename handle extensions, illegal chars, and fallbacks', () => {
  assert.equal(sanitizeExportBaseName('  my product: shot?.png  '), 'my-product-shot');
  assert.equal(sanitizeExportBaseName('   ', 'sneaker-noorcut'), 'sneaker-noorcut');
  assert.equal(
    buildExportFilename('holiday sale', 'fallback-noorcut', 'jpeg'),
    'holiday-sale.jpg'
  );
  assert.equal(
    buildExportFilename('custom-cutout.webp', 'fallback-noorcut', 'png'),
    'custom-cutout.png'
  );
  assert.equal(
    buildExportFilename('', 'sneaker-sample-noorcut', 'webp'),
    'sneaker-sample-noorcut.webp'
  );
});
