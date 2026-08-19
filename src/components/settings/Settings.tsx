import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="h-16 flex items-center gap-3 px-5 border-b border-[var(--border)]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl hover:bg-[var(--bg-input)] transition text-xl"
        >
          ←
        </button>

        <h1 className="text-xl font-semibold">
          Настройки
        </h1>
      </header>

      <main className="max-w-2xl mx-auto p-5">
        <section>
          <p className="text-sm text-[var(--text-muted)] mb-3">
            Чат
          </p>

          <button
            onClick={() => navigate('/settings/chat')}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-input)] transition border border-[var(--border)]"
          >
            <div className="text-left">
              <div className="font-medium">
                Настройки чата
              </div>

              <div className="text-sm text-[var(--text-muted)] mt-1">
                Оформление и цветовая палитра
              </div>
            </div>

            <span className="text-xl text-[var(--text-muted)]">
              ›
            </span>
          </button>
        </section>

        <section className="mt-8">
          <p className="text-sm text-[var(--text-muted)] mb-3">
            Прочее
          </p>

          <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
            <button
              disabled
              className="w-full flex items-center justify-between px-4 py-4 text-left opacity-50"
            >
              <span>Уведомления</span>
              <span>›</span>
            </button>

            <div className="h-px bg-[var(--border)]" />

            <button
              disabled
              className="w-full flex items-center justify-between px-4 py-4 text-left opacity-50"
            >
              <span>Язык</span>
              <span>›</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;