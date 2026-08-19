import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { palettes } from './themes/palettes';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

import { useEffect, useState } from 'react';

import { UpdateModal } from './components/ui/UpdateModal';
import type { UpdateInfo } from './utils/updater';
import { checkForUpdate } from './utils/updater';

import { initPushNotifications } from './utils/pushNotifications';

function App() {
  const { user, isLoading } = useAuthStore();

  const { theme, palette } = useThemeStore();

  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  /*
   * Применяем выбранную тему и палитру
   */
  useEffect(() => {
    const selectedPalette = palettes.find(
      (item) => item.id === palette
    );

    if (!selectedPalette) {
      return;
    }

    const colors =
      theme === 'dark'
        ? selectedPalette.dark
        : selectedPalette.light;

    const root = document.documentElement;

    /*
     * Текущая тема
     */
    root.setAttribute('data-theme', theme);

    /*
     * Текущая палитра
     */
    root.setAttribute('data-palette', palette);

    /*
     * Цветовые CSS-переменные
     */
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-hover', colors.accentHover);

    root.style.setProperty('--bg-primary', colors.bgPrimary);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--bg-input', colors.bgInput);

    root.style.setProperty('--border', colors.border);

    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
  }, [theme, palette]);

  /*
   * Push-уведомления
   */
  useEffect(() => {
    initPushNotifications();
  }, []);

  /*
   * Проверка обновлений приложения
   */
  useEffect(() => {
    const checkUpdate = async () => {
      console.log('UPDATE: начинаем проверку');

      const updateInfo = await checkForUpdate();

      console.log('UPDATE: результат:', updateInfo);

      if (updateInfo) {
        console.log('UPDATE: вызываем setUpdate');
        setUpdate(updateInfo);
      }
    };

    checkUpdate();
  }, []);

  /*
   * Экран загрузки
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <p className="text-text-primary">
          Загрузка...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {update && (
        <UpdateModal
          update={update}
          onClose={() => setUpdate(null)}
        />
      )}

      <BrowserRouter>
        <Routes>
          <Route
            path="/profile"
            element={
              user
                ? <ProfilePage />
                : <Navigate to="/login" />
            }
          />

          <Route
            path="/"
            element={
              user
                ? <ChatPage />
                : <Navigate to="/login" />
            }
          />

          <Route
            path="/login"
            element={
              user
                ? <Navigate to="/" />
                : <LoginPage />
            }
          />

          <Route
            path="/register"
            element={
              user
                ? <Navigate to="/" />
                : <RegisterPage />
            }
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

