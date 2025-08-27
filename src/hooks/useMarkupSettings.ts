import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessSettings } from "./useBusinessSettings";
import { toast } from "@/hooks/use-toast";

export interface MarkupSettings {
  default_markup_percentage: number;
  labor_markup_percentage: number;
  material_markup_percentage: number;
  category_markups: {
    fabric: number;
    hardware: number;
    installation: number;
    curtains: number;
    blinds: number;
    shutters: number;
    [key: string]: number;
  };
  minimum_markup_percentage: number;
  dynamic_pricing_enabled: boolean;
  quantity_discounts_enabled: boolean;
  show_markup_to_staff: boolean;
}

export const defaultMarkupSettings: MarkupSettings = {
  default_markup_percentage: 50,
  labor_markup_percentage: 30,
  material_markup_percentage: 40,
  category_markups: {
    fabric: 45,
    hardware: 35,
    installation: 25,
    curtains: 50,
    blinds: 45,
    shutters: 55
  },
  minimum_markup_percentage: 20,
  dynamic_pricing_enabled: false,
  quantity_discounts_enabled: false,
  show_markup_to_staff: false
};

export const useMarkupSettings = () => {
  const { data: businessSettings } = useBusinessSettings();
  
  return useQuery({
    queryKey: ["markup-settings"],
    queryFn: async () => {
      if (!businessSettings?.pricing_settings) {
        return defaultMarkupSettings;
      }
      
      try {
        const pricingSettings = typeof businessSettings.pricing_settings === 'string' 
          ? JSON.parse(businessSettings.pricing_settings) 
          : businessSettings.pricing_settings;
        
        return {
          ...defaultMarkupSettings,
          ...pricingSettings
        } as MarkupSettings;
      } catch (error) {
        console.error('Error parsing pricing settings:', error);
        return defaultMarkupSettings;
      }
    },
    enabled: !!businessSettings
  });
};

export const useUpdateMarkupSettings = () => {
  const queryClient = useQueryClient();
  const { data: businessSettings } = useBusinessSettings();

  return useMutation({
    mutationFn: async (newSettings: Partial<MarkupSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currentSettings = businessSettings?.pricing_settings 
        ? (typeof businessSettings.pricing_settings === 'string' 
           ? JSON.parse(businessSettings.pricing_settings) 
           : businessSettings.pricing_settings)
        : defaultMarkupSettings;

      const updatedSettings = {
        ...currentSettings,
        ...newSettings
      };

      // Update existing business settings or create new one
      if (businessSettings?.id) {
        const { data, error } = await supabase
          .from('business_settings')
          .update({ pricing_settings: updatedSettings })
          .eq('id', businessSettings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('business_settings')
          .insert({
            user_id: user.id,
            pricing_settings: updatedSettings
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["markup-settings"] });
      toast({
        title: "Success",
        description: "Markup settings updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating markup settings:', error);
      toast({
        title: "Error",
        description: "Failed to update markup settings",
        variant: "destructive"
      });
    }
  });
};

// Utility functions for markup calculations
export const calculateWithMarkup = (baseCost: number, category?: string, markupSettings?: MarkupSettings): number => {
  if (!markupSettings) return baseCost;
  
  let markupPercentage = markupSettings.default_markup_percentage;
  
  if (category && markupSettings.category_markups[category.toLowerCase()]) {
    markupPercentage = markupSettings.category_markups[category.toLowerCase()];
  }
  
  // Ensure minimum markup
  markupPercentage = Math.max(markupPercentage, markupSettings.minimum_markup_percentage);
  
  return baseCost * (1 + markupPercentage / 100);
};

export const getMarkupForCategory = (category: string, markupSettings?: MarkupSettings): number => {
  if (!markupSettings) return defaultMarkupSettings.default_markup_percentage;
  
  const categoryMarkup = markupSettings.category_markups[category.toLowerCase()];
  return categoryMarkup || markupSettings.default_markup_percentage;
};

export const calculateMarkupAmount = (baseCost: number, category?: string, markupSettings?: MarkupSettings): number => {
  const totalWithMarkup = calculateWithMarkup(baseCost, category, markupSettings);
  return totalWithMarkup - baseCost;
};