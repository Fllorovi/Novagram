import { create } from 'zustand';

export type Theme = 'light' | 'dark';

export type ColorPalette =
  | 'default'
  | 'ocean'
  | 'forest'
  | 'lavender'
  | 'amber';

interface ThemeState {
  theme: Theme;
  palette: ColorPalette;

  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setPalette: (palette: ColorPalette) => void;
}

const savedTheme = localStorage.getItem('theme') as Theme | null;
const savedPalette = localStorage.getItem('palette') as ColorPalette | null;

export const useThemeStore = create<ThemeState>((set) => ({
  theme: savedTheme || 'dark',
  palette: savedPalette || 'default',

  toggleTheme: () => {
    set((state) => {
      const newTheme =
        state.theme === 'dark' ? 'light' : 'dark';

      localStorage.setItem('theme', newTheme);

      return {
        theme: newTheme,
      };
    });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  setPalette: (palette) => {
    localStorage.setItem('palette', palette);
    set({ palette });
  },
}));