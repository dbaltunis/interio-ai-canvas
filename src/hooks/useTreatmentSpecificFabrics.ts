import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTreatmentConfig, TreatmentCategory } from "@/utils/treatmentTypeDetection";
import { resolveGridForProduct } from "@/utils/pricing/gridResolver";
import { getAcceptedSubcategories, getTreatmentPrimaryCategory, TREATMENT_SUBCATEGORIES } from "@/constants/inventorySubcategories";
import { hasValidPricingGrid } from "@/utils/pricing/gridValidation";

const PAGE_SIZE = 30; // Reduced for faster initial load — user can search or load more

/**
 * Supplier filter for server-side filtering
 */
export interface SupplierFilter {
  vendorId?: string;
  supplierName?: string;
}

/**
 * Parse a unified supplier ID into a SupplierFilter
 */
export const parseUnifiedSupplierId = (unifiedId: string | undefined): SupplierFilter | undefined => {
  if (!unifiedId) return undefined;
  
  if (unifiedId.startsWith('supplier_text:')) {
    return { supplierName: unifiedId.replace('supplier_text:', '') };
  }
  
  // It's a real vendor UUID
  return { vendorId: unifiedId };
};

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
 * - Server-side vendor/supplier filtering
 * - Pagination with "Load More" (100 items per page)
 * - Batch grid queries (eliminates N+1 problem)
 * - Multi-tenant account isolation
 * - Optimized for large inventories (1000+ items)
 * - Filters by template's assigned pricing grids
 * - Filters by parent_product_id for TWC products
 */
export const useTreatmentSpecificFabrics = (
  treatmentCategory: TreatmentCategory,
  searchTerm?: string,
  templateId?: string,
  parentProductId?: string, // Filter to ONLY TWC-linked materials OR template's linked inventory item
  supplierFilter?: SupplierFilter // NEW: Server-side vendor/supplier filtering
) => {
  const { data: assignedPriceGroups = [] } = useTemplateAssignedPriceGroups(templateId);
  const treatmentConfig = getTreatmentConfig(treatmentCategory);
  
  return useInfiniteQuery({
    queryKey: ["treatment-specific-fabrics", treatmentCategory, searchTerm || "", templateId || "", assignedPriceGroups.join(","), parentProductId || "", JSON.stringify(supplierFilter || {})],
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
      
      // Build base query with server-side search (includes tags)
      const buildSearchQuery = (query: any) => {
        if (searchTerm && searchTerm.length >= 2) {
          const searchPattern = `%${searchTerm}%`;
          // Search across name, SKU, supplier, description AND tags array
          // Using contains operator (cs) for array search
          query = query.or(
            `name.ilike.${searchPattern},sku.ilike.${searchPattern},supplier.ilike.${searchPattern},description.ilike.${searchPattern},tags.cs.{${searchTerm.toLowerCase().replace(/\s+/g, '_')}}`
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

      // NEW: Helper to add supplier/vendor filter (SERVER-SIDE)
      const addSupplierFilter = (query: any) => {
        if (supplierFilter?.vendorId) {
          console.log('🏭 Server-side vendor filter:', supplierFilter.vendorId);
          return query.eq("vendor_id", supplierFilter.vendorId);
        }
        if (supplierFilter?.supplierName) {
          console.log('🏭 Server-side supplier text filter:', supplierFilter.supplierName);
          return query.ilike("supplier", supplierFilter.supplierName);
        }
        return query;
      };

      // =====================================================
      // PARENT PRODUCT / TEMPLATE ITEM FILTER - Shows ONLY linked materials
      // =====================================================
      // Priority 1: If parentProductId is provided, filter to materials that:
      //   a) Have this parent_product_id in their metadata (TWC pattern), OR
      //   b) ARE the parent product itself (for single-material templates)
      // This enables both TWC multi-material products AND single-item templates
      
      let items: any[] = [];
      let hasMore = false;
      
      if (parentProductId) {
        console.log('🔗 Template Filter: Showing materials linked to inventory_item_id:', parentProductId);
        
        // First try: get exact inventory item match (the template IS this product)
        let query = supabase
          .from("enhanced_inventory_items")
          .select("*")
          .or(`id.eq.${parentProductId},metadata->>parent_product_id.eq.${parentProductId}`)
          .eq("active", true);

        // Apply filters BEFORE pagination
        query = addAccountFilter(query);
        query = addSupplierFilter(query);
        query = buildSearchQuery(query);
        
        // Apply ordering and pagination LAST
        query = query.order("name").range(offset, offset + PAGE_SIZE);
        
        const { data, error } = await query;
        if (error) {
          console.error('Error fetching template-linked materials:', error);
          throw error;
        }
        
        console.log(`✅ Template Filter: Found ${data?.length || 0} materials for template`);
        items = data || [];
        hasMore = items.length === PAGE_SIZE + 1;
        if (hasMore) items.pop();
        
        // If we found the exact item, return it immediately (auto-select scenario)
        if (items.length === 1 && items[0].id === parentProductId) {
          console.log('🎯 Single material match - ready for auto-select');
        }
      }
      // CRITICAL FIX: Handle material-based treatments that have inventoryCategory === 'none'
      else if (treatmentConfig.inventoryCategory === 'none' && primaryCategory === 'material') {
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
        query = addSupplierFilter(query);
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
        query = addSupplierFilter(query);
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
          fabricQuery = addSupplierFilter(fabricQuery);
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
          materialQuery = addSupplierFilter(materialQuery);
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
        query = addSupplierFilter(query);
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

        // Method 2: From metadata.pricing_grid_data (TWC products store pricing here)
        // CRITICAL: This is where TWC products have their pricing grids stored!
        const metadataPricingGrid = (item.metadata as any)?.pricing_grid_data;
        // ✅ CRITICAL FIX: Use shared hasValidPricingGrid utility for consistent validation
        if (metadataPricingGrid && hasValidPricingGrid(metadataPricingGrid)) {
          console.log('📊 [TWC] Using pricing grid from metadata:', item.name);
          return {
            ...item,
            pricing_grid_data: metadataPricingGrid,
            resolved_grid_name: `${item.name} (TWC Grid)`,
            resolved_grid_code: item.sku || 'TWC',
            resolved_grid_id: 'metadata'
          };
        }

        // Method 3: Via price_group (resolve through pricing rules)
        if (item.price_group && !item.pricing_grid_id) {
          try {
            const productType = item.product_category || treatmentCategory;
            const gridResult = await resolveGridForProduct({
              productType,
              systemType: item.system_type,
              fabricPriceGroup: item.price_group,
              fabricSupplierId: item.vendor_id,
              userId: user.id
            });

            if (gridResult.gridId) {
              return {
                ...item,
                pricing_grid_data: gridResult.gridData,
                resolved_grid_name: gridResult.gridName,
                resolved_grid_code: gridResult.gridCode,
                resolved_grid_id: gridResult.gridId,
                pricing_grid_markup: gridResult.markupPercentage,
                pricing_grid_discount: gridResult.discountPercentage || 0
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