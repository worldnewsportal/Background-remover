import test from 'node:test';
import assert from 'node:assert/strict';
import { LEGAL_CONTENT, resolveLegalLanguage } from './legalContent';

test('all 4 locales provide non-empty Privacy Policy and Terms sections', () => {
  for (const lang of ['ar', 'en', 'pt', 'fr'] as const) {
    const doc = LEGAL_CONTENT[lang];
    assert.ok(doc.pageTitle.trim().length > 0);
    assert.ok(doc.privacyTitle.trim().length > 0);
    assert.ok(doc.termsTitle.trim().length > 0);
    assert.ok(doc.privacySections.length >= 4, `Expected >=4 privacy sections for ${lang}`);
    assert.ok(doc.termsSections.length >= 3, `Expected >=3 terms sections for ${lang}`);
    for (const sec of [...doc.privacySections, ...doc.termsSections]) {
      assert.ok(sec.heading.trim().length > 0);
      assert.ok(sec.body.trim().length > 15);
    }
  }
});

test('resolveLegalLanguage prefers valid query param, falls back to storedLang or ar', () => {
  assert.equal(resolveLegalLanguage('?lang=en', 'ar'), 'en');
  assert.equal(resolveLegalLanguage('?lang=invalid', 'fr'), 'fr');
  assert.equal(resolveLegalLanguage('', 'pt'), 'pt');
  assert.equal(resolveLegalLanguage('', null), 'ar');
});
