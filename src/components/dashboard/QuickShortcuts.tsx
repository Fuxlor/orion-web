import Link from "next/link";
import { PinnedItem, RecentItem } from "@/types";

interface Props {
  pinned: PinnedItem[];
  recent: RecentItem[];
  addPinned: (item: Omit<PinnedItem, "id" | "created_at">) => Promise<void>;
  removePinned: (id: number) => Promise<void>;
  visitItem: (item: Omit<RecentItem, "id" | "visited_at">) => Promise<void>;
}

function itemHref(item: { item_type: string; item_name: string; project_name: string }): string {
  if (item.item_type === 'source') {
    return `/dashboard/projects/${item.project_name}/logs/${item.item_name}`;
  }
  return `/dashboard/projects/${item.project_name}`;
}

export default function QuickShortcuts({ pinned, recent, removePinned, visitItem }: Props) {
  const isEmpty = pinned.length === 0 && recent.length === 0;

  if (isEmpty) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Recent */}
      {recent.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Recent
          </p>
          <div className="flex flex-col gap-1">
            {recent.map((item) => (
              <Link
                key={item.id}
                href={itemHref(item)}
                onClick={() => visitItem({ item_type: item.item_type, item_name: item.item_name, project_name: item.project_name })}
                className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--primary)] hover:text-white"
              >
                <span>{item.item_name}</span>
                <span className="text-xs text-[var(--text-muted)]">{item.project_name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Pinned
          </p>
          <div className="flex flex-col gap-1">
            {pinned.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2"
              >
                <Link
                  href={itemHref(item)}
                  className="flex-1 text-sm text-[var(--text-secondary)] hover:text-white"
                >
                  <span>{item.item_name}</span>
                  <span className="ml-2 text-xs text-[var(--text-muted)]">{item.project_name}</span>
                </Link>
                <button
                  onClick={() => removePinned(item.id)}
                  className="ml-2 text-[var(--text-muted)] hover:text-red-400"
                  aria-label="Unpin"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
