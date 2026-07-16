import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <>
      <div
        className={`
          fixed inset-0 bg-black/50 z-50 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      <div
        className={`
          fixed left-0 top-0 h-full w-80 bg-[var(--bg-secondary)] border-r border-[var(--border)] z-[60] shadow-2xl flex flex-col p-6
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={onClose}
          className="self-end text-[var(--text-primary)] p-1 text-2xl hover:bg-[var(--bg-input)] rounded-lg transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-4 mt-4">
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=3ECF8E&color=fff&size=64`}
            alt="Аватар"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              {user?.username || user?.email || 'Пользователь'}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">онлайн</p>
          </div>
        </div>

        <ul className="mt-8 space-y-2">
          <li>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-primary)] transition">
              👤 Мой профиль
            </button>
          </li>
          <li>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-primary)] transition">
              ⚙️ Настройки
            </button>
          </li>

          {/* iOS-переключатель темы */}
          <li className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[var(--bg-input)] transition">
            <span className="text-[var(--text-primary)]">🌙 Тёмная тема</span>
            <button
              onClick={toggleTheme}
              className={`
                relative w-12 h-7 rounded-full transition-colors duration-300 flex-shrink-0
                ${theme === 'dark' ? 'bg-[var(--accent)]' : 'bg-gray-400'}
              `}
            >
              <span
                className={`
                  absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300
                  ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </li>
        </ul>

        <button
          onClick={async () => {
            await signOut();
            window.location.href = '/login';
          }}
          className="mt-auto text-red-500 hover:text-red-700 text-sm font-medium text-left px-4 py-3 rounded-lg hover:bg-[var(--bg-input)] transition"
        >
          🚪 Выйти
        </button>
      </div>
    </>
  );
};