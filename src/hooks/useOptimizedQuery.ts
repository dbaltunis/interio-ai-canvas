import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useOfflineSupport } from './useOfflineSupport';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  cacheType?: 'appointments' | 'calendars' | 'accounts';
  enableOffline?: boolean;
}

export const useOptimizedQuery = <T>({
  queryKey,
  queryFn,
  cacheType,
  enableOffline = false,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  gcTime = 10 * 60 * 1000, // 10 minutes default
  refetchOnWindowFocus = false,
  ...options
}: OptimizedQueryOptions<T>) => {
  const { isOnline, getCachedData, updateCache } = useOfflineSupport();

  return useQuery({
    queryKey,
    queryFn: async () => {
      // If offline and cache is available, return cached data
      if (!isOnline && enableOffline && cacheType) {
        const cachedData = getCachedData(cacheType);
        if (cachedData) {
          return cachedData as T;
        }
      }

      const result = await queryFn();

      // Update cache if online and caching is enabled
      if (isOnline && enableOffline && cacheType && Array.isArray(result)) {
        updateCache(cacheType, result);
      }

      return result;
    },
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    enabled: isOnline || (enableOffline && !!getCachedData(cacheType || 'appointments')),
    ...options,
  });
};

// Batch query hook for multiple related queries
export const useBatchQueries = (queries: Array<OptimizedQueryOptions<any>>) => {
  const results = queries.map(query => useOptimizedQuery(query));
  
  return {
    data: results.map(r => r.data),
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError),
    errors: results.map(r => r.error).filter(Boolean),
  };
};