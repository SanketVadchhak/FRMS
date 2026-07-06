import { useEffect } from 'react';

export function useMobileKeyboardFix() {
  useEffect(() => {
    // 1. Dismiss keyboard when touching anywhere outside an input on mobile
    const handleTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // If the currently focused element is an input/textarea, and we touched something else
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) &&
        document.activeElement !== target &&
        !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName) &&
        !target.closest('button') && 
        !target.closest('a')
      ) {
        (document.activeElement as HTMLElement).blur();
      }
    };

    // 2. Dismiss keyboard when hitting "Enter" (unless it's a textarea where we want newlines)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target && target.tagName === 'INPUT') {
          // Blur the input to hide the keyboard
          target.blur();
        }
      }
    };

    // Use touchstart to catch it early before other preventDefaults might run
    document.addEventListener('touchstart', handleTouch, { passive: true });
    document.addEventListener('keydown', handleKeyDown, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
