import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

/**
 * Creates a localStorage persister for React Query
 * Critical settings are cached locally for instant load
 */
export const createLocalStoragePersister = () => {
  return createSyncStoragePersister({
    storage: window.localStorage,
    key: 'INTERIO_APP_CACHE',
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  });
};

/**
 * Query keys that should be persisted to localStorage
 * These are critical settings that users expect to see instantly
 */
export const PERSISTED_QUERY_KEYS = [
  'business-settings',
  'user-preferences',
  'quote-templates',
  'inventory-categories',
  'treatment-templates',
];

/**
 * Configure which queries should be persisted
 */
export const persistOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  dehydrateOptions: {
    shouldDehydrateQuery: (query: any) => {
      // Only persist queries that match our critical keys
      const queryKey = query.queryKey[0];
      return PERSISTED_QUERY_KEYS.includes(queryKey as string);
    },
  },
};

export { PersistQueryClientProvider };
