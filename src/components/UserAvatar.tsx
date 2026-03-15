'use client';

import { useState } from 'react';
import { getApiUrl } from '@/lib/api';
import { User } from '@/types';

interface Props {
  user: User | null;
  size?: number;
  className?: string;
}

function getInitials(user: User): string {
  if (user.pseudo) return user.pseudo.slice(0, 2).toUpperCase();
  if (user.first_name && user.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  return user.email?.slice(0, 2).toUpperCase() ?? '??';
}

export default function UserAvatar({ user, size = 32, className = '' }: Props) {
  const [imgError, setImgError] = useState(false);

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
  };

  const fontSize = size <= 32 ? '0.75rem' : '0.875rem';

  if (user?.avatar_url && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${getApiUrl()}${user.avatar_url}`}
        alt={user.pseudo ?? 'Avatar'}
        style={{ ...baseStyle, objectFit: 'cover' }}
        className={className}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      style={{ ...baseStyle, fontSize }}
      className={`bg-[var(--primary)] text-[var(--surface)] flex items-center justify-center font-semibold ${className}`}
    >
      {user ? getInitials(user) : '?'}
    </div>
  );
}
