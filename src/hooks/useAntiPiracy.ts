import { useEffect } from 'react';

/**
 * Anti-Piracy Hook for MindHubs
 * Disables right-click and certain keyboard shortcuts on premium media.
 */
export const useAntiPiracy = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu on inputs/textareas but block on videos/images
      const target = e.target as HTMLElement;
      if (['VIDEO', 'IMG', 'CANVAS'].includes(target.tagName)) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I (DevTools), Ctrl+U (View Source), Ctrl+S (Save)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
};
