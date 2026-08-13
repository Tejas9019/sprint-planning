import { useEffect, type RefObject } from 'react';

/**
 * Calls `onAway` when a pointerdown happens outside the referenced element,
 * or when Escape is pressed. Used to dismiss popovers / dropdown menus.
 */
export function useClickAway<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onAway: () => void,
  active = true
) {
  useEffect(() => {
    if (!active) return;
    const handlePointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onAway();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onAway();
    };
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onAway, active]);
}
