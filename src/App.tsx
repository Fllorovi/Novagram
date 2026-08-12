import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import { useEffect } from 'react';
import { checkForUpdate } from './utils/updater';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  const { user, isLoading } = useAuthStore();
  const { theme } = useThemeStore();

  // Принудительно устанавливаем data-theme на корневой элемент
  useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
useEffect(() => {
  const checkUpdate = async () => {
    const update = await checkForUpdate();

    if (update) {
      console.log(
        `Novagram: доступно обновление ${update.currentVersion} → ${update.latestVersion}`
      );
      console.log('APK:', update.apkUrl);
      console.log('Изменения:', update.releaseNotes);
    } else {
      console.log('Novagram: обновлений нет');
    }
  };

  checkUpdate();
}, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <p className="text-text-primary">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <BrowserRouter>
        <Routes>
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/" element={user ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}


export default App;