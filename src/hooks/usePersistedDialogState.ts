import { useState } from "react";

/**
 * Hook to persist dialog open state across browser sessions using localStorage.
 * When user leaves browser and comes back, dialog will reopen automatically.
 * 
 * @param key - Unique identifier for this dialog
 * @param defaultValue - Default open state (defaults to false)
 * @returns [open, setOpen] - State tuple similar to useState
 */
export const usePersistedDialogState = (
  key: string, 
  defaultValue: boolean = false
): [boolean, (value: boolean) => void] => {
  const storageKey = `dialog_state_${key}`;
  
  const [open, setOpenState] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === 'true';
    } catch {
      return defaultValue;
    }
  });

  const setOpen = (value: boolean) => {
    try {
      if (value) {
        localStorage.setItem(storageKey, 'true');
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.warn('Failed to persist dialog state:', e);
    }
    setOpenState(value);
  };

  return [open, setOpen];
};
