import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { palettes } from '../themes/palettes';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    theme,
    palette,
    toggleTheme,
    setPalette,
  } = useThemeStore();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-10 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-[var(--bg-input)] transition flex items-center justify-center"
            aria-label="Назад"
          >
            ←
          </button>

          <h1 className="text-xl font-semibold">
            Настройки
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
            Настройки чата
          </h2>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-input)] transition"
            >
              <div className="text-left">
                <div className="font-medium">
                  Тёмная тема
                </div>

                <div className="text-sm text-[var(--text-muted)] mt-1">
                  {theme === 'dark'
                    ? 'Используется тёмное оформление'
                    : 'Используется светлое оформление'}
                </div>
              </div>

              <div
                className={`
                  relative w-12 h-7 rounded-full transition-colors
                  ${theme === 'dark'
                    ? 'bg-[var(--accent)]'
                    : 'bg-gray-400'}
                `}
              >
                <span
                  className={`
                    absolute top-1 left-1 w-5 h-5 rounded-full bg-white
                    transition-transform
                    ${theme === 'dark'
                      ? 'translate-x-5'
                      : 'translate-x-0'}
                  `}
                />
              </div>
            </button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
            Оформление
          </h2>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-5">
            <div className="mb-5">
              <h3 className="font-medium">
                Цветовая палитра
              </h3>

              <p className="text-sm text-[var(--text-muted)] mt-1">
                Выберите цветовое оформление Novagram
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {palettes.map((item) => {
                const colors =
                  theme === 'dark'
                    ? item.dark
                    : item.light;

                const selected = palette === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setPalette(item.id)}
                    className={`
                      relative text-left p-4 rounded-xl border-2
                      transition-all
                      ${
                        selected
                          ? 'border-[var(--accent)]'
                          : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                      }
                    `}
                  >
                    <div
                      className="h-16 rounded-lg mb-3 flex items-end gap-1 p-2"
                      style={{
                        background: colors.bgPrimary,
                      }}
                    >
                      <span
                        className="w-8 h-8 rounded-md"
                        style={{
                          background: colors.accent,
                        }}
                      />

                      <span
                        className="w-8 h-8 rounded-md"
                        style={{
                          background: colors.bgInput,
                        }}
                      />

                      <span
                        className="w-8 h-8 rounded-md"
                        style={{
                          background: colors.bgSecondary,
                        }}
                      />
                    </div>

                    <div className="font-medium">
                      {item.name}
                    </div>

                    <div className="text-sm text-[var(--text-muted)] mt-1">
                      {item.description}
                    </div>

                    {selected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};