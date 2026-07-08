import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white',
    secondary: 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border)]',
    ghost: 'bg-transparent hover:bg-[var(--bg-input)] text-[var(--text-secondary)]',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        variantClasses[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Загрузка...' : children}
    </button>
  );
};