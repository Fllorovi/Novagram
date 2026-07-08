import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';

export const usePresence = (chatId: number | null, userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    if (!chatId || !userId) return;

    const channel = supabase.channel(`presence:${chatId}`);

    // Подписка на события Presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const now = Date.now();
        
        // Фильтруем пользователей, которые обновляли статус менее 10 секунд назад
        const users = Object.keys(state).filter((id) => {
          if (id === userId) return false; // исключаем себя
          const presenceList = state[id] as any[];
          if (!presenceList || presenceList.length === 0) return false;
          
          // Проверяем время последнего обновления
          const lastSeen = presenceList[0]?.last_seen || 0;
          return now - lastSeen < 10000; // 10 секунд
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers((prev) => {
          if (prev.includes(key)) return prev;
          return [...prev, key];
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            last_seen: Date.now(), // 👈 добавляем время последнего обновления
          });
        }
      });

    // 👇 Периодически обновляем статус (каждые 5 секунд)
    const interval = setInterval(async () => {
      await channel.track({
        user_id: userId,
        last_seen: Date.now(),
      });
    }, 5000);

    // Подписка на события "печатает"
    const typingChannel = supabase.channel(`typing:${chatId}`);
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== userId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [chatId, userId]);

  const sendTyping = async () => {
    if (!chatId || !userId) return;
    await supabase.channel(`typing:${chatId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId },
    });
  };

  return { onlineUsers, isTyping, sendTyping };
};