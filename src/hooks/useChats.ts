import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
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
      // 1. Получаем все chat_id, где участвует пользователь
      const { data: participants, error: err1 } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId);

      if (err1 || !participants || participants.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      const chatIds = participants.map((p) => p.chat_id);

      // 2. Получаем данные чатов по id
      const { data: rawChats, error: err2 } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds);

      if (err2 || !rawChats) {
        setChats([]);
        setLoading(false);
        return;
      }

      // 3. Для каждого чата находим собеседника
      const chatsWithNames = await Promise.all(
        rawChats.map(async (chat) => {
          // Получаем всех участников чата
          const { data: chatParticipants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chat.id);

          if (!chatParticipants || chatParticipants.length === 0) {
            return { ...chat, displayName: 'Чат' };
          }

          // Если чат групповой (больше 2 участников)
          if (chatParticipants.length > 2) {
            const otherUserIds = chatParticipants
              .map((p) => p.user_id)
              .filter((id) => id !== userId);

            const { data: profiles } = await supabase
              .from('profiles')
              .select('username')
              .in('id', otherUserIds);

            if (profiles && profiles.length > 0) {
              const names = profiles.map((p) => p.username).filter(Boolean);
              return {
                ...chat,
                displayName: names.length > 0 ? names.join(', ') : 'Групповой чат',
              };
            }
            return { ...chat, displayName: 'Групповой чат' };
          }

          // Если чат на двоих
          const otherUserId = chatParticipants
            .map((p) => p.user_id)
            .find((id) => id !== userId);

          if (!otherUserId) {
            return { ...chat, displayName: 'Чат' };
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', otherUserId)
            .single();

          return {
            ...chat,
            displayName: profile?.username || 'Без имени',
          };
        })
      );

      setChats(chatsWithNames);
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