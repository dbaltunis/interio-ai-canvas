
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Component {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  component_type: 'hardware' | 'fabric_accessory' | 'heading' | 'service' | 'part';
  category?: string;
  price: number;
  unit: string;
  fullness_ratio?: number;
  specifications: any;
  active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockComponents: Component[] = [
  {
    id: "1",
    user_id: "mock-user",
    name: "Standard Curtain Track",
    description: "Basic curtain track system",
    component_type: 'hardware',
    category: "Tracks",
    price: 25,
    unit: "per-meter",
    specifications: {},
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    user_id: "mock-user",
    name: "Installation Service",
    description: "Professional installation",
    component_type: 'service',
    price: 50,
    unit: "per-hour",
    specifications: {},
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useComponents = () => {
  const queryClient = useQueryClient();

  const { data: components, isLoading, error } = useQuery({
    queryKey: ['components'],
    queryFn: async () => {
      // Mock API call - replace with actual Supabase call when database is ready
      return new Promise<Component[]>((resolve) => {
        setTimeout(() => resolve(mockComponents), 100);
      });
    }
  });

  const createComponent = useMutation({
    mutationFn: async (component: Omit<Component, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const newComponent: Component = {
        ...component,
        id: Date.now().toString(),
        user_id: "mock-user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newComponent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create component');
      console.error('Error creating component:', error);
    }
  });

  const updateComponent = useMutation({
    mutationFn: async (component: Partial<Component> & { id: string }) => {
      return { ...component, updated_at: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update component');
      console.error('Error updating component:', error);
    }
  });

  const deleteComponent = useMutation({
    mutationFn: async (id: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete component');
      console.error('Error deleting component:', error);
    }
  });

  return {
    components,
    isLoading,
    error,
    createComponent: createComponent.mutateAsync,
    updateComponent: updateComponent.mutateAsync,
    deleteComponent: deleteComponent.mutateAsync
  };
};
