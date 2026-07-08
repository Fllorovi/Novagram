import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';

export const usePresence = (chatId: number | null, userId: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    if (!chatId || !userId) return;

    const channel = supabase.channel(`presence:${chatId}`);

    // Функция для обновления статуса
    const updatePresence = async () => {
      if (document.hidden) return; // 👈 не обновляем, если вкладка неактивна
      await channel.track({
        user_id: userId,
        last_seen: Date.now(),
      });
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const now = Date.now();
        const users: string[] = [];

        Object.keys(state).forEach((key) => {
          const presenceList = state[key] as any[];
          if (!presenceList || presenceList.length === 0) return;

          const userData = presenceList[0];
          const userIdFromPresence = userData?.user_id;

          if (userIdFromPresence === userId) return;

          const lastSeen = userData?.last_seen || 0;
          if (now - lastSeen < 10000) {
            users.push(userIdFromPresence);
          }
        });

        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers((prev) => {
          const state = channel.presenceState();
          const presenceList = state[key] as any[];
          if (!presenceList || presenceList.length === 0) return prev;
          const userData = presenceList[0];
          const userIdFromPresence = userData?.user_id;

          if (userIdFromPresence === userId) return prev;
          if (prev.includes(userIdFromPresence)) return prev;
          return [...prev, userIdFromPresence];
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers((prev) => {
          const state = channel.presenceState();
          const presenceList = state[key] as any[];
          if (!presenceList || presenceList.length === 0) return prev;
          const userData = presenceList[0];
          const userIdFromPresence = userData?.user_id;
          return prev.filter((id) => id !== userIdFromPresence);
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await updatePresence();
        }
      });

    // 👇 Обновляем статус каждые 3 секунды, только если вкладка активна
    const interval = setInterval(updatePresence, 3000);

    // 👇 Обновляем статус при возвращении на вкладку
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updatePresence();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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