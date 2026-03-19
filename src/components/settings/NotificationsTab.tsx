'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';

interface Props {
  user: User;
  onUserUpdate: (user: User) => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`cursor-pointer relative inline-flex w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
        }`}
    >
      <span
        className={`cursor-pointer absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  );
}

export default function NotificationsTab({ user, onUserUpdate }: Props) {
  const [alertEmails, setAlertEmails] = useState(user.notifications_email ?? true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function update(notifications_email: boolean) {
    setAlertEmails(notifications_email);
    setStatus(null);
    setSaving(true);
    try {
      const res = await apiFetch('/api/auth/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ notifications_email }),
      });
      if (res.ok) {
        const updated = { ...user, notifications_email };
        onUserUpdate(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        setStatus('Preferences saved');
        setTimeout(() => setStatus(null), 2000);
      }
    } catch {
      setAlertEmails(!notifications_email); // revert
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-1">Notifications</h2>
        <p className="text-sm text-[var(--text-muted)]">Choose which emails you want to receive.</p>
      </div>

      <div className="space-y-4 max-w-lg">
        {/* Alert emails */}
        <div className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Alert notifications</p>
            <p className="text-xs text-[var(--text-muted)]">Receive emails when alert rules are triggered</p>
          </div>
          <Toggle checked={alertEmails} onChange={update} />
        </div>

        {/* Security emails — always on */}
        <div className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg opacity-70">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">Security alerts</p>
            <p className="text-xs text-[var(--text-muted)]">New sign-ins, password changes — always enabled</p>
          </div>
          <Toggle checked={true} onChange={() => { }} />
        </div>
      </div>

      {saving && <p className="text-sm text-[var(--text-muted)]">Saving…</p>}
      {status && <p className="text-sm text-[var(--primary)]">{status}</p>}
    </div>
  );
}
