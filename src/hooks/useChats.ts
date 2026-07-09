import { useEffect, useState } from 'react';
import { chatsApi } from '../api/chatsApi';
import type { Chat } from '../types/chat.types';

export const useChats = (userId: string | null) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    if (!userId) {
      setChats([]);
      setLoading(false);
      return;
    }

    try {
      const data = await chatsApi.getChats(userId);
      setChats(data);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [userId]);

  return { chats, loading, setChats, refreshChats: loadChats };
};