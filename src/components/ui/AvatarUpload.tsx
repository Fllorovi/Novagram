import React, { useState } from 'react';
import { chatsApi } from '../../api/chatsApi';
import { useAuthStore } from '../../store/authStore';

export const AvatarUpload: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setError('');

    try {
      const avatarUrl = await chatsApi.uploadAvatar(user.id, file);
      // Обновляем только avatar_url в сторе
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, avatar_url: avatarUrl ?? undefined } : null,
      }));
    } catch (err) {
      setError('Ошибка загрузки аватарки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
      />
      {loading && <p>Загрузка...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};