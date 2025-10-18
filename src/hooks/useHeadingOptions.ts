
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface HeadingOption {
  id: string;
  user_id?: string;
  name: string;
  fullness: number;
  price: number;
  type: string;
  extras?: any;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockHeadingOptions: HeadingOption[] = [
  {
    id: 'heading-1',
    user_id: 'mock-user',
    name: 'Pencil Pleat',
    fullness: 2.5,
    price: 25.00,
    type: 'gathered',
    description: 'Classic pencil pleat heading',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useHeadingOptions = () => {
  return useQuery({
    queryKey: ['heading-options'],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent redundant fetches
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    queryFn: async () => {
      // Mock implementation
      return mockHeadingOptions.filter(option => option.active);
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useCreateHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<HeadingOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      console.log('Mock creating heading option:', option);
      
      const newOption: HeadingOption = {
        ...option,
        id: `heading-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockHeadingOptions.push(newOption);
      
      console.log('Mock heading option created:', newOption);
      return newOption;
    },
    onSuccess: () => {
      console.log('Heading option created successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
    },
    onError: (error) => {
      console.error('Heading option creation failed:', error);
    },
  });
};

export const useUpdateHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeadingOption> & { id: string }) => {
      const index = mockHeadingOptions.findIndex(option => option.id === id);
      if (index !== -1) {
        mockHeadingOptions[index] = {
          ...mockHeadingOptions[index],
          ...updates,
          updated_at: new Date().toISOString()
        };
        return mockHeadingOptions[index];
      }
      throw new Error('Option not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
    },
  });
};

export const useDeleteHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const index = mockHeadingOptions.findIndex(option => option.id === id);
      if (index !== -1) {
        mockHeadingOptions.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
    },
  });
};
