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

      // Check if this is a material-based treatment (venetian, vertical, shutters)
      const primaryCategory = getTreatmentPrimaryCategory(treatmentCategory);
      
      // CRITICAL FIX: Handle material-based treatments that have inventoryCategory === 'none'
      // These treatments USE materials but aren't configured in inventoryCategory
      if (treatmentConfig.inventoryCategory === 'none' && primaryCategory === 'material') {
        console.log('🔍 Material-based treatment detected:', treatmentCategory);
        
        // Get material subcategories for this treatment
        const subcategories = getAcceptedSubcategories(treatmentCategory);
        console.log('📋 Fetching materials with subcategories:', subcategories);
        
        const { data, error } = await supabase
          .from("enhanced_inventory_items")
          .select("*")
          .or("category.eq.material,category.eq.hard_coverings")
          .in("subcategory", subcategories)
          .eq("active", true)
          .order("name");

        if (error) throw error;
        
        console.log('✅ Found material items:', data?.length || 0);
        
        // Enrich materials with pricing grid data
        const enrichedMaterials = await Promise.all((data || []).map(async (material) => {
          // CRITICAL FIX: Check for BOTH price_group AND pricing_grid_id
          // Some materials have direct pricing_grid_id without price_group
          
          // Method 1: Direct pricing_grid_id (highest priority)
          if (material.pricing_grid_id) {
            try {
              console.log('🔗 Fetching direct grid for material:', {
                materialName: material.name,
                pricingGridId: material.pricing_grid_id
              });
              
              const { data: gridData, error } = await supabase
                .from('pricing_grids')
                .select('*')
                .eq('id', material.pricing_grid_id)
                .eq('active', true)
                .single();
              
              if (gridData && !error) {
                console.log('✅ Direct grid found for material:', material.name, gridData.name);
                return {
                  ...material,
                  pricing_grid_data: gridData.grid_data,
                  resolved_grid_name: gridData.name,
                  resolved_grid_code: gridData.grid_code,
                  resolved_grid_id: gridData.id
                };
              } else {
                console.log('⚠️ Direct grid not found or inactive:', material.pricing_grid_id);
              }
            } catch (error) {
              console.error('Error fetching direct grid for material:', material.name, error);
            }
          }
          
          // Method 2: Via price_group (resolve through pricing rules)
          if (material.price_group) {
            try {
              // CRITICAL: For materials, use treatment category as product_type if product_category not set
              const productType = material.product_category || treatmentCategory;
              
              console.log('🔗 Resolving grid via price_group for material:', {
                materialName: material.name,
                priceGroup: material.price_group,
                productType,
                originalProductCategory: material.product_category
              });
              
              const gridResult = await resolveGridForProduct({
                productType,
                systemType: material.system_type,
                fabricPriceGroup: material.price_group,
                userId: user.id
              });
              
              if (gridResult.gridId) {
                console.log('✅ Grid resolved via price_group for material:', material.name, gridResult.gridName);
                return {
                  ...material,
                  pricing_grid_data: gridResult.gridData,
                  resolved_grid_name: gridResult.gridName,
                  resolved_grid_code: gridResult.gridCode,
                  resolved_grid_id: gridResult.gridId
                };
              } else {
                console.log('⚠️ No grid found via price_group for material:', material.name);
              }
            } catch (error) {
              console.error('Error enriching material with grid:', material.name, error);
            }
          }
          
          return material;
        }));
        
        console.log('✅ Enriched materials with grids:', enrichedMaterials.filter((m: any) => m.pricing_grid_data).length);
        return enrichedMaterials;
      }
      
      // Original logic: Return empty for treatments that truly don't need inventory
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
      
      // Enrich fabrics/materials with pricing grid data
      const enrichedItems = await Promise.all((data || []).map(async (item) => {
        // CRITICAL FIX: Check for BOTH pricing_grid_id AND price_group
        // Some items have direct pricing_grid_id without price_group
        
        // Method 1: Direct pricing_grid_id (highest priority)
        if (item.pricing_grid_id) {
          try {
            console.log('🔗 Fetching direct grid for item:', {
              itemName: item.name,
              pricingGridId: item.pricing_grid_id
            });
            
            const { data: gridData, error } = await supabase
              .from('pricing_grids')
              .select('*')
              .eq('id', item.pricing_grid_id)
              .eq('active', true)
              .single();
            
            if (gridData && !error) {
              console.log('✅ Direct grid found for item:', item.name, gridData.name);
              return {
                ...item,
                pricing_grid_data: gridData.grid_data,
                resolved_grid_name: gridData.name,
                resolved_grid_code: gridData.grid_code,
                resolved_grid_id: gridData.id
              };
            }
          } catch (error) {
            console.error('Error fetching direct grid for item:', item.name, error);
          }
        }
        
        // Method 2: Via price_group (resolve through pricing rules)
        if (item.price_group) {
          try {
            // Use product_category if set, otherwise use treatment category
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
      
      console.log('✅ Enriched items with grids:', enrichedItems.filter((f: any) => f.pricing_grid_data).length);
      return enrichedItems;
    },
    enabled: !!treatmentCategory,
  });
};
