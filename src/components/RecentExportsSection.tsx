import { Download, History, Trash2 } from 'lucide-react';
import type { TranslationDictionary } from '../i18n/translations';
import type { RecentExportItem } from '../types/studio';
import { formatBytes } from '../utils/canvasMath';
import { MAX_RECENT_EXPORTS } from '../utils/recentExports';

interface RecentExportsSectionProps {
  t: TranslationDictionary;
  items: RecentExportItem[];
  onRedownload: (item: RecentExportItem) => void;
  onClearAll: () => void;
}

export function RecentExportsSection({
  t,
  items,
  onRedownload,
  onClearAll,
}: RecentExportsSectionProps) {
  return (
    <section
      aria-labelledby="recent-exports-heading"
      data-testid="recent-exports-section"
      className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#0D9488]">
            <History className="h-4 w-4" aria-hidden="true" />
          </div>
          <h2 id="recent-exports-heading" className="text-sm font-bold text-[#111827]">
            {t.recentExportsTitle}
          </h2>
          <span
            data-testid="recent-exports-count"
            className="rounded-md bg-[#F3F4F6] px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-[#4B5563]"
          >
            {items.length} / {MAX_RECENT_EXPORTS}
          </span>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 text-xs font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t.recentExportsClear}</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs text-[#4B5563]">
          {t.recentExportsEmpty}
        </p>
      ) : (
        <ul
          data-testid="recent-exports-list"
          className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          {items.map((item) => (
            <li
              key={item.id}
              data-testid="recent-export-item"
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]"
            >
              <div className="flex items-center gap-3 p-2.5 sm:flex-col sm:items-stretch sm:gap-2">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] checkerboard-sm sm:h-24 sm:w-full">
                  <img
                    src={item.previewUrl}
                    alt={item.filename}
                    className="h-full w-full object-contain p-1"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    title={item.filename}
                    className="truncate text-xs font-semibold text-[#111827]"
                  >
                    {item.filename}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] tabular-nums text-[#4B5563]">
                    {item.format.toUpperCase()} · {item.width}×{item.height} ·{' '}
                    {formatBytes(item.sizeBytes)}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] bg-white px-2.5 py-2">
                <button
                  type="button"
                  onClick={() => onRedownload(item)}
                  aria-label={`${t.recentExportsRedownload} ${item.filename}`}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 text-xs font-semibold text-[#0D9488] hover:border-[#0D9488] hover:bg-[#0D9488]/5 transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{t.recentExportsRedownload}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
