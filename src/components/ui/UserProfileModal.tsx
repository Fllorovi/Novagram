import React from 'react';
import { supabase } from '../../api/supabaseClient';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  username,
  avatarUrl,
  bio,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl p-6 w-80 max-w-[90vw]">
        <button
          onClick={onClose}
          className="float-right text-[var(--text-muted)] hover:text-[var(--text-primary)] transition text-xl"
        >
          ✕
        </button>

        <div className="flex flex-col items-center mt-2">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${username || 'U'}&background=3ECF8E&color=fff&size=120`}
            alt={username}
            className="w-24 h-24 rounded-full object-cover border-2 border-[var(--border)]"
          />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-4">
            {username || 'Пользователь'}
          </h3>
          {bio && (
            <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">
              {bio}
            </p>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-4">
            ID: {userId.slice(0, 8)}...
          </p>
        </div>
      </div>
    </>
  );
};