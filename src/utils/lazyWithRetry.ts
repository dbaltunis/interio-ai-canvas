import { lazy, ComponentType } from 'react';

/**
 * Lazy load helper with automatic retry and exponential backoff.
 * Handles intermittent module loading failures (HMR, caching, network).
 * 
 * @param importFn - Dynamic import function
 * @param moduleName - Human-readable name for logging and error UI
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  moduleName: string,
  maxRetries = 3
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Wait before retry with exponential backoff (1s, 2s, 4s)
        if (attempt > 0) {
          console.log(`🔄 Retrying ${moduleName} (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
        
        const module = await importFn();
        if (attempt > 0) {
          console.log(`✅ ${moduleName} loaded successfully after ${attempt + 1} attempts`);
        }
        return module;
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Failed to load ${moduleName} (attempt ${attempt + 1}/${maxRetries}):`, error);
      }
    }
    
    // All retries failed - return error component
    console.error(`❌ Failed to load ${moduleName} after ${maxRetries} attempts:`, lastError);
    
    // Dynamically import the error component to avoid JSX in this file
    const { LazyLoadError } = await import('@/components/ui/LazyLoadError');
    
    // Create a wrapper component that passes the error info
    const ErrorWrapper = () => LazyLoadError({ moduleName, error: lastError });
    
    return { default: ErrorWrapper as unknown as T };
  });
}
