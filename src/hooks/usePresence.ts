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
        const users = Object.keys(state).filter((id) => id !== userId);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers((prev) => [...prev, key]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId });
        }
      });

    // Подписка на события "печатает"
    const typingChannel = supabase.channel(`typing:${chatId}`);
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== userId) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000); // Сбрасываем через 3 секунды
        }
      })
      .subscribe();

    return () => {
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