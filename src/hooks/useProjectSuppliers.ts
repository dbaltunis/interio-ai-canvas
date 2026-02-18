import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { useVendors } from "@/hooks/useVendors";

export interface DetectedSupplier {
  id: string;
  name: string;
  type: 'twc' | 'vendor';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    twcItemNumber?: string;
  }>;
  isOrdered: boolean;
  orderInfo?: {
    orderId: string;
    status: string;
    submittedAt: string;
  };
}

interface SupplierOrdersJson {
  [key: string]: {
    status: string;
    order_id: string;
    submitted_at: string;
    response?: any;
  };
}

interface UseProjectSuppliersProps {
  quoteItems: any[];
  quoteData?: any;
  supplierOrders?: SupplierOrdersJson | null;
}

/**
 * Hook to detect all suppliers used in a quote/project
 * Scans quote items for TWC products and vendor-linked inventory items
 */
export const useProjectSuppliers = ({
  quoteItems,
  quoteData,
  supplierOrders,
}: UseProjectSuppliersProps) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  // Fetch inventory items with vendor info for items that have inventory_item_id
  const inventoryItemIds = useMemo(() => {
    return quoteItems
      .filter((item) => item.inventory_item_id)
      .map((item) => item.inventory_item_id);
  }, [quoteItems]);

  const { data: inventoryWithVendors = [] } = useQuery({
    queryKey: ["inventory-vendors", inventoryItemIds],
    queryFn: async () => {
      if (inventoryItemIds.length === 0) return [];

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select(`
          id,
          name,
          vendor_id,
          supplier,
          vendor:vendors(id, name)
        `)
        .in("id", inventoryItemIds);

      if (error) {
        console.error("Error fetching inventory vendors:", error);
        return [];
      }

      return data || [];
    },
    enabled: inventoryItemIds.length > 0,
  });

  // Fetch ALL vendors from Settings so the dropdown shows every configured supplier
  // NOTE: Must be before suppliers memo since it's used for fallback vendor name resolution
  const { data: allSettingsVendors = [] } = useVendors();

  // Detect suppliers from quote items
  const suppliers = useMemo<DetectedSupplier[]>(() => {
    const supplierMap = new Map<string, DetectedSupplier>();

    // Check existing TWC order (legacy fields)
    const hasTwcOrder = quoteData?.twc_order_id;
    const twcOrderInfo = hasTwcOrder ? {
      orderId: quoteData.twc_order_id,
      status: quoteData.twc_order_status || 'submitted',
      submittedAt: quoteData.twc_submitted_at,
    } : undefined;

    // Parse supplier_orders JSON for new multi-supplier tracking
    const parsedSupplierOrders = supplierOrders || {};

    quoteItems.forEach((item) => {
      // Check for TWC products in multiple locations
      const productDetails = item.product_details || {};
      const metadata = item.metadata || productDetails.metadata || {};
      const twcItemNumber = 
        item.twc_item_number ||
        metadata.twc_item_number ||
        productDetails.twc_item_number;

      if (twcItemNumber) {
        const existing = supplierMap.get('twc');
        const twcSupplierOrder = parsedSupplierOrders['twc'];
        
        supplierMap.set('twc', {
          id: 'twc',
          name: 'TWC',
          type: 'twc',
          items: [
            ...(existing?.items || []),
            {
              id: item.id,
              name: item.name,
              quantity: item.quantity || 1,
              twcItemNumber,
            },
          ],
          isOrdered: Boolean(hasTwcOrder || twcSupplierOrder),
          orderInfo: twcOrderInfo || (twcSupplierOrder ? {
            orderId: twcSupplierOrder.order_id,
            status: twcSupplierOrder.status,
            submittedAt: twcSupplierOrder.submitted_at,
          } : undefined),
        });
      }

      // Check for vendor-linked inventory items (primary path)
      if (item.inventory_item_id) {
        const inventoryItem = inventoryWithVendors.find(
          (inv) => inv.id === item.inventory_item_id
        );

        if (inventoryItem?.vendor_id && inventoryItem.vendor) {
          const vendorId = inventoryItem.vendor_id;
          const vendorName = (inventoryItem.vendor as any).name || inventoryItem.supplier || 'Unknown Vendor';
          const existing = supplierMap.get(vendorId);
          const vendorSupplierOrder = parsedSupplierOrders[vendorId];

          supplierMap.set(vendorId, {
            id: vendorId,
            name: vendorName,
            type: 'vendor',
            items: [
              ...(existing?.items || []),
              {
                id: item.id,
                name: item.name,
                quantity: item.quantity || 1,
              },
            ],
            isOrdered: Boolean(vendorSupplierOrder),
            orderInfo: vendorSupplierOrder ? {
              orderId: vendorSupplierOrder.order_id,
              status: vendorSupplierOrder.status,
              submittedAt: vendorSupplierOrder.submitted_at,
            } : undefined,
          });
        }
      }

      // Fallback: check product_details.vendor_id directly
      const directVendorId = productDetails?.vendor_id;
      if (directVendorId && !supplierMap.has(directVendorId)) {
        const vendorInfo = allSettingsVendors.find((v: any) => v.id === directVendorId);
        if (vendorInfo) {
          const vendorSupplierOrder = parsedSupplierOrders[directVendorId];
          supplierMap.set(directVendorId, {
            id: directVendorId,
            name: vendorInfo.name,
            type: 'vendor',
            items: [{
              id: item.id,
              name: item.name,
              quantity: item.quantity || 1,
            }],
            isOrdered: Boolean(vendorSupplierOrder),
            orderInfo: vendorSupplierOrder ? {
              orderId: vendorSupplierOrder.order_id,
              status: vendorSupplierOrder.status,
              submittedAt: vendorSupplierOrder.submitted_at,
            } : undefined,
          });
        }
      } else if (directVendorId && supplierMap.has(directVendorId)) {
        // Append item to existing vendor entry
        const existing = supplierMap.get(directVendorId)!;
        const alreadyAdded = existing.items.some(i => i.id === item.id);
        if (!alreadyAdded) {
          existing.items.push({
            id: item.id,
            name: item.name,
            quantity: item.quantity || 1,
          });
        }
      }
    });

    return Array.from(supplierMap.values());
  }, [quoteItems, inventoryWithVendors, quoteData, supplierOrders, allSettingsVendors]);


  // Build list of all vendors not already detected from quote items
  const allVendors = useMemo<DetectedSupplier[]>(() => {
    return allSettingsVendors
      .filter((v) => !suppliers.some((s) => s.id === v.id))
      .map((v) => ({
        id: v.id,
        name: v.name,
        type: 'vendor' as const,
        items: [],
        isOrdered: false,
      }));
  }, [allSettingsVendors, suppliers]);

  const hasTwcProducts = suppliers.some((s) => s.id === 'twc');
  const hasVendorProducts = suppliers.some((s) => s.type === 'vendor');
  const allOrdersSubmitted = suppliers.length > 0 && suppliers.every((s) => s.isOrdered);
  const someOrdersSubmitted = suppliers.some((s) => s.isOrdered);

  return {
    suppliers,
    allVendors,
    hasTwcProducts,
    hasVendorProducts,
    allOrdersSubmitted,
    someOrdersSubmitted,
    isLoading: false,
  };
};
