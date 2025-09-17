import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const JobsFocusHandler = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleFocus = () => {
      console.warn('[JOBS] Window focus - invalidating queries instead of navigating');
      // Invalidate job-related queries on focus instead of navigating
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient]);

  return null;
};