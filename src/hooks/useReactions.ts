import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { chatsApi } from '../api/chatsApi';

export const useReactions = (messageIds: number[], userId: string | null) => {
  const [reactions, setReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReactions = async () => {
    if (!messageIds.length || !userId) {
      setReactions([]);
      setLoading(false);
      return;
    }
    try {
      const data = await chatsApi.getReactions(messageIds);
      setReactions(data);
    } catch (error) {
      console.error('Ошибка загрузки реакций:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReactions();
  }, [messageIds.join(','), userId]);

  // 👇 ПОДПИСКА НА ИЗМЕНЕНИЯ В РЕАЛЬНОМ ВРЕМЕНИ
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('reactions-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'reactions',
        },
        () => {
          // При любом изменении — перезагружаем реакции
          loadReactions();
        }
      )
      .subscribe((status) => {
        console.log('Reactions channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const toggleReaction = async (messageId: number, emoji: string) => {
    if (!userId) return;
    await chatsApi.toggleReaction(messageId, userId, emoji);
  };

  const getReactionsForMessage = (messageId: number) => {
    return reactions.filter((r) => r.message_id === messageId);
  };

  return { reactions, loading, toggleReaction, getReactionsForMessage };
};