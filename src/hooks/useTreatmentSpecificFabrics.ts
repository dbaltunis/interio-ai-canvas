import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTreatmentConfig, TreatmentCategory } from "@/utils/treatmentTypeDetection";
import { resolveGridForProduct } from "@/utils/pricing/gridResolver";
import { getAcceptedSubcategories, getTreatmentPrimaryCategory } from "@/constants/inventorySubcategories";

export const useTreatmentSpecificFabrics = (treatmentCategory: TreatmentCategory) => {
  const config = getTreatmentConfig(treatmentCategory);
  
  return useQuery({
    queryKey: ["treatment-specific-fabrics", treatmentCategory],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Blinds that don't use fabric (venetian, vertical, cellular) return empty
      if (config.inventoryCategory === 'none') {
        console.log('🔍 Treatment does not use fabric inventory:', treatmentCategory);
        return [];
      }

      // Handle wallpaper separately - uses different category structure
      if (treatmentCategory === 'wallpaper') {
        console.log('🎨 Fetching wallpaper items with category:', config.inventoryCategory);
        
        const { data, error } = await supabase
          .from("enhanced_inventory_items")
          .select("*")
          .eq("category", config.inventoryCategory) // 'wallcovering'
          .eq("active", true)
          .order("name");

        if (error) throw error;
        
        console.log('✅ Found wallpaper items:', data?.length || 0);
        return data || [];
      }

      // Get accepted subcategories from centralized config
      const categories = getAcceptedSubcategories(treatmentCategory);
      const primaryCategory = getTreatmentPrimaryCategory(treatmentCategory);
      
      console.log('🔍 Fetching inventory for treatment:', treatmentCategory, 'category:', primaryCategory, 'with subcategories:', categories);

      // Handle treatments that support both fabric and material (e.g., vertical blinds)
      let query = supabase
        .from("enhanced_inventory_items")
        .select("*");

      if (primaryCategory === 'both') {
        // For treatments supporting both, filter by subcategories only (includes both fabric and material)
        query = query.in("subcategory", categories);
      } else {
        // For specific category treatments, filter by both category and subcategories
        query = query.eq("category", primaryCategory).in("subcategory", categories);
      }

      const { data, error } = await query
        .eq("active", true)
        .order("name");

      if (error) throw error;
      
      // Enrich fabrics with pricing grid data
      const enrichedFabrics = await Promise.all((data || []).map(async (fabric) => {
        // If fabric has price_group and product_category, resolve its pricing grid
        if (fabric.price_group && fabric.product_category) {
          try {
            const gridResult = await resolveGridForProduct({
              productType: fabric.product_category,
              systemType: undefined,
              fabricPriceGroup: fabric.price_group,
              userId: user.id
            });
            
            if (gridResult.gridId) {
              return {
                ...fabric,
                pricing_grid_data: gridResult.gridData,
                resolved_grid_name: gridResult.gridName,
                resolved_grid_code: gridResult.gridCode,
                resolved_grid_id: gridResult.gridId
              };
            }
          } catch (error) {
            console.error('Error enriching fabric with grid:', fabric.name, error);
          }
        }
        return fabric;
      }));
      
      console.log('✅ Enriched fabrics with grids:', enrichedFabrics.filter((f: any) => f.pricing_grid_data).length);
      return enrichedFabrics;
    },
    enabled: !!treatmentCategory,
  });
};
