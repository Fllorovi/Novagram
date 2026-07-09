import React, { useState, useEffect, useRef } from 'react';
import { chatsApi } from '../../api/chatsApi';

interface UserSearchProps {
  currentUserId: string;
  onChatCreated: (chatId: number) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  currentUserId,
  onChatCreated,
}) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!query.trim() || query.length < 2) {
        setUsers([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const results = await chatsApi.searchUsers(query, currentUserId);
        setUsers(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Ошибка поиска:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, currentUserId]);

  const handleSelectUser = async (user: any) => {
    try {
      const chatId = await chatsApi.createChat(currentUserId, user.id);
      onChatCreated(chatId);
      setQuery('');
      setUsers([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  };

  return (
    <div ref={wrapperRef} className="relative px-4 py-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск пользователей..."
        className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border)] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
      />

      {isOpen && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-[var(--text-muted)] text-center">Поиск...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-[var(--text-muted)] text-center">Пользователи не найдены</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center gap-3 p-3 hover:bg-[var(--bg-input)] cursor-pointer transition"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold">
                  {user.username?.[0] || user.email?.[0] || '?'}
                </div>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    {user.username || user.email}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">{user.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};