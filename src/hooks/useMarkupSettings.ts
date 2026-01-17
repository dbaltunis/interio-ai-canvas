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
    // Manufacturing markups by treatment type
    curtain_making: number;
    blind_making: number;
    shutter_making: number;
    roman_making: number;
    [key: string]: number;
  };
  minimum_markup_percentage: number;
  dynamic_pricing_enabled: boolean;
  quantity_discounts_enabled: boolean;
  show_markup_to_staff: boolean;
}

export const defaultMarkupSettings: MarkupSettings = {
  default_markup_percentage: 0,
  labor_markup_percentage: 0,
  material_markup_percentage: 0,
  category_markups: {
    fabric: 0,
    hardware: 0,
    installation: 0,
    curtains: 0,
    blinds: 0,
    shutters: 0,
    // Manufacturing markups by treatment type
    curtain_making: 0,
    blind_making: 0,
    shutter_making: 0,
    roman_making: 0
  },
  minimum_markup_percentage: 0,
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
        
        // Deep merge category_markups to preserve all keys including new manufacturing ones
        return {
          ...defaultMarkupSettings,
          ...pricingSettings,
          category_markups: {
            ...defaultMarkupSettings.category_markups,
            ...(pricingSettings.category_markups || {})
          }
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

      // Fetch fresh business settings to avoid stale closure
      const { data: freshBusinessSettings } = await supabase
        .from('business_settings')
        .select('id, pricing_settings')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentSettings = freshBusinessSettings?.pricing_settings 
        ? (typeof freshBusinessSettings.pricing_settings === 'string' 
           ? JSON.parse(freshBusinessSettings.pricing_settings) 
           : freshBusinessSettings.pricing_settings)
        : { ...defaultMarkupSettings };

      // Ensure category_markups exists with all defaults
      const currentCategoryMarkups = {
        ...defaultMarkupSettings.category_markups,
        ...(currentSettings.category_markups || {})
      };

      // Deep merge: preserve all existing values, only override what's in newSettings
      const updatedSettings = {
        ...defaultMarkupSettings,
        ...currentSettings,
        ...newSettings,
        category_markups: newSettings.category_markups 
          ? { ...currentCategoryMarkups, ...newSettings.category_markups }
          : currentCategoryMarkups
      };

      console.log('[MARKUP SAVE] Current:', currentCategoryMarkups);
      console.log('[MARKUP SAVE] New:', newSettings.category_markups);
      console.log('[MARKUP SAVE] Final:', updatedSettings.category_markups);

      // Update existing business settings or create new one
      if (freshBusinessSettings?.id) {
        const { data, error } = await supabase
          .from('business_settings')
          .update({ pricing_settings: updatedSettings })
          .eq('id', freshBusinessSettings.id)
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