import type { Theme } from '../store/themeStore';
import { palettes } from './palettes';

export const applyTheme = (
  theme: Theme,
  paletteId: typeof palettes[number]['id'],
) => {
  const palette = palettes.find((p) => p.id === paletteId);

  if (!palette) return;

  const colors =
    theme === 'dark'
      ? palette.dark
      : palette.light;

  const root = document.documentElement;

  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-hover', colors.accentHover);

  root.style.setProperty('--bg-primary', colors.bgPrimary);
  root.style.setProperty('--bg-secondary', colors.bgSecondary);
  root.style.setProperty('--bg-input', colors.bgInput);

  root.style.setProperty('--border', colors.border);

  root.style.setProperty('--text-primary', colors.textPrimary);
  root.style.setProperty('--text-secondary', colors.textSecondary);
  root.style.setProperty('--text-muted', colors.textMuted);

  root.dataset.theme = theme;
  root.dataset.palette = paletteId;
};