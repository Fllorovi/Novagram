import React from 'react';

interface ReactionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  position: { x: number; y: number };
}

const EMOJIS = ['❤️', '😂', '🔥', '👍', '😍', '🤯', '💩', '👀'];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  position,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl p-2 flex gap-1"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translateY(-100%)',
        }}
      >
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="w-10 h-10 text-xl hover:bg-[var(--bg-input)] rounded-lg transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};