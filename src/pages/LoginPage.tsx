import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email.trim(), password.trim());
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border)] transition-colors duration-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Novagram
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">Войди в свою вселенную</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] transition-all"
            required
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] transition-all"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
          >
            Войти
          </Button>
        </form>

        <p className="mt-6 text-center text-[var(--text-secondary)]">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-[var(--accent)] hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};