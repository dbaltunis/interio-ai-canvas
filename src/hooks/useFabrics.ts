
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Fabric {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  fabric_width: number;
  pattern_repeat: number;
  vertical_repeat: number;
  horizontal_repeat: number;
  rotation_allowed: boolean;
  fabric_type?: string;
  weight?: string;
  care_instructions?: string;
  supplier?: string;
  fabric_code?: string;
  cost_per_meter: number;
  active: boolean;
  image_url?: string;
  roll_direction: string;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockFabrics: Fabric[] = [
  {
    id: "fab-1",
    user_id: "mock-user",
    name: "Cotton Canvas",
    description: "Premium cotton canvas fabric",
    fabric_width: 140,
    pattern_repeat: 0,
    vertical_repeat: 0,
    horizontal_repeat: 0,
    rotation_allowed: true,
    fabric_type: "Cotton",
    weight: "Medium",
    supplier: "Premium Fabrics Ltd",
    fabric_code: "CC140",
    cost_per_meter: 25.50,
    active: true,
    roll_direction: "face-out",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "fab-2",
    user_id: "mock-user",
    name: "Silk Dupioni",
    description: "Luxury silk dupioni with natural texture",
    fabric_width: 110,
    pattern_repeat: 15,
    vertical_repeat: 15,
    horizontal_repeat: 12,
    rotation_allowed: false,
    fabric_type: "Silk",
    weight: "Light",
    supplier: "Luxury Textiles Co",
    fabric_code: "SD110",
    cost_per_meter: 89.00,
    active: true,
    roll_direction: "face-in",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useFabrics = () => {
  const queryClient = useQueryClient();

  const { data: fabrics, isLoading, error } = useQuery({
    queryKey: ['fabrics'],
    queryFn: async () => {
      // Mock implementation
      return mockFabrics.filter(fabric => fabric.active);
    }
  });

  const createFabric = useMutation({
    mutationFn: async (fabric: Omit<Fabric, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation
      const newFabric: Fabric = {
        ...fabric,
        id: `fab-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockFabrics.push(newFabric);
      
      toast.success('Fabric created successfully');
      return newFabric;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
    },
    onError: (error) => {
      toast.error('Failed to create fabric');
      console.error('Error creating fabric:', error);
    }
  });

  const updateFabric = useMutation({
    mutationFn: async (fabric: Partial<Fabric> & { id: string }) => {
      // Mock implementation
      const index = mockFabrics.findIndex(f => f.id === fabric.id);
      if (index !== -1) {
        mockFabrics[index] = {
          ...mockFabrics[index],
          ...fabric,
          updated_at: new Date().toISOString()
        };
        
        toast.success('Fabric updated successfully');
        return mockFabrics[index];
      }
      throw new Error("Fabric not found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
    },
    onError: (error) => {
      toast.error('Failed to update fabric');
      console.error('Error updating fabric:', error);
    }
  });

  const deleteFabric = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation - soft delete
      const index = mockFabrics.findIndex(f => f.id === id);
      if (index !== -1) {
        mockFabrics[index].active = false;
        mockFabrics[index].updated_at = new Date().toISOString();
        
        toast.success('Fabric deleted successfully');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
    },
    onError: (error) => {
      toast.error('Failed to delete fabric');
      console.error('Error deleting fabric:', error);
    }
  });

  return {
    fabrics,
    isLoading,
    error,
    createFabric: createFabric.mutateAsync,
    updateFabric: updateFabric.mutateAsync,
    deleteFabric: deleteFabric.mutateAsync
  };
};
