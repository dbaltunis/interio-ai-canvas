import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTreatmentConfig, TreatmentCategory } from "@/utils/treatmentTypeDetection";
import { resolveGridForProduct } from "@/utils/pricing/gridResolver";
import { getAcceptedSubcategories, getTreatmentPrimaryCategory, TREATMENT_SUBCATEGORIES } from "@/constants/inventorySubcategories";

const PAGE_SIZE = 100; // Increased for large TWC inventories

/**
 * Hook to fetch assigned price groups for a template
 */
const useTemplateAssignedPriceGroups = (templateId: string | undefined) => {
  return useQuery({
    queryKey: ["template-assigned-price-groups", templateId],
    queryFn: async () => {
      if (!templateId) return [];
      
      const { data, error } = await supabase
        .from("template_grid_assignments")
        .select(`
          pricing_grids:pricing_grid_id (
            price_group
          )
        `)
        .eq("template_id", templateId);

      if (error) {
        console.error("Error fetching template price groups:", error);
        return [];
      }
      
      // Extract unique price groups
      const priceGroups = data
        ?.map((d: any) => d.pricing_grids?.price_group)
        .filter(Boolean) as string[];
      
      return [...new Set(priceGroups)];
    },
    enabled: !!templateId,
    staleTime: 60000,
  });
};

/**
 * Enterprise-grade hook for fetching treatment-specific fabrics/materials
 * Features:
 * - Server-side search (filters at database level)
 * - Pagination with "Load More" (100 items per page)
 * - Batch grid queries (eliminates N+1 problem)
 * - Multi-tenant account isolation
 * - Optimized for large inventories (1000+ items)
 * - Filters by template's assigned pricing grids
 */
