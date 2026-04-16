import { useEffect, useCallback, useRef } from 'react';

export interface TallyKeyboardConfig {
  itemCount: number;
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  onSelect: (index: number) => void;
  onBack: () => void;
  onLetterJump?: (letter: string, items: string[]) => number | null;
  fKeyHandlers?: Record<string, () => void>;
  enabled?: boolean;
}

export const useTallyKeyboard = (config: TallyKeyboardConfig) => {
  const {
    itemCount,
    selectedIndex,
    onIndexChange,
    onSelect,
    onBack,
    fKeyHandlers = {},
    enabled = true,
  } = config;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onIndexChange(selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onIndexChange(selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      onIndexChange(Math.min(selectedIndex + 10, itemCount - 1));
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      onIndexChange(Math.max(selectedIndex - 10, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onIndexChange(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onIndexChange(itemCount - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSelect(selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onBack();
    }

    // F-key handlers
    const fKey = e.key; // F1, F2, etc.
    if (fKey.startsWith('F') && fKey.length <= 3) {
      const handler = fKeyHandlers[fKey];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    // Ctrl combinations
    if (e.ctrlKey) {
      const ctrlKey = `Ctrl+${e.key.toUpperCase()}`;
      const handler = fKeyHandlers[ctrlKey];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    // Alt combinations
    if (e.altKey) {
      const altKey = `Alt+${e.key.toUpperCase()}`;
      const handler = fKeyHandlers[altKey];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }
  }, [enabled, itemCount, selectedIndex, onIndexChange, onSelect, onBack, fKeyHandlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook for managing screen-level focus
export const useTallyFocus = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
};
