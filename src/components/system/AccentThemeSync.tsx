import { useInitializeAccentTheme } from '@/hooks/useAccentTheme';

/**
 * Component that initializes and syncs the accent theme on app load.
 * This ensures the user's preferred accent color palette persists across sessions.
 */
export const AccentThemeSync = () => {
  useInitializeAccentTheme();
  return null;
};
