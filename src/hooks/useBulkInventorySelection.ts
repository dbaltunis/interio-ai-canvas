import { useState, useMemo, useCallback } from "react";

export interface InventoryItem {
  id: string;
  [key: string]: any;
}

export const useBulkInventorySelection = (items: InventoryItem[]) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const selectItem = useCallback((itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  }, []);

  const selectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    const isSelected = selectedItems.includes(itemId);
    selectItem(itemId, !isSelected);
  }, [selectedItems, selectItem]);

  const selectionStats = useMemo(() => ({
    total: items.length,
    selected: selectedItems.length,
    allSelected: items.length > 0 && selectedItems.length === items.length,
    someSelected: selectedItems.length > 0 && selectedItems.length < items.length,
    noneSelected: selectedItems.length === 0,
  }), [items.length, selectedItems.length]);

  return {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    toggleItem,
    selectionStats,
  };
};
