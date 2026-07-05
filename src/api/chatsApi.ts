import { supabase } from './supabaseClient';

export const chatsApi = {
  getChats: async (userId: string) => {
    console.log('🔍 1. Получаем chat_participants для userId:', userId);

    const { data: participants, error: err1 } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', userId);

    console.log('📋 2. participants:', participants);
    if (err1) console.error('❌ 3. Ошибка participants:', err1);

    if (!participants || participants.length === 0) {
      console.log('⚠️ 4. Нет участников, возвращаем []');
      return [];
    }

    const chatIds = participants.map((p: any) => p.chat_id);
    console.log('🔢 5. chatIds:', chatIds);

    const { data: chats, error: err2 } = await supabase
      .from('chats')
      .select('*')
      .in('id', chatIds);

    console.log('📦 6. chats:', chats);
    if (err2) console.error('❌ 7. Ошибка chats:', err2);

    return chats || [];
  },

  getMessages: async (chatId: number) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(username, avatar_url)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  sendMessage: async (chatId: number, senderId: string, content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ chat_id: chatId, sender_id: senderId, content }])
      .select('*, profiles(username, avatar_url)')
      .single();
    if (error) throw error;
    return data;
  },
  // Удалить чат и все связанные данные
deleteChat: async (chatId: number) => {
  // Удаляем сообщения (каскадное удаление сработает, если есть внешние ключи)
  // Но на всякий случай удалим вручную
  const { error: err1 } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);
  if (err1) throw err1;

  // Удаляем участников
  const { error: err2 } = await supabase
    .from('chat_participants')
    .delete()
    .eq('chat_id', chatId);
  if (err2) throw err2;

  // Удаляем сам чат
  const { error: err3 } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);
  if (err3) throw err3;
},
};
