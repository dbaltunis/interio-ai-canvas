
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface HardwareOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockHardwareOptions: HardwareOption[] = [
  {
    id: '1',
    name: 'Standard Track',
    description: 'Basic curtain track',
    price: 25,
    unit: 'per-meter',
    active: true,
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Premium Rod',
    description: 'High-quality curtain rod',
    price: 45,
    unit: 'per-piece',
    active: true,
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useHardwareOptions = () => {
  return useQuery({
    queryKey: ['hardware-options'],
    queryFn: async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockHardwareOptions;
    },
  });
};

export const useCreateHardwareOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<HardwareOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const newOption: HardwareOption = {
        ...option,
        id: `hw-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockHardwareOptions.push(newOption);
      return newOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
    },
  });
};

export const useUpdateHardwareOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HardwareOption> & { id: string }) => {
      const index = mockHardwareOptions.findIndex(opt => opt.id === id);
      if (index === -1) {
        throw new Error('Hardware option not found');
      }

      mockHardwareOptions[index] = {
        ...mockHardwareOptions[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      return mockHardwareOptions[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
    },
  });
};

export const useDeleteHardwareOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const index = mockHardwareOptions.findIndex(opt => opt.id === id);
      if (index !== -1) {
        mockHardwareOptions.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
    },
  });
};
