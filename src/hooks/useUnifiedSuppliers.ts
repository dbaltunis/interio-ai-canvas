import { useMemo } from 'react';
import { useVendors } from '@/hooks/useVendors';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveAccountOwner } from './useEffectiveAccountOwner';

interface UnifiedSupplier {
  id: string;
  name: string;
  type: 'vendor' | 'supplier_text';
  itemCount: number;
}

/**
 * Hook that unifies vendor_id and supplier fields into a single list
 * Uses a lightweight query to count items per supplier without loading full inventory
 */
export const useUnifiedSuppliers = (category?: string) => {
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  // Lightweight query to get just supplier/vendor_id data for counting
  const { data: supplierData = [], isLoading: supplierDataLoading } = useQuery({
    queryKey: ['unified-suppliers-data', effectiveOwnerId, category],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];
      
      let query = supabase
        .from('enhanced_inventory_items')
        .select('vendor_id, supplier')
        .eq('user_id', effectiveOwnerId)
        .eq('active', true);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveOwnerId,
    staleTime: 30000, // Cache for 30 seconds
  });

  const unifiedSuppliers = useMemo(() => {
    if (vendorsLoading || supplierDataLoading) return [];
    
    const supplierMap = new Map<string, UnifiedSupplier>();

    // First, add all vendors with their counts
    vendors.forEach(vendor => {
      const count = supplierData.filter(item => 
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
    supplierData.forEach(item => {
      if (item.supplier && !item.vendor_id) {
        const supplierName = item.supplier.trim();
        const normalizedName = supplierName.toLowerCase();
        
        // Check if this supplier matches any vendor name
        const matchingVendor = vendors.find(v => 
          v.name?.toLowerCase().trim() === normalizedName
        );
        
        if (!matchingVendor) {
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
  }, [vendors, supplierData, vendorsLoading, supplierDataLoading]);

  // Total items with any supplier
  const totalItems = useMemo(() => {
    return unifiedSuppliers.reduce((sum, s) => sum + s.itemCount, 0);
  }, [unifiedSuppliers]);

  return {
    suppliers: unifiedSuppliers,
    totalItems,
    isLoading: vendorsLoading || supplierDataLoading
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
