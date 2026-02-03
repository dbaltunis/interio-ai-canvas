
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";

export interface EnhancedInventoryItem {
  // Core fields (exact database column names)
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category: string;
  subcategory?: string;
  quantity?: number;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  profit_per_unit?: number;
  markup_percentage?: number;
  margin_percentage?: number;
  supplier?: string;
  vendor_id?: string;
  collection_id?: string;
  location?: string;
  reorder_point?: number;
  active?: boolean;
  
  // Joined data
  vendor?: {
    id: string;
    name: string;
  } | null;
  collection?: {
    id: string;
    name: string;
  } | null;
  
  // Fabric fields (exact database column names)
  fabric_width?: number;
  fabric_composition?: string;
  fabric_care_instructions?: string;
  fabric_origin?: string;
  pattern_repeat_horizontal?: number;
  pattern_repeat_vertical?: number;
  fabric_grade?: string;
  fabric_collection?: string;
  is_flame_retardant?: boolean;
  
  // Hardware fields (exact database column names)
  hardware_finish?: string;
  hardware_material?: string;
  hardware_dimensions?: string;
  hardware_weight?: number;
  hardware_mounting_type?: string;
  hardware_load_capacity?: number;
  
  // Pricing fields (exact database column names)
  price_per_yard?: number;
  price_per_meter?: number;
  price_per_unit?: number;
  
  // Physical dimensions (exact database column names)
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  color?: string;
  finish?: string;
  collection_name?: string;
  image_url?: string;
  
  // Service/Labor fields (exact database column names)
  labor_hours?: number;
  fullness_ratio?: number;
  service_rate?: number;
  treatment_type?: string;
  
  // Metadata (JSONB field)
  metadata?: Json;
  show_in_quote?: boolean;
  
  // Pricing grid - direct assignment (simpler than routing)
  pricing_grid_id?: string | null;
  price_group?: string | null; // Legacy field, will be deprecated
  product_category?: string | null;
  
  // Tags for categorization and search
  tags?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export const useEnhancedInventory = (options?: { forceRefresh?: boolean }) => {
  // Use effective account owner for multi-tenant queries (team members see owner's inventory)
  const { effectiveOwnerId, isLoading: ownerLoading } = useEffectiveAccountOwner();

  return useQuery({
    // ✅ CRITICAL FIX v2.4.0: Use effectiveOwnerId for multi-tenant isolation
    queryKey: ["enhanced-inventory", effectiveOwnerId],
    enabled: !!effectiveOwnerId && !ownerLoading,
    staleTime: options?.forceRefresh ? 0 : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: options?.forceRefresh ? 'always' : true,
    queryFn: async () => {
      if (!effectiveOwnerId) throw new Error('User not authenticated');

      console.log('📦 [useEnhancedInventory] Fetching ALL inventory for effective owner:', effectiveOwnerId);

      // CRITICAL FIX: Supabase has a default 1000 row limit
      // We must fetch items in batches to get ALL inventory
      const BATCH_SIZE = 1000;
      let allItems: any[] = [];
      let start = 0;
      let hasMore = true;
      let batchCount = 0;

      while (hasMore) {
        const { data, error } = await supabase
          .from("enhanced_inventory_items")
          .select(`
            *,
            vendor:vendors!enhanced_inventory_items_vendor_id_fkey(id, name),
            collection:collections!collection_id(id, name)
          `)
          .eq("user_id", effectiveOwnerId)
          .eq("active", true)
          .order("created_at", { ascending: false })
          .range(start, start + BATCH_SIZE - 1);

        if (error) {
          console.error('❌ [useEnhancedInventory] Error fetching inventory batch:', error);
          throw error;
        }

        if (data && data.length > 0) {
          allItems = [...allItems, ...data];
          start += BATCH_SIZE;
          batchCount++;
          hasMore = data.length === BATCH_SIZE; // If we got a full batch, there might be more
          console.log(`📦 [useEnhancedInventory] Batch ${batchCount}: fetched ${data.length} items (total: ${allItems.length})`);
        } else {
          hasMore = false;
        }
      }
      
      // Debug: Log inventory summary with heading items highlighted
      const headingItems = allItems.filter(item => item.category === 'heading');
      
      console.log('✅ [v2.5.0] useEnhancedInventory Fetched ALL items:', {
        totalItems: allItems.length,
        batchesFetched: batchCount,
        headingItemsCount: headingItems.length,
        allCategories: [...new Set(allItems.map(i => i.category))]
      });
      
      return allItems;
    },
  });
};

export const useEnhancedInventoryByCategory = (category: string, options?: { forceRefresh?: boolean }) => {
  // Use effective account owner for multi-tenant queries
  const { effectiveOwnerId, isLoading: ownerLoading } = useEffectiveAccountOwner();

  return useQuery({
    // ✅ CRITICAL FIX v2.4.0: Use effectiveOwnerId for multi-account isolation
    queryKey: ["enhanced-inventory", category, effectiveOwnerId],
    enabled: !!effectiveOwnerId && !ownerLoading,
    staleTime: options?.forceRefresh ? 0 : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: options?.forceRefresh ? 'always' : true,
    queryFn: async () => {
      if (!effectiveOwnerId) throw new Error('User not authenticated');

      // CRITICAL FIX: Batch fetch to handle >1000 items per category
      const BATCH_SIZE = 1000;
      let allItems: any[] = [];
      let start = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("enhanced_inventory_items")
          .select(`
            *,
            vendor:vendors!enhanced_inventory_items_vendor_id_fkey(id, name),
            collection:collections!collection_id(id, name)
          `)
          .eq("user_id", effectiveOwnerId)
          .eq("category", category)
          .eq("active", true)
          .order("created_at", { ascending: false })
          .range(start, start + BATCH_SIZE - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allItems = [...allItems, ...data];
          start += BATCH_SIZE;
          hasMore = data.length === BATCH_SIZE;
        } else {
          hasMore = false;
        }
      }

      return allItems;
    },
  });
};

