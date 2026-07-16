import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../api/supabaseClient';
import { chatsApi } from '../api/chatsApi';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio')
        .eq('id', user.id)
        .single();
      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
        setBio(data.bio || '');
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ username, bio })
      .eq('id', user.id);

    if (error) {
      setMessage('❌ Ошибка сохранения');
      console.error(error);
    } else {
      setMessage('✅ Профиль обновлён!');
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, username, bio } : null,
      }));
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setLoading(true);
    try {
      const url = await chatsApi.uploadAvatar(user.id, file);
      if (url) {
        setAvatarUrl(url);
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, avatar_url: url } : null,
        }));
        setMessage('✅ Аватар обновлён!');
      } else {
        setMessage('❌ Не удалось получить URL аватарки');
      }
    } catch (error) {
      setMessage('❌ Ошибка загрузки аватарки');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 flex flex-col items-center">
      <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
        <button
          onClick={() => navigate('/')}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition mb-4"
        >
          ← Назад
        </button>

        <h2 className="text-2xl font-bold mb-6">Мой профиль</h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${username || 'U'}&background=3ECF8E&color=fff&size=100`}
            alt="Аватар"
            className="w-24 h-24 rounded-full object-cover border-2 border-[var(--border)]"
          />
          <label className="mt-2 text-sm text-[var(--accent)] cursor-pointer hover:underline">
            Изменить аватар
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Имя</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border)] rounded-lg px-4 py-2 cursor-not-allowed opacity-70"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">О себе</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Расскажите о себе..."
            className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
          />
        </div>

        {message && (
          <p className={`text-sm mb-4 ${message.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
};