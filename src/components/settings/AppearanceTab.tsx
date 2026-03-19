'use client';

import { useTheme } from '@/contexts/themeContext';

type Theme = 'dark' | 'light' | 'system';

const OPTIONS: { id: Theme; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'dark',
    label: 'Dark',
    description: 'Dark background, easy on the eyes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Light background for bright environments',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    id: 'system',
    label: 'System',
    description: 'Follows your OS preference automatically',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

export default function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-1">Theme</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Choose how Orion looks for you. Your preference is synced across devices.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
          {OPTIONS.map(opt => {
            const isActive = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`cursor-pointer flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${isActive
                  ? 'border-[var(--primary)] bg-[var(--primary-muted)]'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:bg-[var(--primary-muted)]'
                  }`}
              >
                <div className={`${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                  {opt.icon}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{opt.description}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
