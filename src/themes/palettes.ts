import type { ColorPalette } from '../store/themeStore';

export interface Palette {
  id: ColorPalette;
  name: string;
  description: string;

  dark: {
    accent: string;
    accentHover: string;
    bgPrimary: string;
    bgSecondary: string;
    bgInput: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
  };

  light: {
    accent: string;
    accentHover: string;
    bgPrimary: string;
    bgSecondary: string;
    bgInput: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
  };
}

export const palettes: Palette[] = [
  {
    id: 'default',
    name: 'Novagram',
    description: 'Стандартное оформление',

    dark: {
      accent: '#3ECF8E',
      accentHover: '#32B97D',
      bgPrimary: '#111111',
      bgSecondary: '#181818',
      bgInput: '#222222',
      border: '#2A2A2A',
      textPrimary: '#FFFFFF',
      textSecondary: '#CCCCCC',
      textMuted: '#888888',
    },

    light: {
      accent: '#20A86B',
      accentHover: '#188F59',
      bgPrimary: '#F7F7F7',
      bgSecondary: '#FFFFFF',
      bgInput: '#EEEEEE',
      border: '#DDDDDD',
      textPrimary: '#111111',
      textSecondary: '#555555',
      textMuted: '#888888',
    },
  },

  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Холодная синяя палитра',

    dark: {
      accent: '#4DA3FF',
      accentHover: '#368DE6',
      bgPrimary: '#0D141C',
      bgSecondary: '#111D28',
      bgInput: '#192735',
      border: '#263746',
      textPrimary: '#F5F9FF',
      textSecondary: '#B8C7D9',
      textMuted: '#718096',
    },

    light: {
      accent: '#287FD4',
      accentHover: '#1F6DB8',
      bgPrimary: '#F3F8FC',
      bgSecondary: '#FFFFFF',
      bgInput: '#E7F0F7',
      border: '#D2E0EB',
      textPrimary: '#102030',
      textSecondary: '#526579',
      textMuted: '#8292A2',
    },
  },

  {
    id: 'forest',
    name: 'Forest',
    description: 'Спокойные зелёные оттенки',

    dark: {
      accent: '#6DBB7B',
      accentHover: '#5AA968',
      bgPrimary: '#101712',
      bgSecondary: '#162019',
      bgInput: '#202C23',
      border: '#2C3A30',
      textPrimary: '#F3F8F3',
      textSecondary: '#B9C8BA',
      textMuted: '#7D8D7F',
    },

    light: {
      accent: '#438F51',
      accentHover: '#377B44',
      bgPrimary: '#F3F8F3',
      bgSecondary: '#FFFFFF',
      bgInput: '#E7F0E8',
      border: '#D2E0D4',
      textPrimary: '#172219',
      textSecondary: '#526456',
      textMuted: '#829286',
    },
  },

  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Мягкие фиолетовые оттенки',

    dark: {
      accent: '#A78BFA',
      accentHover: '#9175E8',
      bgPrimary: '#14121A',
      bgSecondary: '#1C1924',
      bgInput: '#282333',
      border: '#352F42',
      textPrimary: '#F8F6FF',
      textSecondary: '#C8C1D8',
      textMuted: '#898197',
    },

    light: {
      accent: '#805AD5',
      accentHover: '#6F4CC2',
      bgPrimary: '#F8F6FC',
      bgSecondary: '#FFFFFF',
      bgInput: '#EEEAF7',
      border: '#DDD6EC',
      textPrimary: '#211B2B',
      textSecondary: '#625B70',
      textMuted: '#898197',
    },
  },

  {
    id: 'amber',
    name: 'Amber Dusk',
    description: 'Тёплое сумеречное оформление',

    dark: {
      accent: '#D89B5B',
      accentHover: '#C68848',
      bgPrimary: '#171411',
      bgSecondary: '#211B16',
      bgInput: '#2B241D',
      border: '#3A3027',
      textPrimary: '#FFF8EF',
      textSecondary: '#D5C5B3',
      textMuted: '#958575',
    },

    light: {
      accent: '#B87532',
      accentHover: '#9E6128',
      bgPrimary: '#FBF7F2',
      bgSecondary: '#FFFFFF',
      bgInput: '#F1E8DE',
      border: '#E2D5C7',
      textPrimary: '#2A2119',
      textSecondary: '#68594C',
      textMuted: '#958575',
    },
  },
];