export const useCreateEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (raw: any) => {
      // Ensure user is authenticated and attach user_id for RLS
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (authError || !userId) {
        throw new Error('You must be logged in to add inventory items.');
      }

      // ✅ CRITICAL FIX: Get effective account owner for multi-tenant support
      // Team members should create data under their account owner's ID
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", userId)
        .single();
      
      // Use parent account if exists (team member), otherwise own ID (account owner)
      const effectiveOwnerId = profile?.parent_account_id || userId;
      console.log('📦 [useCreateEnhancedInventoryItem] Creating item with effectiveOwnerId:', effectiveOwnerId, '(auth user:', userId, ')');

      // ✅ AUTO-CREATE COLLECTION: If collection_name is provided but no collection_id, create/link collection
      let resolvedCollectionId = raw.collection_id || null;
      const collectionName = raw.collection_name?.trim();
      
      if (collectionName && !resolvedCollectionId) {
        console.log('📦 [useCreateEnhancedInventoryItem] Auto-creating/linking collection:', collectionName);
        
        // First, try to find existing collection with this name for this account
        const { data: existingCollection } = await supabase
          .from("collections")
          .select("id")
          .eq("user_id", effectiveOwnerId)
          .eq("name", collectionName)
          .maybeSingle();
        
        if (existingCollection) {
          resolvedCollectionId = existingCollection.id;
          console.log('📦 [useCreateEnhancedInventoryItem] Found existing collection:', resolvedCollectionId);
        } else {
          // Create new collection
          const { data: newCollection, error: collError } = await supabase
            .from("collections")
            .insert({
              name: collectionName,
              user_id: effectiveOwnerId,
              active: true,
              vendor_id: raw.vendor_id || null, // Link to vendor if provided
            })
            .select("id")
            .single();
          
          if (!collError && newCollection) {
            resolvedCollectionId = newCollection.id;
            console.log('📦 [useCreateEnhancedInventoryItem] Created new collection:', resolvedCollectionId);
          } else {
            console.warn('📦 [useCreateEnhancedInventoryItem] Failed to create collection:', collError?.message);
          }
        }
      }

      // Whitelist fields to match enhanced_inventory_items schema
      const allowedKeys = [
        'name','description','sku','category','subcategory','quantity','unit','cost_price','selling_price','supplier','vendor_id','collection_id','location','reorder_point','active',
        'fabric_width','fabric_composition','fabric_care_instructions','fabric_origin','pattern_repeat_horizontal','pattern_repeat_vertical','fabric_grade','fabric_collection','is_flame_retardant',
        'hardware_finish','hardware_material','hardware_dimensions','hardware_weight','hardware_mounting_type','hardware_load_capacity',
        'price_per_yard','price_per_meter','price_per_unit','markup_percentage',
        'width','height','depth','weight','color','finish','collection_name','image_url',
        'labor_hours','fullness_ratio','service_rate','treatment_type','metadata','show_in_quote',
        'wallpaper_roll_width','wallpaper_roll_length','wallpaper_sold_by','wallpaper_unit_of_measure','wallpaper_match_type','wallpaper_horizontal_repeat','wallpaper_waste_factor','wallpaper_pattern_offset',
        'product_category','price_group','pricing_grid_id','tags','specifications'
      ] as const;

      // UUID fields that should be explicitly set to null if not provided
      const uuidFields = ['vendor_id', 'collection_id', 'product_category', 'price_group', 'pricing_grid_id'];

      // ✅ Use effectiveOwnerId instead of userId for multi-tenant support
      const item: Record<string, any> = { user_id: effectiveOwnerId, active: true };
      for (const key of allowedKeys) {
        const val = raw[key as typeof allowedKeys[number]];
        // For UUID fields, explicitly include null values (don't filter them out)
        if (uuidFields.includes(key)) {
          item[key] = val || null;
        } else if (val !== undefined && val !== null && val !== '') {
          item[key] = val;
        }
      }

      // ✅ Override collection_id with resolved value (from auto-creation)
      item.collection_id = resolvedCollectionId;

      // Ensure required pricing fields have defaults
      if (item.cost_price == null || isNaN(item.cost_price)) item.cost_price = 0;
      if (item.selling_price == null || isNaN(item.selling_price)) {
        item.selling_price = item.price_per_unit || item.cost_price || 0;
      }

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .insert([item] as any)
        .select()
        .single();

      if (error) {
        // Surface Postgres error message to the UI
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Item created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating item: ${error.message}`);
    },
  });
};

export const useUpdateEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EnhancedInventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Item updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating item: ${error.message}`);
    },
  });
};

