
import { useEnhancedInventoryByCategory } from "./useEnhancedInventory";

export const useHeadingInventory = () => {
  return useEnhancedInventoryByCategory('heading');
};
