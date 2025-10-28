
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the business settings interface directly since tables don't exist
export interface FeatureFlags {
  inventory_management: boolean;
  auto_extract_materials: boolean;
  leftover_tracking: boolean;
  order_batching: boolean;
  multi_location_inventory: boolean;
}

export interface InventoryConfig {
  track_leftovers: boolean;
  waste_buffer_percentage: number;
  auto_reorder_enabled: boolean;
  reorder_threshold_percentage: number;
  default_location: string;
}

export interface BusinessSettings {
  id: string;
  user_id: string;
  company_name?: string;
  abn?: string;
  business_email?: string;
  business_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  website?: string;
  company_logo_url?: string;
  measurement_units?: string;
  tax_rate?: number;
  tax_type?: 'none' | 'vat' | 'gst' | 'sales_tax';
  pricing_settings?: any;
  allow_in_app_template_editing?: boolean;
  default_profit_margin_percentage?: number;
  minimum_profit_margin_percentage?: number;
  show_profit_margins_to_staff?: boolean;
  show_vendor_costs_to_managers?: boolean;
  show_vendor_costs_to_staff?: boolean;
  features_enabled?: FeatureFlags;
  inventory_config?: InventoryConfig;
  created_at: string;
  updated_at: string;
}

export interface MeasurementUnits {
  system: 'metric' | 'imperial';
  length: 'mm' | 'cm' | 'm' | 'inches' | 'feet';
  area: 'sq_mm' | 'sq_cm' | 'sq_m' | 'sq_inches' | 'sq_feet';
  fabric: 'cm' | 'm' | 'inches' | 'yards';
  currency: 'NZD' | 'AUD' | 'USD' | 'GBP' | 'EUR' | 'ZAR';
}

export const defaultMeasurementUnits: MeasurementUnits = {
  system: 'imperial',
  length: 'inches',
  area: 'sq_inches', 
  fabric: 'yards',
  currency: 'USD'
};

export const useBusinessSettings = () => {
  return useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First try to get user's own business settings, prioritizing the latest one with measurement_units
      let { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no settings found, try to get account owner's settings
      if (!data) {
        const { data: accountOwnerId } = await supabase
          .rpc('get_account_owner', { user_id_param: user.id });

        if (accountOwnerId && accountOwnerId !== user.id) {
          const { data: ownerSettings, error: ownerError } = await supabase
            .from('business_settings')
            .select('*')
            .eq('user_id', accountOwnerId)
            .maybeSingle();

          if (ownerError && ownerError.code !== 'PGRST116') {
            console.error('Error fetching account owner business settings:', ownerError);
          } else {
            data = ownerSettings;
          }
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching business settings:', error);
        return null;
      }

      return data;
    },
  });
};

export const useCreateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Omit<BusinessSettings, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('business_settings')
        .insert({
          ...settings,
          user_id: user.id,
          features_enabled: settings.features_enabled as any,
          inventory_config: settings.inventory_config as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
  });
};

export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...settings }: Partial<BusinessSettings> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = { ...settings };
      if (settings.features_enabled) {
        updateData.features_enabled = settings.features_enabled as any;
      }
      if (settings.inventory_config) {
        updateData.inventory_config = settings.inventory_config as any;
      }

      const { data, error } = await supabase
        .from('business_settings')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
  });
};

// Utility functions for unit conversion
export const convertLength = (value: number, fromUnit: string, toUnit: string): number => {
  // Convert everything to mm first, then to target unit
  const toMm = (val: number, unit: string): number => {
    switch (unit) {
      case 'mm': return val;
      case 'cm': return val * 10;
      case 'm': return val * 1000;
      case 'inches': return val * 25.4;
      case 'feet': return val * 304.8;
      default: return val;
    }
  };

  const fromMm = (val: number, unit: string): number => {
    switch (unit) {
      case 'mm': return val;
      case 'cm': return val / 10;
      case 'm': return val / 1000;
      case 'inches': return val / 25.4;
      case 'feet': return val / 304.8;
      default: return val;
    }
  };

  const mmValue = toMm(value, fromUnit);
  return fromMm(mmValue, toUnit);
};

export const formatMeasurement = (value: number, unit: string): string => {
  const unitLabels: Record<string, string> = {
    'mm': 'mm',
    'cm': 'cm', 
    'm': 'm',
    'inches': '"',
    'feet': "'",
    'yards': 'yd',
    'sq_mm': 'mm²',
    'sq_cm': 'cm²',
    'sq_m': 'm²',
    'sq_inches': 'in²',
    'sq_feet': 'ft²'
  };

  return `${value.toFixed(2)} ${unitLabels[unit] || unit}`;
};

export const formatCurrency = (value: number, currency: string): string => {
  const currencySymbols: Record<string, string> = {
    'NZD': 'NZ$',
    'AUD': 'A$',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'ZAR': 'R'
  };

  return `${currencySymbols[currency] || currency}${value.toFixed(2)}`;
};
