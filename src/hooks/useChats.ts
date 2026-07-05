import { useEffect, useState } from 'react';
import { chatsApi } from '../api/chatsApi';
import type { Chat } from '../types/chat.types';

export const useChats = (userId: string | null) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useChats: userId =', userId); // 👈 ЛОГ 1
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadChats = async () => {
      try {
        const data = await chatsApi.getChats(userId);
        console.log('useChats: data =', data); // 👈 ЛОГ 2
        setChats(data);
      } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, [userId]);

  return { chats, loading };
};