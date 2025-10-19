import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTreatmentConfig, TreatmentCategory } from "@/utils/treatmentTypeDetection";

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

      // Handle both specific and generic treatment categories
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
        .in("category", categories)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!treatmentCategory,
  });
};
