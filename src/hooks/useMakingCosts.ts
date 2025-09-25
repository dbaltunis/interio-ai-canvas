
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

// Mock data store with 7 main product types
let mockMakingCosts: MakingCost[] = [
  {
    id: 'mc-1',
    name: 'Curtains',
    description: 'Traditional and modern curtain configurations with heading styles and lining options',
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
  },
  {
    id: 'mc-2',
    name: 'Roman Blinds',
    description: 'Soft fabric roman blind configurations with manual and motorised options',
    pricing_method: 'per-sqm',
    measurement_type: 'width-height-only',
    include_fabric_selection: true,
    active: true,
    heading_options: [],
    hardware_options: [],
    lining_options: [],
    drop_ranges: [],
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mc-3',
    name: 'Roller Blinds',
    description: 'Single and double roller configurations with operation controls',
    pricing_method: 'per-sqm',
    measurement_type: 'width-height-only',
    include_fabric_selection: true,
    active: true,
    heading_options: [],
    hardware_options: [],
    lining_options: [],
    drop_ranges: [],
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mc-4',
    name: 'Venetian Blinds',
    description: 'Aluminium and faux wood venetians with material and slat size options',
    pricing_method: 'per-sqm',
    measurement_type: 'width-height-only',
    include_fabric_selection: false,
    active: true,
    heading_options: [],
    hardware_options: [],
    lining_options: [],
    drop_ranges: [],
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mc-5',
    name: 'Vertical Blinds',
    description: 'Fabric vertical blind configurations with track and operation options',
    pricing_method: 'per-sqm',
    measurement_type: 'width-height-only',
    include_fabric_selection: true,
    active: true,
    heading_options: [],
    hardware_options: [],
    lining_options: [],
    drop_ranges: [],
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mc-6',
    name: 'Honeycomb/Cellular',
    description: 'Pleated honeycomb blind configurations with cell sizes and operation types',
    pricing_method: 'per-sqm',
    measurement_type: 'width-height-only',
    include_fabric_selection: false,
    active: true,
    heading_options: [],
    hardware_options: [],
    lining_options: [],
    drop_ranges: [],
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mc-7',
    name: 'Shutters',
    description: 'Timber, PVC and aluminium shutters with material and operation configurations',
    pricing_method: 'per-sqm',
    measurement_type: 'custom-measurements',
    include_fabric_selection: false,
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
