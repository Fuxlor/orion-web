'use client';

import { useState, useEffect } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';
import ConfirmModal from '@/components/ConfirmModal';

interface Session {
  id: number;
  device: string | null;
  ip: string | null;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

interface Passkey {
  id: number;
  credential_id: string;
  device_type: string;
  name: string | null;
  created_at: string;
}

interface Props {
  user: User;
  onUserUpdate: (user: User) => void;
}

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
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

  // Passkey state
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [passkeysLoading, setPasskeysLoading] = useState(true);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeyRegistering, setPasskeyRegistering] = useState(false);

  // Passkey name modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalName, setAddModalName] = useState('');
  const [renameModalId, setRenameModalId] = useState<number | null>(null);
  const [renameModalName, setRenameModalName] = useState('');

  // Shared confirm modal
  const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);

  function openConfirm(title: string, message: string, onConfirm: () => void, confirmLabel?: string) {
    setConfirmModal({ title, message, onConfirm, confirmLabel });
  }

  useEffect(() => {
    apiFetch('/api/auth/sessions')
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setSessionsLoading(false));

    apiFetch('/api/auth/passkey')
      .then(r => r.json())
      .then(d => setPasskeys(d.passkeys ?? []))
      .catch(() => {})
      .finally(() => setPasskeysLoading(false));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (showAddModal) { setShowAddModal(false); setAddModalName(''); }
      if (renameModalId !== null) { setRenameModalId(null); setRenameModalName(''); }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showAddModal, renameModalId]);

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

  async function verifyTotp(e: React.FormEvent<HTMLFormElement>) {
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

  function disableTotp() {
    openConfirm(
      'Disable 2FA',
      'Your account will be less secure without two-factor authentication.',
      async () => {
        try {
          await apiFetch('/api/auth/2fa/totp', { method: 'DELETE' });
          onUserUpdate({ ...user, totp_enabled: false });
          localStorage.setItem('user', JSON.stringify({ ...user, totp_enabled: false }));
          setTotpStatus(null);
          setBackupCodes(null);
        } catch {}
      },
      'Disable'
    );
  }

  async function addPasskey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasskeyError(null);
    setPasskeyRegistering(true);
    try {
      const optRes = await apiFetch('/api/auth/passkey/register-options');
      if (!optRes.ok) {
        setPasskeyError('Failed to get registration options');
        return;
      }
      const options = await optRes.json();
      const response = await startRegistration({ optionsJSON: options });
      const regRes = await apiFetch('/api/auth/passkey/register', {
        method: 'POST',
        body: JSON.stringify({ ...response, name: addModalName.trim() || undefined }),
      });
      if (!regRes.ok) {
        const data = await regRes.json();
        setPasskeyError(data.error || 'Registration failed');
        return;
      }
      setShowAddModal(false);
      setAddModalName('');
      const listRes = await apiFetch('/api/auth/passkey');
      const listData = await listRes.json();
      setPasskeys(listData.passkeys ?? []);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        setPasskeyError(err.message || 'Registration failed');
      }
    } finally {
      setPasskeyRegistering(false);
    }
  }

  async function confirmRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (renameModalId === null) return;
    try {
      const res = await apiFetch(`/api/auth/passkey/${renameModalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: renameModalName }),
      });
      if (res.ok) {
        const data = await res.json();
        setPasskeys(prev => prev.map(p => p.id === renameModalId ? { ...p, name: data.name } : p));
        setRenameModalId(null);
        setRenameModalName('');
      }
    } catch {}
  }

  function removePasskey(id: number) {
    openConfirm(
      'Remove passkey',
      'This passkey will be permanently removed. You will no longer be able to use it to sign in.',
      async () => {
        try {
          await apiFetch(`/api/auth/passkey/${id}`, { method: 'DELETE' });
          setPasskeys(prev => prev.filter(p => p.id !== id));
        } catch {}
      }
    );
  }

  function revokeSession(id: number) {
    openConfirm(
      'Revoke session',
      'This device will be signed out immediately.',
      async () => {
        await apiFetch(`/api/auth/sessions/${id}`, { method: 'DELETE' });
        setSessions(prev => prev.filter(s => s.id !== id));
      },
      'Revoke'
    );
  }

  function revokeOtherSessions() {
    openConfirm(
      'Sign out all other sessions',
      'All other devices will be signed out immediately.',
      async () => {
        await apiFetch('/api/auth/sessions', { method: 'DELETE' });
        setSessions(prev => prev.filter(s => s.isCurrent));
      },
      'Sign out'
    );
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

      {/* Passkeys */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-1">Passkeys</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Sign in with biometrics or a hardware key instead of a password.
        </p>

        {passkeysLoading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading passkeys…</p>
        ) : (
          <div className="space-y-2">
            {passkeys.map(pk => (
              <div
                key={pk.id}
                className="flex items-center justify-between p-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg"
              >
                <div
                  className="flex-1 min-w-0 cursor-pointer group"
                  onClick={() => { setRenameModalId(pk.id); setRenameModalName(pk.name ?? ''); }}
                >
                  <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                    {pk.name || (pk.device_type === 'multiDevice' ? 'Multi-device passkey' : 'Single-device passkey')}
                    <span className="text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">Added {formatDate(pk.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removePasskey(pk.id)}
                  className="ml-4 shrink-0 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            {passkeyError && <p className="text-sm text-red-400">{passkeyError}</p>}
            <button
              type="button"
              onClick={() => { setShowAddModal(true); setPasskeyError(null); }}
              className="btn-primary mt-1"
            >
              Add passkey
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

      {/* Add passkey modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onMouseDown={() => { setShowAddModal(false); setAddModalName(''); }}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl"
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <h2 className="text-base font-semibold text-white">Add passkey</h2>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setAddModalName(''); }}
                className="cursor-pointer rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={addPasskey} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Name <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={addModalName}
                  onChange={e => setAddModalName(e.target.value)}
                  placeholder="e.g. MacBook Touch ID"
                  maxLength={255}
                  className="w-full"
                  disabled={passkeyRegistering}
                />
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  Give this passkey a name to identify it later.
                </p>
              </div>
              {passkeyError && <p className="text-sm text-red-400">{passkeyError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={passkeyRegistering} className="btn-primary flex-1">
                  {passkeyRegistering ? 'Waiting for authenticator…' : 'Add passkey'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setAddModalName(''); }}
                  className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename passkey modal */}
      {renameModalId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onMouseDown={() => { setRenameModalId(null); setRenameModalName(''); }}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-2xl"
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <h2 className="text-base font-semibold text-white">Rename passkey</h2>
              <button
                type="button"
                onClick={() => { setRenameModalId(null); setRenameModalName(''); }}
                className="cursor-pointer rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-input)] hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={confirmRename} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={renameModalName}
                  onChange={e => setRenameModalName(e.target.value)}
                  placeholder="e.g. MacBook Touch ID"
                  maxLength={255}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => { setRenameModalId(null); setRenameModalName(''); }}
                  className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared confirm modal */}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
