'use client';

import { useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';
import UserAvatar from '@/components/UserAvatar';

interface Props {
  user: User;
  onUserUpdate: (user: User) => void;
}

export default function ProfileTab({ user, onUserUpdate }: Props) {
  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Profile form
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [pseudo, setPseudo] = useState(user.pseudo);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Email change form
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileStatus(null);
    setProfileError(null);
    setProfileLoading(true);
    try {
      const res = await apiFetch('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ firstName, lastName, pseudo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Failed to update profile');
      } else {
        setProfileStatus('Profile updated successfully');
        const updated = { ...user, ...data.user };
        onUserUpdate(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch {
      setProfileError('Network error');
    } finally {
      setProfileLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Failed to change password');
      } else {
        setPasswordStatus('Password changed. Other sessions have been signed out.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordError('Network error');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailStatus(null);
    setEmailError(null);
    setEmailLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-email', {
        method: 'POST',
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || 'Failed to initiate email change');
      } else {
        setEmailStatus(`Confirmation email sent to ${newEmail}. Check your inbox.`);
        setNewEmail('');
        setEmailPassword('');
      }
    } catch {
      setEmailError('Network error');
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5MB');
      return;
    }
    setAvatarError(null);
    setPreview(URL.createObjectURL(file));
    setAvatarLoading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await apiFetch('/api/auth/me/avatar', { method: 'POST', body: form }, true);
      const data = await res.json();
      if (!res.ok) {
        setAvatarError(data.error || 'Upload failed');
        setPreview(null);
      } else {
        const updated = { ...user, ...data.user };
        onUserUpdate(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        setPreview(null);
      }
    } catch {
      setAvatarError('Network error');
      setPreview(null);
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function removeAvatar() {
    setAvatarLoading(true);
    setAvatarError(null);
    try {
      const res = await apiFetch('/api/auth/me/avatar', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...user, ...data.user };
        onUserUpdate(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch {
      setAvatarError('Network error');
    } finally {
      setAvatarLoading(false);
    }
  }

  const displayUser = preview ? { ...user, avatar_url: preview } : user;

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-4">Profile photo</h2>
        <div className="flex items-center gap-4">
          <UserAvatar user={displayUser} size={64} className="text-xl" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors disabled:opacity-50 hover:cursor-pointer"
              >
                {avatarLoading ? 'Uploading…' : 'Upload photo'}
              </button>
              {user.avatar_url && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={avatarLoading}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 hover:cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)]">JPG, PNG, WebP or GIF · Max 5MB · Resized to 256×256</p>
            {avatarError && <p className="text-xs text-red-400">{avatarError}</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Profile info */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-4">Profile information</h2>
        <form onSubmit={saveProfile} className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">First name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">Last name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Username</label>
            <input type="text" value={pseudo} onChange={e => setPseudo(e.target.value)} required className="w-full" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Email</label>
            <input type="email" value={user.email} disabled className="w-full opacity-60 cursor-not-allowed" />
            <p className="text-xs text-[var(--text-muted)] mt-1">To change your email, use the section below.</p>
          </div>
          {profileStatus && <p className="text-sm text-[var(--primary)]">{profileStatus}</p>}
          {profileError && <p className="text-sm text-red-400">{profileError}</p>}
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Change password */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-4">Change password</h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Current password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">New password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="w-full" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Confirm new password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full" />
          </div>
          {passwordStatus && <p className="text-sm text-[var(--primary)]">{passwordStatus}</p>}
          {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
          <button type="submit" disabled={passwordLoading} className="btn-primary">
            {passwordLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* Change email */}
      <section>
        <h2 className="text-base font-semibold text-[var(--text-secondary)] mb-1">Change email address</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Current: <span className="text-[var(--text-secondary)]">{user.email}</span>. A confirmation link will be sent to the new address.
        </p>
        <form onSubmit={changeEmail} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">New email address</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Confirm with your password</label>
            <input type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} required className="w-full" />
          </div>
          {emailStatus && <p className="text-sm text-[var(--primary)]">{emailStatus}</p>}
          {emailError && <p className="text-sm text-red-400">{emailError}</p>}
          <button type="submit" disabled={emailLoading} className="btn-primary">
            {emailLoading ? 'Sending…' : 'Send confirmation'}
          </button>
        </form>
      </section>
    </div>
  );
}
