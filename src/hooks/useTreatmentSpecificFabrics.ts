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

      // Many blind types can use curtain fabrics
      const categories = ['roman_blinds', 'roller_blinds', 'panel_glide'].includes(treatmentCategory)
        ? ['curtain_fabric', 'roller_blind_fabric']
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
