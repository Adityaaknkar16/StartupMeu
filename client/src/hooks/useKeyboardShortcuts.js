import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
  onOpenCommandPalette,
  onNewTask,
  onFocusSearch,
  onOpenHelp,
  onEscape
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger single-letter shortcuts when typing in inputs or textareas
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      // Ctrl+K or Cmd+K: Open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      // Single-key shortcuts only outside active inputs
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          onNewTask?.();
        } else if (e.key === '/') {
          e.preventDefault();
          onFocusSearch?.();
        } else if (e.key === '?' || (e.shiftKey && e.key === '?')) {
          e.preventDefault();
          onOpenHelp?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette, onNewTask, onFocusSearch, onOpenHelp, onEscape]);
};

export default useKeyboardShortcuts;
