import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export const useCollections = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["collections", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("collections")
        .select(`
          *,
          vendor:vendors(id, name, email, phone)
        `)
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveOwnerId,
  });
};

export const useCollectionsByVendor = (vendorId?: string) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["collections", "by-vendor", vendorId, effectiveOwnerId],
    queryFn: async () => {
      if (!vendorId || !effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .eq("vendor_id", vendorId)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!vendorId && !!effectiveOwnerId,
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collection: any) => {
      // FIX: Use effectiveOwnerId for multi-tenant support
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      const { data, error } = await supabase
        .from("collections")
        .insert([{ ...collection, user_id: effectiveOwnerId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...collection }: any) => {
      const { data, error } = await supabase
        .from("collections")
        .update(collection)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
};

// Hook to get collections with item counts for filter displays
export const useCollectionsWithCounts = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["collections", "with-counts", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // Get collections with their item counts
      const { data: collections, error: collectionsError } = await supabase
        .from("collections")
        .select(`
          *,
          vendor:vendors(id, name)
        `)
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .order("name");

      if (collectionsError) throw collectionsError;

      // Get item counts per collection
      const { data: inventoryItems, error: itemsError } = await supabase
        .from("enhanced_inventory_items")
        .select("collection_id")
        .eq("user_id", effectiveOwnerId)
        .not("collection_id", "is", null);

      if (itemsError) throw itemsError;

      // Count items per collection
      const itemCountMap: Record<string, number> = {};
      inventoryItems?.forEach(item => {
        if (item.collection_id) {
          itemCountMap[item.collection_id] = (itemCountMap[item.collection_id] || 0) + 1;
        }
      });

      // Merge counts into collections
      return (collections || []).map(collection => ({
        ...collection,
        itemCount: itemCountMap[collection.id] || 0,
      }));
    },
    enabled: !!effectiveOwnerId,
  });
};

// Hook to get vendors with their collections grouped
export const useVendorsWithCollections = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["vendors", "with-collections", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // Get all collections with vendor info
      const { data: collections, error: collectionsError } = await supabase
        .from("collections")
        .select(`
          *,
          vendor:vendors(id, name)
        `)
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .order("name");

      if (collectionsError) throw collectionsError;

      // Get ALL items with their vendor_id and collection_id
      // This ensures we count items even if they have no collection assigned
      const { data: inventoryItems, error: itemsError } = await supabase
        .from("enhanced_inventory_items")
        .select("vendor_id, collection_id")
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .neq("category", "treatment_option");

      if (itemsError) throw itemsError;

      // Count items per collection
      const itemCountMap: Record<string, number> = {};
      // Count items per vendor (including those without collection)
      const vendorItemCountMap: Record<string, number> = {};
      inventoryItems?.forEach(item => {
        const vendorId = item.vendor_id || "unassigned";
        vendorItemCountMap[vendorId] = (vendorItemCountMap[vendorId] || 0) + 1;
        if (item.collection_id) {
          itemCountMap[item.collection_id] = (itemCountMap[item.collection_id] || 0) + 1;
        }
      });

      // Get all vendors that have items (even without collections)
      const { data: vendors, error: vendorsError } = await supabase
        .from("vendors")
        .select("id, name")
        .eq("user_id", effectiveOwnerId)
        .eq("active", true);

      if (vendorsError) throw vendorsError;

      // Build vendor lookup
      const vendorLookup = new Map<string, { id: string; name: string }>();
      vendors?.forEach(v => vendorLookup.set(v.id, v));

      // Group collections by vendor
      const vendorMap = new Map<string, {
        vendor: { id: string; name: string } | null;
        collections: Array<{ id: string; name: string; itemCount: number; description?: string }>;
        totalItems: number;
      }>();

      collections?.forEach(collection => {
        const vendorId = collection.vendor_id || "unassigned";
        const vendorData = collection.vendor as { id: string; name: string } | null;
        const itemCount = itemCountMap[collection.id] || 0;

        if (!vendorMap.has(vendorId)) {
          vendorMap.set(vendorId, {
            vendor: vendorData,
            collections: [],
            totalItems: 0,
          });
        }

        const entry = vendorMap.get(vendorId)!;
        entry.collections.push({
          id: collection.id,
          name: collection.name,
          itemCount,
          description: collection.description,
        });
      });

      // Ensure all vendors with items appear (even without collections)
      for (const [vendorId, count] of Object.entries(vendorItemCountMap)) {
        if (!vendorMap.has(vendorId)) {
          const vendor = vendorLookup.get(vendorId) || null;
          vendorMap.set(vendorId, {
            vendor,
            collections: [],
            totalItems: 0,
          });
        }
        // Use the actual item count from vendor_id (includes items without collections)
        vendorMap.get(vendorId)!.totalItems = count;
      }

      // For vendors that are in vendorMap but have no items, ensure totalItems is correct
      vendorMap.forEach((entry, vendorId) => {
        if (!vendorItemCountMap[vendorId]) {
          entry.totalItems = 0;
        }
      });

      // Sort by vendor name, put unassigned last
      return Array.from(vendorMap.values()).sort((a, b) => {
        if (!a.vendor) return 1;
        if (!b.vendor) return -1;
        return (a.vendor.name || "").localeCompare(b.vendor.name || "");
      });
    },
    enabled: !!effectiveOwnerId,
  });
};
