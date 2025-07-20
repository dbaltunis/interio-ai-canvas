
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock interface for making costs
export interface MakingCost {
  id: string;
  name: string;
  description?: string;
  pricing_method: string;
  measurement_type: string;
  include_fabric_selection: boolean;
  active: boolean;
  heading_options: any[];
  hardware_options: any[];
  lining_options: any[];
  drop_ranges: any[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockMakingCosts: MakingCost[] = [
  {
    id: 'mc-1',
    name: 'Standard Curtain Making',
    description: 'Basic curtain making configuration',
    pricing_method: 'per-linear-meter',
    measurement_type: 'fabric-drop-required',
    include_fabric_selection: true,
    active: true,
    heading_options: [],
    hardware_options: [],
    lining_options: [],
    drop_ranges: [],
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useMakingCosts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMakingCosts = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockMakingCosts;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch making costs",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createMakingCost = {
    mutateAsync: async (data: Omit<MakingCost, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const newMakingCost: MakingCost = {
        ...data,
        id: `mc-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockMakingCosts.push(newMakingCost);
      
      toast({
        title: "Success",
        description: "Making cost configuration created successfully"
      });
      
      return newMakingCost;
    },
    isPending: isLoading
  };

  const updateMakingCost = {
    mutateAsync: async ({ id, updates }: { id: string; updates: Partial<MakingCost> }) => {
      const index = mockMakingCosts.findIndex(mc => mc.id === id);
      if (index === -1) {
        throw new Error('Making cost not found');
      }

      mockMakingCosts[index] = {
        ...mockMakingCosts[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      toast({
        title: "Success",
        description: "Making cost configuration updated successfully"
      });

      return mockMakingCosts[index];
    },
    isPending: isLoading
  };

  const deleteMakingCost = {
    mutateAsync: async (id: string) => {
      const index = mockMakingCosts.findIndex(mc => mc.id === id);
      if (index !== -1) {
        mockMakingCosts.splice(index, 1);
        toast({
          title: "Success",
          description: "Making cost configuration deleted successfully"
        });
      }
    },
    isPending: isLoading
  };

  return {
    makingCosts: mockMakingCosts,
    isLoading,
    fetchMakingCosts,
    createMakingCost,
    updateMakingCost,
    deleteMakingCost
  };
};
