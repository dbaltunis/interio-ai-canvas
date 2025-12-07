import { QueryClient } from "@tanstack/react-query";

/**
 * Comprehensive cache invalidation for window summary saves
 * This ensures all dependent displays refresh after any treatment/measurement save
 */
export const invalidateWindowSummaryCache = async (
  queryClient: QueryClient,
  surfaceId?: string,
  projectId?: string
) => {
  console.log('🔄 [CACHE] Invalidating window summary caches...', { surfaceId, projectId });
  
  const invalidations: Promise<void>[] = [];
  
  // Specific window summary
  if (surfaceId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["window-summary", surfaceId] }),
      queryClient.invalidateQueries({ queryKey: ["window-summary-treatment", surfaceId] })
    );
  }
  
  // Project-level summaries
  if (projectId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["project-window-summaries", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["treatments", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["project-room-products", projectId] })
    );
  }
  
  // General invalidations (always run)
  invalidations.push(
    queryClient.invalidateQueries({ queryKey: ["project-window-summaries"] }),
    queryClient.invalidateQueries({ queryKey: ["treatments"] }),
    queryClient.invalidateQueries({ queryKey: ["quote-items"] }),
    queryClient.invalidateQueries({ queryKey: ["quotes"] }),
    queryClient.invalidateQueries({ queryKey: ["client-measurements"] }),
    queryClient.invalidateQueries({ queryKey: ["project-materials"] })
  );
  
  await Promise.all(invalidations);
  console.log('✅ [CACHE] All window summary caches invalidated');
};

/**
 * Comprehensive cache invalidation for quote saves
 */
export const invalidateQuoteCache = async (
  queryClient: QueryClient,
  quoteId?: string,
  projectId?: string
) => {
  console.log('🔄 [CACHE] Invalidating quote caches...', { quoteId, projectId });
  
  const invalidations: Promise<void>[] = [];
  
  if (quoteId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["quotes", quoteId] }),
      queryClient.invalidateQueries({ queryKey: ["quote-items", quoteId] })
    );
  }
  
  if (projectId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["project-quote", projectId] })
    );
  }
  
  // General quote invalidations
  invalidations.push(
    queryClient.invalidateQueries({ queryKey: ["quotes"] }),
    queryClient.invalidateQueries({ queryKey: ["quote-items"] }),
    queryClient.invalidateQueries({ queryKey: ["quote-versions"] })
  );
  
  await Promise.all(invalidations);
  console.log('✅ [CACHE] All quote caches invalidated');
};

/**
 * Force refresh all data - nuclear option when things seem stale
 */
export const forceRefreshAllData = async (queryClient: QueryClient) => {
  console.log('🔄 [CACHE] Force refreshing ALL data...');
  
  // Invalidate everything
  await queryClient.invalidateQueries();
  
  // Clear React Query cache completely
  queryClient.clear();
  
  console.log('✅ [CACHE] All caches cleared and invalidated');
};

/**
 * Hard refresh - clears localStorage cache and reloads page
 */
export const hardRefresh = () => {
  console.log('🔄 [CACHE] Performing hard refresh...');
  
  try {
    // Clear persisted cache
    localStorage.removeItem('INTERIO_APP_CACHE');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear service worker cache if exists
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
  
  // Force reload bypassing browser cache
  window.location.reload();
};
