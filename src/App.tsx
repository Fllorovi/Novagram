import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import { useEffect, useState } from 'react';
import { UpdateModal } from './components/ui/UpdateModal';
import type { UpdateInfo } from './utils/updater';
import { checkForUpdate } from './utils/updater';
import { ProfilePage } from './pages/ProfilePage';
import { initPushNotifications } from './utils/pushNotifications';

function App() {
  const { user, isLoading } = useAuthStore();
  const { theme } = useThemeStore();
  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  // Принудительно устанавливаем data-theme на корневой элемент
  useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
useEffect(() => {
  initPushNotifications();
}, []);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <p className="text-text-primary">Загрузка...</p>
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