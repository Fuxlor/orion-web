'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';

interface Session {
  id: number;
  device: string | null;
  ip: string | null;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

interface Props {
  user: User;
  onUserUpdate: (user: User) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function SecurityTab({ user, onUserUpdate }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // TOTP setup state
  const [totpSetupData, setTotpSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpStatus, setTotpStatus] = useState<string | null>(null);
  const [totpLoading, setTotpLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  useEffect(() => {
    apiFetch('/api/auth/sessions')
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, []);

  async function startTotpSetup() {
    setTotpError(null);
    setTotpLoading(true);
    try {
      const res = await apiFetch('/api/auth/2fa/totp/setup');
      const data = await res.json();
      if (res.ok) setTotpSetupData(data);
      else setTotpError(data.error || 'Failed to start setup');
    } catch {
      setTotpError('Network error');
    } finally {
      setTotpLoading(false);
    }
  }

  async function verifyTotp(e: React.FormEvent) {
    e.preventDefault();
    setTotpError(null);
    setTotpLoading(true);
    try {
      const res = await apiFetch('/api/auth/2fa/totp/verify', {
        method: 'POST',
        body: JSON.stringify({ secret: totpSetupData!.secret, code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTotpError(data.error || 'Verification failed');
      } else {
        setBackupCodes(data.backupCodes);
        setTotpSetupData(null);
        setTotpStatus('Two-factor authentication is now enabled.');
        onUserUpdate({ ...user, totp_enabled: true });
        localStorage.setItem('user', JSON.stringify({ ...user, totp_enabled: true }));
      }
    } catch {
      setTotpError('Network error');
    } finally {
      setTotpLoading(false);
    }
  }

  async function disableTotp() {
    if (!confirm('Disable two-factor authentication? Your account will be less secure.')) return;
    try {
      await apiFetch('/api/auth/2fa/totp', { method: 'DELETE' });
      onUserUpdate({ ...user, totp_enabled: false });
      localStorage.setItem('user', JSON.stringify({ ...user, totp_enabled: false }));
      setTotpStatus(null);
      setBackupCodes(null);
    } catch {}
  }

  async function revokeSession(id: number) {
    await apiFetch(`/api/auth/sessions/${id}`, { method: 'DELETE' });
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  async function revokeOtherSessions() {
    if (!confirm('Sign out all other sessions?')) return;
    await apiFetch('/api/auth/sessions', { method: 'DELETE' });
    setSessions(prev => prev.filter(s => s.isCurrent));
  }

  return (
    <div className="space-y-8">
      {/* 2FA */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-1">Two-factor authentication</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Add an extra layer of security using an authenticator app (TOTP).
        </p>

        {user.totp_enabled ? (
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] bg-[var(--primary-muted)] px-3 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] inline-block" />
              Enabled
            </span>
            <button
              type="button"
              onClick={disableTotp}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Disable 2FA
            </button>
          </div>
        ) : totpSetupData ? (
          <div className="space-y-4 max-w-sm">
            <p className="text-sm text-[var(--text-muted)]">
              Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={totpSetupData.qrCodeDataUrl} alt="TOTP QR Code" className="rounded-lg w-48 h-48" />
            <form onSubmit={verifyTotp} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full tracking-widest text-center text-lg"
                required
              />
              {totpError && <p className="text-sm text-red-400">{totpError}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={totpLoading} className="btn-primary flex-1">
                  {totpLoading ? 'Verifying…' : 'Verify & enable'}
                </button>
                <button type="button" onClick={() => setTotpSetupData(null)} className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : backupCodes ? (
          <div className="space-y-3 max-w-sm">
            <p className="text-sm font-medium text-[var(--primary)]">{totpStatus}</p>
            <p className="text-sm text-[var(--text-muted)]">
              Save these backup codes somewhere safe. Each can only be used once.
            </p>
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg p-4 font-mono text-sm grid grid-cols-2 gap-2">
              {backupCodes.map(code => (
                <span key={code} className="text-[var(--text-secondary)]">{code}</span>
              ))}
            </div>
            <button type="button" onClick={() => setBackupCodes(null)} className="btn-primary w-full">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {totpStatus && <p className="text-sm text-[var(--text-muted)] mb-2">{totpStatus}</p>}
            <button type="button" onClick={startTotpSetup} disabled={totpLoading} className="btn-primary">
              {totpLoading ? 'Loading…' : 'Set up authenticator app'}
            </button>
          </div>
        )}
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-secondary)]">Active sessions</h2>
            <p className="text-sm text-[var(--text-muted)]">Manage where you're signed in.</p>
          </div>
          {sessions.filter(s => !s.isCurrent).length > 0 && (
            <button
              type="button"
              onClick={revokeOtherSessions}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Sign out all others
            </button>
          )}
        </div>

        {sessionsLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No active sessions found.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[var(--text-secondary)] truncate max-w-[280px]">
                      {session.device || 'Unknown device'}
                    </p>
                    {session.isCurrent && (
                      <span className="text-xs text-[var(--primary)] bg-[var(--primary-muted)] px-2 py-0.5 rounded-full shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {session.ip ?? 'Unknown IP'} · Last active {formatDate(session.lastActiveAt)}
                  </p>
                </div>
                {!session.isCurrent && (
                  <button
                    type="button"
                    onClick={() => revokeSession(session.id)}
                    className="ml-4 shrink-0 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
