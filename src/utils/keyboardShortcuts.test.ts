import test from 'node:test';
import assert from 'node:assert/strict';
import { getPrimaryModifierLabel, resolveAppShortcut } from './keyboardShortcuts';

const base = {
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  altKey: false,
  targetIsEditable: false,
  isHelpOpen: false,
};

test('resolveAppShortcut handles Cmd/Ctrl + S for export including inside inputs', () => {
  assert.equal(resolveAppShortcut({ ...base, ctrlKey: true, key: 's' }), 'export');
  assert.equal(
    resolveAppShortcut({ ...base, metaKey: true, key: 'S', targetIsEditable: true }),
    'export'
  );
  assert.equal(
    resolveAppShortcut({ ...base, ctrlKey: true, shiftKey: true, key: 's' }),
    null
  );
});

test('resolveAppShortcut handles Cmd/Ctrl + Shift + Delete/Backspace for clear_recent', () => {
  assert.equal(
    resolveAppShortcut({ ...base, ctrlKey: true, shiftKey: true, key: 'Delete' }),
    'clear_recent'
  );
  assert.equal(
    resolveAppShortcut({ ...base, metaKey: true, shiftKey: true, key: 'Backspace' }),
    'clear_recent'
  );
  assert.equal(
    resolveAppShortcut({ ...base, ctrlKey: true, shiftKey: false, key: 'Delete' }),
    null
  );
});

test('resolveAppShortcut handles mode toggle and help only outside editable elements', () => {
  assert.equal(resolveAppShortcut({ ...base, key: 'm' }), 'toggle_mode');
  assert.equal(resolveAppShortcut({ ...base, altKey: true, key: 'M' }), 'toggle_mode');
  assert.equal(
    resolveAppShortcut({ ...base, key: 'm', targetIsEditable: true }),
    null
  );

  assert.equal(resolveAppShortcut({ ...base, shiftKey: true, key: '?' }), 'toggle_help');
  assert.equal(
    resolveAppShortcut({ ...base, shiftKey: true, key: '?', targetIsEditable: true }),
    null
  );
  assert.equal(
    resolveAppShortcut({ ...base, key: 'Escape', isHelpOpen: true }),
    'close_help'
  );
});

test('getPrimaryModifierLabel formats macOS vs Windows/Linux label', () => {
  assert.equal(getPrimaryModifierLabel(true), '⌘');
  assert.equal(getPrimaryModifierLabel(false), 'Ctrl');
});
