import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTreatmentConfig, TreatmentCategory } from "@/utils/treatmentTypeDetection";
import { resolveGridForProduct } from "@/utils/pricing/gridResolver";
import { getAcceptedSubcategories, getTreatmentPrimaryCategory, TREATMENT_SUBCATEGORIES } from "@/constants/inventorySubcategories";

const PAGE_SIZE = 50;

/**
 * Enterprise-grade hook for fetching treatment-specific fabrics/materials
 * Features:
 * - Server-side search (filters at database level)
 * - Pagination with "Load More" (50 items per page)
 * - Batch grid queries (eliminates N+1 problem)
 * - Optimized for large inventories (1000+ items)
 */
export const useTreatmentSpecificFabrics = (
  treatmentCategory: TreatmentCategory,
  searchTerm?: string
) => {
  const treatmentConfig = getTreatmentConfig(treatmentCategory);
  
  return useInfiniteQuery({
    queryKey: ["treatment-specific-fabrics", treatmentCategory, searchTerm || ""],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const primaryCategory = getTreatmentPrimaryCategory(treatmentCategory);
      const offset = pageParam * PAGE_SIZE;
      
      // Build base query with server-side search
      const buildSearchQuery = (query: any) => {
        if (searchTerm && searchTerm.length >= 2) {
          const searchPattern = `%${searchTerm}%`;
          query = query.or(
            `name.ilike.${searchPattern},sku.ilike.${searchPattern},supplier.ilike.${searchPattern},description.ilike.${searchPattern}`
          );
        }
        return query;
      };

      let items: any[] = [];
      let hasMore = false;

      // CRITICAL FIX: Handle material-based treatments that have inventoryCategory === 'none'
      if (treatmentConfig.inventoryCategory === 'none' && primaryCategory === 'material') {
        const subcategories = getAcceptedSubcategories(treatmentCategory);
        
        let query = supabase
          .from("enhanced_inventory_items")
          .select("*")
          .or("category.eq.material,category.eq.hard_coverings")
          .in("subcategory", subcategories)
          .eq("active", true)
          .order("name")
          .range(offset, offset + PAGE_SIZE);

        query = buildSearchQuery(query);
        const { data, error } = await query;
        if (error) throw error;
        items = data || [];
        hasMore = items.length === PAGE_SIZE + 1;
        if (hasMore) items.pop(); // Remove extra item used for hasMore check
      }
      // Return empty for treatments that truly don't need inventory
      else if (treatmentConfig.inventoryCategory === 'none') {
        return { items: [], nextPage: undefined, hasMore: false };
      }
      // Handle wallpaper separately
      else if (treatmentCategory === 'wallpaper') {
        let query = supabase
          .from("enhanced_inventory_items")
          .select("*")
          .eq("category", treatmentConfig.inventoryCategory)
          .eq("active", true)
          .order("name")
          .range(offset, offset + PAGE_SIZE);

        query = buildSearchQuery(query);
        const { data, error } = await query;
        if (error) throw error;
        items = data || [];
        hasMore = items.length === PAGE_SIZE + 1;
        if (hasMore) items.pop();
      }
      // Handle treatments that support both fabric and material
      else if (primaryCategory === 'both') {
        const subcategoryConfig = TREATMENT_SUBCATEGORIES[treatmentCategory];
        
        if (subcategoryConfig?.fabricSubcategories && subcategoryConfig?.materialSubcategories) {
          // Fetch fabric items (half the page size each)
          const halfLimit = Math.floor(PAGE_SIZE / 2);
          
          let fabricQuery = supabase
            .from("enhanced_inventory_items")
            .select("*")
            .eq("category", "fabric")
            .in("subcategory", subcategoryConfig.fabricSubcategories)
            .eq("active", true)
            .order("name")
            .range(offset, offset + halfLimit);

          fabricQuery = buildSearchQuery(fabricQuery);
          const { data: fabricData, error: fabricError } = await fabricQuery;
          if (fabricError) throw fabricError;

          // Fetch material items
          let materialQuery = supabase
            .from("enhanced_inventory_items")
            .select("*")
            .or("category.eq.material,category.eq.hard_coverings")
            .in("subcategory", subcategoryConfig.materialSubcategories)
            .eq("active", true)
            .order("name")
            .range(offset, offset + halfLimit);

          materialQuery = buildSearchQuery(materialQuery);
          const { data: materialData, error: materialError } = await materialQuery;
          if (materialError) throw materialError;

          items = [...(fabricData || []), ...(materialData || [])];
          hasMore = (fabricData?.length === halfLimit + 1) || (materialData?.length === halfLimit + 1);
        }
      }
      // Standard category-based fetch
      else {
        const categories = getAcceptedSubcategories(treatmentCategory);
        
        let query = supabase
          .from("enhanced_inventory_items")
          .select("*")
          .eq("category", primaryCategory)
          .in("subcategory", categories)
          .eq("active", true)
          .order("name")
          .range(offset, offset + PAGE_SIZE);

        query = buildSearchQuery(query);
        const { data, error } = await query;
        if (error) throw error;
        items = data || [];
        hasMore = items.length === PAGE_SIZE + 1;
        if (hasMore) items.pop();
      }

      // =====================================================
      // BATCH GRID QUERIES - Eliminates N+1 problem
      // Instead of 1 query per item, we do 1 batch query
      // =====================================================
      
      // Step 1: Collect all unique pricing_grid_ids
      const directGridIds = items
        .filter(item => item.pricing_grid_id)
        .map(item => item.pricing_grid_id);
      const uniqueDirectGridIds = [...new Set(directGridIds)];

      // Step 2: Batch fetch ALL grids in ONE query
      let gridMap = new Map<string, any>();
      if (uniqueDirectGridIds.length > 0) {
        const { data: allGrids, error: gridError } = await supabase
          .from('pricing_grids')
          .select('*')
          .in('id', uniqueDirectGridIds)
          .eq('active', true);

        if (!gridError && allGrids) {
          gridMap = new Map(allGrids.map(g => [g.id, g]));
        }
      }

      // Step 3: Enrich items using the batch-fetched grid map (instant, no queries)
      const enrichedItems = await Promise.all(items.map(async (item) => {
        // Method 1: Direct pricing_grid_id (instant lookup from map)
        if (item.pricing_grid_id && gridMap.has(item.pricing_grid_id)) {
          const grid = gridMap.get(item.pricing_grid_id);
          return {
            ...item,
            pricing_grid_data: grid.grid_data,
            resolved_grid_name: grid.name,
            resolved_grid_code: grid.grid_code,
            resolved_grid_id: grid.id
          };
        }
        
        // Method 2: Via price_group (resolve through pricing rules - only for items without direct grid)
        if (item.price_group && !item.pricing_grid_id) {
          try {
            const productType = item.product_category || treatmentCategory;
            const gridResult = await resolveGridForProduct({
              productType,
              systemType: item.system_type,
              fabricPriceGroup: item.price_group,
              userId: user.id
            });
            
            if (gridResult.gridId) {
              return {
                ...item,
                pricing_grid_data: gridResult.gridData,
                resolved_grid_name: gridResult.gridName,
                resolved_grid_code: gridResult.gridCode,
                resolved_grid_id: gridResult.gridId
              };
            }
          } catch (error) {
            console.error('Error enriching item with grid:', item.name, error);
          }
        }
        
        return item;
      }));
      
      return {
        items: enrichedItems,
        nextPage: hasMore ? pageParam + 1 : undefined,
        hasMore
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!treatmentCategory,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};
