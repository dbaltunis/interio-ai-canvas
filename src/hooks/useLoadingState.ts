import { useState, useEffect } from 'react';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  minimumLoadTime?: number; // Ensure loading shows for at least X ms
}

export const useLoadingState = ({ 
  initialLoading = true, 
  minimumLoadTime = 500 
}: UseLoadingStateOptions = {}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [startTime] = useState(() => Date.now());

  const setLoading = (loading: boolean) => {
    if (!loading && minimumLoadTime > 0) {
      const elapsed = Date.now() - startTime;
      const remaining = minimumLoadTime - elapsed;
      
      if (remaining > 0) {
        setTimeout(() => setIsLoading(false), remaining);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(loading);
    }
  };

  return { isLoading, setLoading };
};