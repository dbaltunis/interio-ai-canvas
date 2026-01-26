
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCollections = () => {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("collections")
        .select(`
          *,
          vendor:vendors(id, name, email, phone)
        `)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCollectionsByVendor = (vendorId?: string) => {
  return useQuery({
    queryKey: ["collections", "by-vendor", vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!vendorId,
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collection: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("collections")
        .insert([{ ...collection, user_id: user.id }])
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
  return useQuery({
    queryKey: ["collections", "with-counts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get collections with their item counts
      const { data: collections, error: collectionsError } = await supabase
        .from("collections")
        .select(`
          *,
          vendor:vendors(id, name)
        `)
        .eq("active", true)
        .order("name");

      if (collectionsError) throw collectionsError;

      // Get item counts per collection
      const { data: inventoryItems, error: itemsError } = await supabase
        .from("enhanced_inventory_items")
        .select("collection_id")
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
  });
};
