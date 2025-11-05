import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTreatmentConfig, TreatmentCategory } from "@/utils/treatmentTypeDetection";
import { resolveGridForProduct } from "@/utils/pricing/gridResolver";

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

      // Handle both specific and generic treatment categories for fabrics
      const categories = treatmentCategory === 'roller_blinds' || (treatmentCategory === 'blinds' && config.inventoryCategory === 'roller_blind_fabric')
        ? ['roller_fabric', 'roller_blind_fabric'] // Support both naming conventions
        : treatmentCategory === 'roman_blinds' || (treatmentCategory === 'blinds' && config.inventoryCategory === 'curtain_fabric')
        ? ['curtain_fabric'] // Roman blinds use curtain fabrics
        : treatmentCategory === 'panel_glide'
        ? ['panel_glide_fabric', 'curtain_fabric']
        : treatmentCategory === 'curtains'
        ? ['curtain_fabric']
        : [config.inventoryCategory];
      
      console.log('🔍 Fetching fabrics for treatment:', treatmentCategory, 'with categories:', categories);

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("*")
        .eq("category", "fabric")
        .in("subcategory", categories)
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
