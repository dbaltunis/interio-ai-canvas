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

// ✅ FIX: Default values are now 0% - user must explicitly set markups
// Previously had hardcoded 50%/40%/30% which applied even when user set 0% in settings
export const defaultMarkupSettings: MarkupSettings = {
  default_markup_percentage: 0,   // User must set intentionally
  labor_markup_percentage: 0,     // User must set intentionally
  material_markup_percentage: 0,  // User must set intentionally - was 40% causing double-markup!
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
    queryKey: ["markup-settings", businessSettings?.id],
    queryFn: async () => {
      if (!businessSettings?.pricing_settings) {
        console.log('[MARKUP LOAD] No pricing_settings found, returning defaults');
        return defaultMarkupSettings;
      }
      
      try {
        const pricingSettings = typeof businessSettings.pricing_settings === 'string' 
          ? JSON.parse(businessSettings.pricing_settings) 
          : businessSettings.pricing_settings;
        
        // ✅ FIX: Use nullish coalescing (??) to preserve explicit 0 values from database
        // The spread operator treats 0 and undefined the same, which was overwriting user's 0% settings
        const merged: MarkupSettings = {
          default_markup_percentage: pricingSettings.default_markup_percentage ?? defaultMarkupSettings.default_markup_percentage,
          labor_markup_percentage: pricingSettings.labor_markup_percentage ?? defaultMarkupSettings.labor_markup_percentage,
          material_markup_percentage: pricingSettings.material_markup_percentage ?? defaultMarkupSettings.material_markup_percentage,
          minimum_markup_percentage: pricingSettings.minimum_markup_percentage ?? defaultMarkupSettings.minimum_markup_percentage,
          dynamic_pricing_enabled: pricingSettings.dynamic_pricing_enabled ?? defaultMarkupSettings.dynamic_pricing_enabled,
          quantity_discounts_enabled: pricingSettings.quantity_discounts_enabled ?? defaultMarkupSettings.quantity_discounts_enabled,
          show_markup_to_staff: pricingSettings.show_markup_to_staff ?? defaultMarkupSettings.show_markup_to_staff,
          category_markups: {
            ...defaultMarkupSettings.category_markups,
            ...(pricingSettings.category_markups || {})
          }
        };
        
        console.log('[MARKUP LOAD] Loaded from DB:', merged.category_markups);
        return merged;
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

      // ✅ FIX: Get effective account owner for multi-tenant support
      // Team members (admins) must save to account owner's record, not their own
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", user.id)
        .single();
      
      const effectiveOwnerId = profile?.parent_account_id || user.id;
      console.log('[MARKUP SAVE] Effective owner:', effectiveOwnerId, 'Current user:', user.id);

      // Fetch fresh business settings using effective owner ID
      const { data: freshBusinessSettings } = await supabase
        .from('business_settings')
        .select('id, pricing_settings')
        .eq('user_id', effectiveOwnerId)
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

      console.log('[MARKUP SAVE] ====== SAVE OPERATION ======');
      console.log('[MARKUP SAVE] Current from DB:', JSON.stringify(currentCategoryMarkups, null, 2));
      console.log('[MARKUP SAVE] New from form:', JSON.stringify(newSettings.category_markups, null, 2));
      console.log('[MARKUP SAVE] Final merged:', JSON.stringify(updatedSettings.category_markups, null, 2));
      console.log('[MARKUP SAVE] Manufacturing keys:', {
        curtain_making: updatedSettings.category_markups.curtain_making,
        blind_making: updatedSettings.category_markups.blind_making,
        roman_making: updatedSettings.category_markups.roman_making,
        shutter_making: updatedSettings.category_markups.shutter_making
      });

      // Update existing business settings or create new one
      if (freshBusinessSettings?.id) {
        console.log('[MARKUP SAVE] Updating existing record ID:', freshBusinessSettings.id);
        const { data, error } = await supabase
          .from('business_settings')
          .update({ pricing_settings: updatedSettings })
          .eq('id', freshBusinessSettings.id)
          .select()
          .single();

        if (error) {
          console.error('[MARKUP SAVE] UPDATE ERROR:', error);
          throw error;
        }
        console.log('[MARKUP SAVE] ✅ Successfully updated in DB');
        return data;
      } else {
        console.log('[MARKUP SAVE] Creating new record for effective owner:', effectiveOwnerId);
        const { data, error } = await supabase
          .from('business_settings')
          .insert({
            user_id: effectiveOwnerId,  // ✅ FIX: Use effective owner, not current user
            pricing_settings: updatedSettings
          })
          .select()
          .single();

        if (error) {
          console.error('[MARKUP SAVE] INSERT ERROR:', error);
          throw error;
        }
        console.log('[MARKUP SAVE] ✅ Successfully inserted in DB');
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