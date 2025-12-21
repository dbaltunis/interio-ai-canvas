import { useMemo } from 'react';
import { useVendors } from '@/hooks/useVendors';
import { useEnhancedInventory } from '@/hooks/useEnhancedInventory';

interface UnifiedSupplier {
  id: string;
  name: string;
  type: 'vendor' | 'supplier_text';
  itemCount: number;
}

/**
 * Hook that unifies vendor_id and supplier fields into a single list
 * This fixes the issue where some items have vendor_id and others have supplier text
 */
export const useUnifiedSuppliers = (category?: string) => {
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: inventory = [], isLoading: inventoryLoading } = useEnhancedInventory();

  const unifiedSuppliers = useMemo(() => {
    const supplierMap = new Map<string, UnifiedSupplier>();
    
    // Filter by category if provided
    const items = category 
      ? inventory.filter(i => i.category === category)
      : inventory;

    // First, add all vendors with their counts
    vendors.forEach(vendor => {
      const count = items.filter(item => 
        item.vendor_id === vendor.id || 
        item.supplier?.toLowerCase().trim() === vendor.name?.toLowerCase().trim()
      ).length;
      
      supplierMap.set(vendor.id, {
        id: vendor.id,
        name: vendor.name || 'Unknown Vendor',
        type: 'vendor',
        itemCount: count
      });
    });

    // Then find orphan supplier text values (not matching any vendor)
    const orphanSuppliers = new Map<string, number>();
    items.forEach(item => {
      if (item.supplier && !item.vendor_id) {
        const supplierName = item.supplier.trim();
        const normalizedName = supplierName.toLowerCase();
        
        // Check if this supplier matches any vendor name
        const matchingVendor = vendors.find(v => 
          v.name?.toLowerCase().trim() === normalizedName
        );
        
        if (!matchingVendor) {
          // This is an orphan supplier
          orphanSuppliers.set(supplierName, (orphanSuppliers.get(supplierName) || 0) + 1);
        }
      }
    });

    // Add orphan suppliers with synthetic IDs
    orphanSuppliers.forEach((count, name) => {
      const syntheticId = `supplier_text:${name.toLowerCase()}`;
      supplierMap.set(syntheticId, {
        id: syntheticId,
        name: name,
        type: 'supplier_text',
        itemCount: count
      });
    });

    // Convert to array and sort
    return Array.from(supplierMap.values()).sort((a, b) => {
      // TWC first
      const aIsTWC = a.name.toUpperCase() === 'TWC';
      const bIsTWC = b.name.toUpperCase() === 'TWC';
      if (aIsTWC && !bIsTWC) return -1;
      if (!aIsTWC && bIsTWC) return 1;
      
      // Then by count (descending)
      if (a.itemCount !== b.itemCount) return b.itemCount - a.itemCount;
      
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [vendors, inventory, category]);

  // Total items with any supplier
  const totalItems = useMemo(() => {
    return unifiedSuppliers.reduce((sum, s) => sum + s.itemCount, 0);
  }, [unifiedSuppliers]);

  return {
    suppliers: unifiedSuppliers,
    totalItems,
    isLoading: vendorsLoading || inventoryLoading
  };
};

/**
 * Helper to check if an item matches a unified supplier selection
 */
export const matchesUnifiedSupplier = (
  item: any, 
  selectedSupplierId: string | undefined, 
  vendors: any[] = []
): boolean => {
  if (!selectedSupplierId) return true;
  
  // Check if it's a synthetic supplier_text ID
  if (selectedSupplierId.startsWith('supplier_text:')) {
    const supplierName = selectedSupplierId.replace('supplier_text:', '');
    return item.supplier?.toLowerCase().trim() === supplierName;
  }
  
  // It's a real vendor ID - check both vendor_id and supplier name match
  if (item.vendor_id === selectedSupplierId) return true;
  
  // Find vendor name for the selected vendor ID
  const vendor = vendors.find(v => v.id === selectedSupplierId);
  if (vendor && item.supplier?.toLowerCase().trim() === vendor.name?.toLowerCase().trim()) {
    return true;
  }
  
  return false;
};
