
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TreatmentTypeOption {
  id?: string;
  name: string;
  description?: string;
  cost?: number;
}

export interface TreatmentTypeSpecifications {
  options?: TreatmentTypeOption[];
  [key: string]: any;
}

export interface TreatmentType {
  id: string;
  name: string;
  description?: string;
  category: string;
  labor_rate?: number;
  estimated_hours?: number;
  complexity?: 'Low' | 'Medium' | 'High';
  required_materials?: string[];
  specifications?: TreatmentTypeSpecifications;
  active?: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export const useTreatmentTypes = () => {
  return useQuery({
    queryKey: ['treatment-types'],
    queryFn: async () => {
      // Since treatment_types table doesn't exist in current schema, return mock data
      const mockData: TreatmentType[] = [
        {
          id: '1',
          name: 'Electric Roller Blinds',
          description: 'Motorized roller blinds with remote control',
          category: 'Blinds',
          labor_rate: 85,
          estimated_hours: 2.5,
          complexity: 'High',
          required_materials: ['Motor', 'Control Unit', 'Brackets', 'Fabric'],
          user_id: 'mock',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Manual Venetian Blinds',
          description: 'Traditional venetian blinds with cord control',
          category: 'Blinds',
          labor_rate: 45,
          estimated_hours: 1.0,
          complexity: 'Low',
          required_materials: ['Slats', 'Cord', 'Brackets'],
          user_id: 'mock',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return mockData;
    },
  });
};

export const useCreateTreatmentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (treatmentType: Omit<TreatmentType, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation - would normally insert to database
      console.log('Creating treatment type:', treatmentType);
      return { ...treatmentType, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-types'] });
    },
  });
};

export const useUpdateTreatmentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TreatmentType> & { id: string }) => {
      // Mock implementation - would normally update database
      console.log('Updating treatment type:', id, updates);
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-types'] });
    },
  });
};

export const useDeleteTreatmentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation - would normally delete from database
      console.log('Deleting treatment type:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-types'] });
    },
  });
};
