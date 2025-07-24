import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the business settings interface
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
      console.log('Fetching business settings...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found');
        return null;
      }

      console.log('User ID:', user.id);

      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching business settings:', error);
        throw error;
      }

      console.log('Business settings fetched:', data);
      return data;
    },
  });
};

export const useCreateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Omit<BusinessSettings, "id" | "user_id" | "created_at" | "updated_at">) => {
      console.log('Creating business settings with data:', settings);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('User ID for creation:', user.id);

      const { data, error } = await supabase
        .from('business_settings')
        .insert({
          ...settings,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating business settings:', error);
        throw error;
      }

      console.log('Business settings created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Create mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
    onError: (error) => {
      console.error('Create mutation failed:', error);
    },
  });
};

export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...settings }: Partial<BusinessSettings> & { id: string }) => {
      console.log('Updating business settings with ID:', id, 'Data:', settings);
      
      const { data, error } = await supabase
        .from('business_settings')
        .update(settings)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating business settings:', error);
        throw error;
      }

      console.log('Business settings updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Update mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
    onError: (error) => {
      console.error('Update mutation failed:', error);
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
