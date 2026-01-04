
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { settingsCacheService, CACHE_KEYS } from "@/services/settingsCacheService";
import { toast } from "sonner";

// Define the business settings interface directly since tables don't exist
export interface FeatureFlags {
  inventory_management: boolean;
  auto_extract_materials: boolean;
  leftover_tracking: boolean;
  order_batching: boolean;
  multi_location_inventory: boolean;
}

export interface InventoryConfig {
  track_inventory: boolean;
  track_leftovers: boolean;
  waste_buffer_percentage: number;
  auto_reorder_enabled: boolean;
  reorder_threshold_percentage: number;
  default_location: string;
  deduction_status_ids: string[];
  reversal_status_ids: string[];
  ecommerce_sync_enabled: boolean;
}

export interface BusinessSettings {
  id: string;
  user_id: string;
  company_name?: string;
  legal_name?: string;
  trading_name?: string;
  abn?: string;
  registration_number?: string;
  tax_number?: string;
  organization_type?: string;
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
  default_payment_terms_days?: number;
  financial_year_end_month?: number;
  financial_year_end_day?: number;
  // Bank account details
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_bsb?: string;
  bank_sort_code?: string;
  bank_routing_number?: string;
  bank_iban?: string;
  bank_swift_bic?: string;
  // Other settings
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
  system: 'metric' | 'imperial' | 'mixed';
  length: 'mm' | 'cm' | 'm' | 'inches' | 'feet';
  area: 'sq_mm' | 'sq_cm' | 'sq_m' | 'sq_inches' | 'sq_feet';
  fabric: 'cm' | 'm' | 'inches' | 'yards';
  currency: 'NZD' | 'AUD' | 'USD' | 'GBP' | 'EUR' | 'ZAR' | 'INR';
}

// Default to MM to match most users' settings and prevent flash during load
export const defaultMeasurementUnits: MeasurementUnits = {
  system: 'metric',
  length: 'mm',  // ✅ Changed from 'cm' to match database standard
  area: 'sq_cm', 
  fabric: 'm',
  currency: 'USD'
};

export const defaultImperialMeasurementUnits: MeasurementUnits = {
  system: 'imperial',
  length: 'inches',
  area: 'sq_feet',
  fabric: 'yards',
  currency: 'USD'
};

// Mixed system: inches for dimensions, meters for fabric, sq_feet for area (Homekaara style)
export const defaultMixedMeasurementUnits: MeasurementUnits = {
  system: 'mixed',
  length: 'inches',
  area: 'sq_feet',
  fabric: 'm',
  currency: 'INR'
};

export const useBusinessSettings = () => {
  return useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      console.log('🔍 Fetching business settings from Supabase...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First try to get user's business settings with actual data (company_name not null)
      let { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .not('company_name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no settings with data found, fallback to any record
      if (!data) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('business_settings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        data = fallbackData;
        error = fallbackError;
      }

      // Cache the settings for instant future loads
      if (data) {
        settingsCacheService.set(CACHE_KEYS.BUSINESS_SETTINGS, data);
        console.log('✅ Cached business settings to localStorage');
      }

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
    // Add staleTime to prevent unnecessary refetches
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      // Invalidate business settings and ALL dependent queries
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["measurement-units"] });
      queryClient.invalidateQueries({ queryKey: ["currency"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["window-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
      // Invalidate business settings and ALL dependent queries
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      queryClient.invalidateQueries({ queryKey: ["measurement-units"] });
      queryClient.invalidateQueries({ queryKey: ["currency"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["window-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// Utility functions for unit conversion
export const convertLength = (value: number, fromUnit: string, toUnit: string): number => {
  // Handle area conversions separately (convert to sq_mm base, then to target)
  const isAreaUnit = (unit: string) => unit.startsWith('sq_');
  
  if (isAreaUnit(fromUnit) || isAreaUnit(toUnit)) {
    // Convert to sq_mm first, then to target area unit
    const toSqMm = (val: number, unit: string): number => {
      switch (unit) {
        case 'sq_mm': return val;
        case 'sq_cm': return val * 100; // 1 cm² = 100 mm²
        case 'sq_m': return val * 1_000_000; // 1 m² = 1,000,000 mm²
        case 'sq_inches': return val * 645.16; // 1 in² = 645.16 mm²
        case 'sq_feet': return val * 92903.04; // 1 ft² = 92,903.04 mm²
        default: return val;
      }
    };

    const fromSqMm = (val: number, unit: string): number => {
      switch (unit) {
        case 'sq_mm': return val;
        case 'sq_cm': return val / 100;
        case 'sq_m': return val / 1_000_000;
        case 'sq_inches': return val / 645.16;
        case 'sq_feet': return val / 92903.04;
        default: return val;
      }
    };

    const sqMmValue = toSqMm(value, fromUnit);
    return fromSqMm(sqMmValue, toUnit);
  }
  
  // Linear conversions - convert everything to mm first, then to target unit
  const toMm = (val: number, unit: string): number => {
    switch (unit) {
      case 'mm': return val;
      case 'cm': return val * 10;
      case 'm': return val * 1000;
      case 'inches': return val * 25.4;
      case 'feet': return val * 304.8;
      case 'yards': return val * 914.4; // 1 yard = 914.4 mm
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
      case 'yards': return val / 914.4; // 1 yard = 914.4 mm
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

// Re-export the main currency formatter for consistency
export { formatCurrency } from '@/utils/currency';