export const useDeleteEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enhanced_inventory_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting item: ${error.message}`);
    },
  });
};

export const useInventoryStats = (effectiveOwnerIdOverride?: string) => {
  // Use effective account owner for multi-tenant queries
  const { effectiveOwnerId: resolvedOwnerId, isLoading: ownerLoading } = useEffectiveAccountOwner();
  const effectiveOwnerId = effectiveOwnerIdOverride || resolvedOwnerId;

  return useQuery({
    queryKey: ["inventory-stats", effectiveOwnerId],
    enabled: !!effectiveOwnerId && !ownerLoading,
    queryFn: async () => {
      if (!effectiveOwnerId) throw new Error("Not authenticated");

      // Get total inventory count by category
      const { data: items, error } = await supabase
        .from("enhanced_inventory_items")
        .select("category, vendor_id, collection_id")
        .eq("user_id", effectiveOwnerId) // ✅ FIX: Use effectiveOwnerId
        .eq("active", true);

      if (error) throw error;

      const stats = {
        total: items?.length || 0,
        byCategory: {} as Record<string, number>,
        byVendor: {} as Record<string, number>,
        byCollection: {} as Record<string, number>,
      };

      items?.forEach((item) => {
        // Count by category
        if (item.category) {
          stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
        }
        // Count by vendor
        if (item.vendor_id) {
          stats.byVendor[item.vendor_id] = (stats.byVendor[item.vendor_id] || 0) + 1;
        }
        // Count by collection
        if (item.collection_id) {
          stats.byCollection[item.collection_id] = (stats.byCollection[item.collection_id] || 0) + 1;
        }
      });

      return stats;
    },
  });
};
