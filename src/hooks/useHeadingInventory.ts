
import { useEnhancedInventoryByCategory } from "./useEnhancedInventory";

export const useHeadingInventory = (options?: { forceRefresh?: boolean }) => {
  // ✅ CRITICAL: Force refresh to ensure fresh heading data when worksheet opens
  return useEnhancedInventoryByCategory('heading', { forceRefresh: options?.forceRefresh ?? true });
};
