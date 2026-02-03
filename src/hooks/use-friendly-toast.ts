import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { getFriendlyError, isSessionError, type FriendlyError } from '@/utils/friendlyErrors';

interface ShowErrorOptions {
  context?: string;
  onRetry?: () => void;
}

/**
 * Hook for showing user-friendly error notifications
 * 
 * Usage:
 * const { showError, showSuccess } = useFriendlyToast();
 * 
 * try {
 *   await saveClient(data);
 * } catch (error) {
 *   showError(error, { context: 'save client' });
 * }
 */
export function useFriendlyToast() {
  const navigate = useNavigate();

  const showError = useCallback((error: unknown, options?: ShowErrorOptions) => {
    const friendly = getFriendlyError(error, options?.context);
    
    // For session errors, include navigation to login
    const handleLoginClick = () => {
      navigate('/auth');
    };

    toast({
      title: friendly.title,
      description: friendly.message,
      variant: 'warning',
      importance: 'important',
      // Pass custom data for the toaster to render
      icon: friendly.icon,
      persistent: friendly.persistent,
      showLoginButton: friendly.showLoginButton,
      onLoginClick: friendly.showLoginButton ? handleLoginClick : undefined,
      autoDismissMs: friendly.autoDismissMs,
    } as any); // Using any to pass custom props that toaster will read
  }, [navigate]);

  const showSuccess = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'success',
      importance: 'important',
    });
  }, []);

  const showInfo = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      importance: 'normal',
    });
  }, []);

  return {
    showError,
    showSuccess,
    showInfo,
  };
}

/**
 * Standalone function for showing friendly errors without hooks
 * Useful in non-component contexts or when navigation isn't needed
 */
export function showFriendlyError(error: unknown, context?: string) {
  const friendly = getFriendlyError(error, context);
  
  toast({
    title: friendly.title,
    description: friendly.message,
    variant: 'warning',
    importance: 'important',
    icon: friendly.icon,
    persistent: friendly.persistent,
    autoDismissMs: friendly.autoDismissMs,
  } as any);
}

/**
 * Quick helper to show a session expired error with login redirect
 * Call this when you detect an auth error and want to prompt re-login
 */
export function showSessionExpiredError(navigateFn: () => void) {
  toast({
    title: "Session expired",
    description: "For security, you've been logged out. Please log in again to continue.",
    variant: 'warning',
    importance: 'important',
    icon: 'session',
    persistent: true,
    showLoginButton: true,
    onLoginClick: navigateFn,
  } as any);
}
