import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeInferenceDimensions,
  containsArabicScript,
  isSupportedImageFile,
  validateImageDimensions,
} from './imageLimits';

test('isSupportedImageFile accepts standard images and Android extension fallback while rejecting SVG/docs', () => {
  assert.equal(isSupportedImageFile({ name: 'photo.jpg', type: 'image/jpeg' }), true);
  assert.equal(isSupportedImageFile({ name: 'cutout.webp', type: 'image/webp' }), true);
  assert.equal(isSupportedImageFile({ name: 'camera.avif', type: '' }), true);
  assert.equal(isSupportedImageFile({ name: 'vector.svg', type: 'image/svg+xml' }), false);
  assert.equal(isSupportedImageFile({ name: 'doc.pdf', type: 'application/pdf' }), false);
  assert.equal(isSupportedImageFile({ name: 'notes.txt', type: '' }), false);
});

test('validateImageDimensions guards corrupt 0x0 and excessive >64MP images', () => {
  assert.deepEqual(validateImageDimensions(4000, 3000), { valid: true });
  assert.deepEqual(validateImageDimensions(0, 500), { valid: false, reason: 'invalid' });
  assert.deepEqual(validateImageDimensions(13000, 1000), { valid: false, reason: 'too_large' });
  assert.deepEqual(validateImageDimensions(9000, 9000), { valid: false, reason: 'too_large' });
});

test('computeInferenceDimensions preserves normal sizes and caps oversized mobile inputs at 2048px', () => {
  assert.deepEqual(computeInferenceDimensions(1200, 900), {
    width: 1200,
    height: 900,
    scaled: false,
  });
  assert.deepEqual(computeInferenceDimensions(4096, 2048), {
    width: 2048,
    height: 1024,
    scaled: true,
  });
});

test('containsArabicScript detects Arabic text for canvas RTL direction', () => {
  assert.equal(containsArabicScript('تصميم احترافي 2026'), true);
  assert.equal(containsArabicScript('CREATIVE STUDIO'), false);
});
