import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Palette {
  id: string;
  name: string;
  colors: {
    background: string;
    secondary: string;
    input: string;
    accent: string;
    messageOwn: string;
    messageOther: string;
  };
}

const palettes: Palette[] = [
  {
    id: 'amber',
    name: 'Amber',
    colors: {
      background: '#191512',
      secondary: '#241e19',
      input: '#302820',
      accent: '#c58b52',
      messageOwn: '#8b6340',
      messageOther: '#302820',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      background: '#101820',
      secondary: '#17232d',
      input: '#21313d',
      accent: '#4da3d9',
      messageOwn: '#246487',
      messageOther: '#21313d',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      background: '#111914',
      secondary: '#19231c',
      input: '#243127',
      accent: '#6da36f',
      messageOwn: '#416f4b',
      messageOther: '#243127',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    colors: {
      background: '#17141c',
      secondary: '#211c29',
      input: '#2c2636',
      accent: '#a987d4',
      messageOwn: '#69518b',
      messageOther: '#2c2636',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: {
      background: '#1b1417',
      secondary: '#271b20',
      input: '#35242a',
      accent: '#c77b91',
      messageOwn: '#824b60',
      messageOther: '#35242a',
    },
  },
  {
    id: 'graphite',
    name: 'Graphite',
    colors: {
      background: '#121212',
      secondary: '#1c1c1c',
      input: '#292929',
      accent: '#8c8c8c',
      messageOwn: '#4b4b4b',
      messageOther: '#292929',
    },
  },
];

const applyPalette = (palette: Palette) => {
  const root = document.documentElement;

  root.style.setProperty('--bg-primary', palette.colors.background);
  root.style.setProperty('--bg-secondary', palette.colors.secondary);
  root.style.setProperty('--bg-input', palette.colors.input);
  root.style.setProperty('--accent', palette.colors.accent);
  root.style.setProperty('--message-own', palette.colors.messageOwn);
  root.style.setProperty('--message-other', palette.colors.messageOther);

  localStorage.setItem('novagram-palette', palette.id);
};

const ChatSettings: React.FC = () => {
  const navigate = useNavigate();

  const [selectedPalette, setSelectedPalette] = useState(
    () => localStorage.getItem('novagram-palette') || 'amber',
  );

  useEffect(() => {
    const savedPalette = localStorage.getItem('novagram-palette');

    const palette =
      palettes.find((item) => item.id === savedPalette) ||
      palettes[0];

    applyPalette(palette);
    setSelectedPalette(palette.id);
  }, []);

  const handlePaletteChange = (palette: Palette) => {
    applyPalette(palette);
    setSelectedPalette(palette.id);
  };

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
          Настройки чата
        </h1>
      </header>

      <main className="max-w-3xl mx-auto p-5">
        <h2 className="text-lg font-semibold">
          Оформление
        </h2>

        <p className="text-sm text-[var(--text-muted)] mt-1 mb-5">
          Выберите цветовую палитру интерфейса
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {palettes.map((palette) => {
            const selected = selectedPalette === palette.id;

            return (
              <button
                key={palette.id}
                onClick={() => handlePaletteChange(palette)}
                className={`
                  relative text-left rounded-2xl overflow-hidden
                  border-2 transition-all duration-200
                  ${
                    selected
                      ? 'border-[var(--accent)] scale-[1.01]'
                      : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                  }
                `}
              >
                <div
                  className="h-32 p-4"
                  style={{
                    background: palette.colors.background,
                  }}
                >
                  <div
                    className="rounded-xl p-3 h-full"
                    style={{
                      background: palette.colors.secondary,
                    }}
                  >
                    <div
                      className="w-2/3 h-3 rounded-full mb-3"
                      style={{
                        background: palette.colors.input,
                      }}
                    />

                    <div className="flex justify-end">
                      <div
                        className="px-4 py-2 rounded-xl text-xs"
                        style={{
                          background: palette.colors.messageOwn,
                        }}
                      >
                        Сообщение
                      </div>
                    </div>

                    <div
                      className="w-1/2 h-2 rounded-full mt-3"
                      style={{
                        background: palette.colors.accent,
                      }}
                    />
                  </div>
                </div>

                <div className="px-4 py-3 bg-[var(--bg-secondary)]">
                  <div className="font-medium">
                    {palette.name}
                  </div>

                  <div className="flex gap-2 mt-2">
                    {Object.values(palette.colors).slice(0, 5).map(
                      (color) => (
                        <span
                          key={color}
                          className="w-5 h-5 rounded-full border border-white/10"
                          style={{ background: color }}
                        />
                      ),
                    )}
                  </div>
                </div>

                {selected && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
 
export default ChatSettings;