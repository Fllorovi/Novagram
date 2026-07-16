import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChats } from '../hooks/useChats';
import { useRealtimeMessages } from '../hooks/useRealtime';
import { usePresence } from '../hooks/usePresence';
import { useReactions } from '../hooks/useReactions';
import { chatsApi } from '../api/chatsApi';
import { supabase } from '../api/supabaseClient';
import type { Chat, Message } from '../types/chat.types';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ReactionPicker } from '../components/ui/ReactionPicker';
import { formatMessageDate } from '../utils/dateUtils';
import { UserSearch } from '../components/ui/UserSearch';
import { SidebarMenu } from '../components/sidebar/SidebarMenu';
import { UserProfileModal } from '../components/ui/UserProfileModal';

export const ChatPage = () => {
  const { user, signOut } = useAuthStore();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { chats, loading: chatsLoading, setChats, refreshChats } = useChats(user?.id || null);
  const { messages, loading: messagesLoading } = useRealtimeMessages(selectedChat?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
  }>({
    isOpen: false,
    userId: '',
    username: '',
    avatarUrl: null,
    bio: null,
  });
const [otherUser, setOtherUser] = useState<{
  username: string | null;
  avatar_url: string | null;
  user_id?: string;
} | null>(null);

  const { onlineUsers, isTyping, sendTyping } = usePresence(
    selectedChat?.id || null,
    user?.id || null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messageIds = messages.map((m) => m.id);
  const { toggleReaction, getReactionsForMessage } = useReactions(
    messageIds,
    user?.id || null
  );

  const [reactionPicker, setReactionPicker] = useState<{
    isOpen: boolean;
    messageId: number | null;
    x: number;
    y: number;
  }>({
    isOpen: false,
    messageId: null,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedChat || !user) return;

    const markAndRefresh = async () => {
      try {
        await chatsApi.markMessagesAsRead(selectedChat.id, user.id);
        await refreshChats();
      } catch (error) {
        console.error('Ошибка при отметке прочитанных:', error);
      }
    };

    markAndRefresh();

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
    user_id: otherUserId,
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

  const handleOpenProfile = async (chat: Chat) => {
    const otherUserId = chat.otherUserId;
    if (!otherUserId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .eq('id', otherUserId)
        .single();

      if (error) {
        console.error('Ошибка загрузки профиля:', error);
        return;
      }

      if (data) {
        setProfileModal({
          isOpen: true,
          userId: data.id,
          username: data.username || 'Пользователь',
          avatarUrl: data.avatar_url,
          bio: data.bio || null,
        });
      }
    } catch (error) {
      console.error('Ошибка:', error);
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
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-[var(--bg-secondary)] border-r border-[var(--border)]
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex flex-col
        `}
      >
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-[var(--text-primary)] p-1 text-2xl hover:bg-[var(--bg-input)] rounded-lg transition flex-shrink-0"
            aria-label="Открыть меню"
          >
            ☰
          </button>
          <UserSearch
            currentUserId={user?.id || ''}
            onChatCreated={(chatId) => {
              setSelectedChat(null);
              window.location.reload();
            }}
          />
        </div>

        <ul className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
<li
  key={chat.id}
  className={`flex items-center p-4 cursor-pointer hover:bg-[var(--bg-input)] border-b border-[var(--border)] ${
    selectedChat?.id === chat.id ? 'bg-[var(--bg-input)]' : ''
  }`}
  onClick={() => {
    setSelectedChat(chat);
    setIsSidebarOpen(false);
  }}
  onContextMenu={(e) => {
    e.preventDefault();
    handleDeleteChat(chat.id, chat.displayName || 'Чат');
  }}
>
              <img
                src={chat.avatar_url || `https://ui-avatars.com/api/?name=${chat.displayName || 'Ч'}&background=3ECF8E&color=fff&size=48`}
                alt="Аватар"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[var(--text-primary)] truncate">
                    {chat.displayName || 'Чат'}
                  </span>
                  {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="p-4 border-t border-[var(--border)] text-sm text-[var(--text-secondary)] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=3ECF8E&color=fff&size=32`}
              alt="Аватар"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <span className="truncate">{user?.username || user?.email || 'Пользователь'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 text-xs font-medium flex-shrink-0"
          >
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[var(--bg-primary)] min-w-0">
        <header
  className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-input)] transition"
  onClick={async () => {
    if (!selectedChat || !otherUser?.user_id) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio')
      .eq('id', otherUser.user_id)
      .single();

    if (data) {
      setProfileModal({
        isOpen: true,
        userId: data.id,
        username: data.username || 'Пользователь',
        avatarUrl: data.avatar_url,
        bio: data.bio || null,
      });
    }
  }}
>
  {/* Бургер для мобилок */}
  <button
    className="lg:hidden text-[var(--text-primary)] p-1 text-2xl hover:bg-[var(--bg-input)] rounded-lg transition flex-shrink-0"
    onClick={(e) => {
      e.stopPropagation();
      setIsSidebarOpen(true);
    }}
    aria-label="Открыть чаты"
  >
    ☰
  </button>

  {selectedChat ? (
    <>
      <img
        src={otherUser?.avatar_url || `https://ui-avatars.com/api/?name=${otherUser?.username || 'Ч'}&background=3ECF8E&color=fff&size=40`}
        alt="Аватар"
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[var(--text-primary)] truncate">
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
    </>
  ) : (
    <div className="min-w-0 flex-1">
      <h3 className="font-semibold text-[var(--text-primary)]">Novagram</h3>
      <span className="text-xs text-[var(--text-muted)]">Выберите чат</span>
    </div>
  )}
</header>

        {selectedChat ? (
          <>
            <div className="flex-1 p-4 overflow-y-auto bg-[var(--bg-primary)] space-y-3">
              {messagesLoading && (
                <p className="text-center text-[var(--text-muted)]">Загрузка сообщений...</p>
              )}

              {messages.map((msg, index) => {
                const showDate =
                  index === 0 ||
                  new Date(msg.created_at).toDateString() !==
                    new Date(messages[index - 1].created_at).toDateString();

                const reactions = getReactionsForMessage(msg.id);

                return (
                  <Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border)]">
                          {formatMessageDate(new Date(msg.created_at))}
                        </span>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] sm:max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-[var(--accent)] text-white self-end ml-auto'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]'
                      }`}
                      onDoubleClick={() => toggleReaction(msg.id, '❤️')}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setReactionPicker({
                          isOpen: true,
                          messageId: msg.id,
                          x: rect.left + rect.width / 2 - 80,
                          y: rect.top - 10,
                        });
                      }}
                    >
                      {(() => {
                        try {
                          const parsed = JSON.parse(msg.content);
                          if (parsed.type === 'image') {
                            return (
                              <img
                                src={parsed.url}
                                alt="Фото"
                                className="max-w-full rounded-lg cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(parsed.url, '_blank');
                                }}
                              />
                            );
                          } else if (parsed.type === 'file') {
                            return (
                              <a
                                href={parsed.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                📎 {parsed.name}
                              </a>
                            );
                          }
                        } catch {
                          return <p className="break-words">{msg.content}</p>;
                        }
                      })()}

                      <span className="text-xs opacity-70 block mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {reactions.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {reactions.map((r) => (
                            <span key={r.id} className="text-sm">
                              {r.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Fragment>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex gap-2 items-center"
            >
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept="image/*,video/*,application/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !selectedChat || !user) return;

                  try {
                    const fileUrl = await chatsApi.uploadFile(selectedChat.id, file);
                    const content = JSON.stringify({
                      type: file.type.startsWith('image/') ? 'image' : 'file',
                      url: fileUrl,
                      name: file.name,
                    });
                    await chatsApi.sendMessage(selectedChat.id, user.id, content);
                    e.target.value = '';
                  } catch (error) {
                    console.error('Ошибка отправки файла:', error);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => document.getElementById('fileInput')?.click()}
                className="bg-[var(--bg-input)] text-[var(--text-primary)] p-2 rounded-full hover:bg-[var(--border)] transition flex items-center justify-center w-10 h-10 flex-shrink-0"
                title="Прикрепить файл"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                  />
                </svg>
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  sendTyping();
                }}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border)] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all min-w-0"
              />

              <button
                type="submit"
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-full transition flex-shrink-0"
              >
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] p-4 text-center">
            Выберите чат для начала общения
          </div>
        )}
      </main>

      <ReactionPicker
        isOpen={reactionPicker.isOpen}
        onClose={() =>
          setReactionPicker({ isOpen: false, messageId: null, x: 0, y: 0 })
        }
        onSelect={(emoji) => {
          if (reactionPicker.messageId) {
            toggleReaction(reactionPicker.messageId, emoji);
          }
        }}
        position={{ x: reactionPicker.x, y: reactionPicker.y }}
      />

      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        userId={profileModal.userId}
        username={profileModal.username}
        avatarUrl={profileModal.avatarUrl}
        bio={profileModal.bio}
      />
    </div>
  );
};