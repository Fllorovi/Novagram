import { supabase } from './supabaseClient';

export const chatsApi = {
  getChats: async (userId: string) => {
    const { data: participants, error: err1 } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', userId);

    if (err1) throw err1;

    if (!participants || participants.length === 0) {
      return [];
    }

    const chatIds = participants.map((p: any) => p.chat_id);

    const { data: chats, error: err2 } = await supabase
      .from('chats')
      .select('*')
      .in('id', chatIds);

    if (err2) throw err2;

    if (!chats) return [];

    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .neq('sender_id', userId)
          .eq('is_read', false);

        if (error) {
          console.error('❌ Ошибка подсчёта непрочитанных:', error);
          return { ...chat, unreadCount: 0 };
        }

        return { ...chat, unreadCount: count || 0 };
      })
    );

    const chatsWithNames = await Promise.all(
      chatsWithUnread.map(async (chat) => {
        const { data: chatParticipants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', chat.id);

        if (!chatParticipants || chatParticipants.length === 0) {
          return { ...chat, displayName: 'Чат', avatar_url: null };
        }

        if (chatParticipants.length > 2) {
          const otherUserIds = chatParticipants
            .map((p) => p.user_id)
            .filter((id) => id !== userId);

          const { data: profiles } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .in('id', otherUserIds);

          if (profiles && profiles.length > 0) {
            const names = profiles.map((p) => p.username).filter(Boolean);
            return {
              ...chat,
              displayName: names.length > 0 ? names.join(', ') : 'Групповой чат',
              avatar_url: null,
            };
          }
          return { ...chat, displayName: 'Групповой чат', avatar_url: null };
        }

        const otherUserId = chatParticipants
          .map((p) => p.user_id)
          .find((id) => id !== userId);

        if (!otherUserId) {
          return { ...chat, displayName: 'Чат', avatar_url: null };
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', otherUserId)
          .single();

        return {
          ...chat,
          displayName: profile?.username || 'Без имени',
          avatar_url: profile?.avatar_url || null,
        };
      })
    );

    return chatsWithNames;
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

  deleteChat: async (chatId: number) => {
    const { error: err1 } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId);
    if (err1) throw err1;

    const { error: err2 } = await supabase
      .from('chat_participants')
      .delete()
      .eq('chat_id', chatId);
    if (err2) throw err2;

    const { error: err3 } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);
    if (err3) throw err3;
  },

  toggleReaction: async (messageId: number, userId: string, emoji: string) => {
    const { data: existing, error: findError } = await supabase
      .from('reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single();

    if (findError && findError.code !== 'PGRST116') throw findError;

    if (existing) {
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existing.id);
      if (deleteError) throw deleteError;
      return null;
    } else {
      const { data, error } = await supabase
        .from('reactions')
        .insert([{ message_id: messageId, user_id: userId, emoji }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  getReactions: async (messageIds: number[]) => {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .in('message_id', messageIds);
    if (error) throw error;
    return data || [];
  },

  searchUsers: async (query: string, currentUserId: string) => {
    if (!query.trim() || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query.trim()}%`)
        .neq('id', currentUserId)
        .limit(10);

      if (error) {
        console.error('Ошибка поиска:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Ошибка поиска:', error);
      return [];
    }
  },

  createChat: async (userId: string, otherUserId: string) => {
    const { data: existing, error: findError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', userId);

    if (findError) throw findError;

    const chatIds = existing?.map((p) => p.chat_id) || [];
    if (chatIds.length > 0) {
      const { data: common, error: commonError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', otherUserId)
        .in('chat_id', chatIds);

      if (commonError) throw commonError;

      if (common && common.length > 0) {
        return common[0].chat_id;
      }
    }

    const { data: newChat, error: createError } = await supabase
      .from('chats')
      .insert([{ name: null, is_private: true }])
      .select()
      .single();

    if (createError) throw createError;

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { chat_id: newChat.id, user_id: userId },
        { chat_id: newChat.id, user_id: otherUserId },
      ]);

    if (participantsError) throw participantsError;

    return newChat.id;
  },

  markMessagesAsRead: async (chatId: number, userId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  uploadAvatar: async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  await supabase.storage.from('avatars').remove([filePath]);

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const avatarUrl = data?.publicUrl || null;

  await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId);

  return avatarUrl;
},

  uploadFile: async (chatId: number, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${chatId}/${Date.now()}.${fileExt}`;
    const filePath = `chat-files/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('novagram-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('novagram-files').getPublicUrl(filePath);
    return data?.publicUrl || null;
  },
};