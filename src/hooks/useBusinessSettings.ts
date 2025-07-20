
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define the business settings interface directly since tables don't exist
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

// Mock storage
let mockBusinessSettings: BusinessSettings | null = null;

export const useBusinessSettings = () => {
  return useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      // Mock implementation
      return mockBusinessSettings;
    },
  });
};

export const useCreateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Omit<BusinessSettings, "id" | "user_id" | "created_at" | "updated_at">) => {
      // Mock implementation
      const newSettings: BusinessSettings = {
        ...settings,
        id: 'mock-id',
        user_id: 'mock-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockBusinessSettings = newSettings;
      return newSettings;
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
      // Mock implementation
      if (mockBusinessSettings && mockBusinessSettings.id === id) {
        mockBusinessSettings = {
          ...mockBusinessSettings,
          ...settings,
          updated_at: new Date().toISOString()
        };
      }
      return mockBusinessSettings!;
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
