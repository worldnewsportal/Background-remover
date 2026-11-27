import { Download, Keyboard, Layers, Trash2, Undo2, X } from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';
import { getPrimaryModifierLabel } from '../utils/keyboardShortcuts';

interface KeyboardShortcutsModalProps {
  t: TranslationDictionary;
  isOpen: boolean;
  onClose: () => void;
  canExport: boolean;
  canClearRecent: boolean;
  onTriggerExport: () => void;
  onTriggerClearRecent: () => void;
  onTriggerToggleMode: () => void;
}

export function KeyboardShortcutsModal({
  t,
  isOpen,
  onClose,
  canExport,
  canClearRecent,
  onTriggerExport,
  onTriggerClearRecent,
  onTriggerToggleMode,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const isMac =
    typeof navigator !== 'undefined' &&
    /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
  const mod = getPrimaryModifierLabel(isMac);

  const actionableRows = [
    {
      id: 'export',
      label: t.shortcutExportLabel,
      keys: [mod, 'S'],
      Icon: Download,
      disabled: !canExport,
      onTrigger: () => {
        onTriggerExport();
        onClose();
      },
    },
    {
      id: 'toggle_mode',
      label: t.shortcutToggleModeLabel,
      keys: ['M'],
      Icon: Layers,
      disabled: false,
      onTrigger: () => {
        onTriggerToggleMode();
        onClose();
      },
    },
    {
      id: 'clear_recent',
      label: t.shortcutClearRecentLabel,
      keys: [mod, 'Shift', 'Del'],
      Icon: Trash2,
      disabled: !canClearRecent,
      onTrigger: () => {
        onTriggerClearRecent();
        onClose();
      },
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
        data-testid="shortcuts-dialog"
        className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#0D9488]">
              <Keyboard className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="shortcuts-dialog-title" className="text-sm font-bold text-[#111827]">
                {t.shortcutsTitle}
              </h2>
              <p className="mt-0.5 text-xs text-[#4B5563]">{t.shortcutsSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeLabel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563] hover:text-[#111827] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {actionableRows.map(({ id, label, keys, Icon, disabled, onTrigger }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={onTrigger}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-start transition-colors hover:border-[#0D9488] hover:bg-white disabled:opacity-45 disabled:hover:border-[#E5E7EB] disabled:hover:bg-[#F9FAFB] cursor-pointer disabled:cursor-not-allowed"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-xs font-semibold text-[#111827]">
                <Icon className="h-3.5 w-3.5 shrink-0 text-[#0D9488]" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </span>
              <span dir="ltr" className="flex shrink-0 items-center gap-1">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded-md border border-[#D1D5DB] bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#111827]"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </button>
          ))}

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5">
            <span className="flex min-w-0 items-center gap-2.5 text-xs font-medium text-[#4B5563]">
              <Undo2 className="h-3.5 w-3.5 shrink-0 text-[#6B7280]" aria-hidden="true" />
              <span className="truncate">{t.shortcutUndoRedoLabel}</span>
            </span>
            <span dir="ltr" className="flex shrink-0 items-center gap-1">
              <kbd className="rounded-md border border-[#D1D5DB] bg-[#F9FAFB] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#374151]">
                {mod}
              </kbd>
              <kbd className="rounded-md border border-[#D1D5DB] bg-[#F9FAFB] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#374151]">
                Z / Y
              </kbd>
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5">
            <span className="flex min-w-0 items-center gap-2.5 text-xs font-medium text-[#4B5563]">
              <Keyboard className="h-3.5 w-3.5 shrink-0 text-[#6B7280]" aria-hidden="true" />
              <span className="truncate">{t.shortcutHelpLabel}</span>
            </span>
            <span dir="ltr" className="flex shrink-0 items-center gap-1">
              <kbd className="rounded-md border border-[#D1D5DB] bg-[#F9FAFB] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#374151]">
                ?
              </kbd>
              <kbd className="rounded-md border border-[#D1D5DB] bg-[#F9FAFB] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#374151]">
                Esc
              </kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
