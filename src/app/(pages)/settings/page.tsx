'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';
import UserAvatar from '@/components/UserAvatar';
import ProfileTab from '@/components/settings/ProfileTab';
import SecurityTab from '@/components/settings/SecurityTab';
import ConnectionsTab from '@/components/settings/ConnectionsTab';
import ProjectsTab from '@/components/settings/ProjectsTab';
import AppearanceTab from '@/components/settings/AppearanceTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import BillingTab from '@/components/settings/BillingTab';

type Tab = 'profile' | 'security' | 'connections' | 'projects' | 'appearance' | 'notifications' | 'billing';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Security',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = '/login'; return; }

    // Try localStorage first for instant render
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw) as User);
    } catch { }

    apiFetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          setUser(d.user);
          localStorage.setItem('user', JSON.stringify(d.user));
        }
      })
      .catch(() => { window.location.href = '/login'; })
      .finally(() => setLoading(false));
  }, []);

  // Check URL hash for initial tab
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as Tab;
    if (TABS.find(t => t.id === hash)) setActiveTab(hash);
  }, []);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
  }

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--text-muted)] text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-[var(--border)] bg-[var(--surface-elevated)] flex items-center px-6 gap-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/orion-nobg.png" alt="Orion" width={32} height={32} />
          <span className="font-semibold text-[var(--text-secondary)]">Orion</span>
        </Link>
        <span className="text-[var(--border)] select-none">/</span>
        <span className="text-sm text-[var(--text-muted)]">Settings</span>
        <div className="flex-1" />
        <Link
          href="/dashboard"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to dashboard
        </Link>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <nav className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-1">
          {user && (
            <div className="px-3 py-3 mb-2 border-b border-[var(--border)]">
              <UserAvatar user={user} size={40} className="mb-2" />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--text-secondary)] truncate">{user.pseudo}</p>
                {user?.plan && <p className="text-xs text-[var(--text-muted)] truncate">{user.plan.slice(0, 1).toUpperCase() + user.plan.slice(1)}</p>}
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
            </div>
          )}
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${activeTab === tab.id
                ? 'bg-[var(--primary-muted)] text-[var(--primary)] font-medium'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-secondary)]'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-2xl">
            <h1 className="text-xl font-semibold text-[var(--text-secondary)] mb-6">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>

            {!user ? null : (
              <>
                {activeTab === 'profile' && (
                  <ProfileTab user={user} onUserUpdate={setUser} />
                )}
                {activeTab === 'security' && (
                  <SecurityTab user={user} onUserUpdate={setUser} />
                )}
                {activeTab === 'connections' && (
                  <ConnectionsTab />
                )}
                {activeTab === 'projects' && (
                  <ProjectsTab />
                )}
                {activeTab === 'appearance' && (
                  <AppearanceTab />
                )}
                {activeTab === 'notifications' && (
                  <NotificationsTab user={user} onUserUpdate={setUser} />
                )}
                {activeTab === 'billing' && (
                  <BillingTab user={user} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