export const useTreatmentSpecificFabrics = (
  treatmentCategory: TreatmentCategory,
  searchTerm?: string,
  templateId?: string
) => {
  const { data: assignedPriceGroups = [] } = useTemplateAssignedPriceGroups(templateId);
  const treatmentConfig = getTreatmentConfig(treatmentCategory);
  
  return useInfiniteQuery({
    queryKey: ["treatment-specific-fabrics", treatmentCategory, searchTerm || "", templateId || "", assignedPriceGroups.join(",")],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's account for proper multi-tenant filtering
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, parent_account_id')
        .eq('user_id', user.id)
        .single();
      
      const accountId = profile?.parent_account_id || user.id;

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

      // Helper: add account filtering to query
      const addAccountFilter = (query: any) => {
        return query.or(`user_id.eq.${user.id},user_id.eq.${accountId}`);
      };

      // Helper: add price group filter if template has assigned grids
      const addPriceGroupFilter = (query: any) => {
        if (assignedPriceGroups.length > 0) {
          console.log('🎯 Filtering fabrics by price_groups:', assignedPriceGroups);
          return query.in("price_group", assignedPriceGroups);
        }
        console.log('⚠️ No assigned price groups - showing all fabrics');
        return query;
      };

      let items: any[] = [];
      let hasMore = false;

      // CRITICAL FIX: Handle material-based treatments that have inventoryCategory === 'none'
      if (treatmentConfig.inventoryCategory === 'none' && primaryCategory === 'material') {
        const subcategories = getAcceptedSubcategories(treatmentCategory);
        
        // PHASE 2 FIX: Build query with filters BEFORE pagination
        let query = supabase
          .from("enhanced_inventory_items")
          .select("*")
          .or("category.eq.material,category.eq.hard_coverings")
          .in("subcategory", subcategories)
          .eq("active", true);

        // Apply filters BEFORE range
        query = addAccountFilter(query);
        query = addPriceGroupFilter(query);
        query = buildSearchQuery(query);
        
        // Apply ordering and pagination LAST
        query = query.order("name").range(offset, offset + PAGE_SIZE);
        
        const { data, error } = await query;
        if (error) throw error;
        items = data || [];
        hasMore = items.length === PAGE_SIZE + 1;
        if (hasMore) items.pop();
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
          .eq("active", true);

        // Apply filters BEFORE pagination
        query = addAccountFilter(query);
        query = buildSearchQuery(query);
        
        // Apply ordering and pagination LAST
        query = query.order("name").range(offset, offset + PAGE_SIZE);
        
        const { data, error } = await query;
        if (error) throw error;
        items = data || [];
        hasMore = items.length === PAGE_SIZE + 1;
        if (hasMore) items.pop();
      }
      // Handle treatments that support both fabric and material (e.g., roller_blinds)
      else if (primaryCategory === 'both') {
        const subcategoryConfig = TREATMENT_SUBCATEGORIES[treatmentCategory];
        
        if (subcategoryConfig?.fabricSubcategories && subcategoryConfig?.materialSubcategories) {
          // PHASE 2 FIX: Build queries with filters BEFORE pagination
          let fabricQuery = supabase
            .from("enhanced_inventory_items")
            .select("*")
            .eq("category", "fabric")
            .in("subcategory", subcategoryConfig.fabricSubcategories)
            .eq("active", true);

          // Apply filters BEFORE pagination
          fabricQuery = addAccountFilter(fabricQuery);
          fabricQuery = addPriceGroupFilter(fabricQuery);
          fabricQuery = buildSearchQuery(fabricQuery);
          
          // Apply ordering and pagination LAST
          fabricQuery = fabricQuery.order("name").range(offset, offset + PAGE_SIZE);
          
          const { data: fabricData, error: fabricError } = await fabricQuery;
          if (fabricError) throw fabricError;

          let materialQuery = supabase
            .from("enhanced_inventory_items")
            .select("*")
            .or("category.eq.material,category.eq.hard_coverings")
            .in("subcategory", subcategoryConfig.materialSubcategories)
            .eq("active", true);

          // Apply filters BEFORE pagination
          materialQuery = addAccountFilter(materialQuery);
          materialQuery = addPriceGroupFilter(materialQuery);
          materialQuery = buildSearchQuery(materialQuery);
          
          // Apply ordering and pagination LAST
          materialQuery = materialQuery.order("name").range(offset, offset + PAGE_SIZE);
          
          const { data: materialData, error: materialError } = await materialQuery;
          if (materialError) throw materialError;

          items = [...(fabricData || []), ...(materialData || [])];
          hasMore = (fabricData?.length === PAGE_SIZE + 1) || (materialData?.length === PAGE_SIZE + 1);
          
          console.log('🔧 useTreatmentSpecificFabrics (both):', {
            treatmentCategory,
            assignedPriceGroups,
            fabricCount: fabricData?.length || 0,
            materialCount: materialData?.length || 0,
            totalItems: items.length,
          });
        }
      }
      // Standard category-based fetch
      else {
        const categories = getAcceptedSubcategories(treatmentCategory);
        
        // PHASE 2 FIX: Build query with filters BEFORE pagination
        let query = supabase
          .from("enhanced_inventory_items")
          .select("*")
          .eq("category", primaryCategory)
          .in("subcategory", categories)
          .eq("active", true);

        // Apply filters BEFORE pagination
        query = addAccountFilter(query);
        query = addPriceGroupFilter(query);
        query = buildSearchQuery(query);
        
        // Apply ordering and pagination LAST
        query = query.order("name").range(offset, offset + PAGE_SIZE);
        
        const { data, error } = await query;
        if (error) throw error;
        items = data || [];
        hasMore = items.length === PAGE_SIZE + 1;
        if (hasMore) items.pop();
      }

      // =====================================================
      // BATCH GRID QUERIES - Eliminates N+1 problem
      // =====================================================
      
      const directGridIds = items
        .filter(item => item.pricing_grid_id)
        .map(item => item.pricing_grid_id);
      const uniqueDirectGridIds = [...new Set(directGridIds)];

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

      // Enrich items with grid data
      const enrichedItems = await Promise.all(items.map(async (item) => {
        // Method 1: Direct pricing_grid_id
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
        
        // Method 2: Via price_group (resolve through pricing rules)
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
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
  });
};