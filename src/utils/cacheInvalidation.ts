import { QueryClient } from "@tanstack/react-query";

/**
 * COMPREHENSIVE CACHE INVALIDATION
 *
 * This module ensures UI stays in sync after any data change.
 * CRITICAL: Call the appropriate invalidation function after ANY save operation.
 */

/**
 * Invalidate ALL caches related to a calculation/treatment save
 * This is the most comprehensive invalidation - use after any calculation is saved
 *
 * INCLUDES: window summaries, quotes, work orders, project data, materials
 */
export const invalidateCalculationCaches = async (
  queryClient: QueryClient,
  windowId?: string,
  projectId?: string
) => {
  console.log('🔄 [CACHE] Invalidating calculation caches...', { windowId, projectId });

  const invalidations: Promise<void>[] = [];

  // Window-specific caches
  if (windowId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["window-summary", windowId] }),
      queryClient.invalidateQueries({ queryKey: ["window-summary-treatment", windowId] }),
      queryClient.invalidateQueries({ queryKey: ["workshop-item", windowId] })
    );
  }

  // Project-specific caches
  if (projectId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["project-window-summaries", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["treatments", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["project-room-products", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["quote-items", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["quotes", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["workshop-items", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["project-materials", projectId] })
    );
  }

  // Global caches (always invalidate these - they may have stale data)
  invalidations.push(
    queryClient.invalidateQueries({ queryKey: ["project-window-summaries"] }),
    queryClient.invalidateQueries({ queryKey: ["treatments"] }),
    queryClient.invalidateQueries({ queryKey: ["quote-items"] }),
    queryClient.invalidateQueries({ queryKey: ["quotes"] }),
    queryClient.invalidateQueries({ queryKey: ["workshop-items"] }),
    queryClient.invalidateQueries({ queryKey: ["client-measurements"] }),
    queryClient.invalidateQueries({ queryKey: ["project-materials"] })
  );

  await Promise.all(invalidations);

  // Force immediate refetch of critical data (don't wait for component to request)
  if (projectId) {
    await queryClient.refetchQueries({
      queryKey: ["project-window-summaries", projectId],
      type: 'active'
    });
  }

  console.log('✅ [CACHE] All calculation caches invalidated');
};

/**
 * Comprehensive cache invalidation for window summary saves
 * This ensures all dependent displays refresh after any treatment/measurement save
 * @deprecated Use invalidateCalculationCaches instead for more comprehensive invalidation
 */
export const invalidateWindowSummaryCache = async (
  queryClient: QueryClient,
  surfaceId?: string,
  projectId?: string
) => {
  // Delegate to the more comprehensive function
  return invalidateCalculationCaches(queryClient, surfaceId, projectId);
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
