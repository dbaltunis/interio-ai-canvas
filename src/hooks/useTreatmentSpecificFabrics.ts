import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTreatmentConfig, TreatmentCategory } from "@/utils/treatmentTypeDetection";
import { resolveGridForProduct } from "@/utils/pricing/gridResolver";
import { getAcceptedSubcategories, getTreatmentPrimaryCategory, TREATMENT_SUBCATEGORIES } from "@/constants/inventorySubcategories";

export const useTreatmentSpecificFabrics = (treatmentCategory: TreatmentCategory) => {
  const treatmentConfig = getTreatmentConfig(treatmentCategory);
  
  return useQuery({
    queryKey: ["treatment-specific-fabrics", treatmentCategory],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Blinds that don't use fabric (venetian, vertical, cellular) return empty
      if (treatmentConfig.inventoryCategory === 'none') {
        console.log('🔍 Treatment does not use fabric inventory:', treatmentCategory);
        return [];
      }

      // Handle wallpaper separately - uses different category structure
      if (treatmentCategory === 'wallpaper') {
        console.log('🎨 Fetching wallpaper items with category:', treatmentConfig.inventoryCategory);
        
        const { data, error } = await supabase
          .from("enhanced_inventory_items")
          .select("*")
          .eq("category", treatmentConfig.inventoryCategory) // 'wallcovering'
          .eq("active", true)
          .order("name");

        if (error) throw error;
        
        console.log('✅ Found wallpaper items:', data?.length || 0);
        return data || [];
      }

      // Get accepted subcategories from centralized config
      const subcategoryConfig = TREATMENT_SUBCATEGORIES[treatmentCategory];
      const primaryCategory = getTreatmentPrimaryCategory(treatmentCategory);
      
      console.log('🔍 Fetching inventory for treatment:', treatmentCategory, 'category:', primaryCategory);

      let data, error;

      // Handle treatments that support both fabric and material (e.g., vertical blinds)
      if (primaryCategory === 'both' && subcategoryConfig.fabricSubcategories && subcategoryConfig.materialSubcategories) {
        // For treatments supporting both, fetch BOTH fabric items AND material items separately
        console.log('🔄 Fetching both fabric and material items');
        
        // Fetch fabric items
        const { data: fabricData, error: fabricError } = await supabase
          .from("enhanced_inventory_items")
          .select("*")
          .eq("category", "fabric")
          .in("subcategory", subcategoryConfig.fabricSubcategories)
          .eq("active", true)
          .order("name");

        if (fabricError) throw fabricError;

        // Fetch material items
        const { data: materialData, error: materialError } = await supabase
          .from("enhanced_inventory_items")
          .select("*")
          .or("category.eq.material,category.eq.hard_coverings")
          .in("subcategory", subcategoryConfig.materialSubcategories)
          .eq("active", true)
          .order("name");

        if (materialError) throw materialError;

        // Combine both results
        data = [...(fabricData || []), ...(materialData || [])];
        console.log('✅ Combined results:', fabricData?.length || 0, 'fabric +', materialData?.length || 0, 'material');
      } else {
        // For specific category treatments, filter by both category and subcategories
        const categories = getAcceptedSubcategories(treatmentCategory);
        console.log('🔍 Fetching with subcategories:', categories);
        
        const result = await supabase
          .from("enhanced_inventory_items")
          .select("*")
          .eq("category", primaryCategory)
          .in("subcategory", categories)
          .eq("active", true)
          .order("name");

        data = result.data;
        error = result.error;
      }

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
