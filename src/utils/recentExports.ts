import type { RecentExportItem } from '../types/studio';

export const MAX_RECENT_EXPORTS = 5;

export interface PushRecentExportResult {
  items: RecentExportItem[];
  evicted: RecentExportItem[];
}

/**
 * Prepends a newly exported item to the session list, replaces any prior entry
 * with the exact same filename so re-exports stay fresh, and caps the list at
 * MAX_RECENT_EXPORTS while returning evicted items so callers can revoke URLs.
 */
export function pushRecentExport(
  current: RecentExportItem[],
  nextItem: RecentExportItem,
  maxItems: number = MAX_RECENT_EXPORTS
): PushRecentExportResult {
  const evicted: RecentExportItem[] = [];
  const remaining: RecentExportItem[] = [];

  for (const item of current) {
    if (item.filename === nextItem.filename) {
      evicted.push(item);
    } else {
      remaining.push(item);
    }
  }

  const combined = [nextItem, ...remaining];
  if (combined.length > maxItems) {
    evicted.push(...combined.slice(maxItems));
  }

  return {
    items: combined.slice(0, maxItems),
    evicted,
  };
}

export function removeRecentExport(
  current: RecentExportItem[],
  id: string
): PushRecentExportResult {
  const evicted: RecentExportItem[] = [];
  const items: RecentExportItem[] = [];

  for (const item of current) {
    if (item.id === id) {
      evicted.push(item);
    } else {
      items.push(item);
    }
  }

  return { items, evicted };
}
