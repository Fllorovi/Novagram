import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChats } from '../hooks/useChats';
import { useRealtimeMessages } from '../hooks/useRealtime';
import { usePresence } from '../hooks/usePresence';
import { chatsApi } from '../api/chatsApi';
import { supabase } from '../api/supabaseClient';
import type { Chat, Message } from '../types/chat.types';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { formatMessageDate } from '../utils/dateUtils';

export const ChatPage = () => {
  const { user, signOut } = useAuthStore();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { chats, loading: chatsLoading, setChats } = useChats(user?.id || null);
  const { messages, loading: messagesLoading } = useRealtimeMessages(selectedChat?.id || null);
  const [newMessage, setNewMessage] = useState('');

  const [otherUser, setOtherUser] = useState<{
    username: string | null;
    avatar_url: string | null;
  } | null>(null);

  const { onlineUsers, isTyping, sendTyping } = usePresence(
    selectedChat?.id || null,
    user?.id || null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedChat || !user) return;

    const loadOtherUser = async () => {
      const { data: participants, error: err1 } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', selectedChat.id);

      if (err1 || !participants) return;

      const otherUserId = participants
        .map((p) => p.user_id)
        .find((id) => id !== user.id);

      if (!otherUserId) {
        setOtherUser(null);
        return;
      }

      const { data: profile, error: err2 } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', otherUserId)
        .single();

      if (err2 || !profile) {
        setOtherUser(null);
        return;
      }

      setOtherUser({
        username: profile.username || 'Без имени',
        avatar_url: profile.avatar_url || null,
      });
    };

    loadOtherUser();
  }, [selectedChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      await chatsApi.sendMessage(selectedChat.id, user.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const handleDeleteChat = async (chatId: number, chatName: string) => {
    if (window.confirm(`Удалить чат "${chatName || 'Чат'}"?`)) {
      try {
        await chatsApi.deleteChat(chatId);
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
        }
      } catch (error) {
        console.error('Ошибка удаления чата:', error);
        alert('Не удалось удалить чат.');
      }
    }
  };

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <p className="text-[var(--text-primary)]">Загрузка чатов...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Сайдбар */}
      <aside className="w-80 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Чаты</h2>
          <ThemeToggle />
        </div>
        <ul className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className={`flex items-center p-4 cursor-pointer hover:bg-[var(--bg-input)] border-b border-[var(--border)] ${
                selectedChat?.id === chat.id ? 'bg-[var(--bg-input)]' : ''
              }`}
              onClick={() => setSelectedChat(chat)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleDeleteChat(chat.id, chat.displayName || 'Чат');
              }}
            >
              <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white mr-4 font-semibold">
                {chat.displayName?.[0] || 'Ч'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-medium text-[var(--text-primary)]">
                    {chat.displayName || 'Чат'}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-[var(--border)] text-sm text-[var(--text-secondary)] flex items-center justify-between">
          <span>{user?.username || user?.email || 'Пользователь'}</span>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 text-xs font-medium"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Окно чата */}
      <main className="flex-1 flex flex-col bg-[var(--bg-primary)]">
        {selectedChat ? (
          <>
            <header
              className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center"
              onContextMenu={(e) => {
                e.preventDefault();
                handleDeleteChat(selectedChat.id, otherUser?.username || 'Чат');
              }}
            >
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white mr-4 font-semibold">
                {otherUser?.username?.[0] || 'Ч'}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {otherUser?.username || 'Чат'}
                </h3>
                <span className="text-xs">
                  {onlineUsers.length > 0 ? (
                    <span className="text-[var(--accent)]">онлайн</span>
                  ) : (
                    <span className="text-[var(--text-muted)]">офлайн</span>
                  )}
                  {isTyping && (
                    <span className="text-[var(--accent)] ml-2">печатает...</span>
                  )}
                </span>
              </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto bg-[var(--bg-primary)] space-y-3">
  {messagesLoading && <p className="text-center text-[var(--text-muted)]">Загрузка сообщений...</p>}

  {messages.map((msg, index) => {
    // Проверяем, нужно ли показывать разделитель
    const showDate = index === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

    return (
      <React.Fragment key={msg.id}>
        {showDate && (
          <div className="flex justify-center my-4">
            <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border)]">
              {formatMessageDate(new Date(msg.created_at))}
            </span>
          </div>
        )}
        <div
          className={`max-w-xs px-4 py-2 rounded-lg ${
            msg.sender_id === user?.id
              ? 'bg-[var(--accent)] text-white self-end ml-auto'
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          <p>{msg.content}</p>
          <span className="text-xs opacity-70 block mt-1">
            {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </React.Fragment>
    );
  })}

  <div ref={messagesEndRef} />
</div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  sendTyping();
                }}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border)] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              />
              <button
                type="submit"
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-full transition"
              >
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            Выберите чат для начала общения
          </div>
        )}
      </main>
    </div>
  );
};