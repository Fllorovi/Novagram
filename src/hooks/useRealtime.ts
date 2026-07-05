import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import type { Message } from '../types/chat.types';

export const useRealtimeMessages = (chatId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    // Загружаем историю сообщений
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, profiles(username, avatar_url)')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Ошибка загрузки сообщений:', error);
        return;
      }
      
      setMessages(data || []);
      setLoading(false);
    };

    loadMessages();

    // Подписываемся на новые сообщения в реальном времени
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          // Добавляем новое сообщение в список
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Отписка при размонтировании компонента
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  return { messages, loading };
};