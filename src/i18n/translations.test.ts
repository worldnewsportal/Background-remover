import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS } from './translations';

test('all 4 locales have identical non-empty translation keys', () => {
  const baseKeys = Object.keys(TRANSLATIONS.ar).sort();
  for (const locale of ['en', 'pt', 'fr'] as const) {
    const keys = Object.keys(TRANSLATIONS[locale]).sort();
    assert.deepEqual(keys, baseKeys, `Locale ${locale} keys mismatch`);
    for (const k of keys) {
      const val = TRANSLATIONS[locale][k as keyof typeof TRANSLATIONS.ar];
      assert.ok(typeof val === 'string' && val.trim().length > 0, `Empty key ${locale}.${k}`);
    }
  }
});
