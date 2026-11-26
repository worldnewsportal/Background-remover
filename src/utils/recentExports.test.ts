import test from 'node:test';
import assert from 'node:assert/strict';
import type { RecentExportItem } from '../types/studio';
import { MAX_RECENT_EXPORTS, pushRecentExport, removeRecentExport } from './recentExports';

function makeItem(n: number, filename?: string): RecentExportItem {
  return {
    id: `exp-${n}`,
    filename: filename ?? `photo-${n}-noorcut.png`,
    previewUrl: `blob:preview-${n}`,
    blob: new Blob([`img-${n}`], { type: 'image/png' }),
    format: 'png',
    sizeBytes: 1024 * n,
    width: 800,
    height: 600,
    createdAt: 1000 + n,
  };
}

test('pushRecentExport prepends newest and caps list at 5 items', () => {
  let list: RecentExportItem[] = [];
  for (let i = 1; i <= 7; i++) {
    const res = pushRecentExport(list, makeItem(i));
    list = res.items;
    if (i <= MAX_RECENT_EXPORTS) {
      assert.equal(res.evicted.length, 0);
    } else {
      assert.equal(res.evicted.length, 1);
      assert.equal(res.evicted[0].id, `exp-${i - MAX_RECENT_EXPORTS}`);
    }
  }

  assert.equal(list.length, 5);
  assert.deepEqual(
    list.map((x) => x.id),
    ['exp-7', 'exp-6', 'exp-5', 'exp-4', 'exp-3']
  );
});

test('pushRecentExport replaces duplicate filename and returns prior item for URL cleanup', () => {
  const first = makeItem(1, 'product-noorcut.png');
  const second = makeItem(2, 'portrait-noorcut.webp');
  const updatedFirst = makeItem(3, 'product-noorcut.png');

  let list = pushRecentExport([], first).items;
  list = pushRecentExport(list, second).items;
  const res = pushRecentExport(list, updatedFirst);

  assert.equal(res.items.length, 2);
  assert.equal(res.items[0].id, 'exp-3');
  assert.equal(res.items[1].id, 'exp-2');
  assert.equal(res.evicted.length, 1);
  assert.equal(res.evicted[0].id, 'exp-1');
});

test('removeRecentExport removes target item and returns it in evicted list', () => {
  const list = [makeItem(2), makeItem(1)];
  const res = removeRecentExport(list, 'exp-2');

  assert.equal(res.items.length, 1);
  assert.equal(res.items[0].id, 'exp-1');
  assert.equal(res.evicted.length, 1);
  assert.equal(res.evicted[0].id, 'exp-2');
});
