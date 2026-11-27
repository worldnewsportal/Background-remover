export type AppShortcutAction =
  | 'export'
  | 'clear_recent'
  | 'toggle_mode'
  | 'toggle_help'
  | 'close_help';

export interface ShortcutKeyInput {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  targetIsEditable: boolean;
  isHelpOpen?: boolean;
}

export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const el = target as { tagName?: string; isContentEditable?: boolean };
  if (el.isContentEditable) return true;
  const tag = el.tagName?.toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function resolveAppShortcut(input: ShortcutKeyInput): AppShortcutAction | null {
  const key = input.key.toLowerCase();
  const hasPrimaryMod = input.ctrlKey || input.metaKey;

  if (input.isHelpOpen && key === 'escape') {
    return 'close_help';
  }

  // Cmd/Ctrl + S -> Export (works even right after typing a filename)
  if (hasPrimaryMod && !input.shiftKey && !input.altKey && key === 's') {
    return 'export';
  }

  // Cmd/Ctrl + Shift + Delete (or Backspace on macOS) -> Clear Recent Exports
  if (
    hasPrimaryMod &&
    input.shiftKey &&
    !input.altKey &&
    (key === 'delete' || key === 'backspace')
  ) {
    return 'clear_recent';
  }

  // Single-key or Alt shortcuts skip editable inputs so typing is unaffected
  if (input.targetIsEditable) {
    return null;
  }

  // Toggle Single / Batch mode: Alt + M or bare M
  if (
    (!hasPrimaryMod && input.altKey && !input.shiftKey && key === 'm') ||
    (!hasPrimaryMod && !input.altKey && !input.shiftKey && key === 'm')
  ) {
    return 'toggle_mode';
  }

  // Open/close Keyboard Shortcuts helper: '?'
  if (!hasPrimaryMod && !input.altKey && input.key === '?') {
    return 'toggle_help';
  }

  return null;
}

export function getPrimaryModifierLabel(isMac: boolean): '⌘' | 'Ctrl' {
  return isMac ? '⌘' : 'Ctrl';
}
