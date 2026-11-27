import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampBatchDelayMs,
  DEFAULT_BATCH_DELAY_MS,
  shouldPauseBetweenBatchItems,
  waitForBatchCooldown,
} from './batchQueue';

test('clampBatchDelayMs enforces 0..5000 bounds and handles NaN', () => {
  assert.equal(clampBatchDelayMs(500), 500);
  assert.equal(clampBatchDelayMs(-200), 0);
  assert.equal(clampBatchDelayMs(12000), 5000);
  assert.equal(clampBatchDelayMs(Number.NaN), DEFAULT_BATCH_DELAY_MS);
  assert.equal(clampBatchDelayMs(333.7), 334);
});

test('shouldPauseBetweenBatchItems pauses only between consecutive items when delay > 0', () => {
  assert.equal(shouldPauseBetweenBatchItems(0, 3, 500), true);
  assert.equal(shouldPauseBetweenBatchItems(1, 3, 500), true);
  assert.equal(shouldPauseBetweenBatchItems(2, 3, 500), false);
  assert.equal(shouldPauseBetweenBatchItems(0, 1, 500), false);
  assert.equal(shouldPauseBetweenBatchItems(0, 3, 0), false);
});

test('waitForBatchCooldown resolves immediately for 0ms and waits at least target ms otherwise', async () => {
  const startZero = Date.now();
  await waitForBatchCooldown(0);
  assert.ok(Date.now() - startZero < 40);

  const start = Date.now();
  await waitForBatchCooldown(45);
  assert.ok(Date.now() - start >= 35);
});
